import { pgTable, varchar, timestamp, integer, text, serial, real } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  age: integer("age").notNull(),
  gender: varchar("gender", { length: 20 }).notNull(),
  fitnessLevel: varchar("fitness_level", { length: 20 }).notNull(),
  runningPaceMinPerKm: real("running_pace_min_per_km").notNull(),
  profileImage: text("profile_image"),
  city: varchar("city", { length: 100 }).notNull(),
});

export const locations = pgTable("locations", {
  locationId: serial("location_id").primaryKey(),
  city: varchar("city", { length: 100 }).notNull(),
  municipality: varchar("municipality", { length: 100 }).notNull(),
});

export const runs = pgTable("runs", {
  runId: serial("run_id").primaryKey(),
  title: varchar("title", { length: 120 }).notNull(),
  route: text("route").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  distanceKm: real("distance_km").notNull(),
  paceMinPerKm: real("pace_min_per_km").notNull(),
  locationId: integer("location_id").notNull().references(() => locations.locationId),
  hostUserId: integer("host_user_id").notNull().references(() => users.userId),
});

export const messages = pgTable("messages", {
  messageId: serial("message_id").primaryKey(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull(),
  runId: integer("run_id").references(() => runs.runId),
  fromUserId: integer("from_user_id").notNull().references(() => users.userId),
  toUserId: integer("to_user_id").notNull().references(() => users.userId),
});

export const ratings = pgTable("ratings", {
  ratingId: serial("rating_id").primaryKey(),
  score: integer("score").notNull(),
  comment: text("comment").notNull(),
  fromUserId: integer("from_user_id").notNull().references(() => users.userId),
  toUserId: integer("to_user_id").notNull().references(() => users.userId),
});
