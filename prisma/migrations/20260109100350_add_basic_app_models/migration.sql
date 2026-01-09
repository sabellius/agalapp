-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('USER', 'TRUCK_OWNER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `coffee_trucks` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `coffee_trucks_city_idx`(`city`),
    INDEX `coffee_trucks_latitude_longitude_idx`(`latitude`, `longitude`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coffee_truck_images` (
    `id` VARCHAR(191) NOT NULL,
    `truckId` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `publicId` TEXT NOT NULL,
    `alt` TEXT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `coffee_truck_images_truckId_idx`(`truckId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `truckId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `reviews_truckId_idx`(`truckId`),
    INDEX `reviews_userId_idx`(`userId`),
    INDEX `reviews_rating_idx`(`rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -- CreateIndex
-- CREATE INDEX `accounts_userId_idx` ON `accounts`(`userId`(191));

-- -- CreateIndex
-- CREATE INDEX `sessions_userId_idx` ON `sessions`(`userId`(191));

-- AddForeignKey
ALTER TABLE `coffee_trucks` ADD CONSTRAINT `coffee_trucks_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coffee_truck_images` ADD CONSTRAINT `coffee_truck_images_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `coffee_trucks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `coffee_trucks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
