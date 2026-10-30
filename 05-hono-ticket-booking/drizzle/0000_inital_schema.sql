CREATE TYPE "public"."event_status" AS ENUM('DRAFT', 'PUBLISHED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'CUSTOMER');--> statement-breakpoint
CREATE TABLE "events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"description" text,
	"location" varchar(255),
	"startTime" timestamp with time zone,
	"status" "event_status" DEFAULT 'DRAFT' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"orderId" bigint NOT NULL,
	"ticketTypeId" bigint NOT NULL,
	"quantity" integer,
	"unitPrice" integer
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"userId" bigint,
	"eventId" bigint,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"totalAmount" bigint,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_types" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ticket_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"eventId" bigint,
	"name" varchar(255),
	"price" integer,
	"quantity" integer,
	"reservedQuantity" integer DEFAULT 0 NOT NULL,
	"soldQuantity" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(255),
	"role" "role" DEFAULT 'CUSTOMER' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_ticketTypeId_ticket_types_id_fk" FOREIGN KEY ("ticketTypeId") REFERENCES "public"."ticket_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_eventId_events_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_eventId_events_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;