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

  getPassword() {
    return this.password;
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
