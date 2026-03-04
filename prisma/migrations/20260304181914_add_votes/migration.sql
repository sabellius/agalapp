-- DropIndex
DROP INDEX `coffee_trucks_latitude_longitude_idx` ON `coffee_trucks`;

-- AlterTable
ALTER TABLE `coffee_trucks` MODIFY `latitude` DOUBLE NULL,
    MODIFY `longitude` DOUBLE NULL;

-- CreateTable
CREATE TABLE `votes` (
    `id` VARCHAR(191) NOT NULL,
    `reviewId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `votes_reviewId_idx`(`reviewId`),
    INDEX `votes_userId_idx`(`userId`),
    UNIQUE INDEX `votes_reviewId_userId_key`(`reviewId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `votes` ADD CONSTRAINT `votes_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `reviews`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votes` ADD CONSTRAINT `votes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
