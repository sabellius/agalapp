-- CreateTable
CREATE TABLE `truck_hours` (
    `id` VARCHAR(191) NOT NULL,
    `truckId` VARCHAR(191) NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,
    `openTime` VARCHAR(5) NULL,
    `closeTime` VARCHAR(5) NULL,
    `isClosed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `truck_hours_truckId_idx`(`truckId`),
    UNIQUE INDEX `truck_hours_truckId_dayOfWeek_key`(`truckId`, `dayOfWeek`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `truck_hours` ADD CONSTRAINT `truck_hours_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `coffee_trucks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
