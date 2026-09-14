import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

export interface TestUser {
  username: string;
  email: string;
  password: string;
  token: string;
}

let counter = 0;

/** Registers a fresh user through the real HTTP API — the "fake data" seeded before a test case runs. */
export async function createTestUser(
  app: INestApplication<App>,
  overrides: Partial<Pick<TestUser, 'username' | 'email' | 'password'>> = {},
): Promise<TestUser> {
  counter += 1;
  const username = overrides.username ?? `user${counter}`;
  const email = overrides.email ?? `user${counter}@example.com`;
  const password = overrides.password ?? 'password123';

  const res = await request(app.getHttpServer())
    .post('/api/users')
    .send({ user: { username, email, password } });

  return {
    username,
    email,
    password,
    token: (res.body as { user: { token: string } }).user.token,
  };
}
