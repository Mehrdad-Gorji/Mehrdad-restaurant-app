const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const output = require('pdf-to-printer');
const puppeteer = require('puppeteer');
const open = require('open');

const app = express();
const PORT = 4000;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// --- Global State ---
let isRunning = false;
let pollingInterval = null;
let logBuffer = [];

// --- Config Management ---
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE));
        }
    } catch (e) { console.error("Config load error", e); }
    return {
        siteUrl: "http://localhost:3000",
        apiKey: "",
        printerName: "",
        checkIntervalSeconds: 30
    };
}

function saveConfig(newConfig) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
}

let config = loadConfig();

// --- PDF Logic ---
async function fetchOrders() {
    try {
        const endpoint = `${config.siteUrl}/api/printer`;
        log(`Checking for orders at: ${endpoint}`);

        const response = await axios.get(endpoint, {
            params: {
                action: 'erfan_autoprinter_get_order',
                apikey: config.apiKey
            },
            timeout: 10000
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
            log(`📦 Found ${response.data.length} new orders!`);
            return response.data;
        } else {
            return [];
        }
    } catch (error) {
        log(`❌ Error fetching orders: ${error.message}`);
        return [];
    }
}

async function markAsPrinted(orderId) {
    try {
        const endpoint = `${config.siteUrl}/api/printer`;
        await axios.get(endpoint, {
            params: {
                action: 'erfan_autoprinter_update_order',
                id: orderId,
                apikey: config.apiKey
            }
        });
        log(`✅ Marked Order #${orderId.slice(0, 8)} as printed.`);
    } catch (error) {
        log(`⚠️ Failed to mark marked as printed: ${error.message}`);
    }
}

async function printOrder(order) {
    log(`🖨️ Processing Order #${order.id.slice(0, 8)}...`);
    const pdfPath = path.join(__dirname, `order-${order.id}.pdf`);

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(order.content, { waitUntil: 'networkidle0' });
        await page.pdf({
            path: pdfPath,
            width: '80mm',
            printBackground: true,
            margin: { top: '0', bottom: '10px' }
        });
        await browser.close();

        log(`   Attempting to print to: "${config.printerName}"...`);
        await output.print(pdfPath, { printer: config.printerName });
        log('   Print job sent to Windows spooler.');

        await markAsPrinted(order.id);

    } catch (error) {
        log(`❌ Print failed: ${error.message}`);
    } finally {
        if (fs.existsSync(pdfPath)) {
            try { fs.unlinkSync(pdfPath); } catch (e) { }
        }
    }
}

let isProcessing = false;
async function checkLoop() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        const orders = await fetchOrders();
        for (const order of orders) {
            await printOrder(order);
        }
    } catch (e) {
        log("Loop Error: " + e.message);
    }

    isProcessing = false;
}

// --- Log Helper ---
function log(msg) {
    console.log(msg); // also to terminal
    logBuffer.push(msg);
    if (logBuffer.length > 100) logBuffer.shift(); // keep last 100
}

// --- Express Setup ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/config', (req, res) => {
    res.json({ ...config, isRunning });
});

app.post('/api/config', (req, res) => {
    config = { ...config, ...req.body };
    saveConfig(config);
    log('⚙️ Settings updated.');

    // Restart service if running to apply new interval
    if (isRunning) {
        stopService();
        startService();
    }

    res.json({ success: true });
});

app.get('/api/logs', (req, res) => {
    const logs = [...logBuffer];
    logBuffer = []; // Clear buffer after read (or keep it if you want history, but simple pop is fine)
    res.json(logs);
});

app.get('/api/status', (req, res) => {
    res.json({ isRunning });
});

app.get('/api/printers', async (req, res) => {
    try {
        const printers = await output.getPrinters();
        res.json(printers);
    } catch (e) {
        log("❌ Error fetching printers: " + e.message);
        res.status(500).json([]);
    }
});

app.post('/api/control', (req, res) => {
    const { action } = req.body;
    if (action === 'start') startService();
    if (action === 'stop') stopService();
    res.json({ success: true, isRunning });
});

app.post('/api/test-print', async (req, res) => {
    // Determine the user's OS name
    const os = require('os');
    const platform = os.platform(); // 'win32', etc.

    // A simple test print
    log("🧪 Generating Test Print...");
    const pdfPath = path.join(__dirname, 'test-print.pdf');
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(`
            <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                <h1>Test Print</h1>
                <p>If you can read this, the printer service is working!</p>
                <p>Website: ${config.siteUrl}</p>
                <p>Printer: ${config.printerName}</p>
                <p>OS: ${platform}</p>
                <h2>✅ Success!</h2>
            </div>
        `);
        await page.pdf({ path: pdfPath, width: '80mm', printBackground: true });
        await browser.close();

        await output.print(pdfPath, { printer: config.printerName });
        log("✅ Test print sent.");
    } catch (e) {
        log("❌ Test print failed: " + e.message);
    }

    res.json({ success: true });
});

// Service Control
function startService() {
    if (isRunning) return;
    isRunning = true;
    log("🚀 Service Started.");

    // Immediate check
    checkLoop();

    pollingInterval = setInterval(checkLoop, config.checkIntervalSeconds * 1000);
}

function stopService() {
    if (!isRunning) return;
    isRunning = false;
    if (pollingInterval) clearInterval(pollingInterval);
    log("🛑 Service Stopped.");
}

// Start Server
app.listen(PORT, () => {
    console.log(`Web Dashboard running at http://localhost:${PORT}`);

    // Auto-start if configured
    if (config.printerName && config.siteUrl && config.apiKey) {
        console.log("🔄 Auto-starting service based on saved config...");
        startService();
    }
});
