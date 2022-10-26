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
}

export default Role;
