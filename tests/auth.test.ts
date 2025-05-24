import request from 'supertest';
import express from 'express';
import { setupAuth } from '../server/auth';
import { registerRoutes } from '../server/routes';

describe('🔐 Authentication API Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    setupAuth(app);
    registerRoutes(app);
  });

  describe('POST /api/register', () => {
    it('باید کاربر جدید را با موفقیت ثبت‌نام کند', async () => {
      const userData = {
        username: 'test_user_001',
        email: 'test001@example.com',
        fullName: 'کاربر تست',
        password: 'password123',
        bio: 'دانشجوی مهندسی کامپیوتر'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        role: 'user'
      });
      expect(response.body.password).toBeUndefined();
    });

    it('نباید اجازه ثبت‌نام با نام کاربری تکراری بدهد', async () => {
      const userData = {
        username: 'test_user_duplicate',
        email: 'unique@example.com',
        fullName: 'کاربر یکتا',
        password: 'password123'
      };

      // ثبت‌نام اول
      await request(app)
        .post('/api/register')
        .send(userData)
        .expect(201);

      // ثبت‌نام دوم با همان نام کاربری
      await request(app)
        .post('/api/register')
        .send({ ...userData, email: 'another@example.com' })
        .expect(400);
    });

    it('باید فیلدهای اجباری را بررسی کند', async () => {
      const incompleteData = {
        username: 'test_incomplete',
        // فیلدهای مهم حذف شده
      };

      await request(app)
        .post('/api/register')
        .send(incompleteData)
        .expect(400);
    });
  });

  describe('POST /api/login', () => {
    const testUser = {
      username: 'test_login_user',
      email: 'login@example.com',
      fullName: 'کاربر ورود',
      password: 'loginpass123'
    };

    beforeEach(async () => {
      // ایجاد کاربر برای تست ورود
      await request(app)
        .post('/api/register')
        .send(testUser);
    });

    it('باید با اطلاعات صحیح وارد شود', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.username).toBe(testUser.username);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('نباید با کلمه عبور اشتباه وارد شود', async () => {
      await request(app)
        .post('/api/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('نباید با نام کاربری ناموجود وارد شود', async () => {
      await request(app)
        .post('/api/login')
        .send({
          username: 'nonexistent_user',
          password: 'anypassword'
        })
        .expect(401);
    });
  });

  describe('GET /api/user', () => {
    it('باید اطلاعات کاربر وارد شده را برگرداند', async () => {
      const userData = {
        username: 'test_user_info',
        email: 'userinfo@example.com',
        fullName: 'کاربر اطلاعات',
        password: 'infopass123'
      };

      // ثبت‌نام
      await request(app)
        .post('/api/register')
        .send(userData);

      // ورود و دریافت cookie
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      const cookies = loginResponse.headers['set-cookie'];

      // دریافت اطلاعات کاربر
      const response = await request(app)
        .get('/api/user')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.username).toBe(userData.username);
      expect(response.body.email).toBe(userData.email);
    });

    it('باید 401 برای کاربر وارد نشده برگرداند', async () => {
      await request(app)
        .get('/api/user')
        .expect(401);
    });
  });

  describe('POST /api/logout', () => {
    it('باید کاربر را خارج کند', async () => {
      const userData = {
        username: 'test_logout_user',
        email: 'logout@example.com',
        fullName: 'کاربر خروج',
        password: 'logoutpass123'
      };

      // ثبت‌نام و ورود
      await request(app)
        .post('/api/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      const cookies = loginResponse.headers['set-cookie'];

      // خروج
      await request(app)
        .post('/api/logout')
        .set('Cookie', cookies)
        .expect(200);

      // تست اینکه دیگر دسترسی ندارد
      await request(app)
        .get('/api/user')
        .set('Cookie', cookies)
        .expect(401);
    });
  });
});