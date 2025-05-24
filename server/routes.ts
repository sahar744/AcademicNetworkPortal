import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertNewsSchema, insertEventSchema, insertArticleSchema, insertCommentSchema } from "@shared/schema";
import { notificationService } from "./notifications";
import { setupSwagger } from "./swagger";

export function registerRoutes(app: Express): Server {
  // Setup Swagger documentation
  setupSwagger(app);

  // Setup authentication routes
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Middleware to check admin/member role
  const requireMemberOrAdmin = (req: any, res: any, next: any) => {
    if (!req.user || (req.user.role !== 'member' && req.user.role !== 'admin')) {
      return res.status(403).json({ message: "Member or admin role required" });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin role required" });
    }
    next();
  };

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const newsList = await storage.getAllNews();
      res.json(newsList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const newsItem = await storage.getNewsById(id);
      if (!newsItem) {
        return res.status(404).json({ message: "News not found" });
      }
      await storage.incrementNewsViews(id);
      res.json(newsItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.post("/api/news", requireAuth, requireMemberOrAdmin, async (req, res) => {
    try {
      const validatedData = insertNewsSchema.parse(req.body);
      const newsItem = await storage.createNews({
        ...validatedData,
        authorId: req.user!.id,
      });
      
      // ارسال نوتیفیکیشن برای انتشار خبر جدید
      await notificationService.notifyNewsPublished(newsItem.id);
      
      res.status(201).json(newsItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create news" });
    }
  });

  app.put("/api/news/:id", requireAuth, requireMemberOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertNewsSchema.partial().parse(req.body);
      const newsItem = await storage.updateNews(id, validatedData);
      if (!newsItem) {
        return res.status(404).json({ message: "News not found" });
      }
      res.json(newsItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update news" });
    }
  });

  app.delete("/api/news/:id", requireAuth, requireMemberOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNews(id);
      if (!deleted) {
        return res.status(404).json({ message: "News not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete news" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const eventsList = await storage.getAllEvents();
      res.json(eventsList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEventById(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", requireAuth, requireMemberOrAdmin, async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent({
        ...validatedData,
        organizerId: req.user.id,
      });
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", requireAuth, requireMemberOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(id, validatedData);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", requireAuth, requireMemberOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEvent(id);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Event registration routes
  app.post("/api/events/:id/register", requireAuth, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const registration = await storage.registerForEvent(eventId, req.user!.id);
      
      // ارسال نوتیفیکیشن برای تأیید ثبت‌نام
      await notificationService.notifyEventRegistration(req.user!.id, eventId);
      
      res.status(201).json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  app.delete("/api/events/:id/register", requireAuth, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const success = await storage.unregisterFromEvent(eventId, req.user.id);
      if (!success) {
        return res.status(404).json({ message: "Registration not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to unregister from event" });
    }
  });

  app.get("/api/events/:id/registrations", requireAuth, requireMemberOrAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const registrations = await storage.getEventRegistrations(eventId);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.get("/api/user/registrations", requireAuth, async (req, res) => {
    try {
      const registrations = await storage.getUserEventRegistrations(req.user.id);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user registrations" });
    }
  });

  // Article routes
  app.get("/api/articles", requireAuth, async (req, res) => {
    try {
      const articles = await storage.getAllArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/pending", requireAuth, requireMemberOrAdmin, async (req, res) => {
    try {
      const articles = await storage.getArticlesByStatus('pending');
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending articles" });
    }
  });

  app.get("/api/articles/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticleById(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post("/api/articles", requireAuth, async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle({
        ...validatedData,
        authorId: req.user.id,
      });
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.put("/api/articles/:id/review", requireAuth, requireMemberOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, comments } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const article = await storage.updateArticleStatus(id, status, req.user!.id, comments);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // ارسال نوتیفیکیشن برای نتیجه بررسی مقاله
      await notificationService.notifyArticleReviewed(id);
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to review article" });
    }
  });

  // Comment routes
  app.get("/api/news/:id/comments", async (req, res) => {
    try {
      const newsId = parseInt(req.params.id);
      const comments = await storage.getCommentsByNewsId(newsId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.get("/api/events/:id/comments", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const comments = await storage.getCommentsByEventId(eventId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment({
        ...validatedData,
        authorId: req.user.id,
      });
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.put("/api/comments/:id/approve", requireAuth, requireMemberOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comment = await storage.approveComment(id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve comment" });
    }
  });

  app.delete("/api/comments/:id", requireAuth, requireMemberOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteComment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      // برای سادگی، نوتیفیکیشن‌های نمونه برمی‌گردانیم
      const notifications = [
        {
          id: 1,
          type: 'welcome',
          title: 'خوش آمدید!',
          message: 'به انجمن علمی کامپیوتر خوش آمدید',
          read: false,
          createdAt: new Date().toISOString(),
        }
      ];
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put("/api/notifications/mark-all-read", requireAuth, async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", requireAuth, async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // User management routes (admin only)
  app.get("/api/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/users/:id/role", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!['user', 'member', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.updateUserRole(id, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
