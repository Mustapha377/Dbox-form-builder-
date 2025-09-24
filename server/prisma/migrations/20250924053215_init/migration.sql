/*
  Warnings:

  - You are about to drop the `Field` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Form` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Response` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Field" DROP CONSTRAINT "Field_formId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Form" DROP CONSTRAINT "Form_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Response" DROP CONSTRAINT "Response_formId_fkey";

-- DropTable
DROP TABLE "public"."Field";

-- DropTable
DROP TABLE "public"."Form";

-- DropTable
DROP TABLE "public"."Response";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'Free',
    "language" TEXT NOT NULL DEFAULT 'English',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."forms" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "headerImage" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "responseCount" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "lastResponse" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fields" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "calculation" TEXT,
    "amount" DECIMAL(65,30),
    "currency" TEXT,
    "conditions" JSONB,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scaleMin" INTEGER DEFAULT 1,
    "scaleMax" INTEGER DEFAULT 5,
    "scaleMinLabel" TEXT,
    "scaleMaxLabel" TEXT,

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sections" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."responses" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "email" TEXT,
    "data" JSONB NOT NULL DEFAULT '{}',
    "responses" JSONB NOT NULL DEFAULT '{}',
    "paymentId" TEXT,
    "paymentStatus" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."forms" ADD CONSTRAINT "forms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fields" ADD CONSTRAINT "fields_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sections" ADD CONSTRAINT "sections_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."responses" ADD CONSTRAINT "responses_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
