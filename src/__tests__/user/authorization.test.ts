import { describe, expect, it, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../settings/variables';
import '../../types/express/index.d.ts';

describe('Tests to check authentication process. If user can login into site, provide action which needs authorization and verify error cases.', () => {
  let user = {
    username: '',
    password: '',
    confirm_password: ''
  };

  let token;
  let userId;

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

  it('User should log into site after provide correct credentials and should get Access Token in response.', async () => {
    const { username, password } = user;
    const response = await request(app)
      .post('/auth')
      .send({ username, password });
    const { accessToken, id } = response.body;
    token = accessToken;
    userId = id;
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(accessToken).toBeDefined;
    expect(typeof accessToken).toBe('string');
  });

  it('Logged user should provide action restricted to authenticated user when set authorization header with valid token value.', async () => {
    await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('User should NOT do any action related with authentication when authorization header is not set.', async () => {
    await request(app)
      .get(`/users/${userId}`)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });

  it('User using wrong token should NOT perform any action requiring authorization.', async () => {
    await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer thisIsNotValidToken`)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });

  it('After token expiration time passed user should NOT perform any action requiring authorization.', async () => {
    // Token expiration time for test ENV is set to 2s.
    await new Promise((t) => setTimeout(t, 2000));

    await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });
});
