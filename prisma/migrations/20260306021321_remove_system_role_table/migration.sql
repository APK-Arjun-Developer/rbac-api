/*
  Warnings:

  - You are about to drop the `SystemRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_systemRoleId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "systemRoleType" "SystemRoleType" NOT NULL DEFAULT 'COMPANY_USER';

-- DropTable
DROP TABLE "SystemRole";
