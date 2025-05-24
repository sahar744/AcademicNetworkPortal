import { pool } from '../server/db';

// تنظیمات اولیه برای تست‌ها
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
});

afterAll(async () => {
  // پاک‌سازی بعد از تمام تست‌ها
  await pool.end();
  console.log('✅ Test environment cleaned up');
});

beforeEach(async () => {
  // آماده‌سازی قبل از هر تست
  console.log('🔄 Preparing test...');
});

afterEach(async () => {
  // پاک‌سازی بعد از هر تست
  console.log('🧹 Cleaning up after test...');
});