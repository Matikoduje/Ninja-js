import query from '../db/database';

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
    return rows[0].user_id;
  }

  static async loadUser(email: string, password: string) {
    const getQuery = 'SELECT * FROM users where email=$1 and password=$2';
    const { rows } = await query(getQuery, [email, password]);
    if (rows[0]) {
      const { user_id, email, password, created_at } = rows[0];
      return new User(email, password, user_id, created_at);
    }
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

  static async isEmailExists(email: string) {
    const { rows } = await query(
      'SELECT COUNT(*)::INT FROM users where email=$1',
      [email]
    );
    return rows[0].count > 0 ? true : false;
  }
}

export default User;
