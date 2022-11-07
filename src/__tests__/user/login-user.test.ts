import { describe, expect, it, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../settings/variables';
import '../../types/express/index.d.ts';

describe('Tests to check user can login and logout. POST /auth path and GET /logout', () => {
  let user = {
    username: '',
    password: '',
    confirm_password: ''
  };

  beforeAll(async () => {
    user = {
      username: `test-${Date.now()}@mail.com`,
      password: 'password',
      confirm_password: 'password'
    };
    await request(app).post('/users').send(user);
  });

  it('User should NOT log into site when wrong credentials was provided.', async () => {
    await request(app)
      .post('/auth')
      .send({ username: user.username, password: 'wrong_password' })
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });

  it('User should log with correct credentials and should can logout after.', async () => {
    const { username, password } = user;
    const response = await request(app)
      .post('/auth')
      .send({ username, password });
    const { accessToken } = response.body;
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(accessToken).toBeDefined;
    expect(typeof accessToken).toBe('string');
  });
});
