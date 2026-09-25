-- Create file logs table
CREATE TABLE "file_logs" (
    "id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "event" TEXT NOT NULL,
    "detail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_logs_pkey" PRIMARY KEY ("id")
);

-- Indexes for lookups and cleanup
CREATE INDEX "file_logs_file_id_idx" ON "file_logs"("file_id");
CREATE INDEX "file_logs_created_at_idx" ON "file_logs"("created_at");