-- CreateTable
CREATE TABLE `page_views` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `path` VARCHAR(500) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
