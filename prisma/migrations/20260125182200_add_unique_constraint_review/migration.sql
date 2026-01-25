-- AlterTable
ALTER TABLE `reviews` ADD UNIQUE INDEX `reviews_truckId_userId_key`(`truckId`, `userId`);
