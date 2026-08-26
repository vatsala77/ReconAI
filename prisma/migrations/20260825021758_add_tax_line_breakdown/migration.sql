-- CreateTable
CREATE TABLE "bank_settlements" (
    "id" TEXT NOT NULL,
    "utr" TEXT NOT NULL,
    "transfer_id" TEXT NOT NULL,
    "amount_credited" INTEGER NOT NULL,
    "credited_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "upload_batch_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gst_filings" (
    "id" TEXT NOT NULL,
    "vendor_gstin" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "tcs_reported" INTEGER NOT NULL,
    "filing_period" TEXT NOT NULL,
    "filed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "upload_batch_id" TEXT,

    CONSTRAINT "gst_filings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_settlements_utr_key" ON "bank_settlements"("utr");

-- AddForeignKey
ALTER TABLE "bank_settlements" ADD CONSTRAINT "bank_settlements_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "route_transfers"("transfer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_settlements" ADD CONSTRAINT "bank_settlements_upload_batch_id_fkey" FOREIGN KEY ("upload_batch_id") REFERENCES "upload_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gst_filings" ADD CONSTRAINT "gst_filings_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gst_filings" ADD CONSTRAINT "gst_filings_upload_batch_id_fkey" FOREIGN KEY ("upload_batch_id") REFERENCES "upload_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
