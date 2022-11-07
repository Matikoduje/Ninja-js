import { PoolClient } from 'pg';
import { query } from '../db/database';

class Role {
  static async getRoleIdByName(roleName: string): Promise<number> {
    const { rows } = await query(
      'SELECT role_id FROM roles where role_name=$1',
      [roleName]
    );
    if (rows.length === 0) {
      throw new Error('Specified role does not exists.');
    }
    return rows[0].role_id;
  }

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
    roleName: string
  ) {
    const roleId = await this.getRoleIdByName(roleName);
    const addUserRoleQuery =
      'INSERT INTO user_roles(user_id, role_id) VALUES($1, $2)';
    await transactionClient.query(addUserRoleQuery, [userId, roleId]);
  }

  static async removeUserRoles(userId: number, transactionClient: PoolClient) {
    const removeUserRolesQuery = 'DELETE FROM user_roles WHERE user_id=$1';
    await transactionClient.query(removeUserRolesQuery, [userId]);
  }
}

export default Role;
