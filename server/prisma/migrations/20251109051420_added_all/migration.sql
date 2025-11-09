-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'VIEW_ONLY', 'DEACTIVATED', 'DELETED');

-- CreateEnum
CREATE TYPE "ComplaintDomain" AS ENUM ('MESS', 'INTERNET', 'CLEANING', 'WATER', 'TRANSPORT');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('CREATED', 'REVIEWED', 'ASSIGNED', 'WORK_IN_PROGRESS', 'RESOLVED', 'ARCHIVED', 'CANCELED', 'DELETED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'MESS';
ALTER TYPE "UserRole" ADD VALUE 'INTERNET';
ALTER TYPE "UserRole" ADD VALUE 'CLEANING';
ALTER TYPE "UserRole" ADD VALUE 'WATER';
ALTER TYPE "UserRole" ADD VALUE 'TRANSPORT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mediaLink" TEXT,
    "domain" "ComplaintDomain" NOT NULL,
    "complainerId" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaLink" TEXT,
    "responderId" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Complaint_domain_idx" ON "Complaint"("domain");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");

-- CreateIndex
CREATE INDEX "Complaint_complainerId_idx" ON "Complaint"("complainerId");

-- CreateIndex
CREATE INDEX "Response_complaintId_idx" ON "Response"("complaintId");

-- CreateIndex
CREATE INDEX "Response_responderId_idx" ON "Response"("responderId");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_complainerId_fkey" FOREIGN KEY ("complainerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
