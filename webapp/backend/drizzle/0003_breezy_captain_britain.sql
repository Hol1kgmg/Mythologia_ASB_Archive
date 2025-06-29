CREATE TABLE "leaders" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"name_en" varchar(50) NOT NULL,
	"sub_name" varchar(100),
	"description" varchar(500),
	"color" varchar(7) NOT NULL,
	"icon_url" varchar(500),
	"image_url" varchar(500),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "leaders_name_unique" UNIQUE("name"),
	CONSTRAINT "leaders_name_en_unique" UNIQUE("name_en")
);
--> statement-breakpoint
CREATE TABLE "tribes" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"leader_id" integer,
	"thematic" varchar(100),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"master_card_id" varchar(36),
	CONSTRAINT "tribes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "card_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(20) NOT NULL,
	"release_date" date NOT NULL,
	"card_count" integer DEFAULT 0 NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "card_sets_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_number" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"tribe_id" integer NOT NULL,
	"category_id" integer,
	"rarity_id" integer NOT NULL,
	"card_type_id" integer NOT NULL,
	"cost" integer NOT NULL,
	"power" integer NOT NULL,
	"effects" json,
	"flavor_text" text,
	"image_url" varchar(500),
	"artist" varchar(100),
	"card_set_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cards_card_number_unique" UNIQUE("card_number")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY NOT NULL,
	"tribe_id" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"name_en" varchar(50) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rarities" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"name_en" varchar(50) NOT NULL,
	"color" varchar(7) NOT NULL,
	"icon" varchar(10),
	"max_in_deck" integer DEFAULT 3,
	"drop_rate" numeric(6, 3) DEFAULT '0.000',
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "rarities_name_unique" UNIQUE("name"),
	CONSTRAINT "rarities_name_en_unique" UNIQUE("name_en")
);
--> statement-breakpoint
CREATE TABLE "card_types" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"name_en" varchar(50) NOT NULL,
	"description" varchar(500),
	"icon" varchar(10),
	"color" varchar(7),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "card_types_name_unique" UNIQUE("name"),
	CONSTRAINT "card_types_name_en_unique" UNIQUE("name_en")
);
--> statement-breakpoint
CREATE TABLE "card_categories" (
	"card_id" uuid NOT NULL,
	"category_id" integer NOT NULL,
	"is_primary" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "card_categories_card_id_category_id_pk" PRIMARY KEY("card_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ALTER COLUMN "token" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "tribes" ADD CONSTRAINT "tribes_leader_id_leaders_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."leaders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_tribe_id_tribes_id_fk" FOREIGN KEY ("tribe_id") REFERENCES "public"."tribes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_card_set_id_card_sets_id_fk" FOREIGN KEY ("card_set_id") REFERENCES "public"."card_sets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_rarity_id_rarities_id_fk" FOREIGN KEY ("rarity_id") REFERENCES "public"."rarities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_card_type_id_card_types_id_fk" FOREIGN KEY ("card_type_id") REFERENCES "public"."card_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_tribe_id_tribes_id_fk" FOREIGN KEY ("tribe_id") REFERENCES "public"."tribes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_categories" ADD CONSTRAINT "card_categories_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_categories" ADD CONSTRAINT "card_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tribes_name_idx" ON "tribes" USING btree ("name");--> statement-breakpoint
CREATE INDEX "tribes_active_idx" ON "tribes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "tribes_leader_idx" ON "tribes" USING btree ("leader_id");--> statement-breakpoint
CREATE INDEX "card_sets_code_idx" ON "card_sets" USING btree ("code");--> statement-breakpoint
CREATE INDEX "card_sets_release_date_idx" ON "card_sets" USING btree ("release_date");--> statement-breakpoint
CREATE INDEX "card_sets_active_idx" ON "card_sets" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "cards_name_idx" ON "cards" USING btree ("name");--> statement-breakpoint
CREATE INDEX "cards_card_number_idx" ON "cards" USING btree ("card_number");--> statement-breakpoint
CREATE INDEX "cards_rarity_id_idx" ON "cards" USING btree ("rarity_id");--> statement-breakpoint
CREATE INDEX "cards_card_type_id_idx" ON "cards" USING btree ("card_type_id");--> statement-breakpoint
CREATE INDEX "cards_tribe_id_idx" ON "cards" USING btree ("tribe_id");--> statement-breakpoint
CREATE INDEX "cards_category_id_idx" ON "cards" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "cards_cost_idx" ON "cards" USING btree ("cost");--> statement-breakpoint
CREATE INDEX "cards_power_idx" ON "cards" USING btree ("power");--> statement-breakpoint
CREATE INDEX "cards_card_set_idx" ON "cards" USING btree ("card_set_id");--> statement-breakpoint
CREATE INDEX "cards_active_idx" ON "cards" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "cards_deleted_at_idx" ON "cards" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "cards_rarity_type_idx" ON "cards" USING btree ("rarity_id","card_type_id");--> statement-breakpoint
CREATE INDEX "cards_tribe_type_idx" ON "cards" USING btree ("tribe_id","card_type_id");--> statement-breakpoint
CREATE INDEX "cards_tribe_category_idx" ON "cards" USING btree ("tribe_id","category_id");--> statement-breakpoint
CREATE INDEX "cards_cost_power_idx" ON "cards" USING btree ("cost","power");--> statement-breakpoint
CREATE INDEX "cards_set_active_idx" ON "cards" USING btree ("card_set_id","is_active");--> statement-breakpoint
CREATE INDEX "categories_tribe_id_idx" ON "categories" USING btree ("tribe_id");--> statement-breakpoint
CREATE INDEX "categories_name_idx" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "categories_name_en_idx" ON "categories" USING btree ("name_en");--> statement-breakpoint
CREATE INDEX "categories_active_idx" ON "categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "categories_deleted_at_idx" ON "categories" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "categories_tribe_name_unique" ON "categories" USING btree ("tribe_id","name");--> statement-breakpoint
CREATE INDEX "categories_tribe_name_en_unique" ON "categories" USING btree ("tribe_id","name_en");--> statement-breakpoint
CREATE INDEX "card_categories_card_idx" ON "card_categories" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "card_categories_category_idx" ON "card_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "card_categories_primary_idx" ON "card_categories" USING btree ("card_id","is_primary");--> statement-breakpoint
CREATE INDEX "card_categories_active_idx" ON "card_categories" USING btree ("is_active");