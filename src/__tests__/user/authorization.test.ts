import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app, { cleanUpTestUser } from '../settings/environment';
import '../../types/express/index.d.ts';

describe('Tests to verify authentication process.', () => {
  let user = {
    username: '',
    password: '',
    confirm_password: ''
  };

  let token;
  let userId;

  /** Create user for this test group. */
  beforeAll(async () => {
    user = {
      username: `test-auth-${Date.now()}@mail.com`,
      password: 'password',
      confirm_password: 'password'
    };
    await request(app).post('/users').send(user);
  });

  /** After tests delete user used in this test file. */
  afterAll(async () => {
    try {
      await cleanUpTestUser(user.username);
    } catch (err) {
      throw new Error(
        `User ${user.username} can't be clean up after tests. YOU SHOULD verify authorization test.`
      );
    }
  });

  it('User should NOT LOGIN into site with INVALID credentials. Expect STATUS 401.', async () => {
    await request(app)
      .post('/auth')
      .send({ username: user.username, password: 'wrong_password' })
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });

  it('User should LOGIN into site with VALID credentials. Response SHOULD HAVE ACCESS TOKEN and ID in body. Expect STATUS 200.', async () => {
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

  it('User should BE ABLE to do any action that requires authentication when provide VALID TOKEN in AUTHORIZATION header. Expect STATUS 200.', async () => {
    await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('User should NOT BE ABLE to do any action that requires authentication when AUTHORIZATION header is NOT SET. Expect STATUS 401.', async () => {
    await request(app)
      .get(`/users/${userId}`)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });

  it('User should NOT BE ABLE to do any action that requires authentication when provide INVALID TOKEN in AUTHORIZATION header. Expect STATUS 401.', async () => {
    await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer thisIsNotValidToken`)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });

  it('User should NOT BE ABLE to do any action that requires authentication when TOKEN is expired. Expect STATUS 401.', async () => {
    // If the token does not expire within this time, check the expiresIn time for the test environment. Should be 2s.
    await new Promise((t) => setTimeout(t, 2000));

    await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });
});
