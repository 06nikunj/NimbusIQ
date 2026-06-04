/*
  Warnings:

  - Added the required column `userId` to the `AiRecommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Alert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `AlertHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `CostSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiRecommendation" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "AlertHistory" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CostSnapshot" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AwsCredentials" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "accessKeyId" TEXT NOT NULL,
    "secretAccessKey" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'ap-south-1',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AwsCredentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AwsCredentials_userId_key" ON "AwsCredentials"("userId");

-- AddForeignKey
ALTER TABLE "AwsCredentials" ADD CONSTRAINT "AwsCredentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRecommendation" ADD CONSTRAINT "AiRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertHistory" ADD CONSTRAINT "AlertHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
