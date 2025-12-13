'use client';

import { useState } from 'react';
import { useCurrency } from '@/hooks/use-currency';

export default function FinancialReportsPage() {
    // Financial Reports Page
    const { formatPrice, symbol } = useCurrency();
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Last 30 days
        end: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reports/financial?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            if (res.ok) {
                const data = await res.json();
                setReportData(data);
            }
        } catch (error) {
            console.error('Failed to fetch report:', error);
        }
        setLoading(false);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{ paddingBottom: '4rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="no-print" style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem'
                }}>Financial Reports</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                    View sales summary, tax (VAT) details, and invoice counts.
                </p>
            </div>

            {/* Filter Section */}
            <div className="no-print" style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'end'
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>From Date</label>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(0,0,0,0.2)',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>To Date</label>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(0,0,0,0.2)',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                </div>
                <button
                    onClick={fetchReport}
                    disabled={loading}
                    style={{
                        padding: '0.75rem 2rem',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: '600',
                        cursor: 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>

            {reportData && (
                <div id="report-content">
                    {/* Summary Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        {/* Total Sales */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Total Sales (Gross)</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fff' }}>
                                {formatPrice(reportData.summary.totalSales)}
                            </div>
                        </div>

                        {/* Total Tax with breakdown */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Total Tax (VAT)</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fbbf24', marginBottom: '0.75rem' }}>
                                {formatPrice(reportData.summary.totalTax)}
                            </div>
                            {/* VAT Breakdown */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>🍕 Food ({reportData.summary.foodVatRate}%)</span>
                                    <span style={{ color: '#a3e635' }}>{formatPrice(reportData.summary.foodTax)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>🚚 Delivery ({reportData.summary.deliveryVatRate}%)</span>
                                    <span style={{ color: '#f97316' }}>{formatPrice(reportData.summary.deliveryTax)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Net Sales */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Net Sales</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                                {formatPrice(reportData.summary.netSales)}
                            </div>
                        </div>

                        {/* Order Count */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Total Invoices</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fff' }}>
                                {reportData.summary.totalOrders}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Invoice Details</h3>
                            <button
                                className="no-print"
                                onClick={handlePrint}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                🖨️ Print Report
                            </button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>Date</th>
                                        <th style={{ padding: '1rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>Order ID</th>
                                        <th style={{ padding: '1rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>Customer</th>
                                        <th style={{ padding: '1rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textAlign: 'right' }}>Net</th>
                                        <th style={{ padding: '1rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textAlign: 'right' }}>VAT</th>
                                        <th style={{ padding: '1rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.orders.map((order: any) => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem', color: '#fff' }}>
                                                {new Date(order.date).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
                                                #{order.id.slice(0, 8)}
                                            </td>
                                            <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                                                {order.customer}
                                            </td>
                                            <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.7)', textAlign: 'right' }}>
                                                {formatPrice(order.net)}
                                            </td>
                                            <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.7)', textAlign: 'right' }}>
                                                {formatPrice(order.tax)}
                                            </td>
                                            <td style={{ padding: '1rem', color: '#fff', fontWeight: '600', textAlign: 'right' }}>
                                                {formatPrice(order.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: #fff !important;
                        color: #000 !important;
                    }
                    #report-content {
                        color: #000 !important;
                    }
                    td, th, h1, h2, h3, div {
                        color: #000 !important;
                        border-color: #ddd !important;
                    }
                }
            `}</style>
        </div>
    );
}
