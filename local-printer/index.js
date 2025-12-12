const axios = require('axios');
const output = require('pdf-to-printer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const POLLING_INTERVAL = config.checkIntervalSeconds * 1000;
const API_ENDPOINT = `${config.siteUrl}/api/printer`;

async function fetchOrders() {
    try {
        const response = await axios.get(API_ENDPOINT, {
            params: {
                action: 'erfan_autoprinter_get_order',
                apikey: config.apiKey
            }
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
            console.log(`📦 Found ${response.data.length} new orders!`);
            return response.data;
        } else {
            // No new orders
            return [];
        }
    } catch (error) {
        console.error('❌ Error fetching orders:', error.message);
        return [];
    }
}

async function markAsPrinted(orderId) {
    try {
        await axios.get(API_ENDPOINT, {
            params: {
                action: 'erfan_autoprinter_update_order',
                id: orderId,
                apikey: config.apiKey
            }
        });
        console.log(`✅ Marked Order #${orderId.slice(0, 8)} as printed.`);
    } catch (error) {
        console.error(`⚠️ Failed to mark order ${orderId} as printed:`, error.message);
    }
}

async function printOrder(order) {
    console.log(`🖨️ Processing Order #${order.id.slice(0, 8)}...`);
    const pdfPath = path.join(__dirname, `order-${order.id}.pdf`);

    try {
        // 1. Generate PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Wrap content in basic flexible HTML if needed, or use as is
        // The API returns a div specific for 80mm/58mm width usually, but let's ensure it handles correctly
        await page.setContent(order.content, { waitUntil: 'networkidle0' });

        await page.pdf({
            path: pdfPath,
            width: '80mm', // Standard receipt width
            printBackground: true,
            margin: {
                top: '0px',
                bottom: '10px'
            }
        });
        await browser.close();

        // 2. Print PDF
        console.log(`   Attempting to print to: "${config.printerName}"...`);

        await output.print(pdfPath, {
            printer: config.printerName
        });

        console.log('   Print job sent.');

        // 3. Mark as Printed
        await markAsPrinted(order.id);

    } catch (error) {
        console.error(`❌ Print failed for order ${order.id}:`, error);
    } finally {
        // Cleanup PDF file
        if (fs.existsSync(pdfPath)) {
            try {
                fs.unlinkSync(pdfPath);
            } catch (e) { /* ignore */ }
        }
    }
}

async function startService() {
    console.log("🚀 Custom Printer Service Started");
    console.log(`   Target Site: ${config.siteUrl}`);
    console.log(`   Printer: "${config.printerName}"`);
    console.log(`   Checking every ${config.checkIntervalSeconds} seconds...`);
    console.log("---------------------------------------------------");

    // Initial check
    await checkAndPrint();

    // Loop
    setInterval(async () => {
        await checkAndPrint();
    }, POLLING_INTERVAL);
}

let isProcessing = false;

async function checkAndPrint() {
    if (isProcessing) return;
    isProcessing = true;

    const orders = await fetchOrders();
    for (const order of orders) {
        await printOrder(order);
    }

    isProcessing = false;
}

startService();
