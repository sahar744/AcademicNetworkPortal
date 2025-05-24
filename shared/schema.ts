import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["user", "member", "admin"] }).notNull().default("user"),
  bio: text("bio"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: text("category").notNull(),
  authorId: integer("author_id").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  views: integer("views").notNull().default(0),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("event_date").notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull(),
  registeredCount: integer("registered_count").notNull().default(0),
  organizerId: integer("organizer_id").notNull(),
  status: text("status", { enum: ["open", "closed", "cancelled", "completed"] }).notNull().default("open"),
  registrationDeadline: timestamp("registration_deadline"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  abstract: text("abstract"),
  authorId: integer("author_id").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  reviewedBy: integer("reviewed_by"),
  reviewComments: text("review_comments"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  publishedAt: timestamp("published_at"),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
  status: text("status", { enum: ["registered", "cancelled", "attended"] }).notNull().default("registered"),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  newsId: integer("news_id"),
  eventId: integer("event_id"),
  articleId: integer("article_id"),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  news: many(news),
  events: many(events),
  articles: many(articles),
  eventRegistrations: many(eventRegistrations),
  comments: many(comments),
}));

export const newsRelations = relations(news, ({ one, many }) => ({
  author: one(users, {
    fields: [news.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  registrations: many(eventRegistrations),
  comments: many(comments),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [articles.reviewedBy],
    references: [users.id],
  }),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  news: one(news, {
    fields: [comments.newsId],
    references: [news.id],
  }),
  event: one(events, {
    fields: [comments.eventId],
    references: [events.id],
  }),
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  bio: true,
});

export const insertNewsSchema = createInsertSchema(news).pick({
  title: true,
  content: true,
  excerpt: true,
  category: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  eventDate: true,
  location: true,
  capacity: true,
  registrationDeadline: true,
});

export const insertArticleSchema = createInsertSchema(articles).pick({
  title: true,
  content: true,
  abstract: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  newsId: true,
  eventId: true,
  articleId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
