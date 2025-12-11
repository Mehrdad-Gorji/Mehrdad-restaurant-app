export interface DaySchedule {
    isOpen: boolean;
    open: string;  // "HH:mm"
    close: string; // "HH:mm"
}

export type WeeklySchedule = Record<string, DaySchedule>;

export const DAYS_OF_WEEK = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export function isShopOpen(scheduleJson: string | null | undefined, scheduleEnabled: boolean = true): { isOpen: boolean; message: string, nextOpen?: string } {
    // If schedule feature is disabled, always return open
    if (!scheduleEnabled) {
        return { isOpen: true, message: 'Open' };
    }

    if (!scheduleJson || scheduleJson === '{}') {
        // If no schedule is set, assume open
        return { isOpen: true, message: 'Open' };
    }

    let schedule: WeeklySchedule;
    try {
        schedule = JSON.parse(scheduleJson);
    } catch (e) {
        console.error('Failed to parse schedule', e);
        return { isOpen: true, message: 'Open (Error)' };
    }

    const now = new Date();
    // 0 = Sunday, 1 = Monday. We want 0 = Monday, 6 = Sunday to match correct array index if we use array, 
    // but here we use keys.
    const dayIndex = now.getDay(); // 0 is Sunday
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Normalize time to minutes for comparison
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 1. Check Yesterday's schedule (if it spans to today)
    const prevDayIndex = (dayIndex + 6) % 7;
    const prevDayKey = dayKeys[prevDayIndex];
    const prevDaySchedule = schedule[prevDayKey];

    if (prevDaySchedule && prevDaySchedule.isOpen) {
        const [prevOpenH, prevOpenM] = prevDaySchedule.open.split(':').map(Number);
        const [prevCloseH, prevCloseM] = prevDaySchedule.close.split(':').map(Number);

        const prevOpenMinutes = prevOpenH * 60 + prevOpenM;
        const prevCloseMinutes = prevCloseH * 60 + prevCloseM;

        // If yesterday spans midnight (close < open)
        if (prevCloseMinutes < prevOpenMinutes) {
            // And we are currently before the closing time of yesterday's shift
            if (currentMinutes < prevCloseMinutes) {
                return { isOpen: true, message: 'Open' };
            }
        }
    }

    // 2. Check Today's schedule
    const currentDayKey = dayKeys[dayIndex];
    const todaySchedule = schedule[currentDayKey];

    if (!todaySchedule || !todaySchedule.isOpen) {
        return { isOpen: false, message: `Closed today` };
    }

    const [openH, openM] = todaySchedule.open.split(':').map(Number);
    const [closeH, closeM] = todaySchedule.close.split(':').map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    if (closeMinutes < openMinutes) {
        // Spans midnight: Open if we are past opening time (Closing time is checked on next day)
        if (currentMinutes >= openMinutes) {
            return { isOpen: true, message: 'Open' };
        }
    } else {
        // Normal hours: Open if within range
        if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
            return { isOpen: true, message: 'Open' };
        }
    }

    return { isOpen: false, message: `Closed. Opens at ${todaySchedule.open}` };
}
