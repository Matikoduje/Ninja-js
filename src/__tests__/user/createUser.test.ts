import { describe, expect, it, afterAll } from '@jest/globals';
import request from 'supertest';
import app, { cleanUpTestUser } from '../settings/environment';
import '../../types/express/index.d.ts';

describe('Tests to check create user account process.', () => {
  const user = {
    username: `test-create-user-${Date.now()}@mail.com`,
    password: 'password',
    confirm_password: 'password'
  };

  /** After tests delete user used in this test file. */
  afterAll(async () => {
    try {
      await cleanUpTestUser(user.username);
    } catch (err) {
      throw new Error(
        `User ${user.username} can't be clean up after tests. YOU SHOULD verify createUser tests.`
      );
    }
  });

  it('User should NOT CREATE account with invalid email. Expect STATUS 422.', async () => {
    const testUser = { ...user };
    testUser.username = 'invalid-email';
    await request(app)
      .post('/users')
      .send(testUser)
      .expect(422)
      .expect('Content-Type', /application\/json/);
  });

  it('User should NOT CREATE account when password and password match are not the same. Expect STATUS 422.', async () => {
    const testUser = { ...user };
    testUser.confirm_password = 'passwords-not-match';
    await request(app)
      .post('/users')
      .send(testUser)
      .expect(422)
      .expect('Content-Type', /application\/json/);
  });

  it('User should CREATE account with properly set params. Expect STATUS 201. After that GET /users SHOULD returns created user account in users array.', async () => {
    await request(app)
      .post('/users')
      .send(user)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await request(app).get('/users');
    const { users } = response.body;
    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: user.username })
      ])
    );
  });
});
