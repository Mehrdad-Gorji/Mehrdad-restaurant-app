'use client';

// QZ Tray integration for silent thermal printing
// Requires QZ Tray app to be installed: https://qz.io/download/

import { getPrintSettings, getPaperFormat, type PaperFormatId, type PrintSettings } from './print-settings';



interface QZ {
    websocket: {
        connect: () => Promise<void>;
        disconnect: () => Promise<void>;
        isActive: () => boolean;
    };
    printers: {
        find: (name?: string) => Promise<string | string[]>;
        getDefault: () => Promise<string>;
    };
    configs: {
        create: (printer: string, options?: any) => any;
    };
    print: (config: any, data: any[]) => Promise<void>;
    security: {
        setCertificatePromise: (callback: (resolve: (cert: string) => void) => void) => void;
        setSignatureAlgorithm: (algorithm: string) => void;
    };
}

declare global {
    interface Window {
        qz?: QZ;
    }
}

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    size?: string;
    sizeName?: string;
    sizeLabel?: string;
    product?: { translations?: { name: string; lang: string }[] };
    combo?: { translations?: { name: string; lang: string }[] };
    extras?: { name?: string; extra?: { translations?: { name: string; lang: string }[] }; price: number }[];
}

interface Order {
    id: string;
    createdAt: string;
    status: string;
    total: number;
    deliveryMethod: string;
    deliveryFee?: number;
    tip?: number;
    couponCode?: string | null;
    isScheduled?: boolean;
    requestedTime?: string | null;
    addressJson?: string | null;
    items: OrderItem[];
    user?: { name?: string; phone?: string; email?: string } | null;
}

// Generate ESC/POS commands for thermal printer
function generateReceiptCommands(order: Order, shopName: string = 'Palmas Pizzeria'): string[] {
    const parseAddress = (json: string | null | undefined) => {
        try { return json ? JSON.parse(json) : {}; } catch { return {}; }
    };

    const address = parseAddress(order.addressJson);
    const customer = address.customer || order.user || {};

    const getProductName = (item: OrderItem) => {
        const translation = item.product?.translations?.find(t => t.lang === 'en')
            || item.product?.translations?.[0]
            || item.combo?.translations?.find(t => t.lang === 'en')
            || item.combo?.translations?.[0];
        return translation?.name || 'Product';
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('sv-SE', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const line = '----------------------------------------';
    const commands: string[] = [];

    // ESC/POS commands
    const ESC = '\x1B';
    const GS = '\x1D';

    // Initialize printer
    commands.push(ESC + '@'); // Initialize
    commands.push(ESC + 'a' + '\x01'); // Center align

    // Header
    commands.push(ESC + '!' + '\x38'); // Double height + Double width + Bold
    commands.push(shopName + '\n');
    commands.push(ESC + '!' + '\x00'); // Normal
    commands.push('Order Receipt\n');
    commands.push('\n');

    commands.push(ESC + 'a' + '\x00'); // Left align
    commands.push(line + '\n');

    // Order Info
    commands.push(ESC + '!' + '\x08'); // Bold
    commands.push(`Order: #${order.id.slice(0, 8).toUpperCase()}\n`);
    commands.push(ESC + '!' + '\x00'); // Normal
    commands.push(`Date: ${formatDate(order.createdAt)}\n`);
    commands.push(`Type: ${order.deliveryMethod}\n`);
    commands.push(`Status: ${order.status}\n`);

    if (order.isScheduled && order.requestedTime) {
        commands.push(line + '\n');
        commands.push(ESC + '!' + '\x38'); // Double height + width + bold
        commands.push('SCHEDULED FOR:\n');
        commands.push(ESC + '!' + '\x00'); // Normal
        commands.push(ESC + '!' + '\x10'); // Double height
        commands.push(`${formatDate(order.requestedTime)}\n`);
        commands.push(ESC + '!' + '\x00'); // Normal
    }

    commands.push(line + '\n');

    // Customer Info
    commands.push(ESC + '!' + '\x08'); // Bold
    commands.push('CUSTOMER:\n');
    commands.push(ESC + '!' + '\x00'); // Normal
    if (customer.name) commands.push(`${customer.name}\n`);
    if (customer.phone) commands.push(`Tel: ${customer.phone}\n`);
    if (customer.email) commands.push(`${customer.email}\n`);
    if (order.deliveryMethod === 'DELIVERY' && address.street) {
        commands.push(`${address.street}\n`);
        if (address.city) commands.push(`${address.city} ${address.zip || ''}\n`);
        if (address.floor) commands.push(`Floor: ${address.floor}\n`);
        if (address.door) commands.push(`Door: ${address.door}\n`);
    }
    commands.push(line + '\n');

    // Items
    commands.push(ESC + '!' + '\x08'); // Bold
    commands.push('ITEMS:\n');
    commands.push(ESC + '!' + '\x00'); // Normal

    order.items.forEach(item => {
        const name = getProductName(item);
        const itemTotal = Number(item.price) * item.quantity;
        commands.push(`${item.quantity}x ${name.padEnd(25)} ${itemTotal} SEK\n`);

        if (item.sizeLabel) {
            commands.push(`   Size: ${item.sizeLabel}\n`);
        }

        if (item.extras && item.extras.length > 0) {
            item.extras.forEach(ex => {
                const extraName = ex?.name
                    || ex?.extra?.translations?.find((t: any) => t.lang === 'en')?.name
                    || ex?.extra?.translations?.[0]?.name
                    || 'Extra';
                commands.push(`   + ${extraName} (${Number(ex.price)} SEK)\n`);
            });
        }
    });

    commands.push(line + '\n');

    // VAT Breakdown (assuming 7% food, 19% delivery for Germany)
    const itemsTotal = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const deliveryFee = Number(order.deliveryFee) || 0;
    const foodVatRate = 0.07;
    const deliveryVatRate = 0.19;
    const foodVat = itemsTotal - (itemsTotal / (1 + foodVatRate));
    const deliveryVat = deliveryFee > 0 ? deliveryFee - (deliveryFee / (1 + deliveryVatRate)) : 0;
    const totalVat = foodVat + deliveryVat;

    commands.push('VAT BREAKDOWN:\n');
    commands.push(`Items (net):    ${(itemsTotal - foodVat).toFixed(2)} SEK\n`);
    commands.push(`Food VAT (${(foodVatRate * 100).toFixed(0)}%):   ${foodVat.toFixed(2)} SEK\n`);
    if (deliveryFee > 0) {
        commands.push(`Delivery (net): ${(deliveryFee - deliveryVat).toFixed(2)} SEK\n`);
        commands.push(`Del. VAT (${(deliveryVatRate * 100).toFixed(0)}%): ${deliveryVat.toFixed(2)} SEK\n`);
    }
    commands.push(line + '\n');

    // Total
    commands.push(ESC + '!' + '\x38'); // Double height + width + bold
    commands.push(ESC + 'a' + '\x02'); // Right align
    commands.push(`TOTAL: ${Number(order.total)} SEK\n`);
    commands.push(`(inkl. MwSt. ${totalVat.toFixed(2)} SEK)\n`);
    commands.push(ESC + '!' + '\x00'); // Normal
    commands.push(ESC + 'a' + '\x00'); // Left align
    commands.push(line + '\n');

    // Footer
    commands.push(ESC + 'a' + '\x01'); // Center
    commands.push('\nThank you for your order!\n');
    commands.push(`Printed: ${new Date().toLocaleTimeString()}\n`);
    commands.push('\n\n\n');

    // Cut paper
    commands.push(GS + 'V' + '\x00'); // Full cut

    return commands;
}

// QZ Tray connection status
let qzConnected = false;
let qzConnecting = false;
let qzScriptLoaded = false;

// Load QZ Tray script from CDN
async function loadQZScript(): Promise<boolean> {
    if (qzScriptLoaded && window.qz) return true;
    if (typeof window === 'undefined') return false;

    return new Promise((resolve) => {
        // Check if already loaded
        if (window.qz) {
            qzScriptLoaded = true;
            resolve(true);
            return;
        }

        // Check if script tag already exists
        if (document.querySelector('script[src*="qz-tray"]')) {
            const checkLoaded = setInterval(() => {
                if (window.qz) {
                    qzScriptLoaded = true;
                    clearInterval(checkLoaded);
                    resolve(true);
                }
            }, 100);
            setTimeout(() => {
                clearInterval(checkLoaded);
                resolve(false);
            }, 5000);
            return;
        }

        // Load from QZ Tray CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.min.js';
        script.async = true;
        script.onload = () => {
            console.log('📄 QZ Tray script loaded');
            // Wait a moment for initialization
            setTimeout(() => {
                qzScriptLoaded = !!window.qz;
                resolve(qzScriptLoaded);
            }, 100);
        };
        script.onerror = () => {
            console.error('❌ Failed to load QZ Tray script');
            resolve(false);
        };
        document.head.appendChild(script);
    });
}

// Cache for certificate
let cachedCertificate: string | null = null;

// Fetch certificate from file
async function fetchCertificate(): Promise<string> {
    if (cachedCertificate) return cachedCertificate;

    try {
        const response = await fetch('/qz/digital-certificate.txt');
        if (response.ok) {
            cachedCertificate = await response.text();
            return cachedCertificate;
        }
    } catch (e) {
        console.warn('Could not fetch QZ certificate:', e);
    }
    return ''; // Empty for demo mode
}

// Connect to QZ Tray with proper certificate handling
export async function connectQZ(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // First, load the QZ Tray script if not loaded
    const scriptLoaded = await loadQZScript();
    if (!scriptLoaded || !window.qz) {
        console.error('QZ Tray script not loaded. Make sure QZ Tray app is installed: https://qz.io/download/');
        return false;
    }

    // Already connected
    if (qzConnected && window.qz.websocket.isActive()) {
        return true;
    }

    // Wait for existing connection attempt
    if (qzConnecting) {
        return new Promise(resolve => setTimeout(() => resolve(qzConnected), 2000));
    }

    qzConnecting = true;

    try {
        // Fetch and set certificate
        const certificate = await fetchCertificate();

        // Set certificate promise - QZ Tray will use this to verify trust
        window.qz.security.setCertificatePromise((resolve) => {
            resolve(certificate);
        });

        // Set signature algorithm (required for signed requests)
        window.qz.security.setSignatureAlgorithm('SHA512');

        // Connect to QZ Tray
        await window.qz.websocket.connect();
        qzConnected = true;
        console.log('✅ QZ Tray connected successfully');
        return true;
    } catch (e: any) {
        // Handle specific errors
        if (e?.message?.includes('Unable to establish connection')) {
            console.error('❌ QZ Tray not running. Please start QZ Tray application.');
        } else if (e?.message?.includes('Untrusted')) {
            console.warn('⚠️ QZ Tray certificate not trusted. Click Allow in the popup.');
        } else {
            console.error('❌ QZ Tray connection failed:', e?.message || e);
        }
        qzConnected = false;
        return false;
    } finally {
        qzConnecting = false;
    }
}

// Generate HTML for receipt (shared between QZ and fallback)
function generateReceiptHtml(order: Order, settings: PrintSettings): string {
    const format = getPaperFormat(settings.paperFormat);
    const isThermal = settings.printerType === 'thermal';

    // Shop info from settings
    const shopName = settings.shopName || 'Shop Name';
    const shopAddress = settings.shopAddress || '';
    const shopPhone = settings.shopPhone || '';
    const thankYouMessage = settings.thankYouMessage || 'Thank you for your order!';

    // Font sizes based on settings
    const fontSizes: Record<string, { base: number; header: number; line: number }> = {
        small: { base: 10, header: 14, line: 8 },
        medium: { base: 12, header: 16, line: 10 },
        large: { base: 14, header: 18, line: 12 }
    };
    const fs = fontSizes[settings.fontSize] || fontSizes.medium;

    const parseAddress = (json: string | null | undefined) => {
        try { return json ? JSON.parse(json) : {}; } catch { return {}; }
    };

    const address = parseAddress(order.addressJson);
    const customer = address.customer || order.user || {};

    const getProductName = (item: OrderItem) => {
        const translation = item.product?.translations?.find(t => t.lang === 'en')
            || item.product?.translations?.[0]
            || item.combo?.translations?.find(t => t.lang === 'en')
            || item.combo?.translations?.[0];
        return translation?.name || 'Product';
    };

    const itemsHtml = order.items.map(item => {
        const extras = item.extras?.map(ex => {
            const name = ex?.extra?.translations?.find((t: any) => t.lang === 'en')?.name
                || ex?.extra?.translations?.[0]?.name || 'Extra';
            return `<div style="font-size:${fs.line}px;padding-left:12px;color:#666;margin-top:2px">+ ${name} (${Number(ex.price)} SEK)</div>`;
        }).join('') || '';

        return `
            <div style="margin-bottom:8px;border-bottom:1px dashed #eee;padding-bottom:8px">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                    <span style="font-weight:600">${item.quantity}x ${getProductName(item)}</span>
                    <span style="white-space:nowrap">${Number(item.price) * item.quantity} SEK</span>
                </div>
                ${item.size || (item as any).sizeName ? `<div style="font-size:${fs.line}px;padding-left:12px;color:#666">Size: ${item.size || (item as any).sizeName}</div>` : ''}
                ${extras}
            </div>
        `;
    }).join('');

    const line = isThermal ? '----------------------------------------' : '<hr style="border:none;border-top:1px solid #ccc;margin:12px 0">';
    const bodyPadding = isThermal ? '5mm' : '15mm';

    // Page size based on format
    const pageSize = isThermal
        ? `${format.width} auto` // Continuous for thermal
        : `${format.width} ${(format as any).height || 'auto'}`; // Fixed for A4/A5

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page { size: ${pageSize}; margin: ${isThermal ? '0' : '10mm'}; }
                body { 
                    font-family: ${isThermal ? "'Courier New', monospace" : "'Segoe UI', Arial, sans-serif"}; 
                    font-size: ${fs.base}px; 
                    width: ${format.width}; 
                    max-width: 100%;
                    padding: ${bodyPadding}; 
                    margin: 0 auto; 
                    color: #000;
                    box-sizing: border-box;
                    background: white;
                }
                .header { text-align: center; margin-bottom: ${isThermal ? '10px' : '20px'}; }
                .header h1 { font-size: ${fs.header + 4}px; font-weight: bold; margin: 0; line-height: 1.2; }
                .header p { font-size: ${fs.line}px; margin: 4px 0 0; color: #666; }
                .section { margin: ${isThermal ? '8px' : '16px'} 0; }
                .section-title { font-weight: bold; margin-bottom: ${isThermal ? '6px' : '10px'}; font-size: ${fs.base}px; border-bottom: 2px solid #eee; padding-bottom: 4px; }
                .total { font-size: ${fs.header}px; font-weight: bold; text-align: right; margin-top: 15px; border-top: 2px solid #000; padding-top: 10px; }
                .footer { text-align: center; margin-top: ${isThermal ? '15px' : '30px'}; font-size: ${fs.line}px; color: #666; border-top: 1px dotted #ccc; padding-top: 10px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: ${isThermal ? '4px' : '8px'}; text-align: left; border-bottom: 1px solid #eee; }
                th { background: #f9f9f9; }
                
                /* Utils */
                .flex-between { display: flex; justify-content: space-between; }
                .mb-1 { margin-bottom: 4px; }
                .text-small { font-size: ${fs.line}px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${shopName}</h1>
                ${shopAddress ? `<p>${shopAddress}</p>` : ''}
                ${shopPhone ? `<p>Tel: ${shopPhone}</p>` : ''}
                <div style="margin-top:10px;font-weight:bold;border:1px solid #000;display:inline-block;padding:4px 12px;border-radius:4px">Order Receipt</div>
            </div>
            
            <div class="section" style="background:#f9fafb;padding:10px;border-radius:6px;border:1px solid #eee">
                <div class="flex-between mb-1"><strong>Order #:</strong> <span>${order.id.slice(0, 8).toUpperCase()}</span></div>
                <div class="flex-between mb-1"><strong>Date:</strong> <span>${new Date(order.createdAt).toLocaleString('sv-SE')}</span></div>
                <div class="flex-between mb-1"><strong>Type:</strong> <span>${order.deliveryMethod}</span></div>
                <div class="flex-between"><strong>Status:</strong> <span>${order.status}</span></div>
                
                ${order.isScheduled && order.requestedTime ? `
                    <div style="margin-top:10px;padding:8px;background:#fff3cd;border:2px solid #ffc107;border-radius:4px;text-align:center">
                        <div style="font-weight:bold;color:#856404;font-size:${fs.header}px">SCHEDULED FOR:</div>
                        <div style="font-weight:bold;font-size:${fs.header + 2}px;margin-top:4px">${new Date(order.requestedTime).toLocaleString('sv-SE')}</div>
                    </div>
                ` : ''}
            </div>
            
            <div class="section">
                <div class="section-title">👤 Customer</div>
                <div style="padding-left:4px">
                    ${customer.name ? `<div style="font-weight:600">${customer.name}</div>` : ''}
                    ${customer.phone ? `<div>Tel: ${customer.phone}</div>` : ''}
                    ${customer.email ? `<div>${customer.email}</div>` : ''}
                    ${order.deliveryMethod === 'DELIVERY' && address.street ? `
                        <div style="margin-top:8px;background:#fff5f5;padding:8px;border-radius:4px;border:1px dashed #feb2b2">
                            <div style="font-weight:600;color:#c53030;font-size:${fs.line}px;margin-bottom:2px">DELIVERY ADDRESS:</div>
                            <div>${address.street}</div>
                            ${address.city ? `<div>${address.city} ${address.zip || ''}</div>` : ''}
                            ${address.floor ? `<div>Floor: ${address.floor}, Door: ${address.door || '-'}</div>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">🛒 Items</div>
                ${isThermal ? itemsHtml : `
                    <table>
                        <thead><tr><th>Item</th><th style="text-align:right">Price</th></tr></thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>
                                        <div style="font-weight:600">${item.quantity}x ${getProductName(item)}</div>
                                        ${item.size || (item as any).sizeName ? `<div class="text-small">Size: ${item.size || (item as any).sizeName}</div>` : ''}
                                        ${item.extras?.map(ex => {
        const name = ex?.name || ex?.extra?.translations?.find((t: any) => t.lang === 'en')?.name || ex?.extra?.translations?.[0]?.name || 'Extra';
        return `<div class="text-small">+ ${name} (${Number(ex.price)} SEK)</div>`;
    }).join('') || ''}
                                    </td>
                                    <td style="text-align:right;vertical-align:top;white-space:nowrap">${Number(item.price) * item.quantity} SEK</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `}
            </div>

            <!-- Driver Tip -->
            ${Number(order.tip) > 0 ? `
                <div class="flex-between" style="margin:8px 0;padding:8px;background:#fff8dc;border-radius:4px;border:1px dashed #e6b307;color:#d97706;font-weight:bold">
                    <span>🤲 Driver Tip:</span>
                    <span>${Number(order.tip).toFixed(2)} SEK</span>
                </div>
            ` : ''}
            
            <!-- VAT Breakdown -->
            <div class="section" style="background:#f9f9f9;padding:8px;border-radius:6px;margin:12px 0;font-size:${fs.line}px">
                <div style="font-weight:bold;margin-bottom:6px;border-bottom:1px solid #ddd;padding-bottom:4px">💰 VAT / Tax Details</div>
                ${(() => {
            const itemsTotal = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
            const deliveryFee = Number(order.deliveryFee) || 0;
            const tip = Number(order.tip) || 0;
            const total = Number(order.total) || 0;
            // Allow negative discount (surcharge) display
            const discount = (itemsTotal + deliveryFee + tip) - total;

            const foodVatRate = 0.07;
            const deliveryVatRate = 0.19;
            const foodVat = itemsTotal - (itemsTotal / (1 + foodVatRate));
            const deliveryVat = deliveryFee > 0 ? deliveryFee - (deliveryFee / (1 + deliveryVatRate)) : 0;

            return `
                        ${order.couponCode ? `
                        <div class="flex-between" style="border-bottom:1px dashed #ccc;padding-bottom:8px;margin-bottom:8px;color:#059669">
                            <span>Coupon (${order.couponCode}):</span><span>- ${Math.abs(discount).toFixed(2)} SEK</span>
                        </div>
                        ` : ''}

                        <div class="flex-between mb-1">
                            <span>Items (net):</span><span>${(itemsTotal - foodVat).toFixed(2)} SEK</span>
                        </div>
                        <div class="flex-between mb-1 text-small">
                            <span>Food VAT (${(foodVatRate * 100).toFixed(0)}%):</span><span>${foodVat.toFixed(2)} SEK</span>
                        </div>
                        ${deliveryFee > 0 ? `
                            <div class="flex-between mb-1">
                                <span>Delivery (net):</span><span>${(deliveryFee - deliveryVat).toFixed(2)} SEK</span>
                            </div>
                            <div class="flex-between mb-1 text-small">
                                <span>Delivery VAT (${(deliveryVatRate * 100).toFixed(0)}%):</span><span>${deliveryVat.toFixed(2)} SEK</span>
                            </div>
                        ` : ''}
                        <div class="flex-between" style="border-top:1px dashed #ccc;padding-top:4px;margin-top:4px;font-weight:600">
                            <span>Total VAT:</span><span>${(foodVat + deliveryVat).toFixed(2)} SEK</span>
                        </div>
                    `;
        })()}
            </div>
            
            <div class="total">
                <div style="font-size:${fs.header + 6}px">TOTAL: ${Number(order.total)} SEK</div>
                <div style="font-size:${fs.line}px;color:#666;font-weight:normal">(inkl. MwSt.)</div>
            </div>
            
            <div class="footer">
                <div style="font-weight:600;margin-bottom:5px">${thankYouMessage}</div>
                <div>Printed: ${new Date().toLocaleTimeString()}</div>
                <div style="margin-top:5px;font-size:10px">www.fahimcanaria.com</div>
            </div>
        </body>
        </html>
    `;
}

// Print order using QZ Tray
export async function printOrderQZ(order: Order, printerName?: string): Promise<boolean> {
    if (typeof window === 'undefined' || !window.qz) {
        console.error('QZ Tray not available');
        printOrderFallback(order);
        return false;
    }

    try {
        const connected = await connectQZ();
        if (!connected) {
            console.warn('QZ Tray not connected, using fallback');
            printOrderFallback(order);
            return false;
        }

        let printer = printerName;
        if (!printer) {
            try {
                printer = await window.qz.printers.getDefault();
            } catch {
                const printers = await window.qz.printers.find();
                if (Array.isArray(printers) && printers.length > 0) {
                    printer = printers[0];
                } else if (typeof printers === 'string') {
                    printer = printers;
                }
            }
        }

        if (!printer) {
            console.error('No printer found');
            printOrderFallback(order);
            return false;
        }

        console.log('🖨️ Printing to:', printer);

        const settings = getPrintSettings();
        const config = window.qz.configs.create(printer, {
            encoding: 'UTF-8',
            // For pixel printing, we might need to adjust units or density if needed
            // but QZ defaults are usually good for HTML
        });

        let printData;

        if (settings.printerType === 'pixel') {
            // HTML / Pixel Printing (good for A4)
            console.log('📄 Using HTML/Pixel printing mode');
            const html = generateReceiptHtml(order, settings);
            printData = [{
                type: 'html',
                format: 'plain',
                data: html
            }];
        } else {
            // Thermal / Raw ESC/POS Printing
            console.log('🧾 Using Raw/Thermal printing mode');
            const commands = generateReceiptCommands(order);
            printData = [{
                type: 'raw',
                format: 'plain',
                data: commands.join('')
            }];
        }

        await window.qz.print(config, printData);

        console.log('✅ Print successful');
        return true;
    } catch (e: any) {
        console.error('❌ Print error:', e?.message || e);
        printOrderFallback(order);
        return false;
    }
}

// Fallback: Browser print dialog with configurable paper format
function printOrderFallback(order: Order) {
    const settings = getPrintSettings();
    const html = generateReceiptHtml(order, settings);

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.write(html);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
}

// Export for use in orders-live
export { printOrderFallback as printOrder };
