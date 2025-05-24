import axios from 'axios';

// سرویس SMS برای ایران - پشتیبانی از سرویس‌های داخلی
interface SMSConfig {
  apiUrl: string;
  username: string;
  password: string;
  sender: string;
}

// پیکربندی برای سرویس‌های SMS ایرانی (قابل تغییر)
const smsConfig: SMSConfig = {
  apiUrl: process.env.SMS_API_URL || 'https://api.kavenegar.com/v1/{API-KEY}/sms/send.json',
  username: process.env.SMS_USERNAME || '',
  password: process.env.SMS_PASSWORD || '',
  sender: process.env.SMS_SENDER || '10004346'
};

// تمپلیت‌های پیامک فارسی
export const smsTemplates = {
  eventReminder: (userName: string, eventTitle: string, eventDate: string) => 
    `سلام ${userName}، یادآوری: رویداد "${eventTitle}" فردا ${eventDate} برگزار می‌شود. انجمن علمی کامپیوتر`,

  eventRegistration: (userName: string, eventTitle: string) =>
    `سلام ${userName}، ثبت‌نام شما در "${eventTitle}" تأیید شد. منتظر حضورتان هستیم. انجمن علمی کامپیوتر`,

  articleApproved: (userName: string, articleTitle: string) =>
    `تبریک ${userName}! مقاله "${articleTitle}" شما تأیید و منتشر شد. انجمن علمی کامپیوتر`,

  articleRejected: (userName: string, articleTitle: string) =>
    `سلام ${userName}، متأسفانه مقاله "${articleTitle}" نیاز به بازبینی دارد. لطفاً پنل کاربری را چک کنید. انجمن علمی`,

  welcomeMessage: (userName: string) =>
    `${userName} عزیز، به انجمن علمی کامپیوتر خوش آمدید! از امکانات متنوع انجمن استفاده کنید.`,

  eventCancellation: (userName: string, eventTitle: string) =>
    `${userName} عزیز، متأسفانه رویداد "${eventTitle}" لغو شد. جزئیات در وب‌سایت. انجمن علمی کامپیوتر`,

  urgentNews: (title: string) =>
    `🔴 اخبار فوری: ${title} - برای جزئیات به وب‌سایت انجمن مراجعه کنید.`,

  reminderGeneral: (userName: string, message: string) =>
    `${userName} عزیز، ${message} - انجمن علمی کامپیوتر`
};

// ارسال پیامک تکی
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  try {
    // بررسی فعال بودن سرویس SMS
    if (!smsConfig.username || !smsConfig.password) {
      console.log('SMS service not configured, SMS not sent');
      return false;
    }

    // تنظیمات برای سرویس‌های مختلف ایرانی
    const smsData = {
      receptor: phoneNumber,
      message: message,
      sender: smsConfig.sender
    };

    // ارسال درخواست به API
    const response = await axios.post(smsConfig.apiUrl, smsData, {
      auth: {
        username: smsConfig.username,
        password: smsConfig.password
      },
      timeout: 10000
    });

    if (response.status === 200 && response.data.return?.status === 200) {
      console.log(`SMS sent successfully to ${phoneNumber}`);
      return true;
    } else {
      console.log('SMS sending failed:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

// ارسال پیامک گروهی
export async function sendBulkSMS(phoneNumbers: string[], message: string): Promise<number> {
  let successCount = 0;
  
  for (const phoneNumber of phoneNumbers) {
    const success = await sendSMS(phoneNumber, message);
    if (success) successCount++;
    
    // تأخیر برای جلوگیری از محدودیت API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`Bulk SMS: ${successCount}/${phoneNumbers.length} sent successfully`);
  return successCount;
}

// اعتبارسنجی شماره تلفن ایرانی
export function validateIranianPhoneNumber(phoneNumber: string): boolean {
  // فرمت‌های معتبر: 09123456789, +989123456789, 00989123456789
  const iranPhoneRegex = /^(\+98|0098|0)?9\d{9}$/;
  return iranPhoneRegex.test(phoneNumber.replace(/\s/g, ''));
}

// تبدیل شماره تلفن به فرمت استاندارد
export function normalizePhoneNumber(phoneNumber: string): string {
  let normalized = phoneNumber.replace(/\s/g, '');
  
  if (normalized.startsWith('+98')) {
    normalized = '0' + normalized.substring(3);
  } else if (normalized.startsWith('0098')) {
    normalized = '0' + normalized.substring(4);
  } else if (!normalized.startsWith('0')) {
    normalized = '0' + normalized;
  }
  
  return normalized;
}

// ارسال پیامک اضطراری
export async function sendEmergencySMS(message: string): Promise<number> {
  // ارسال به تمام مدیران انجمن
  const adminPhones = await getAdminPhoneNumbers();
  return await sendBulkSMS(adminPhones, `🚨 اضطراری: ${message}`);
}

// دریافت شماره تلفن مدیران (باید از database بیاید)
async function getAdminPhoneNumbers(): Promise<string[]> {
  // این تابع باید از storage استفاده کند
  // فعلاً یک آرایه خالی برمی‌گرداند
  return [];
}

// گزارش وضعیت SMS
export interface SMSReport {
  totalSent: number;
  successfulSent: number;
  failedSent: number;
  lastSentAt: Date;
}

let smsReport: SMSReport = {
  totalSent: 0,
  successfulSent: 0,
  failedSent: 0,
  lastSentAt: new Date()
};

export function getSMSReport(): SMSReport {
  return { ...smsReport };
}

export function updateSMSReport(success: boolean): void {
  smsReport.totalSent++;
  if (success) {
    smsReport.successfulSent++;
  } else {
    smsReport.failedSent++;
  }
  smsReport.lastSentAt = new Date();
}

// پلن‌بندی پیامک‌ها (برای آینده)
export interface ScheduledSMS {
  id: string;
  phoneNumbers: string[];
  message: string;
  scheduledAt: Date;
  sent: boolean;
}

const scheduledSMSQueue: ScheduledSMS[] = [];

export function scheduleSMS(phoneNumbers: string[], message: string, scheduledAt: Date): string {
  const id = Date.now().toString();
  scheduledSMSQueue.push({
    id,
    phoneNumbers,
    message,
    scheduledAt,
    sent: false
  });
  return id;
}

// پردازش پیامک‌های برنامه‌ریزی شده
export async function processScheduledSMS(): Promise<void> {
  const now = new Date();
  const readyToSend = scheduledSMSQueue.filter(sms => 
    !sms.sent && sms.scheduledAt <= now
  );

  for (const sms of readyToSend) {
    await sendBulkSMS(sms.phoneNumbers, sms.message);
    sms.sent = true;
  }
}