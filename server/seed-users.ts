import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedUsers() {
  try {
    // بررسی وجود کاربران نمونه
    const existingUsers = await storage.getAllUsers();
    const hasAdmin = existingUsers.some(u => u.username === 'admin');
    if (hasAdmin) {
      console.log("کاربران نمونه قبلاً ایجاد شده‌اند");
      return;
    }

    // ایجاد کاربران نمونه
    const sampleUsers = [
      {
        username: "admin",
        password: await hashPassword("admin123"),
        email: "admin@university.ac.ir",
        fullName: "مدیر سیستم",
        role: "admin",
        bio: "مدیر کل سیستم انجمن علمی کامپیوتر"
      },
      {
        username: "member1",
        password: await hashPassword("member123"),
        email: "member1@university.ac.ir", 
        fullName: "علی احمدی",
        role: "member",
        bio: "عضو انجمن علمی کامپیوتر - تخصص در هوش مصنوعی"
      },
      {
        username: "member2",
        password: await hashPassword("member123"),
        email: "member2@university.ac.ir",
        fullName: "مریم حسینی",
        role: "member", 
        bio: "عضو انجمن علمی کامپیوتر - تخصص در امنیت سایبری"
      },
      {
        username: "user1",
        password: await hashPassword("user123"),
        email: "user1@student.university.ac.ir",
        fullName: "محمد کریمی",
        role: "user",
        bio: "دانشجوی کارشناسی علوم کامپیوتر"
      },
      {
        username: "user2", 
        password: await hashPassword("user123"),
        email: "user2@student.university.ac.ir",
        fullName: "فاطمه نوری",
        role: "user",
        bio: "دانشجوی کارشناسی ارشد مهندسی کامپیوتر"
      }
    ];

    // ایجاد کاربران در دیتابیس
    for (const userData of sampleUsers) {
      await storage.createUser(userData);
      console.log(`کاربر ${userData.fullName} (${userData.username}) ایجاد شد`);
    }

    console.log("تمام کاربران نمونه با موفقیت ایجاد شدند!");
    console.log("\n--- اطلاعات ورود ---");
    console.log("مدیر: admin / admin123");
    console.log("عضو انجمن 1: member1 / member123");
    console.log("عضو انجمن 2: member2 / member123");
    console.log("کاربر عادی 1: user1 / user123");
    console.log("کاربر عادی 2: user2 / user123");

  } catch (error) {
    console.error("خطا در ایجاد کاربران نمونه:", error);
  }
}