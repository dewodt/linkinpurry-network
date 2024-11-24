-- AlterTable
ALTER TABLE "users" ADD COLUMN     "full_name" VARCHAR(255),
ADD COLUMN     "profile_photo_path" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "work_history" TEXT;
