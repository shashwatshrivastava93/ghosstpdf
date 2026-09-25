-- Create file status enum
CREATE TYPE "FileStatus" AS ENUM ('ACTIVE', 'OPENED', 'DELETED');

-- Create temporary files table
CREATE TABLE "temp_files" (
    "id" UUID NOT NULL,
    "object_key" TEXT NOT NULL,
    "wrapped_key" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "status" "FileStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opened_at" TIMESTAMP(3),

    CONSTRAINT "temp_files_pkey" PRIMARY KEY ("id")
);

-- Index for fast expiry lookups
CREATE INDEX "temp_files_status_idx" ON "temp_files"("status");

-- Index for expiry-based cleanup
CREATE INDEX "temp_files_expires_at_idx" ON "temp_files"("expires_at");