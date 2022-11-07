import { describe, expect, it, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../settings/variables';
import '../../types/express/index.d.ts';

describe('Tests to verify that the user can read their account data, change it and delete it.', () => {
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

  beforeEach(async () => {
    const { username, password } = user;
    const response = await request(app)
      .post('/auth')
      .send({ username, password })
      .expect(200);
    const { accessToken, id } = response.body;
    token = accessToken;
    userId = id;
  });

  it('Authorized user should get information about account when Authorization header is set properly.', async () => {
    const response = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(response.headers['Etag']).toBeDefined;
  });

  it('Authorized user should NOT get information about other users.', async () => {
    await request(app)
      .get('/users/1')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  it('Authorized user should update account information when Authorization and if-match headers are set properly.', async () => {
    const getUserResponse = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getUserResponse.status).toEqual(200);
    const etag = getUserResponse.headers['etag'];
    const updateUsername = `test-${Date.now()}@mail.com`;
    user.username = updateUsername;

    await request(app)
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('if-match', etag)
      .send([{ op: 'replace', path: '/username', value: updateUsername }])
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('Authorized user should NOT update account when if-match header is not valid.', async () => {
    const etag = '1';
    const updateUsername = `test-${Date.now()}@mail.com`;

    await request(app)
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('if-match', etag)
      .send([{ op: 'replace', path: '/username', value: updateUsername }])
      .expect(412)
      .expect('Content-Type', /application\/json/);
  });
});
