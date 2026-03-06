/*
  Warnings:

  - You are about to drop the column `systemRoleType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "systemRoleType",
ADD COLUMN     "systemRole" "SystemRoleType" NOT NULL DEFAULT 'COMPANY_USER';
