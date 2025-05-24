import nodemailer from 'nodemailer';

// Email service برای ایران - استفاده از SMTP محلی
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// پیکربندی برای سرویس‌های ایمیل ایرانی مثل تله‌میل، پارس‌پک و غیره
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com', // قابل تغییر به سرویس ایرانی
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

// ایجاد transporter
const transporter = nodemailer.createTransport(emailConfig);

// تست اتصال
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service connection error:', error);
  } else {
    console.log('Email service ready to send messages');
  }
});

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// تمپلیت‌های ایمیل فارسی
export const emailTemplates = {
  eventRegistration: (userName: string, eventTitle: string, eventDate: string) => ({
    subject: `تأیید ثبت‌نام در ${eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Tahoma', sans-serif; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; }
          .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>انجمن علمی کامپیوتر</h1>
            <p>دانشگاه صنعتی شریف</p>
          </div>
          <div class="content">
            <h2>سلام ${userName} عزیز</h2>
            <p>ثبت‌نام شما در رویداد <strong>${eventTitle}</strong> با موفقیت انجام شد.</p>
            <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>جزئیات رویداد:</h3>
              <p><strong>عنوان:</strong> ${eventTitle}</p>
              <p><strong>تاریخ:</strong> ${eventDate}</p>
            </div>
            <p>لطفاً در تاریخ مقرر حضور داشته باشید.</p>
            <a href="#" class="btn">مشاهده جزئیات رویداد</a>
          </div>
          <div class="footer">
            <p>© ۱۴۰۳ انجمن علمی کامپیوتر دانشگاه صنعتی شریف</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `سلام ${userName} عزیز، ثبت‌نام شما در رویداد ${eventTitle} در تاریخ ${eventDate} با موفقیت انجام شد.`
  }),

  newsPublished: (userName: string, newsTitle: string) => ({
    subject: `خبر جدید: ${newsTitle}`,
    html: `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Tahoma', sans-serif; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; }
          .btn { display: inline-block; padding: 12px 24px; background: #48bb78; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📰 خبر جدید</h1>
          </div>
          <div class="content">
            <h2>سلام ${userName} عزیز</h2>
            <p>خبر جدیدی در وب‌سایت انجمن منتشر شده است:</p>
            <div style="background: #f0fff4; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #48bb78;">
              <h3>${newsTitle}</h3>
            </div>
            <a href="#" class="btn">مطالعه خبر</a>
          </div>
          <div class="footer">
            <p>© ۱۴۰۳ انجمن علمی کامپیوتر دانشگاه صنعتی شریف</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `سلام ${userName} عزیز، خبر جدید "${newsTitle}" در وب‌سایت انجمن منتشر شده است.`
  }),

  articleReviewed: (userName: string, articleTitle: string, status: string, comments?: string) => ({
    subject: `نتیجه بررسی مقاله: ${articleTitle}`,
    html: `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Tahoma', sans-serif; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; }
          .status-approved { background: #f0fff4; border-right: 4px solid #48bb78; padding: 15px; border-radius: 8px; }
          .status-rejected { background: #fff5f5; border-right: 4px solid #f56565; padding: 15px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 نتیجه بررسی مقاله</h1>
          </div>
          <div class="content">
            <h2>سلام ${userName} عزیز</h2>
            <p>بررسی مقاله شما با عنوان <strong>"${articleTitle}"</strong> انجام شد.</p>
            <div class="${status === 'approved' ? 'status-approved' : 'status-rejected'}">
              <h3>وضعیت: ${status === 'approved' ? '✅ تأیید شده' : '❌ رد شده'}</h3>
              ${comments ? `<p><strong>نظرات بررسی‌کننده:</strong></p><p>${comments}</p>` : ''}
            </div>
          </div>
          <div class="footer">
            <p>© ۱۴۰۳ انجمن علمی کامپیوتر دانشگاه صنعتی شریف</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `سلام ${userName} عزیز، نتیجه بررسی مقاله "${articleTitle}": ${status === 'approved' ? 'تأیید شده' : 'رد شده'}`
  }),

  welcomeUser: (userName: string) => ({
    subject: 'خوش آمدید به انجمن علمی کامپیوتر',
    html: `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Tahoma', sans-serif; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; }
          .features { background: #faf5ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 خوش آمدید</h1>
          </div>
          <div class="content">
            <h2>سلام ${userName} عزیز</h2>
            <p>به انجمن علمی کامپیوتر دانشگاه صنعتی شریف خوش آمدید!</p>
            <div class="features">
              <h3>امکانات در دسترس شما:</h3>
              <ul>
                <li>🎯 شرکت در رویدادها و کارگاه‌های علمی</li>
                <li>📚 ارسال مقالات و ایده‌های علمی</li>
                <li>📰 دریافت آخرین اخبار انجمن</li>
                <li>💬 تعامل با سایر اعضا</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© ۱۴۰۳ انجمن علمی کامپیوتر دانشگاه صنعتی شریف</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `سلام ${userName} عزیز، به انجمن علمی کامپیوتر دانشگاه صنعتی شریف خوش آمدید!`
  })
};

// ارسال ایمیل
export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  try {
    // بررسی فعال بودن سرویس ایمیل
    if (!emailConfig.auth.user) {
      console.log('Email service not configured, email not sent');
      return false;
    }

    const mailOptions = {
      from: `"انجمن علمی کامپیوتر" <${emailConfig.auth.user}>`,
      to: template.to,
      subject: template.subject,
      html: template.html,
      text: template.text || template.subject
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${template.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// ارسال ایمیل گروهی
export async function sendBulkEmail(recipients: string[], template: Omit<EmailTemplate, 'to'>): Promise<number> {
  let successCount = 0;
  
  for (const recipient of recipients) {
    const emailTemplate = { ...template, to: recipient };
    const success = await sendEmail(emailTemplate);
    if (success) successCount++;
    
    // تأخیر کوتاه برای جلوگیری از spam
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return successCount;
}

// دریافت ایمیل‌های کاربران بر اساس نقش
export async function getEmailsByRole(role?: string): Promise<string[]> {
  // این تابع باید از storage استفاده کند
  // فعلاً یک پیاده‌سازی ساده
  return [];
}