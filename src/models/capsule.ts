import { query } from '../db/database';
import format from 'pg-format';
import { StatusCodeError } from '../handlers/error-handler';

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
  id: number;
  creator: string;
  delete_at: Date | null;
  created_at: Date;
  data: CapsuleData;
};

export default class Capsule {
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

  static async getCapsules(): Promise<Array<CapsuleRecord>> {
    const { rows } = await query('SELECT * FROM capsules', []);
    return rows;
  }

  static async getCapsuleById(capsuleId: number): Promise<CapsuleRecord> {
    const { rows } = await query('SELECT * FROM capsules WHERE id=$1', [
      capsuleId
    ]);
    return rows[0];
  }

  static async getEtag(capsuleId: number): Promise<string> {
    const { rows } = await query('SELECT xmin FROM capsules WHERE id=$1', [
      capsuleId
    ]);
    return rows[0].xmin;
  }

  static async save(data: string, creator: string): Promise<CapsuleRecord> {
    const { rows } = await query(
      'INSERT INTO capsules (creator, data) VALUES ($1,$2) returning id',
      [creator, data]
    );
    return this.getCapsuleById(rows[0].id);
  }

  static async update(capsuleId: number, data: any): Promise<void> {
    await query('UPDATE capsules SET data=$1 WHERE id=$2 returning id', [
      data,
      capsuleId
    ]);
  }

  static async delete(capsuleId: number): Promise<void> {
    await query(
      'UPDATE capsules SET deleted_at=NOW() WHERE id=$1 returning id',
      [capsuleId]
    );
  }

  static async isValidCapsuleId(capsuleId: number): Promise<boolean> {
    const { rows } = await query('SELECT id FROM capsules WHERE id=$1', [
      capsuleId
    ]);
    return rows.length === 0 ? false : true;
  }

  static async verifyEtag(capsuleId: number, etag: string): Promise<boolean> {
    const { rows } = await query(
      'SELECT id FROM capsules WHERE id=$1 and xmin=$2',
      [capsuleId, etag]
    );
    return rows.length === 0 ? false : true;
  }
}
