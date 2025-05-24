# 🎓 سیستم مدیریت انجمن علمی کامپیوتر

یک سیستم جامع و مدرن برای مدیریت فعالیت‌های انجمن علمی کامپیوتر دانشگاه صنعتی شریف

## ✨ امکانات کلیدی

### 🔐 سیستم احراز هویت
- ثبت‌نام و ورود امن با رمزنگاری
- سه سطح دسترسی: کاربر عادی، عضو انجمن، مدیر
- مدیریت جلسات با Session-based Authentication

### 📰 مدیریت اخبار و اطلاعیه‌ها
- انتشار اخبار توسط اعضا و مدیران
- سیستم نمایش و آمار بازدید
- ویرایش و حذف اخبار با کنترل دسترسی

### 📅 مدیریت رویدادها
- ایجاد رویدادهای علمی (کارگاه‌ها، مسابقات، نشست‌ها)
- سیستم ثبت‌نام با کنترل ظرفیت
- مدیریت وضعیت رویدادها

### 📝 سیستم مقالات علمی
- ارسال مقالات توسط کاربران
- فرآیند بررسی و تأیید توسط مدیران
- سیستم نظردهی و بازخورد

### 💬 سیستم تعامل
- نظردهی روی اخبار، رویدادها و مقالات
- مدیریت و تأیید نظرات

### 📧 سیستم نوتیفیکیشن
- **ایمیل نوتیفیکیشن**: ارسال ایمیل‌های زیبا و فارسی
- **SMS نوتیفیکیشن**: پیامک‌های اطلاع‌رسانی
- اطلاع‌رسانی خودکار برای رویدادها، اخبار و مقالات

## 🛠 تکنولوژی‌ها

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **PostgreSQL** با **Drizzle ORM**
- **Passport.js** برای احراز هویت
- **Nodemailer** برای ایمیل (سازگار با سرویس‌های ایرانی)
- **SMS API** (پشتیبانی از سرویس‌های داخلی)

### Frontend
- **React** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **React Query** برای مدیریت state
- **Wouter** برای routing
- **پشتیبانی کامل از فارسی و RTL**

### DevOps & Testing
- **Jest** برای Unit Testing
- **Swagger** برای مستندسازی API
- **Docker-ready** (قابلیت containerization)

## 🚀 راه‌اندازی سریع

### 1. نصب Dependencies
```bash
npm install
```

### 2. تنظیم پایگاه داده
```bash
npm run db:push
```

### 3. اجرای سرور توسعه
```bash
npm run dev
```

### 4. مشاهده مستندات API
دسترسی به Swagger UI در آدرس: `http://localhost:5000/api-docs`

## 📊 تست‌نویسی

### اجرای تست‌ها
```bash
npm test
```

### تست با پوشش کد
```bash
npm run test:coverage
```

### تست در حالت watch
```bash
npm run test:watch
```

## 🔧 متغیرهای محیطی

### اجباری
```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
SESSION_SECRET=your-super-secret-key
```

### اختیاری (برای ایمیل)
```env
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
```

### اختیاری (برای SMS)
```env
SMS_API_URL=https://api.sms-provider.com/send
SMS_USERNAME=your-username
SMS_PASSWORD=your-password
SMS_SENDER=your-sender-number
```

## 📚 API مستندات

### احراز هویت
- `POST /api/register` - ثبت‌نام کاربر جدید
- `POST /api/login` - ورود کاربر
- `POST /api/logout` - خروج کاربر
- `GET /api/user` - دریافت اطلاعات کاربر فعلی

### اخبار
- `GET /api/news` - لیست تمام اخبار
- `POST /api/news` - ایجاد خبر جدید (عضو/مدیر)
- `GET /api/news/:id` - جزئیات خبر
- `PUT /api/news/:id` - ویرایش خبر (عضو/مدیر)
- `DELETE /api/news/:id` - حذف خبر (مدیر)

### رویدادها
- `GET /api/events` - لیست رویدادها
- `POST /api/events` - ایجاد رویداد (عضو/مدیر)
- `GET /api/events/:id` - جزئیات رویداد
- `POST /api/events/:id/register` - ثبت‌نام در رویداد
- `DELETE /api/events/:id/unregister` - لغو ثبت‌نام

### مقالات
- `GET /api/articles` - لیست مقالات
- `POST /api/articles` - ارسال مقاله جدید
- `PUT /api/articles/:id/review` - بررسی مقاله (مدیر)

### داشبورد
- `GET /api/dashboard/stats` - آمار کلی سیستم

## 🎨 ویژگی‌های UI/UX

### طراحی مدرن
- گرادینت‌های زیبا و انیمیشن‌های نرم
- کارت‌های شیشه‌ای با shadow effects
- تم تاریک و روشن
- رنگ‌بندی علمی و حرفه‌ای

### پشتیبانی کامل از فارسی
- فونت Vazir برای متن فارسی
- پشتیبانی کامل از RTL
- تاریخ و اعداد فارسی
- رابط کاربری بومی‌سازی شده

### تجربه کاربری بهینه
- طراحی ریسپانسیو برای تمام دستگاه‌ها
- نوتیفیکیشن‌های زیبا و کاربردی
- لودینگ states و error handling
- Navigation آسان و شهودی

## 📈 آمار و گزارش‌گیری

- آمار کلی اعضا و فعالیت‌ها
- گزارش ثبت‌نام در رویدادها
- آمار بازدید اخبار
- وضعیت مقالات ارسالی

## 🔒 امنیت

- رمزنگاری bcrypt برای کلمه عبور
- Session-based authentication
- کنترل دسترسی بر اساس نقش
- Validation کامل ورودی‌ها با Zod
- Rate limiting (قابل اضافه)

## 📱 نوتیفیکیشن‌ها

### ایمیل
- خوش‌آمدگویی به اعضای جدید
- اطلاع‌رسانی اخبار مهم
- تأیید ثبت‌نام در رویدادها
- نتیجه بررسی مقالات

### SMS
- یادآوری رویدادهای مهم
- اطلاعیه‌های فوری
- تأیید عملیات مهم

## 🚢 Deploy

### توسعه
```bash
npm run dev
```

### تولید
```bash
npm run build
npm start
```

### Docker (آماده برای containerization)
```dockerfile
# Dockerfile آماده در پروژه موجود است
docker build -t scientific-association .
docker run -p 5000:5000 scientific-association
```

## 🤝 مشارکت

این پروژه آماده برای توسعه و بهبود است:

1. Fork کنید
2. Branch جدید بسازید (`git checkout -b feature/amazing-feature`)
3. Commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request ایجاد کنید

## 📝 License

این پروژه تحت لایسنس MIT منتشر شده است.

## 👥 تیم توسعه

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind
- **DevOps**: Jest + Swagger + Docker
- **Design**: Persian UI/UX + RTL Support

---

## 🎯 نکات مهم

- **سیستم کاملاً عملیاتی** و آماده استفاده
- **مستندسازی کامل** API با Swagger
- **تست‌های جامع** برای تمام functionality
- **پشتیبانی کامل از ایران** (سرویس‌های داخلی)
- **UI/UX زیبا و مدرن** با انیمیشن‌ها
- **قابل توسعه** و modular architecture

سیستم آماده دیپلوی و استفاده در محیط تولید است! 🚀