import { query, client } from '../db/database';
import Role from './role';
import UserToken from './userToken';
import { StatusCodeError } from '../handlers/error-handler';

class User {
  constructor(
    private username: string,
    private password: string,
    private id: number | null = null,
    private created_at: Date | null = null,
    private deleted_at: Date | null = null,
    private etag: string = '',
    private roles: string[] = []
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
          await UserToken.initializeToken(transactionClient, userId);
          await Role.addRoleToUser(
            transactionClient,
            userId,
            Role.USER_ROLE_ID
          );
          break;
        }
        case 'update': {
          const updateUserQuery =
            'UPDATE users SET password=$1, username=$2 WHERE user_id=$3 and xmin=$4';
          await transactionClient.query(updateUserQuery, [
            this.password,
            this.username,
            this.id,
            this.etag
          ]);
          await UserToken.saveUserToken(
            this.id as number,
            '',
            transactionClient
          );
          await Role.updateAdminRole(
            this.id as number,
            this.roles,
            transactionClient
          );
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

  getCreatedAt(): Date | null {
    return this.created_at;
  }

  getUserStatus(): string {
    return this.deleted_at === null ? 'active' : 'deleted';
  }

  getEtag(): string {
    return this.etag;
  }

  getUserRoles() {
    return this.roles;
  }

  isDeleted(): boolean {
    return this.deleted_at !== null;
  }

  async delete(): Promise<User> {
    const transactionClient = await client();

    try {
      await transactionClient.query('BEGIN');
      const deleteUserQuery =
        'UPDATE users SET deleted_at=NOW() WHERE user_id=$1 and xmin=$2';
      await transactionClient.query(deleteUserQuery, [this.id, this.etag]);
      await UserToken.saveUserToken(this.id as number, '', transactionClient);
      await Role.removeUserRoles(this.id as number, transactionClient);
      await transactionClient.query('COMMIT');
    } catch (err) {
      await transactionClient.query('ROLLBACK');
      throw err;
    } finally {
      transactionClient.release();
    }
    return User.loadUser(this.username);
  }

  static async loadUser(usernameToLoad: string) {
    let roles: string[] = [];
    const getQuery = 'SELECT *, xmin as etag FROM users where username=$1';
    const { rows } = await query(getQuery, [usernameToLoad]);
    if (rows.length === 0) {
      throw new Error('');
    }
    const { user_id, username, password, created_at, deleted_at, etag } =
      rows[0];

    if (deleted_at === null) {
      roles = await Role.getUserRoles(user_id);
    }
    return new User(
      username,
      password,
      user_id,
      created_at,
      deleted_at,
      etag,
      roles
    );
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

  static async isUsernameUnique(username: string): Promise<boolean> {
    const { rows } = await query(
      'SELECT user_id FROM users WHERE username=$1',
      [username]
    );
    return rows.length === 0;
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
