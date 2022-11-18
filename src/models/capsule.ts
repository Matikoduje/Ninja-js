import { query } from '../db/database';
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

export default class Capsule {
  constructor(
    private id: number | null = null,
    private source: string,
    private data: CapsuleData
  ) {}

  static async areCapsulesFetchFromAPI(): Promise<boolean> {
    const { rows } = await query('SELECT id FROM capsules WHERE creator=$1', [
      'spacexAPI'
    ]);

    return rows.length === 0 ? false : true;
  }

  static async fetchCapsulesFromAPI(fetchedData: Array<string>): Promise<void> {
    await query(
      format('INSERT INTO capsules (data) VALUES %L', fetchedData),
      []
    );
  }

  static async getCapsules() {
    const { rows } = await query('SELECT * FROM capsules', []);
    return rows;
  }
}
