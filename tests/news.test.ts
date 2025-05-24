import request from 'supertest';
import express from 'express';
import { setupAuth } from '../server/auth';
import { registerRoutes } from '../server/routes';

describe('📰 News API Tests', () => {
  let app: express.Application;
  let userCookies: string[];
  let adminCookies: string[];

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    setupAuth(app);
    registerRoutes(app);

    // ایجاد کاربر عادی
    await request(app)
      .post('/api/register')
      .send({
        username: 'test_news_user',
        email: 'newsuser@example.com',
        fullName: 'کاربر اخبار',
        password: 'newspass123'
      });

    const userLogin = await request(app)
      .post('/api/login')
      .send({
        username: 'test_news_user',
        password: 'newspass123'
      });
    userCookies = userLogin.headers['set-cookie'];

    // ایجاد مدیر
    await request(app)
      .post('/api/register')
      .send({
        username: 'test_news_admin',
        email: 'newsadmin@example.com',
        fullName: 'مدیر اخبار',
        password: 'adminpass123'
      });

    const adminLogin = await request(app)
      .post('/api/login')
      .send({
        username: 'test_news_admin',
        password: 'adminpass123'
      });
    adminCookies = adminLogin.headers['set-cookie'];
  });

  describe('GET /api/news', () => {
    it('باید لیست اخبار را برگرداند', async () => {
      const response = await request(app)
        .get('/api/news')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/news', () => {
    it('باید برای کاربر مجاز خبر جدید ایجاد کند', async () => {
      const newsData = {
        title: 'خبر تست جدید',
        content: 'این یک خبر تست است که برای آزمایش API نوشته شده است.',
        summary: 'خلاصه خبر تست'
      };

      const response = await request(app)
        .post('/api/news')
        .set('Cookie', adminCookies)
        .send(newsData)
        .expect(201);

      expect(response.body.title).toBe(newsData.title);
      expect(response.body.content).toBe(newsData.content);
      expect(response.body.authorId).toBeDefined();
    });

    it('نباید به کاربر غیرمجاز اجازه ایجاد خبر بدهد', async () => {
      const newsData = {
        title: 'خبر غیرمجاز',
        content: 'این خبر نباید ایجاد شود'
      };

      await request(app)
        .post('/api/news')
        .set('Cookie', userCookies)
        .send(newsData)
        .expect(403);
    });

    it('باید فیلدهای اجباری را بررسی کند', async () => {
      const incompleteNews = {
        title: 'خبر ناقص'
        // محتوا حذف شده
      };

      await request(app)
        .post('/api/news')
        .set('Cookie', adminCookies)
        .send(incompleteNews)
        .expect(400);
    });
  });

  describe('GET /api/news/:id', () => {
    it('باید جزئیات خبر را برگرداند', async () => {
      // ایجاد خبر
      const newsData = {
        title: 'خبر برای نمایش جزئیات',
        content: 'محتوای کامل این خبر'
      };

      const createResponse = await request(app)
        .post('/api/news')
        .set('Cookie', adminCookies)
        .send(newsData);

      const newsId = createResponse.body.id;

      // دریافت جزئیات
      const response = await request(app)
        .get(`/api/news/${newsId}`)
        .expect(200);

      expect(response.body.title).toBe(newsData.title);
      expect(response.body.content).toBe(newsData.content);
    });

    it('باید 404 برای خبر ناموجود برگرداند', async () => {
      await request(app)
        .get('/api/news/99999')
        .expect(404);
    });
  });

  describe('PUT /api/news/:id', () => {
    it('باید خبر را ویرایش کند', async () => {
      // ایجاد خبر
      const newsData = {
        title: 'خبر برای ویرایش',
        content: 'محتوای اولیه'
      };

      const createResponse = await request(app)
        .post('/api/news')
        .set('Cookie', adminCookies)
        .send(newsData);

      const newsId = createResponse.body.id;

      // ویرایش خبر
      const updatedData = {
        title: 'خبر ویرایش شده',
        content: 'محتوای جدید'
      };

      const response = await request(app)
        .put(`/api/news/${newsId}`)
        .set('Cookie', adminCookies)
        .send(updatedData)
        .expect(200);

      expect(response.body.title).toBe(updatedData.title);
      expect(response.body.content).toBe(updatedData.content);
    });
  });

  describe('DELETE /api/news/:id', () => {
    it('باید خبر را حذف کند', async () => {
      // ایجاد خبر
      const newsData = {
        title: 'خبر برای حذف',
        content: 'این خبر حذف خواهد شد'
      };

      const createResponse = await request(app)
        .post('/api/news')
        .set('Cookie', adminCookies)
        .send(newsData);

      const newsId = createResponse.body.id;

      // حذف خبر
      await request(app)
        .delete(`/api/news/${newsId}`)
        .set('Cookie', adminCookies)
        .expect(200);

      // بررسی حذف شدن
      await request(app)
        .get(`/api/news/${newsId}`)
        .expect(404);
    });
  });
});