-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "swedbankPayAutoOrderStatus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "swedbankPayDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "swedbankPayInstantCapture" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "swedbankPayLanguage" TEXT NOT NULL DEFAULT 'sv-SE',
ADD COLUMN     "swedbankPayLogging" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "swedbankPayLogoUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "swedbankPayTermsUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "swedbankPayTitle" TEXT NOT NULL DEFAULT 'Swedbank Pay';
