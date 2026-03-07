-- CreateTable
CREATE TABLE `truck_attributes` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `nameEn` TEXT NOT NULL,
    `icon` VARCHAR(191) NOT NULL DEFAULT 'tag',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `truck_attributes_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `truck_attribute_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `truckId` VARCHAR(191) NOT NULL,
    `attributeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `truck_attribute_assignments_truckId_idx`(`truckId`),
    INDEX `truck_attribute_assignments_attributeId_idx`(`attributeId`),
    UNIQUE INDEX `truck_attribute_assignments_truckId_attributeId_key`(`truckId`, `attributeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `truck_attribute_assignments` ADD CONSTRAINT `truck_attribute_assignments_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `coffee_trucks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truck_attribute_assignments` ADD CONSTRAINT `truck_attribute_assignments_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `truck_attributes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
