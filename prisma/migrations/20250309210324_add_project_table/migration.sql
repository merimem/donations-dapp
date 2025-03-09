-- CreateTable
CREATE TABLE "ProjectList" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "amountRaised" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectList_pkey" PRIMARY KEY ("id")
);
