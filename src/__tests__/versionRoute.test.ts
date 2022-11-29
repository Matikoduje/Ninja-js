import { describe, expect, test } from '@jest/globals';
import request from 'supertest';
import app from './settings/environment';

describe('Tests for route /version', function () {
  test('Should HAVE response status 200.', async () => {
    const response = await request(app).get('/version');
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
  });

  test('Should HAVE params commitHash and version in response body.', async () => {
    const response = await request(app).get('/version');
    const { commitHash, version } = response.body;

    expect(commitHash).toBeDefined();
    expect(typeof commitHash).toBe('string');
    expect(version).toBeDefined();
    expect(typeof version).toBe('string');
  });
});
