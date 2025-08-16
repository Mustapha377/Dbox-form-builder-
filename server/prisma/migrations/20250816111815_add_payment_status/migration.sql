/*
  Warnings:

  - Added the required column `data` to the `Response` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Response" ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "paymentStatus" TEXT;
