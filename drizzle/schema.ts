import { pgTable, varchar, timestamp, integer, text, serial, real } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  lozinkaHash: varchar("lozinka_hash", { length: 255 }).notNull(),
  korisnickoIme: varchar("korisnicko_ime", { length: 100 }).notNull().unique(),
  slikaKorisnika: text("slika_korisnika"),
  starost: integer("starost").notNull(),
  pol: varchar("pol", { length: 20 }).notNull(),
  nivoKondicije: varchar("nivo_kondicije", { length: 20 }).notNull(),
  tempoTrcanja: real("tempo_trcanja").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("runner"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
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

export const runUsers = pgTable("run_users", {
  runUserId: serial("run_user_id").primaryKey(),
  runId: integer("run_id")
    .notNull()
    .references(() => runs.runId),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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

export const sessions = pgTable("sessions", {
  sessionId: serial("session_id").primaryKey(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.userId),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
