import { sendEmail, emailTemplates } from './email';
import { sendSMS, smsTemplates } from './sms';
import { storage } from './storage';

// سرویس نوتیفیکیشن جامع
export class NotificationService {
  
  // ارسال نوتیفیکیشن ثبت‌نام در رویداد
  async notifyEventRegistration(userId: number, eventId: number): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      const event = await storage.getEventById(eventId);
      
      if (!user || !event) return;
      
      // ارسال ایمیل
      if (user.email) {
        const emailTemplate = emailTemplates.eventRegistration(
          user.fullName,
          event.title,
          new Date(event.eventDate).toLocaleDateString('fa-IR')
        );
        await sendEmail({
          to: user.email,
          ...emailTemplate
        });
      }
      
      // ارسال پیامک (اگر شماره تلفن موجود باشد)
      // فعلاً comment شده چون فیلد phoneNumber در schema نیست
      // if (user.phoneNumber) {
      //   const smsMessage = smsTemplates.eventRegistration(user.fullName, event.title);
      //   await sendSMS(user.phoneNumber, smsMessage);
      // }
      
    } catch (error) {
      console.error('Error sending event registration notification:', error);
    }
  }
  
  // اطلاع‌رسانی انتشار خبر جدید
  async notifyNewsPublished(newsId: number): Promise<void> {
    try {
      const news = await storage.getNewsById(newsId);
      if (!news) return;
      
      // دریافت ایمیل همه کاربران
      const users = await storage.getAllUsers();
      
      for (const user of users) {
        if (user.email) {
          const emailTemplate = emailTemplates.newsPublished(
            user.fullName,
            news.title
          );
          await sendEmail({
            to: user.email,
            ...emailTemplate
          });
          
          // تأخیر کوتاه بین ایمیل‌ها
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
    } catch (error) {
      console.error('Error sending news notification:', error);
    }
  }
  
  // اطلاع‌رسانی نتیجه بررسی مقاله
  async notifyArticleReviewed(articleId: number): Promise<void> {
    try {
      const article = await storage.getArticleById(articleId);
      if (!article) return;
      
      const author = await storage.getUser(article.authorId);
      if (!author || !author.email) return;
      
      const emailTemplate = emailTemplates.articleReviewed(
        author.fullName,
        article.title,
        article.status,
        article.reviewComments
      );
      
      await sendEmail({
        to: author.email,
        ...emailTemplate
      });
      
      // ارسال پیامک برای مقالات تأیید شده
      if (article.status === 'approved') {
        // if (author.phoneNumber) {
        //   const smsMessage = smsTemplates.articleApproved(author.fullName, article.title);
        //   await sendSMS(author.phoneNumber, smsMessage);
        // }
      }
      
    } catch (error) {
      console.error('Error sending article review notification:', error);
    }
  }
  
  // خوش‌آمدگویی به کاربر جدید
  async notifyWelcomeUser(userId: number): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.email) return;
      
      const emailTemplate = emailTemplates.welcomeUser(user.fullName);
      await sendEmail({
        to: user.email,
        ...emailTemplate
      });
      
    } catch (error) {
      console.error('Error sending welcome notification:', error);
    }
  }
  
  // یادآوری رویداد (یک روز قبل)
  async sendEventReminders(): Promise<void> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const events = await storage.getAllEvents();
      const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate.toDateString() === tomorrow.toDateString();
      });
      
      for (const event of upcomingEvents) {
        const registrations = await storage.getEventRegistrations(event.id);
        
        for (const registration of registrations) {
          const user = await storage.getUser(registration.userId);
          if (user && user.email) {
            // ارسال ایمیل یادآوری
            const reminderTemplate = emailTemplates.eventRegistration(
              user.fullName,
              event.title,
              new Date(event.eventDate).toLocaleDateString('fa-IR')
            );
            
            await sendEmail({
              to: user.email,
              subject: `یادآوری: ${event.title} فردا برگزار می‌شود`,
              ...reminderTemplate
            });
            
            // تأخیر کوتاه
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
      
    } catch (error) {
      console.error('Error sending event reminders:', error);
    }
  }
  
  // اطلاع‌رسانی اضطراری به مدیران
  async notifyAdminsUrgent(message: string): Promise<void> {
    try {
      const users = await storage.getAllUsers();
      const admins = users.filter(user => user.role === 'admin');
      
      for (const admin of admins) {
        if (admin.email) {
          await sendEmail({
            to: admin.email,
            subject: '🚨 اطلاع‌رسانی اضطراری - انجمن علمی',
            html: `
              <div style="background: #fee; border: 2px solid #f56565; padding: 20px; border-radius: 8px;">
                <h2 style="color: #c53030;">⚠️ اطلاع‌رسانی اضطراری</h2>
                <p style="font-size: 16px;">${message}</p>
                <p style="color: #666; font-size: 14px;">لطفاً در اسرع وقت بررسی کنید.</p>
              </div>
            `,
            text: `اطلاع‌رسانی اضطراری: ${message}`
          });
        }
      }
      
    } catch (error) {
      console.error('Error sending urgent notification to admins:', error);
    }
  }
  
  // آمار نوتیفیکیشن‌ها
  async getNotificationStats(): Promise<{
    totalSent: number;
    emailsSent: number;
    smsSent: number;
    lastActivity: Date;
  }> {
    // این آمار باید در دیتابیس ذخیره شود
    // فعلاً مقادیر نمونه برمی‌گرداند
    return {
      totalSent: 0,
      emailsSent: 0,
      smsSent: 0,
      lastActivity: new Date()
    };
  }
}

// نمونه سراسری سرویس
export const notificationService = new NotificationService();