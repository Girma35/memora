CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "memory_items" ADD COLUMN "embedding" vector(1536);