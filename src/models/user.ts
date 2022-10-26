import query from '../db/database';
import Role from './role';
import logger from '../logger/_logger';

class User {
  constructor(
    private email: string,
    private password: string,
    private id: number | null = null,
    private created_at: Date | null = null
  ) {}

  async save() {
    const insertQuery =
      'INSERT INTO users(password, email) VALUES($1, $2) RETURNING user_id';
    const { rows } = await query(insertQuery, [this.password, this.email]);
    const userId = rows[0].user_id;
    const userRoleId = await Role.getRoleIdByName('user');
    const isRoleUserAdded = await this.addRoleToUser(userId, userRoleId);
    if (isRoleUserAdded) {
      logger.info(`User ${userId} has successfully added user role.`);
    } else {
      logger.warn(`Due to DB problems. User ${userId} hadn't add role user.`);
    }
    return userId;
  }

  getPassword() {
    return this.password;
  }

  getEmail() {
    return this.email;
  }

  getId() {
    return this.id;
  }

  async addRoleToUser(userId: number, roleId: number) {
    const insertUserIntoUserRolesQuery =
      'INSERT INTO user_roles(user_id, role_id) VALUES($1, $2) RETURNING *';
    const { rows } = await query(insertUserIntoUserRolesQuery, [
      userId,
      roleId
    ]);
    return rows[0].user_id === userId;
  }

  static async loadUser(userEmail: string) {
    const getQuery = 'SELECT * FROM users where email=$1';
    const { rows } = await query(getQuery, [userEmail]);
    if (rows.length === 0) {
      return null;
    }
    const { user_id, email, password, created_at } = rows[0];
    return new User(email, password, user_id, created_at);
  }

  static async getUsers() {
    const { rows } = await query(
      'SELECT * FROM users where deleted_at IS NULL',
      []
    );
    return rows.map(({ user_id, email, created_at }) => {
      return {
        id: user_id,
        email,
        created_at
      };
    });
  }
}

export default User;
