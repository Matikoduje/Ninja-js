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

describe('Tests to verify user can use Read, Update and Delete operations.', () => {
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
      username: `test-user-routes-${Date.now()}@mail.com`,
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
        `User ${user.username} can't be clean up after tests. YOU SHOULD verify userRoutes tests.`
      );
    }
  });

  it('User should GET full information about account. Response SHOULD HAVE header Etag. Expect STATUS 200.', async () => {
    const response = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(response.headers['Etag']).toBeDefined;
  });

  it('User should NOT GET full information about other user. Expect STATUS 403.', async () => {
    await request(app)
      .get('/users/1')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  it('User should UPDATE account with PATCH /user when HEADER if-match has CORRECT value. Expect STATUS 200.', async () => {
    const getUserResponse = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getUserResponse.status).toEqual(200);
    const etag = getUserResponse.headers['etag'];
    const updateUsername = `test-user-${Date.now()}-update@mail.com`;

    // Update username in test user account. This updated value will be used in beforeEach() rest of test cases.
    user.username = updateUsername;

    await request(app)
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('if-match', etag)
      .send([{ op: 'replace', path: '/username', value: updateUsername }])
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('User should NOT UPDATE account with PATCH /user when HEADER if-match has WRONG value. Expect STATUS 412.', async () => {
    const etag = '1';
    const updateUsername = `test-user-routes-${Date.now()}-update@mail.com`;

    await request(app)
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('if-match', etag)
      .send([{ op: 'replace', path: '/username', value: updateUsername }])
      .expect(412)
      .expect('Content-Type', /application\/json/);
  });

  it('User should NOT UPDATE other user account with PATCH /user. Expect STATUS 403.', async () => {
    // etag is mocked, authorization by user role is checked before etag validation.
    const etag = '1';
    const updateUsername = `test-${Date.now()}-update@mail.com`;

    await request(app)
      .patch(`/users/1`)
      .set('Authorization', `Bearer ${token}`)
      .set('if-match', etag)
      .send([{ op: 'replace', path: '/username', value: updateUsername }])
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  it('User should NOT DELETE other user account with DELETE /user. Expect STATUS 403.', async () => {
    // etag is mocked, authorization by user role is checked before etag validation.
    const mockedEtag = '1';

    await request(app)
      .delete(`/users/1`)
      .set('Authorization', `Bearer ${token}`)
      .set('if-match', mockedEtag)
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  it('User should DELETE account with DELETE /user when HEADER if-match has CORRECT value. Expect STATUS 200. After that user should NOT LOGIN anymore in this account. Expect STATUS 401.', async () => {
    const getUserResponse = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getUserResponse.status).toEqual(200);
    const etag = getUserResponse.headers['etag'];

    await request(app)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('if-match', etag)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const { username, password } = user;
    await request(app).post('/auth').send({ username, password }).expect(401);
  });
});
