const siteUrlInput = document.getElementById('site-url');
const printerNameInput = document.getElementById('printer-name');
const apiKeyInput = document.getElementById('api-key');
const checkIntervalInput = document.getElementById('check-interval');
const settingsForm = document.getElementById('settings-form');

const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnTest = document.getElementById('btn-test');
const statusBadge = document.getElementById('status-indicator');
const logsContainer = document.getElementById('logs-container');

// Load settings on start
// Load settings on start
async function loadSettings() {
    try {
        // 1. Fetch Config
        const resConfig = await fetch('/api/config');
        const config = await resConfig.json();

        siteUrlInput.value = config.siteUrl || '';
        apiKeyInput.value = config.apiKey || '';
        checkIntervalInput.value = config.checkIntervalSeconds || 30;

        // 2. Fetch Printers and Populate Dropdown
        const resPrinters = await fetch('/api/printers');
        const printers = await resPrinters.json();

        printerNameInput.innerHTML = ''; // Clear 'Loading...'

        if (printers.length === 0) {
            const option = document.createElement('option');
            option.text = "No printers found";
            printerNameInput.add(option);
        } else {
            printers.forEach(p => {
                const option = document.createElement('option');
                option.value = p.name;
                option.text = p.name;
                // Pre-select saved printer
                if (p.name === config.printerName) option.selected = true;
                printerNameInput.add(option);
            });
        }

        // Handling case where saved printer is not in list (e.g. renamed or disconnected)
        if (config.printerName && !Array.from(printerNameInput.options).some(o => o.value === config.printerName)) {
            const option = document.createElement('option');
            option.value = config.printerName;
            option.text = `${config.printerName} (Not Found)`;
            option.selected = true;
            printerNameInput.add(option);
        }

        updateStatus(config.isRunning);
    } catch (err) {
        log('Error loading settings: ' + err.message);
    }
}

// Update UI based on status
function updateStatus(isRunning) {
    if (isRunning) {
        statusBadge.textContent = 'RUNNING';
        statusBadge.className = 'status-badge status-running';
        btnStart.disabled = true;
        btnStop.disabled = false;
    } else {
        statusBadge.textContent = 'STOPPED';
        statusBadge.className = 'status-badge status-stopped';
        btnStart.disabled = false;
        btnStop.disabled = true;
    }
}

// Log to console UI
function log(msg) {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logsContainer.appendChild(div);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Poll for logs
setInterval(async () => {
    try {
        const res = await fetch('/api/logs');
        const logs = await res.json();
        if (logs.length > 0) {
            logs.forEach(l => log(l));
        }
    } catch (e) {
        // silent fail
    }
}, 2000);

// Poll for status
setInterval(async () => {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        updateStatus(data.isRunning);
    } catch (e) { }
}, 5000);

// Event Listeners
settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const config = {
        siteUrl: siteUrlInput.value,
        printerName: printerNameInput.value,
        apiKey: apiKeyInput.value,
        checkIntervalSeconds: parseInt(checkIntervalInput.value)
    };

    try {
        const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        if (res.ok) {
            log('✅ Settings saved successfully!');
            alert('Settings saved!');
        } else {
            log('❌ Failed to save settings.');
        }
    } catch (err) {
        log('Error saving: ' + err.message);
    }
});

btnStart.addEventListener('click', async () => {
    await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
    });
    log('Sending START command...');
});

btnStop.addEventListener('click', async () => {
    await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
    });
    log('Sending STOP command...');
});

btnTest.addEventListener('click', async () => {
    log('Sending TEST print job...');
    await fetch('/api/test-print', { method: 'POST' });
});

// Init
loadSettings();
