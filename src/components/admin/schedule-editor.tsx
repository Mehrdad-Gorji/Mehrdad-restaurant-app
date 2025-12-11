'use client';

import { useState, useEffect } from 'react';

interface DaySchedule {
    isOpen: boolean;
    open: string;
    close: string;
}

interface ScheduleEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const DEFAULT_DAY: DaySchedule = { isOpen: true, open: '11:00', close: '22:00' };

const DAYS = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
];

export default function ScheduleEditor({ value, onChange }: ScheduleEditorProps) {
    const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({});

    useEffect(() => {
        try {
            const parsed = ConvertToSchedule(value);
            setSchedule(parsed);
        } catch (e) {
            setSchedule({});
        }
    }, [value]);

    function ConvertToSchedule(json: string): Record<string, DaySchedule> {
        if (!json || json === '{}') {
            // Initialize default
            const initial: Record<string, DaySchedule> = {};
            DAYS.forEach(d => initial[d.key] = { ...DEFAULT_DAY });
            return initial;
        }
        return JSON.parse(json);
    }

    const updateDay = (day: string, field: keyof DaySchedule, val: any) => {
        const newSchedule = { ...schedule };
        if (!newSchedule[day]) newSchedule[day] = { ...DEFAULT_DAY };

        newSchedule[day] = {
            ...newSchedule[day],
            [field]: val
        };

        setSchedule(newSchedule);
        onChange(JSON.stringify(newSchedule));
    };

    return (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
            <style jsx>{`
                .schedule-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    background: rgba(255,255,255,0.03);
                    padding: 1rem;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                    transition: all 0.2s;
                }
                @media (max-width: 640px) {
                    .schedule-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                    .schedule-row > div {
                        width: 100%;
                        justify-content: space-between;
                    }
                    .time-inputs {
                        width: 100%;
                        display: grid;
                        grid-template-columns: 1fr auto 1fr;
                    }
                    .time-inputs input {
                        width: 100% !important;
                    }
                }
            `}</style>
            {DAYS.map((day) => {
                const dayData = schedule[day.key] || DEFAULT_DAY;
                return (
                    <div
                        key={day.key}
                        className="schedule-row"
                        style={{ color: dayData.isOpen ? '#fff' : 'rgba(255,255,255,0.4)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: 'auto' }}>
                            <div style={{ width: '100px', fontWeight: 'bold', fontSize: '0.95rem' }}>{day.label}</div>

                            <label style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                                padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={dayData.isOpen}
                                    onChange={(e) => updateDay(day.key, 'isOpen', e.target.checked)}
                                    style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                                />
                                <span style={{ fontSize: '0.85rem' }}>Open</span>
                            </label>
                        </div>

                        {dayData.isOpen ? (
                            <div className="time-inputs" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <input
                                    type="time"
                                    value={dayData.open}
                                    onChange={(e) => updateDay(day.key, 'open', e.target.value)}
                                    style={{
                                        padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.9rem', outline: 'none'
                                    }}
                                />
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>to</span>
                                <input
                                    type="time"
                                    value={dayData.close}
                                    onChange={(e) => updateDay(day.key, 'close', e.target.value)}
                                    style={{
                                        padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.9rem', outline: 'none'
                                    }}
                                />
                            </div>
                        ) : (
                            <div style={{ padding: '0.4rem 1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                                Closed
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
