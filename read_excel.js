const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const exelDir = './Exel';
const files = fs.readdirSync(exelDir).filter(f => f.endsWith('.xlsx'));

files.forEach(file => {
    console.log('\n========== ' + file + ' ==========');
    const wb = XLSX.readFile(path.join(exelDir, file));
    console.log('Sheets:', wb.SheetNames);

    wb.SheetNames.forEach(sheetName => {
        console.log('\n--- Sheet: ' + sheetName + ' ---');
        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        // Show first 5 rows
        data.slice(0, 5).forEach((row, i) => {
            if (row.length > 0) {
                console.log('Row ' + i + ':', row.slice(0, 8).join(' | '));
            }
        });
    });
});
