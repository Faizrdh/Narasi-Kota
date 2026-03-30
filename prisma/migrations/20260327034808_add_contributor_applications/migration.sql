-- CreateTable
CREATE TABLE "contributor_applications" (
    "id" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "nomorHP" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "jenisKelamin" TEXT,
    "role" TEXT NOT NULL,
    "pengalaman" TEXT NOT NULL,
    "spesialisasi" TEXT NOT NULL,
    "motivasi" TEXT NOT NULL,
    "portofolioLink" TEXT,
    "cvFileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "catatanAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributor_applications_pkey" PRIMARY KEY ("id")
);
