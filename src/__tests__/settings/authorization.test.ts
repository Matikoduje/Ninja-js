// import { describe, expect, it } from '@jest/globals';
// import request from 'supertest';
// import app from '../settings/variables';
// import '../../types/express/index.d.ts';

// const validUser = {
//   username: 'TESTuser' + Date.now() + '@gmail.com',
//   password: 'qwerty',
//   confirm_password: 'qwerty'
// };

// const invalidUser = {
//   username: 'TESTuser' + Date.now() + '@gmail.com',
//   password: 'wrongPassword',
//   confirm_password: 'qwerty'
// };

// let userAccessToken = '';
// let userId = 0;

// describe('Tests covered authentication process. Create user, login, check can user do authenticated action, logout', () => {
//   it('User should NOT create account when provide data which does not meet validation requirements.', async () => {
//     const response = await request(app).post('/users').send(invalidUser);
//     expect(response.status).toEqual(422);
//     expect(response.type).toEqual('application/json');
//   });
//   it('User should create account when provide valid data.', async () => {
//     const response = await request(app).post('/users').send(validUser);
//     expect(response.status).toEqual(201);
//     expect(response.type).toEqual('application/json');
//   });
//   it('User should NOT log into site when provide wrong credentials.', async () => {
//     const { username, password } = invalidUser;
//     const response = await request(app)
//       .post('/auth')
//       .send({ username, password });
//     expect(response.status).toEqual(401);
//     expect(response.type).toEqual('application/json');
//   });
//   it('User should log into site when provide valid credentials and user should get access token in response.', async () => {
//     const { username, password } = validUser;
//     const response = await request(app)
//       .post('/auth')
//       .send({ username, password });
//     const { id, accessToken } = response.body;
//     expect(response.status).toEqual(200);
//     expect(response.type).toEqual('application/json');
//     expect(id).toBeDefined;
//     expect(accessToken).toBeDefined;
//     userAccessToken = accessToken;
//     userId = id;
//   });
//   it('Logged user should get information about his account', async () => {
//     const response = await request(app)
//       .get(`/users/${userId}`)
//       .set('authorization', `Bearer ${userAccessToken}`);
//     const { user } = response.body;
//     expect(response.status).toEqual(200);
//     expect(response.type).toEqual('application/json');
//     expect(user).toBeDefined();
//     expect(typeof user).toBe('object');
//     expect(user.length).toEqual(1);
//     expect(user[0].id).toEqual(userId);
//     expect(user[0].username).toEqual(validUser.username);
//     expect(user[0].etag).toBeDefined;
//   });
//   it('User should logout when valid access token was provided in header.', async () => {
//     const response = await request(app)
//       .get('/logout')
//       .set('authorization', `Bearer ${userAccessToken}`);
//     expect(response.status).toEqual(200);
//     expect(response.type).toEqual('application/json');
//   });
//   it('After logout access token should NOT work anymore. User should NOT get information about his account', async () => {
//     const response = await request(app)
//       .get(`/users/${userId}`)
//       .set('authorization', `Bearer ${userAccessToken}`);
//     expect(response.status).toEqual(401);
//     expect(response.type).toEqual('application/json');
//   });
// });
