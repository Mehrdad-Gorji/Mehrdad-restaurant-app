
const { isShopOpen } = require('./src/lib/shop-status');

// Mock specific dates by overriding Date
function checkDate(dateStr, schedule, enabled = true) {
    const originalDate = global.Date;
    global.Date = class extends Date {
        constructor() {
            super();
            return new originalDate(dateStr);
        }
    };

    try {
        const result = isShopOpen(JSON.stringify(schedule), enabled);
        console.log(`Time: ${dateStr}, Schedule: ${JSON.stringify(schedule).substring(0, 50)}..., Enabled: ${enabled} => Open: ${result.isOpen} (${result.message})`);
        return result;
    } finally {
        global.Date = originalDate;
    }
}

const scheduleNormal = {
    monday: { isOpen: true, open: '12:00', close: '22:00' },
    tuesday: { isOpen: true, open: '12:00', close: '22:00' }
};

const scheduleLateNight = {
    monday: { isOpen: true, open: '18:00', close: '02:00' }, // Closes 2am Tuesday
    tuesday: { isOpen: true, open: '18:00', close: '02:00' }
};

console.log("--- TEST Normal Hours ---");
// Monday 13:00 (Open)
checkDate('2023-12-11T13:00:00', scheduleNormal);
// Monday 11:00 (Closed)
checkDate('2023-12-11T11:00:00', scheduleNormal);
// Monday 23:00 (Closed)
checkDate('2023-12-11T23:00:00', scheduleNormal);

console.log("\n--- TEST Late Night Hours (Bug Check) ---");
// Monday 23:00 (Should be Open, 23:00 < 02:00 is false, wait. 18:00=1080, 02:00=120, 23:00=1380. 120 < 1080 (close < open). 
// Logic: if (current >= open || current < close). 1380 >= 1080. Open. Correct.)
checkDate('2023-12-11T23:00:00', scheduleLateNight);

// Tuesday 01:00 (Should be Open as part of Monday shift)
// Date is Tuesday. Day = Tuesday.
// Logic checks Tuesday schedule: 18:00 - 02:00.
// Current: 01:00 (60 mins). Open: 18:00 (1080). Close: 02:00 (120).
// 60 >= 1080 (False) || 60 < 120 (True).
// Returns OPEN.
// WAIT. It returns open because TUESDAY also has a late shift 01:00 is part of Tuesday's "early morning" before it closes at 2am?
// NO. Tuesday 18:00 - 02:00 means Tuesday Evening to Wednesday Morning.
// It DOES NOT mean Tuesday 00:00 to 02:00.
// If Tuesday schedule is 18:00-02:00, then 01:00 on Tuesday causes:
// close(02:00) < open(18:00).
// current(01:00) < close(02:00) => True.
// It returns OPEN.
// But is it open because of Monday night or because of Tuesday logic?
// It treats 00:00-02:00 Tuesday as part of the "Tuesday shift" effectively?
// No, the code says:
/*
    const [openH, openM] = todaySchedule.open.split(':').map(Number);
    const [closeH, closeM] = todaySchedule.close.split(':').map(Number);
    if (closeMinutes < openMinutes) {
        if (currentMinutes >= openMinutes || currentMinutes < closeMinutes) {
             return { isOpen: true, message: 'Open' };
        }
    }
*/
// If I am on Tuesday 01:00.
// todaySchedule is Tuesday (18:00 - 02:00).
// open: 1080, close: 120.
// current: 60.
// 60 < 120 is True.
// So it thinks Tuesday's shift COVERS Tuesday morning 01:00.
// BUT Tuesday's shift is 18:00 - 02:00 (next day).
// So it thinks Tuesday 00:00-02:00 is open. 
// AND Tuesday 18:00-24:00 is open.
// This effectively means "Open from 18:00 until 02:00 AND 00:00 to 02:00".
// This logic assumes "spanning midnight" applies to the CURRENT day's start (00:00) too.
// Which is... strictly speaking, if the schedule repeats every day, it works out.
// But if Monday is closed, and Tuesday is 18:00-02:00.
// Tuesday 01:00 should be CLOSED (since Monday was closed).
// Let's test THAT.

const scheduleMondayClosedTuesdayLate = {
    monday: { isOpen: false, open: '12:00', close: '22:00' },
    tuesday: { isOpen: true, open: '18:00', close: '02:00' }
};
console.log("\n--- TEST Edge Case: Monday Closed, Tuesday Late ---");
// Tuesday 01:00. Should be CLOSED (since Monday closed).
// But existing logic might say OPEN because Tuesday says "close < open" so it matches 01:00 < 02:00.
checkDate('2023-12-12T01:00:00', scheduleMondayClosedTuesdayLate);

