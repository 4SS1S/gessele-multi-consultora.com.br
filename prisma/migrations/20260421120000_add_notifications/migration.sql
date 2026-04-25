CREATE TABLE "notifications" (
  "id"         TEXT NOT NULL,
  "user_id"    UUID NOT NULL,
  "title"      TEXT NOT NULL,
  "body"       TEXT NOT NULL,
  "href"       TEXT,
  "read"       BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE
);
