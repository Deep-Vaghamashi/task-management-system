/*
  Warnings:

  - You are about to drop the `role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userrole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `userrole` DROP FOREIGN KEY `UserRole_RoleID_fkey`;

-- DropForeignKey
ALTER TABLE `userrole` DROP FOREIGN KEY `UserRole_UserID_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `Role` VARCHAR(191) NOT NULL DEFAULT 'Manager';

-- DropTable
DROP TABLE `role`;

-- DropTable
DROP TABLE `userrole`;
