import { query, client } from '../db/database';
import Role from './role';
import { StatusCodeError } from '../handlers/error-handler';
import { PoolClient } from 'pg';

class User {
  constructor(
    private username: string,
    private password: string,
    private id: number | null = null,
    private token: string = '',
    private created_at: Date | null = null,
    private deleted_at: Date | null = null,
    private etag: string = '',
    private roles: string[] = []
  ) {}

  async update() {
    if (this.id === null) {
      throw new StatusCodeError('Operation update is not allowed.', 500);
    }
    const transactionClient = await client();
    try {
      await transactionClient.query('BEGIN');
      const updateUserQuery =
        'UPDATE users SET password=$1, username=$2 WHERE user_id=$3 and xmin=$4';
      await transactionClient.query(updateUserQuery, [
        this.password,
        this.username,
        this.id,
        this.etag
      ]);
      await this.saveToken('', transactionClient);
      await Role.updateAdminRole(
        this.id as number,
        this.roles,
        transactionClient
      );
      await transactionClient.query('COMMIT');
    } catch (err) {
      await transactionClient.query('ROLLBACK');
      throw err;
    } finally {
      transactionClient.release();
    }
  }

  async save() {
    if (this.id !== null) {
      throw new StatusCodeError('Operation save is not allowed.', 500);
    }
    const transactionClient = await client();
    try {
      await transactionClient.query('BEGIN');
      const insertUserQuery =
        'INSERT INTO users(password, username) VALUES($1, $2) RETURNING user_id';
      const { rows } = await transactionClient.query(insertUserQuery, [
        this.password,
        this.username
      ]);
      const userId = rows[0].user_id;
      await Role.addRoleToUser(transactionClient, userId, Role.USER_ROLE_ID);
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
      await this.saveToken('', transactionClient);
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

  async saveToken(token: string, transactionClient: PoolClient | null) {
    const saveTokenQuery = 'UPDATE users SET token=$1 WHERE user_id=$2';
    const saveTokenParams = [token, this.id];
    if (transactionClient !== null) {
      await transactionClient.query(saveTokenQuery, saveTokenParams);
    } else {
      await query(saveTokenQuery, saveTokenParams);
    }
  }

  static async loadUser(usernameToLoad: string) {
    let roles: string[] = [];
    const getQuery = 'SELECT *, xmin as etag FROM users where username=$1';
    const { rows } = await query(getQuery, [usernameToLoad]);
    if (rows.length === 0) {
      throw new Error('');
    }
    const { user_id, username, password, created_at, deleted_at, etag, token } =
      rows[0];

    if (deleted_at === null) {
      roles = await Role.getUserRoles(user_id);
    }
    return new User(
      username,
      password,
      user_id,
      token,
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

  static async isTokenValid(userId: number, token: string) {
    const { rows } = await query(
      'SELECT user_id FROM users WHERE user_id=$1 AND token=$2',
      [userId, token]
    );
    if (rows.length === 0) {
      throw new StatusCodeError('Provided token is not valid.', 401);
    }
  }
}

export default User;
