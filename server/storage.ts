import { 
  users, news, events, articles, eventRegistrations, comments,
  type User, type InsertUser, type News, type InsertNews, 
  type Event, type InsertEvent, type Article, type InsertArticle,
  type EventRegistration, type Comment, type InsertComment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(userId: number, role: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // News methods
  getAllNews(): Promise<News[]>;
  getNewsById(id: number): Promise<News | undefined>;
  createNews(news: InsertNews & { authorId: number }): Promise<News>;
  updateNews(id: number, news: Partial<News>): Promise<News | undefined>;
  deleteNews(id: number): Promise<boolean>;
  incrementNewsViews(id: number): Promise<void>;

  // Event methods
  getAllEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent & { organizerId: number }): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  registerForEvent(eventId: number, userId: number): Promise<EventRegistration>;
  unregisterFromEvent(eventId: number, userId: number): Promise<boolean>;
  getEventRegistrations(eventId: number): Promise<EventRegistration[]>;
  getUserEventRegistrations(userId: number): Promise<EventRegistration[]>;

  // Article methods
  getAllArticles(): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle & { authorId: number }): Promise<Article>;
  updateArticleStatus(id: number, status: string, reviewedBy: number, comments?: string): Promise<Article | undefined>;
  getArticlesByStatus(status: string): Promise<Article[]>;

  // Comment methods
  getCommentsByNewsId(newsId: number): Promise<Comment[]>;
  getCommentsByEventId(eventId: number): Promise<Comment[]>;
  getCommentsByArticleId(articleId: number): Promise<Comment[]>;
  createComment(comment: InsertComment & { authorId: number }): Promise<Comment>;
  approveComment(id: number): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalMembers: number;
    activeEvents: number;
    publishedNews: number;
    pendingArticles: number;
  }>;

  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role: role as any })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // News methods
  async getAllNews(): Promise<News[]> {
    return await db.select().from(news).where(eq(news.isPublished, true)).orderBy(desc(news.publishedAt));
  }

  async getNewsById(id: number): Promise<News | undefined> {
    const [newsItem] = await db.select().from(news).where(eq(news.id, id));
    return newsItem || undefined;
  }

  async createNews(newsData: InsertNews & { authorId: number }): Promise<News> {
    const [newsItem] = await db
      .insert(news)
      .values({
        ...newsData,
        isPublished: true,
        publishedAt: new Date(),
      })
      .returning();
    return newsItem;
  }

  async updateNews(id: number, newsData: Partial<News>): Promise<News | undefined> {
    const [newsItem] = await db
      .update(news)
      .set({ ...newsData, updatedAt: new Date() })
      .where(eq(news.id, id))
      .returning();
    return newsItem || undefined;
  }

  async deleteNews(id: number): Promise<boolean> {
    const result = await db.delete(news).where(eq(news.id, id));
    return result.rowCount > 0;
  }

  async incrementNewsViews(id: number): Promise<void> {
    await db
      .update(news)
      .set({ views: sql`${news.views} + 1` })
      .where(eq(news.id, id));
  }

  // Event methods
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.eventDate));
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(eventData: InsertEvent & { organizerId: number }): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(eventData)
      .returning();
    return event;
  }

  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set({ ...eventData, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount > 0;
  }

  async registerForEvent(eventId: number, userId: number): Promise<EventRegistration> {
    const [registration] = await db
      .insert(eventRegistrations)
      .values({ eventId, userId })
      .returning();
    
    // Update registered count
    await db
      .update(events)
      .set({ registeredCount: sql`${events.registeredCount} + 1` })
      .where(eq(events.id, eventId));

    return registration;
  }

  async unregisterFromEvent(eventId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(eventRegistrations)
      .where(and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.userId, userId)
      ));
    
    if (result.rowCount > 0) {
      // Update registered count
      await db
        .update(events)
        .set({ registeredCount: sql`${events.registeredCount} - 1` })
        .where(eq(events.id, eventId));
      return true;
    }
    return false;
  }

  async getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));
  }

  async getUserEventRegistrations(userId: number): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.userId, userId));
  }

  // Article methods
  async getAllArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.submittedAt));
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article || undefined;
  }

  async createArticle(articleData: InsertArticle & { authorId: number }): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values(articleData)
      .returning();
    return article;
  }

  async updateArticleStatus(id: number, status: string, reviewedBy: number, reviewComments?: string): Promise<Article | undefined> {
    const [article] = await db
      .update(articles)
      .set({ 
        status: status as any, 
        reviewedBy, 
        reviewComments,
        reviewedAt: new Date(),
        publishedAt: status === 'approved' ? new Date() : null
      })
      .where(eq(articles.id, id))
      .returning();
    return article || undefined;
  }

  async getArticlesByStatus(status: string): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.status, status as any))
      .orderBy(desc(articles.submittedAt));
  }

  // Comment methods
  async getCommentsByNewsId(newsId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(and(eq(comments.newsId, newsId), eq(comments.isApproved, true)))
      .orderBy(desc(comments.createdAt));
  }

  async getCommentsByEventId(eventId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(and(eq(comments.eventId, eventId), eq(comments.isApproved, true)))
      .orderBy(desc(comments.createdAt));
  }

  async getCommentsByArticleId(articleId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(and(eq(comments.articleId, articleId), eq(comments.isApproved, true)))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(commentData: InsertComment & { authorId: number }): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(commentData)
      .returning();
    return comment;
  }

  async approveComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db
      .update(comments)
      .set({ isApproved: true })
      .where(eq(comments.id, id))
      .returning();
    return comment || undefined;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id));
    return result.rowCount > 0;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalMembers: number;
    activeEvents: number;
    publishedNews: number;
    pendingArticles: number;
  }> {
    const [membersCount] = await db.select({ count: count() }).from(users);
    const [eventsCount] = await db.select({ count: count() }).from(events).where(eq(events.status, 'open'));
    const [newsCount] = await db.select({ count: count() }).from(news).where(eq(news.isPublished, true));
    const [articlesCount] = await db.select({ count: count() }).from(articles).where(eq(articles.status, 'pending'));

    return {
      totalMembers: membersCount.count,
      activeEvents: eventsCount.count,
      publishedNews: newsCount.count,
      pendingArticles: articlesCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
