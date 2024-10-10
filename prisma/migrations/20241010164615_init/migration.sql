-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'IN_PROCESS', 'CANCELED');

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "materialID" TEXT NOT NULL,
    "orderQuantity" DOUBLE PRECISION NOT NULL,
    "predictedDate" TIMESTAMP(3) NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "predicionID" TEXT NOT NULL,
    "realQuantity" DOUBLE PRECISION NOT NULL,
    "purchaseDate" TIMESTAMP(3),
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);
