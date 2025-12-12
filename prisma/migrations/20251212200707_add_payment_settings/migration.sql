-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "adminRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "floor" TEXT,
    "doorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryTranslation" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "image" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isSpicy" BOOLEAN NOT NULL DEFAULT false,
    "isVegetarian" BOOLEAN NOT NULL DEFAULT false,
    "isGlutenFree" BOOLEAN NOT NULL DEFAULT false,
    "isVegan" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTranslation" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ProductTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSize" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "priceModifier" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSizeTranslation" (
    "id" TEXT NOT NULL,
    "productSizeId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ProductSizeTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extra" (
    "id" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "image" TEXT,
    "categoryId" TEXT,

    CONSTRAINT "Extra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraTranslation" (
    "id" TEXT NOT NULL,
    "extraId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ExtraTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraCategory" (
    "id" TEXT NOT NULL,

    CONSTRAINT "ExtraCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraCategoryTranslation" (
    "id" TEXT NOT NULL,
    "extraCategoryId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ExtraCategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductExtra" (
    "productId" TEXT NOT NULL,
    "extraId" TEXT NOT NULL,

    CONSTRAINT "ProductExtra_pkey" PRIMARY KEY ("productId","extraId")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "total" DECIMAL(65,30) NOT NULL,
    "tip" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "deliveryMethod" TEXT NOT NULL,
    "deliveryFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "requestedTime" TIMESTAMP(3),
    "isPrinted" BOOLEAN NOT NULL DEFAULT false,
    "addressJson" TEXT,
    "estimatedMinutes" INTEGER,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "couponCode" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "comboId" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "size" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemExtra" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "extraId" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "OrderItemExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT,
    "rawResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "zipStart" TEXT NOT NULL,
    "zipEnd" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "name" TEXT,
    "minOrder" DECIMAL(65,30),
    "freeDeliveryOver" DECIMAL(65,30),
    "estimatedTime" TEXT,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "minAmount" DECIMAL(65,30),
    "maxDiscount" DECIMAL(65,30),
    "applyTo" TEXT,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxUsesPerUser" INTEGER NOT NULL DEFAULT 1,
    "design" TEXT NOT NULL DEFAULT 'TICKET',

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spendThreshold" DECIMAL(65,30) NOT NULL,
    "periodDays" INTEGER NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" DECIMAL(65,30) NOT NULL,
    "maxDiscount" DECIMAL(65,30),
    "couponValidDays" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Combo" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "discountType" TEXT,
    "discountValue" DECIMAL(65,30),
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Combo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboItem" (
    "id" TEXT NOT NULL,
    "comboId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sizeName" TEXT,
    "extrasJson" TEXT,

    CONSTRAINT "ComboItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboTranslation" (
    "id" TEXT NOT NULL,
    "comboId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ComboTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "brandName" TEXT NOT NULL DEFAULT 'PizzaShop',
    "logo" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#F25F4C',
    "secondaryColor" TEXT NOT NULL DEFAULT '#F5DFBB',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFF9F2',
    "heroTitle" TEXT NOT NULL DEFAULT 'Delicious Pizza Delivered',
    "heroDescription" TEXT NOT NULL DEFAULT 'Authentic Italian flavors delivered straight to your doorstep.',
    "heroImage" TEXT,
    "heroTitleColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "textColor" TEXT NOT NULL DEFAULT '#2D3436',
    "textMuted" TEXT NOT NULL DEFAULT '#636E72',
    "surfaceColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "surfaceAltColor" TEXT NOT NULL DEFAULT '#FAEEE5',
    "borderColor" TEXT NOT NULL DEFAULT '#F0DAC9',
    "borderRadius" TEXT NOT NULL DEFAULT '20px',
    "btnRadius" TEXT NOT NULL DEFAULT '50px',
    "glassOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    "glassBlur" TEXT NOT NULL DEFAULT '16px',
    "footerBrandDesc" TEXT NOT NULL DEFAULT 'Die beste Pizzeria der Stadt serviert authentische italienische Aromen.',
    "footerAddress" TEXT NOT NULL DEFAULT 'Storgatan 1, 123 45 Stockholm, Sweden',
    "footerPhone" TEXT NOT NULL DEFAULT '+46 123 456 789',
    "footerEmail" TEXT NOT NULL DEFAULT 'info@pizzashop.com',
    "openingHours" TEXT NOT NULL DEFAULT 'Mån-Sön: 11:00 - 23:00',
    "socialFacebook" TEXT NOT NULL DEFAULT 'https://facebook.com',
    "socialInstagram" TEXT NOT NULL DEFAULT 'https://instagram.com',
    "socialTwitter" TEXT NOT NULL DEFAULT '',
    "mapEmbedUrl" TEXT NOT NULL DEFAULT '',
    "closedTitle" TEXT NOT NULL DEFAULT 'Store is Closed',
    "closedMessage" TEXT NOT NULL DEFAULT 'We are currently closed. Please check our opening hours.',
    "closedBtnText" TEXT NOT NULL DEFAULT 'Browse Menu Only',
    "closedHoursText" TEXT NOT NULL DEFAULT 'Operating Hours',
    "welcomeCouponEnabled" BOOLEAN NOT NULL DEFAULT false,
    "welcomeCouponValue" DECIMAL(65,30) NOT NULL DEFAULT 10,
    "welcomeCouponType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "welcomeCouponDays" INTEGER NOT NULL DEFAULT 30,
    "loyaltySecondOrderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "loyaltySecondOrderValue" DECIMAL(65,30) NOT NULL DEFAULT 10,
    "loyaltySecondOrderType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "loyaltySecondOrderDays" INTEGER NOT NULL DEFAULT 30,
    "loyaltyThirdOrderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "loyaltyThirdOrderValue" DECIMAL(65,30) NOT NULL DEFAULT 15,
    "loyaltyThirdOrderType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "loyaltyThirdOrderDays" INTEGER NOT NULL DEFAULT 30,
    "scheduleEnabled" BOOLEAN NOT NULL DEFAULT false,
    "operatingSchedule" TEXT NOT NULL DEFAULT '{}',
    "headerNavLinks" TEXT NOT NULL DEFAULT '[{"label":"Home","labelSv":"Hem","labelDe":"Startseite","url":"/"},{"label":"Menu","labelSv":"Meny","labelDe":"Menü","url":"/menu"},{"label":"Offers","labelSv":"Erbjudanden","labelDe":"Angebote","url":"/offers"}]',
    "vatEnabled" BOOLEAN NOT NULL DEFAULT true,
    "vatNumber" TEXT NOT NULL DEFAULT '',
    "vatRateStandard" DOUBLE PRECISION NOT NULL DEFAULT 0.19,
    "vatRateReduced" DOUBLE PRECISION NOT NULL DEFAULT 0.07,
    "vatPriceInclusive" BOOLEAN NOT NULL DEFAULT true,
    "predefinedSizes" TEXT NOT NULL DEFAULT '["Small","Medium","Large","Extra Large"]',
    "swedbankPayEnabled" BOOLEAN NOT NULL DEFAULT false,
    "swedbankPayMode" TEXT NOT NULL DEFAULT 'test',
    "swedbankPayPayeeId" TEXT NOT NULL DEFAULT '',
    "swedbankPayAccessToken" TEXT NOT NULL DEFAULT '',
    "swedbankPayPayeeName" TEXT NOT NULL DEFAULT '',
    "swishEnabled" BOOLEAN NOT NULL DEFAULT false,
    "cardPaymentEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "discountCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferTranslation" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "OfferTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'About Us',
    "titleSv" TEXT NOT NULL DEFAULT 'Om Oss',
    "titleDe" TEXT NOT NULL DEFAULT 'Über Uns',
    "content" TEXT NOT NULL DEFAULT 'Welcome to our restaurant! We are passionate about creating delicious food with the finest ingredients.',
    "contentSv" TEXT NOT NULL DEFAULT 'Välkommen till vår restaurang! Vi brinner för att skapa utsökt mat med de finaste ingredienserna.',
    "contentDe" TEXT NOT NULL DEFAULT 'Willkommen in unserem Restaurant! Wir sind leidenschaftlich daran interessiert, köstliches Essen mit den besten Zutaten zu kreieren.',
    "mission" TEXT NOT NULL DEFAULT 'Our mission is to deliver authentic flavors and exceptional dining experiences.',
    "missionSv" TEXT NOT NULL DEFAULT 'Vårt uppdrag är att leverera autentiska smaker och exceptionella matupplevelser.',
    "missionDe" TEXT NOT NULL DEFAULT 'Unsere Mission ist es, authentische Aromen und außergewöhnliche Speiseerlebnisse zu liefern.',
    "heroImage" TEXT,
    "teamMembers" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL DEFAULT 'general',
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "reply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "_CouponProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CouponUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_categoryId_language_key" ON "CategoryTranslation"("categoryId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTranslation_productId_language_key" ON "ProductTranslation"("productId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSizeTranslation_productSizeId_language_key" ON "ProductSizeTranslation"("productSizeId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "ExtraTranslation_extraId_language_key" ON "ExtraTranslation"("extraId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "ExtraCategoryTranslation_extraCategoryId_language_key" ON "ExtraCategoryTranslation"("extraCategoryId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Combo_slug_key" ON "Combo"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ComboTranslation_comboId_language_key" ON "ComboTranslation"("comboId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "OfferTranslation_offerId_language_key" ON "OfferTranslation"("offerId", "language");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "Review_isApproved_idx" ON "Review"("isApproved");

-- CreateIndex
CREATE UNIQUE INDEX "_CouponProducts_AB_unique" ON "_CouponProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_CouponProducts_B_index" ON "_CouponProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CouponUsers_AB_unique" ON "_CouponUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_CouponUsers_B_index" ON "_CouponUsers"("B");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSize" ADD CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSizeTranslation" ADD CONSTRAINT "ProductSizeTranslation_productSizeId_fkey" FOREIGN KEY ("productSizeId") REFERENCES "ProductSize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extra" ADD CONSTRAINT "Extra_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExtraCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraTranslation" ADD CONSTRAINT "ExtraTranslation_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "Extra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraCategoryTranslation" ADD CONSTRAINT "ExtraCategoryTranslation_extraCategoryId_fkey" FOREIGN KEY ("extraCategoryId") REFERENCES "ExtraCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductExtra" ADD CONSTRAINT "ProductExtra_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductExtra" ADD CONSTRAINT "ProductExtra_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "Extra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "Combo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemExtra" ADD CONSTRAINT "OrderItemExtra_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemExtra" ADD CONSTRAINT "OrderItemExtra_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "Extra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "Combo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboTranslation" ADD CONSTRAINT "ComboTranslation_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "Combo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferTranslation" ADD CONSTRAINT "OfferTranslation_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CouponProducts" ADD CONSTRAINT "_CouponProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CouponProducts" ADD CONSTRAINT "_CouponProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CouponUsers" ADD CONSTRAINT "_CouponUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CouponUsers" ADD CONSTRAINT "_CouponUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
