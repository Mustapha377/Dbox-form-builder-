/*
  Warnings:

  - You are about to drop the column `maxLabel` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `minLabel` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `scaleMax` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `scaleMin` on the `Field` table. All the data in the column will be lost.
  - The `options` column on the `Field` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "public"."Field" DROP CONSTRAINT "Field_formId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Form" DROP CONSTRAINT "Form_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Response" DROP CONSTRAINT "Response_formId_fkey";

-- AlterTable
ALTER TABLE "public"."Field" DROP COLUMN "maxLabel",
DROP COLUMN "minLabel",
DROP COLUMN "scaleMax",
DROP COLUMN "scaleMin",
ADD COLUMN     "calculation" JSONB,
ADD COLUMN     "conditions" JSONB,
DROP COLUMN "options",
ADD COLUMN     "options" JSONB;

-- AddForeignKey
ALTER TABLE "public"."Form" ADD CONSTRAINT "Form_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Field" ADD CONSTRAINT "Field_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
