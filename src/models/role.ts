import { query } from '../db/database';

class Role {
  static async getRoleIdByName(roleName: string) {
    const { rows } = await query(
      'SELECT role_id FROM roles where role_name=$1',
      [roleName]
    );
    if (rows.length === 0) {
      return null;
    }
    return rows[0].role_id;
  }

  static async hasUserRole(userId: number, roleId: number) {
    const { rows } = await query(
      'SELECT * FROM user_roles where user_id=$1 AND role_id=$2',
      [userId, roleId]
    );
    return rows.length === 1;
  }
}

export default Role;
