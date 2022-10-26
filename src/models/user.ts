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

  // async addRoleToUser(userId: number, roleId: number) {
  //   const addUserRoleQuery =
  //     'INSERT INTO user_roles(user_id, role_id) VALUES($1, $2) RETURNING *';
  //   const { rows } = await query(addUserRoleQuery, [userId, roleId]);
  //   return rows[0].user_id === userId;
  // }

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
}

export default User;
