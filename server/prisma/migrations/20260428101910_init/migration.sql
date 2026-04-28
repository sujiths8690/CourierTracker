-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `address` TEXT NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lng` DOUBLE NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `mobileNumber` VARCHAR(13) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Driver` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `mobileNumber` VARCHAR(15) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrackingLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `lat` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lng` DOUBLE NOT NULL,

    INDEX `TrackingLog_bookingId_createdAt_idx`(`bookingId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(90) NOT NULL,
    `type` ENUM('ADMIN', 'STAFF') NULL DEFAULT 'STAFF',
    `password` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VehicleBooking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `pickupLat` DOUBLE NOT NULL,
    `destLat` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED', 'LOADING') NOT NULL DEFAULT 'PENDING',
    `trackingToken` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `route` JSON NULL,
    `destLng` DOUBLE NOT NULL,
    `pickupLng` DOUBLE NOT NULL,
    `lastLat` DOUBLE NULL,
    `lastLng` DOUBLE NULL,
    `lastUpdated` DATETIME(3) NULL,
    `userId` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `customerId` INTEGER NOT NULL,
    `destAddress` VARCHAR(191) NOT NULL,
    `pickupAddress` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `VehicleBooking_trackingToken_key`(`trackingToken`),
    UNIQUE INDEX `VehicleBooking_bookingId_key`(`bookingId`),
    INDEX `VehicleBooking_customerId_fkey`(`customerId`),
    INDEX `VehicleBooking_userId_fkey`(`userId`),
    INDEX `VehicleBooking_vehicleId_fkey`(`vehicleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VehicleDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` VARCHAR(100) NOT NULL,
    `type` ENUM('TRUCK', 'PICKUP') NOT NULL DEFAULT 'TRUCK',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `status` ENUM('AVAILABLE', 'BUSY') NOT NULL DEFAULT 'AVAILABLE',
    `isActive` BOOLEAN NULL DEFAULT true,
    `lastLat` DOUBLE NULL,
    `lastUpdated` DATETIME(3) NULL,
    `pricePerKm` DOUBLE NULL DEFAULT 10,
    `lastLng` DOUBLE NULL,

    UNIQUE INDEX `VehicleDetails_number_key`(`number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VehicleUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `type` ENUM('OWNER', 'DRIVER') NOT NULL DEFAULT 'DRIVER',
    `mobileNumber` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `vehicleId` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    INDEX `VehicleUser_vehicleId_fkey`(`vehicleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TrackingLog` ADD CONSTRAINT `TrackingLog_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `VehicleBooking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VehicleBooking` ADD CONSTRAINT `VehicleBooking_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VehicleBooking` ADD CONSTRAINT `VehicleBooking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VehicleBooking` ADD CONSTRAINT `VehicleBooking_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `VehicleDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VehicleUser` ADD CONSTRAINT `VehicleUser_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `VehicleDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
