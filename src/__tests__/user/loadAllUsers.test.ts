import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../settings/environment';
import '../../types/express/index.d.ts';

describe('Test to verify GET /users route', () => {
  it('Response should return all users.', async () => {
    const response = await request(app).get('/users');
    const { users } = response.body;
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(users).toBeDefined();
    expect(users.length).toBeGreaterThan(0);
  });
});
