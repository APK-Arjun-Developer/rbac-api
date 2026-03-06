/*
  Warnings:

  - You are about to drop the column `systemRoleId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_systemRoleId_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "systemRoleId";
