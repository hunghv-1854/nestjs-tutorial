import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { validationExceptionFactory } from './../src/common/validation-exception-factory';
import { truncateAll } from './utils/database.util';
import { createTestUser } from './utils/fixtures.util';

interface ErrorsResponseBody {
  errors: Record<string, string[]>;
}

interface UserResponseBody {
  user: {
    email: string;
    username: string;
    token: string;
    bio: string;
    image: string | null;
  };
}

/**
 * Condition-coverage ("C2") e2e suite for AuthController: every branch of
 * every endpoint's logic (each validation rule, each conflict/failure
 * condition, each success path) is exercised at least once, not just the
 * happy path. Runs against a dedicated test database (see .env.test) and
 * starts each test case from a clean slate: fixtures are seeded in a
 * `beforeEach` and every table is truncated in `afterEach`.
 */
describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['/'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: validationExceptionFactory,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(getDataSourceToken());
  });

  afterEach(async () => {
    await truncateAll(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/users (register)', () => {
    it('rejects an empty payload with one validation error per field', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .send({ user: {} })
        .expect(422);

      const body = res.body as ErrorsResponseBody;
      expect(body.errors.username).toContain('username should not be empty');
      expect(body.errors.email).toContain('email should not be empty');
      expect(body.errors.password).toContain('password should not be empty');
    });

    it('rejects a malformed email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          user: {
            username: 'newuser',
            email: 'not-an-email',
            password: 'password123',
          },
        })
        .expect(422);

      expect((res.body as ErrorsResponseBody).errors.email).toContain(
        'email must be a valid email address',
      );
    });

    it('rejects a password shorter than the minimum length', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          user: {
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'short',
          },
        })
        .expect(422);

      expect((res.body as ErrorsResponseBody).errors.password).toContain(
        'password must be longer than or equal to 8 characters',
      );
    });

    it('rejects only the email when the email is already taken', async () => {
      const existing = await createTestUser(app);

      const res = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          user: {
            username: 'brandNewUsername',
            email: existing.email,
            password: 'password123',
          },
        })
        .expect(422);

      const body = res.body as ErrorsResponseBody;
      expect(body.errors.email).toContain('has already been taken');
      expect(body.errors.username).toBeUndefined();
    });

    it('rejects only the username when the username is already taken', async () => {
      const existing = await createTestUser(app);

      const res = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          user: {
            username: existing.username,
            email: 'brand-new-email@example.com',
            password: 'password123',
          },
        })
        .expect(422);

      const body = res.body as ErrorsResponseBody;
      expect(body.errors.username).toContain('has already been taken');
      expect(body.errors.email).toBeUndefined();
    });

    it('rejects both fields when both the email and username are already taken', async () => {
      const existing = await createTestUser(app);

      const res = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          user: {
            username: existing.username,
            email: existing.email,
            password: 'password123',
          },
        })
        .expect(422);

      const body = res.body as ErrorsResponseBody;
      expect(body.errors.email).toContain('has already been taken');
      expect(body.errors.username).toContain('has already been taken');
    });

    it('registers a new user when every field is valid and unique', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          user: {
            username: 'freshuser',
            email: 'freshuser@example.com',
            password: 'password123',
          },
        })
        .expect(201);

      const body = res.body as UserResponseBody;
      expect(body.user.email).toBe('freshuser@example.com');
      expect(body.user.username).toBe('freshuser');
      expect(body.user.token).toEqual(expect.any(String));
      expect((body.user as Record<string, unknown>).password).toBeUndefined();
    });
  });

  describe('POST /api/users/login', () => {
    it('rejects an email that does not exist', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: { email: 'nobody@example.com', password: 'password123' },
        })
        .expect(401);

      expect((res.body as ErrorsResponseBody).errors.email).toContain(
        'was not found',
      );
    });

    it('rejects a known email with the wrong password', async () => {
      const existing = await createTestUser(app);

      const res = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({ user: { email: existing.email, password: 'wrong-password' } })
        .expect(401);

      expect((res.body as ErrorsResponseBody).errors.password).toContain(
        'is invalid',
      );
    });

    it('logs in and returns a token for correct credentials', async () => {
      const existing = await createTestUser(app);

      const res = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({ user: { email: existing.email, password: existing.password } })
        .expect(200);

      const body = res.body as UserResponseBody;
      expect(body.user.email).toBe(existing.email);
      expect(body.user.token).toEqual(expect.any(String));
    });
  });

  describe('GET /api/user (current user)', () => {
    it('rejects a request with no token', () => {
      return request(app.getHttpServer()).get('/api/user').expect(401);
    });

    it('rejects a malformed token', () => {
      return request(app.getHttpServer())
        .get('/api/user')
        .set('Authorization', 'Token not-a-real-jwt')
        .expect(401);
    });

    it('returns the current user for a valid token', async () => {
      const user = await createTestUser(app);

      const res = await request(app.getHttpServer())
        .get('/api/user')
        .set('Authorization', `Token ${user.token}`)
        .expect(200);

      const body = res.body as UserResponseBody;
      expect(body.user.email).toBe(user.email);
      expect(body.user.username).toBe(user.username);
    });

    it('rejects a token that has been logged out (blacklisted)', async () => {
      const user = await createTestUser(app);
      await request(app.getHttpServer())
        .post('/api/user/logout')
        .set('Authorization', `Token ${user.token}`)
        .expect(204);

      await request(app.getHttpServer())
        .get('/api/user')
        .set('Authorization', `Token ${user.token}`)
        .expect(401);
    });
  });

  describe('POST /api/user/logout', () => {
    it('rejects a request with no token', () => {
      return request(app.getHttpServer()).post('/api/user/logout').expect(401);
    });

    it("blacklists the token so it can't be reused", async () => {
      const user = await createTestUser(app);

      await request(app.getHttpServer())
        .post('/api/user/logout')
        .set('Authorization', `Token ${user.token}`)
        .expect(204);

      await request(app.getHttpServer())
        .get('/api/user')
        .set('Authorization', `Token ${user.token}`)
        .expect(401);
    });

    it('does not invalidate a different, still-valid token for the same user', async () => {
      const user = await createTestUser(app);
      const secondLogin = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({ user: { email: user.email, password: user.password } });
      const secondToken = (secondLogin.body as UserResponseBody).user.token;

      await request(app.getHttpServer())
        .post('/api/user/logout')
        .set('Authorization', `Token ${user.token}`)
        .expect(204);

      await request(app.getHttpServer())
        .get('/api/user')
        .set('Authorization', `Token ${secondToken}`)
        .expect(200);
    });
  });
});
