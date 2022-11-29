import { PoolClient } from 'pg';
import { query } from '../db/database';

class Role {
  static ADMIN_ROLE_ID = 1;
  static USER_ROLE_ID = 2;

  static async hasUserRole(userId: number, roleId: number): Promise<boolean> {
    const { rows } = await query(
      'SELECT * FROM user_roles where user_id=$1 AND role_id=$2',
      [userId, roleId]
    );
    return rows.length === 1;
  }

  static async addRoleToUser(
    transactionClient: PoolClient,
    userId: number,
    roleId: number
  ): Promise<void> {
    const addUserRoleQuery =
      'INSERT INTO user_roles(user_id, role_id) VALUES($1, $2)';
    await transactionClient.query(addUserRoleQuery, [userId, roleId]);
  }

  static async removeRoleFromUser(
    transactionClient: PoolClient,
    userId: number,
    roleId: number
  ): Promise<void> {
    const removeUserRoleQuery =
      'DELETE FROM user_roles where user_id=$1 and role_id=$2';
    await transactionClient.query(removeUserRoleQuery, [userId, roleId]);
  }

  static async removeUserRoles(
    userId: number,
    transactionClient: PoolClient
  ): Promise<void> {
    const removeUserRolesQuery = 'DELETE FROM user_roles WHERE user_id=$1';
    await transactionClient.query(removeUserRolesQuery, [userId]);
  }

  static async getUserRoles(userId: number): Promise<Array<string>> {
    const getUserRolesQuery =
      'SELECT r.role_name as name FROM user_roles ur JOIN roles r ON (ur.role_id = r.role_id) where ur.user_id=$1';
    const { rows } = await query(getUserRolesQuery, [userId]);
    return rows.map((element) => {
      return element.name;
    });
  }

  static async updateAdminRole(
    userId: number,
    updatedUserRoles: Array<string>,
    transactionClient: PoolClient
  ) {
    const isAdmin = await this.hasUserRole(userId, this.ADMIN_ROLE_ID);

    if (!isAdmin && updatedUserRoles.includes('admin')) {
      await this.addRoleToUser(transactionClient, userId, this.ADMIN_ROLE_ID);
    } else if (isAdmin && !updatedUserRoles.includes('admin')) {
      await this.removeRoleFromUser(
        transactionClient,
        userId,
        this.ADMIN_ROLE_ID
      );
    }
  }
}

export default Role;
