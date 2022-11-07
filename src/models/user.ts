import { query, client } from '../db/database';
import Role from './role';
import { StatusCodeError } from '../handlers/error-handler';

class User {
  constructor(
    private username: string,
    private password: string,
    private id: number | null = null,
    private created_at: Date | null = null,
    private deleted_at: Date | null = null,
    private ETag: string = ''
  ) {}

  async save() {
    const operation = this.id !== null ? 'update' : 'save';

    const transactionClient = await client();

    try {
      await transactionClient.query('BEGIN');

      switch (operation) {
        case 'save': {
          const insertUserQuery =
            'INSERT INTO users(password, username) VALUES($1, $2) RETURNING user_id';
          const { rows } = await transactionClient.query(insertUserQuery, [
            this.password,
            this.username
          ]);
          const userId = rows[0].user_id;
          const roleUserId = await Role.getRoleIdByName('user');
          const addUserRoleQuery =
            'INSERT INTO user_roles(user_id, role_id) VALUES($1, $2)';
          await transactionClient.query(addUserRoleQuery, [userId, roleUserId]);
          break;
        }
        case 'update': {
          const updateUserQuery =
            'UPDATE users SET password=$1, username=$2, token=$3 WHERE user_id=$4 and xmin=$5';
          await transactionClient.query(updateUserQuery, [
            this.password,
            this.username,
            '',
            this.id,
            this.ETag
          ]);
          break;
        }
      }
      await transactionClient.query('COMMIT');
    } catch (err) {
      await transactionClient.query('ROLLBACK');
      throw err;
    } finally {
      transactionClient.release();
    }
  }

  getPassword(): string {
    return this.password;
  }

  getUsername(): string {
    return this.username;
  }

  getId(): number | null {
    return this.id;
  }

  getCreatedAt() {
    return this.created_at;
  }

  getUserStatus(): string {
    return this.deleted_at === null ? 'active' : 'deleted';
  }

  isDeleted(): boolean {
    return this.deleted_at !== null;
  }

  async saveAuthenticationToken(token: string) {
    const addTokenToUserQuery = 'UPDATE users SET token=$1 WHERE user_id=$2';
    await query(addTokenToUserQuery, [token, this.id]);
  }

  async delete(): Promise<User> {
    const transactionClient = await client();

    try {
      await transactionClient.query('BEGIN');
      const deleteUserQuery =
        'UPDATE users SET token=$1, deleted_at=NOW() WHERE user_id=$2 and xmin=$3';
      await transactionClient.query(deleteUserQuery, ['', this.id, this.ETag]);
      const removeUserRolesQuery = 'DELETE FROM user_roles WHERE user_id=$1';
      await transactionClient.query(removeUserRolesQuery, [this.id]);
      await transactionClient.query('COMMIT');
    } catch (err) {
      await transactionClient.query('ROLLBACK');
      throw err;
    } finally {
      transactionClient.release();
    }
    return User.loadUser(this.username);
  }

  async generateETag(): Promise<string> {
    const getEtagQuery = 'SELECT xmin AS etag FROM users where user_id=$1';
    const { rows } = await query(getEtagQuery, [this.id]);
    return rows[0].etag;
  }

  async checkETag(ETagToCheck: string): Promise<boolean> {
    const Etag = await this.generateETag();
    return ETagToCheck === Etag;
  }

  setETag(ETag: string) {
    this.ETag = ETag;
  }

  static async loadUser(usernameToLoad: string) {
    const getQuery = 'SELECT * FROM users where username=$1';
    const { rows } = await query(getQuery, [usernameToLoad]);
    if (rows.length === 0) {
      throw new Error('');
    }
    const { user_id, username, password, created_at, deleted_at, token } =
      rows[0];
    return new User(username, password, user_id, created_at, deleted_at, token);
  }

  static async getUsers() {
    const { rows } = await query('SELECT * FROM users', []);
    return rows.map(({ user_id, username, created_at, deleted_at }) => {
      return {
        id: user_id,
        username,
        created_at,
        active: deleted_at === null ? 'active' : 'deleted'
      };
    });
  }

  static async isTokenValid(userId: number, token: string) {
    const { rows } = await query(
      'SELECT user_id FROM users WHERE user_id=$1 AND token=$2',
      [userId, token]
    );
    if (rows.length === 0) {
      throw new StatusCodeError('Provided token is not valid.', 401);
    }
  }

  static async isUsernameUnique(username: string): Promise<boolean> {
    const { rows } = await query(
      'SELECT user_id FROM users WHERE username=$1',
      [username]
    );
    return rows.length === 0;
  }

  static async userLogout(userId: number) {
    const addTokenToUserQuery =
      'UPDATE users SET token=$1 WHERE user_id=$2 RETURNING user_id';
    const { rows } = await query(addTokenToUserQuery, ['', userId]);
    return rows.length === 1;
  }

  static async loadUserById(userId: number) {
    const { rows } = await query(
      'SELECT username FROM users WHERE user_id=$1',
      [userId]
    );
    if (rows.length === 0) {
      throw new StatusCodeError('User Not Found', 404);
    }
    return await this.loadUser(rows[0].username);
  }
}

export default User;
