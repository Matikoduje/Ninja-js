import { PoolClient } from 'pg';
import { query } from '../db/database';
import { StatusCodeError } from '../handlers/error-handler';

class UserToken {
  static async initializeToken(transactionClient: PoolClient, userId: number) {
    await transactionClient.query(
      'INSERT INTO user_tokens(user_id) VALUES($1)',
      [userId]
    );
  }

  static async saveUserToken(
    userId: number,
    token: string,
    transactionClient: PoolClient | null
  ) {
    const saveTokenQuery = 'UPDATE user_tokens SET token=$1 WHERE user_id=$2';
    const saveTokenParams = [token, userId];
    if (transactionClient !== null) {
      await transactionClient.query(saveTokenQuery, saveTokenParams);
    } else {
      await query(saveTokenQuery, saveTokenParams);
    }
  }

  static async isTokenValid(userId: number, token: string) {
    const { rows } = await query(
      'SELECT user_id FROM user_tokens WHERE user_id=$1 AND token=$2',
      [userId, token]
    );
    if (rows.length === 0) {
      throw new StatusCodeError('Provided token is not valid.', 401);
    }
  }
}

export default UserToken;
