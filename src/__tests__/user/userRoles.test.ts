import {
  describe,
  expect,
  it,
  beforeAll,
  beforeEach,
  afterAll
} from '@jest/globals';
import request from 'supertest';
import app, { cleanUpTestUser } from '../settings/environment';
import '../../types/express/index.d.ts';

describe('Tests to verify user have properly set roles related with actions.', () => {
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
      username: `test-user-roles-${Date.now()}@mail.com`,
      password: 'password',
      confirm_password: 'password'
    };
    await request(app).post('/users').send(user);
  });

  /** Login user before each test. */
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

  /** After tests delete user used in this test file. */
  afterAll(async () => {
    try {
      await cleanUpTestUser(user.username);
    } catch (err) {
      throw new Error(
        `User ${user.username} can't be clean up after tests. YOU SHOULD verify userRoles tests.`
      );
    }
  });

  it('After create account user SHOULD have only USER role.', async () => {
    const response = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    const userData = response.body.user;
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(userData.roles).toBeDefined;
    expect(userData.roles).toEqual(['user']);
  });

  it('User SHOULD add ADMIN role for account. Expect STATUS 200.', async () => {
    const getUserResponse = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getUserResponse.status).toEqual(200);
    const etag = getUserResponse.headers['etag'];

    await request(app)
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('if-match', etag)
      .send([{ op: 'replace', path: '/roles', value: ['admin', 'user'] }])
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const { username, password } = user;
    const loginResponse = await request(app)
      .post('/auth')
      .send({ username, password })
      .expect(200);
    const { accessToken, id } = loginResponse.body;

    const response = await request(app)
      .get(`/users/${id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    const userData = response.body.user;
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(userData.roles).toBeDefined;
    expect(userData.roles).toContain('user');
    expect(userData.roles).toContain('admin');
    expect(userData.roles.length).toBe(2);
  });

  it('User SHOULD NOT remove manually role USER. Expect STATUS 422.', async () => {
    const getUserResponse = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getUserResponse.status).toEqual(200);
    const etag = getUserResponse.headers['etag'];

    await request(app)
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('if-match', etag)
      .send([{ op: 'replace', path: '/roles', value: ['admin'] }])
      .expect(422)
      .expect('Content-Type', /application\/json/);
  });

  it('User with ADMIN role SHOULD do any action related to other accounts. Expect STATUS 422.', async () => {
    const getUserResponse = await request(app)
      .get(`/users/1`)
      .set('Authorization', `Bearer ${token}`);
    expect(getUserResponse.status).toEqual(200);
  });

  it('User SHOULD remove role ADMIN. Expect status 200. After that user SHOULD have only USER role.', async () => {
    const getUserResponse = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getUserResponse.status).toEqual(200);
    const etag = getUserResponse.headers['etag'];

    await request(app)
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('if-match', etag)
      .send([{ op: 'replace', path: '/roles', value: ['user'] }])
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const { username, password } = user;
    const loginResponse = await request(app)
      .post('/auth')
      .send({ username, password })
      .expect(200);
    const { accessToken, id } = loginResponse.body;

    const response = await request(app)
      .get(`/users/${id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    const userData = response.body.user;
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(userData.roles).toBeDefined;
    expect(userData.roles).toEqual(['user']);
  });

  it('User without ADMIN role SHOULD NOT BE ABLE to do any action related to other accounts. Expect STATUS 403.', async () => {
    const getUserResponse = await request(app)
      .get(`/users/1`)
      .set('Authorization', `Bearer ${token}`);
    expect(getUserResponse.status).toEqual(403);
  });
});
