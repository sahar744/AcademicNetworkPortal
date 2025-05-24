import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// تنظیمات Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'انجمن علمی کامپیوتر - API مستندات',
      version: '1.0.0',
      description: `
        # سیستم مدیریت انجمن علمی کامپیوتر دانشگاه صنعتی شریف
        
        این API برای مدیریت تمام فعالیت‌های انجمن علمی طراحی شده است.
        
        ## امکانات:
        - 🔐 احراز هویت و مدیریت کاربران
        - 📰 مدیریت اخبار و اطلاعیه‌ها
        - 📅 مدیریت رویدادها و ثبت‌نام
        - 📝 سیستم ارسال و بررسی مقالات
        - 💬 سیستم نظردهی
        - 📧 نوتیفیکیشن‌های ایمیل و SMS
        
        ## نقش‌های کاربری:
        - **کاربر عادی**: مشاهده محتوا، ثبت‌نام در رویدادها، ارسال مقاله
        - **عضو انجمن**: تمام امکانات کاربر عادی + انتشار اخبار و رویدادها
        - **مدیر انجمن**: دسترسی کامل به تمام بخش‌ها
      `,
      contact: {
        name: 'انجمن علمی کامپیوتر',
        email: 'info@ce-association.ir'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'سرور توسعه'
      },
      {
        url: 'https://api.ce-association.ir',
        description: 'سرور تولید'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'احراز هویت بر اساس Session Cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'شناسه یکتا کاربر' },
            username: { type: 'string', description: 'نام کاربری' },
            email: { type: 'string', format: 'email', description: 'آدرس ایمیل' },
            fullName: { type: 'string', description: 'نام و نام خانوادگی' },
            role: { 
              type: 'string', 
              enum: ['user', 'member', 'admin'],
              description: 'نقش کاربر'
            },
            bio: { type: 'string', description: 'معرفی کوتاه' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        News: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string', description: 'عنوان خبر' },
            content: { type: 'string', description: 'متن کامل خبر' },
            summary: { type: 'string', description: 'خلاصه خبر' },
            authorId: { type: 'integer', description: 'شناسه نویسنده' },
            status: { 
              type: 'string', 
              enum: ['draft', 'published'],
              description: 'وضعیت انتشار'
            },
            views: { type: 'integer', description: 'تعداد بازدید' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string', description: 'عنوان رویداد' },
            description: { type: 'string', description: 'توضیحات رویداد' },
            eventDate: { type: 'string', format: 'date-time', description: 'تاریخ و زمان برگزاری' },
            location: { type: 'string', description: 'مکان برگزاری' },
            capacity: { type: 'integer', description: 'ظرفیت شرکت‌کنندگان' },
            organizerId: { type: 'integer', description: 'شناسه برگزارکننده' },
            status: { 
              type: 'string', 
              enum: ['active', 'inactive', 'completed'],
              description: 'وضعیت رویداد'
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Article: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string', description: 'عنوان مقاله' },
            content: { type: 'string', description: 'متن کامل مقاله' },
            abstract: { type: 'string', description: 'چکیده مقاله' },
            authorId: { type: 'integer', description: 'شناسه نویسنده' },
            status: { 
              type: 'string', 
              enum: ['pending', 'approved', 'rejected'],
              description: 'وضعیت بررسی'
            },
            reviewedBy: { type: 'integer', description: 'شناسه بررسی‌کننده' },
            reviewComments: { type: 'string', description: 'نظرات بررسی‌کننده' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            content: { type: 'string', description: 'متن نظر' },
            authorId: { type: 'integer', description: 'شناسه نویسنده نظر' },
            newsId: { type: 'integer', description: 'شناسه خبر (اختیاری)' },
            eventId: { type: 'integer', description: 'شناسه رویداد (اختیاری)' },
            articleId: { type: 'integer', description: 'شناسه مقاله (اختیاری)' },
            isApproved: { type: 'boolean', description: 'وضعیت تأیید' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', description: 'نام کاربری' },
            password: { type: 'string', description: 'کلمه عبور' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'fullName', 'password'],
          properties: {
            username: { type: 'string', description: 'نام کاربری' },
            email: { type: 'string', format: 'email', description: 'آدرس ایمیل' },
            fullName: { type: 'string', description: 'نام و نام خانوادگی' },
            password: { type: 'string', description: 'کلمه عبور' },
            bio: { type: 'string', description: 'معرفی کوتاه (اختیاری)' }
          }
        },
        CreateNewsRequest: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: { type: 'string', description: 'عنوان خبر' },
            content: { type: 'string', description: 'متن کامل خبر' },
            summary: { type: 'string', description: 'خلاصه خبر (اختیاری)' }
          }
        },
        CreateEventRequest: {
          type: 'object',
          required: ['title', 'description', 'eventDate', 'location'],
          properties: {
            title: { type: 'string', description: 'عنوان رویداد' },
            description: { type: 'string', description: 'توضیحات رویداد' },
            eventDate: { type: 'string', format: 'date-time', description: 'تاریخ و زمان برگزاری' },
            location: { type: 'string', description: 'مکان برگزاری' },
            capacity: { type: 'integer', description: 'ظرفیت شرکت‌کنندگان' }
          }
        },
        CreateArticleRequest: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: { type: 'string', description: 'عنوان مقاله' },
            content: { type: 'string', description: 'متن کامل مقاله' },
            abstract: { type: 'string', description: 'چکیده مقاله (اختیاری)' }
          }
        },
        CreateCommentRequest: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { type: 'string', description: 'متن نظر' },
            newsId: { type: 'integer', description: 'شناسه خبر (اختیاری)' },
            eventId: { type: 'integer', description: 'شناسه رویداد (اختیاری)' },
            articleId: { type: 'integer', description: 'شناسه مقاله (اختیاری)' }
          }
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalMembers: { type: 'integer', description: 'تعداد کل اعضا' },
            activeEvents: { type: 'integer', description: 'تعداد رویدادهای فعال' },
            publishedNews: { type: 'integer', description: 'تعداد اخبار منتشر شده' },
            pendingArticles: { type: 'integer', description: 'تعداد مقالات در انتظار بررسی' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'پیام خطا' },
            code: { type: 'integer', description: 'کد خطا' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'احراز هویت و مدیریت جلسات'
      },
      {
        name: 'Users',
        description: 'مدیریت کاربران'
      },
      {
        name: 'News',
        description: 'مدیریت اخبار و اطلاعیه‌ها'
      },
      {
        name: 'Events',
        description: 'مدیریت رویدادها'
      },
      {
        name: 'Articles',
        description: 'مدیریت مقالات علمی'
      },
      {
        name: 'Comments',
        description: 'سیستم نظردهی'
      },
      {
        name: 'Dashboard',
        description: 'آمار و داشبورد'
      }
    ]
  },
  apis: ['./server/routes.ts', './server/*.ts']
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  // راه‌اندازی Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: `
      .swagger-ui .topbar { 
        background-color: #667eea; 
      }
      .swagger-ui .topbar .download-url-wrapper { 
        display: none; 
      }
      .swagger-ui .info hgroup.main h2.title {
        font-family: 'Tahoma', sans-serif;
        direction: rtl;
      }
      .swagger-ui .info .description {
        font-family: 'Tahoma', sans-serif;
      }
    `,
    customSiteTitle: 'انجمن علمی کامپیوتر - API مستندات',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true
    }
  }));

  // API مستندات به صورت JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger documentation available at: /api-docs');
}