-- CreateTable
CREATE TABLE "Analytics" (
    "id" SERIAL NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,
    "linkId" INTEGER NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
