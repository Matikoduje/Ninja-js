import { query, client } from '../db/database';
import Role from './role';

class User {
  constructor(
    private username: string,
    private password: string,
    private id: number | null = null,
    private created_at: Date | null = null,
    private deleted_at: Date | null = null,
    private token: string = ''
  ) {}

  async save() {
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
      const roleUserId = await Role.getRoleIdByName('user');
      const addUserRoleQuery =
        'INSERT INTO user_roles(user_id, role_id) VALUES($1, $2)';
      await transactionClient.query(addUserRoleQuery, [userId, roleUserId]);
      await transactionClient.query('COMMIT');
    } catch (err) {
      await transactionClient.query('ROLLBACK');
      throw err;
    } finally {
      transactionClient.release();
    }
  }

  getPassword() {
    return this.password;
  }

  getUsername() {
    return this.username;
  }

  getId() {
    return this.id;
  }

  isDeleted() {
    return this.deleted_at !== null;
  }

  async setAuthenticationToken(token: string) {
    const addTokenToUserQuery = 'UPDATE users SET token=$1 WHERE user_id=$2';
    await query(addTokenToUserQuery, [token, this.id]);
  }

  static async loadUser(usernameToLoad: string) {
    const getQuery = 'SELECT * FROM users where username=$1';
    const { rows } = await query(getQuery, [usernameToLoad]);
    if (rows.length === 0) {
      return null;
    }
    const { user_id, username, password, created_at, deleted_at, token } =
      rows[0];
    return new User(username, password, user_id, created_at, deleted_at, token);
  }

  static async getUsers() {
    const { rows } = await query(
      'SELECT * FROM users where deleted_at IS NULL',
      []
    );
    return rows.map(({ user_id, username, created_at }) => {
      return {
        id: user_id,
        username,
        created_at
      };
    });
  }

  static async isTokenValid(userId: number, token: string) {
    const { rows } = await query(
      'SELECT user_id FROM users WHERE user_id=$1 AND token=$2',
      [userId, token]
    );
    return rows.length === 1;
  }

  static async isUserExists(userId: number) {
    const { rows } = await query('SELECT user_id FROM users WHERE user_id=$1', [
      userId
    ]);
    return rows.length === 1;
  }

  static async userLogout(userId: number) {
    const addTokenToUserQuery =
      'UPDATE users SET token=$1 WHERE user_id=$2 RETURNING user_id';
    const { rows } = await query(addTokenToUserQuery, ['', userId]);
    return rows.length === 1;
  }

  static async delete(userId: number) {
    const transactionClient = await client();

    try {
      await transactionClient.query('BEGIN');
      const deleteUserQuery =
        'UPDATE users SET token=$1, deleted_at=NOW() WHERE user_id=$2';
      await transactionClient.query(deleteUserQuery, ['', userId]);
      const removeUserRolesQuery = 'DELETE FROM user_roles WHERE user_id=$1';
      await transactionClient.query(removeUserRolesQuery, [userId]);
      await transactionClient.query('COMMIT');
    } catch (err) {
      await transactionClient.query('ROLLBACK');
      throw err;
    } finally {
      transactionClient.release();
    }
  }

  static async getUsernameByUserId(userId: number) {
    const { rows } = await query(
      'SELECT username FROM users WHERE user_id=$1',
      [userId]
    );
    if (rows.length === 0) {
      return null;
    }
    return rows[0].username;
  }
}

export default User;
