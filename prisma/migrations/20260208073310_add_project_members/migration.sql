-- AlterTable
ALTER TABLE `project` ADD COLUMN `DueDate` DATE NULL,
    ADD COLUMN `Status` VARCHAR(20) NOT NULL DEFAULT 'Active';

-- CreateTable
CREATE TABLE `ProjectMember` (
    `ProjectID` INTEGER NOT NULL,
    `UserID` INTEGER NOT NULL,
    `JoinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `Role` VARCHAR(20) NOT NULL DEFAULT 'Member',

    PRIMARY KEY (`ProjectID`, `UserID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProjectMember` ADD CONSTRAINT `ProjectMember_ProjectID_fkey` FOREIGN KEY (`ProjectID`) REFERENCES `Project`(`ProjectID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectMember` ADD CONSTRAINT `ProjectMember_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;
