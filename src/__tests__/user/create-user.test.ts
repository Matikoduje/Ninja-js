import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../settings/variables';
import '../../types/express/index.d.ts';

describe('Tests to check whether a user can create account. POST /users path.', () => {
  const testUser = {
    username: `test-${Date.now()}@mail.com`,
    password: 'password',
    confirm_password: 'password'
  };

  it('User should NOT create account when provided invalid email.', async () => {
    const user = { ...testUser };
    user.username = 'invalid-email';
    await request(app)
      .post('/users')
      .send(user)
      .expect(422)
      .expect('Content-Type', /application\/json/);
  });
  it('User should NOT create account when provided password and confirm_password were different.', async () => {
    const user = { ...testUser };
    user.confirm_password = 'passwords-not-match';
    await request(app)
      .post('/users')
      .send(user)
      .expect(422)
      .expect('Content-Type', /application\/json/);
  });
  it('User should create account when provide valid data.', async () => {
    const user = { ...testUser };
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
