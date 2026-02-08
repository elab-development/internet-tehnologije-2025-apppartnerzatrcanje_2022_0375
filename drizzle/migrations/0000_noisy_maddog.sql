CREATE TABLE "locations" (
	"location_id" serial PRIMARY KEY NOT NULL,
	"city" varchar(100) NOT NULL,
	"municipality" varchar(100) NOT NULL,
	"lat" real,
	"lng" real
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	"run_id" integer,
	"from_user_id" integer NOT NULL,
	"to_user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"rating_id" serial PRIMARY KEY NOT NULL,
	"score" integer NOT NULL,
	"comment" text NOT NULL,
	"run_id" integer NOT NULL,
	"from_user_id" integer NOT NULL,
	"to_user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "run_users" (
	"run_user_id" serial PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"run_id" serial PRIMARY KEY NOT NULL,
	"title" varchar(120) NOT NULL,
	"route" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"distance_km" real NOT NULL,
	"pace_min_per_km" real NOT NULL,
	"location_id" integer NOT NULL,
	"host_user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_id" serial PRIMARY KEY NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"lozinka_hash" varchar(255) NOT NULL,
	"korisnicko_ime" varchar(100) NOT NULL,
	"slika_korisnika" text,
	"starost" integer NOT NULL,
	"pol" varchar(20) NOT NULL,
	"nivo_kondicije" varchar(20) NOT NULL,
	"tempo_trcanja" real NOT NULL,
	"role" varchar(20) DEFAULT 'runner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_korisnicko_ime_unique" UNIQUE("korisnicko_ime")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_run_id_runs_run_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("run_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_from_user_id_users_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_to_user_id_users_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_run_id_runs_run_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("run_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_from_user_id_users_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_to_user_id_users_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_users" ADD CONSTRAINT "run_users_run_id_runs_run_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("run_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_users" ADD CONSTRAINT "run_users_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_location_id_locations_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_host_user_id_users_user_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;