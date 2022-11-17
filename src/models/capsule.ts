import { query, client } from '../db/database';
import format from 'pg-format';

export type CapsuleData = {
  reuse_count: number;
  water_landings: number;
  land_landings: number;
  last_update: string | null;
  launches: Array<string>;
  serial: string;
  status: string;
  type: string;
  id: string;
};

type CapsuleRecord = {
  source: string;
  data: CapsuleData;
};

export default class Capsule {
  constructor(
    private id: number | null = null,
    private source: string,
    private data: CapsuleData
  ) {}

  static async areCapsulesFetchFromAPI(): Promise<boolean> {
    const { rows } = await query('SELECT id FROM capsules WHERE source=$1', [
      'spacexAPI'
    ]);

    return rows.length === 0 ? false : true;
  }

  static async fetchCapsulesFromAPI(
    fetchedData: Array<CapsuleRecord>
  ): Promise<void> {
    const transactionClient = await client();
    try {
      await transactionClient.query('BEGIN');
      await query(
        format('INSERT INTO capsules (source, data) VALUES %L', fetchedData),
        []
      );
      await transactionClient.query('COMMIT');
    } catch (err) {
      await transactionClient.query('ROLLBACK');
    } finally {
      transactionClient.release();
    }
  }
}
