'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RewardRule {
    id: string;
    name: string;
    spendThreshold: number;
    periodDays: number;
    discountType: string;
    discountValue: number;
    maxDiscount: number | null;
    couponValidDays: number;
    isActive: boolean;
}

export default function RewardRuleManager({ initialRules }: { initialRules: RewardRule[] }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<RewardRule | null>(null);
    const [loading, setLoading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [spendThreshold, setSpendThreshold] = useState('1000');
    const [periodDays, setPeriodDays] = useState('30');
    const [discountType, setDiscountType] = useState('PERCENTAGE');
    const [discountValue, setDiscountValue] = useState('10');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [couponValidDays, setCouponValidDays] = useState('30');
    const [isActive, setIsActive] = useState(true);

    const resetForm = () => {
        setName('');
        setSpendThreshold('1000');
        setPeriodDays('30');
        setDiscountType('PERCENTAGE');
        setDiscountValue('10');
        setMaxDiscount('');
        setCouponValidDays('30');
        setIsActive(true);
        setEditingRule(null);
    };

    const openCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEdit = (rule: RewardRule) => {
        setEditingRule(rule);
        setName(rule.name);
        setSpendThreshold(String(rule.spendThreshold));
        setPeriodDays(String(rule.periodDays));
        setDiscountType(rule.discountType);
        setDiscountValue(String(rule.discountValue));
        setMaxDiscount(rule.maxDiscount ? String(rule.maxDiscount) : '');
        setCouponValidDays(String(rule.couponValidDays));
        setIsActive(rule.isActive);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                id: editingRule?.id,
                name,
                spendThreshold: Number(spendThreshold),
                periodDays: Number(periodDays),
                discountType,
                discountValue: Number(discountValue),
                maxDiscount: maxDiscount ? Number(maxDiscount) : null,
                couponValidDays: Number(couponValidDays),
                isActive
            };

            const res = await fetch('/api/admin/reward-rules', {
                method: editingRule ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.refresh();
                setIsModalOpen(false);
                resetForm();
            } else {
                const err = await res.json();
                alert('Error: ' + (err.error || 'Failed to save'));
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred');
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this reward rule?')) return;
        try {
            await fetch(`/api/admin/reward-rules?id=${id}`, { method: 'DELETE' });
            router.refresh();
        } catch (e) {
            alert('Failed to delete');
        }
    };

    const handleToggle = async (id: string, current: boolean) => {
        try {
            await fetch('/api/admin/reward-rules', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isActive: !current })
            });
            router.refresh();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="reward-manager">
            <div className="header">
                <div>
                    <h2>🎁 Auto-Reward Rules</h2>
                    <p>Automatically assign coupons to users based on their spending</p>
                </div>
                <button className="add-btn" onClick={openCreate}>
                    + Add Reward Rule
                </button>
            </div>

            {/* Rules List */}
            {initialRules.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🎁</span>
                    <h3>No reward rules yet</h3>
                    <p>Create your first rule to start rewarding loyal customers</p>
                    <button className="create-first-btn" onClick={openCreate}>
                        Create Reward Rule
                    </button>
                </div>
            ) : (
                <div className="rules-grid">
                    {initialRules.map((rule) => (
                        <div key={rule.id} className={`rule-card ${!rule.isActive ? 'inactive' : ''}`}>
                            <div className="rule-header">
                                <span className="rule-name">{rule.name}</span>
                                <span className={`status-badge ${rule.isActive ? 'active' : 'inactive'}`}>
                                    {rule.isActive ? '✓ Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="rule-condition">
                                <span className="condition-label">When customer spends</span>
                                <span className="threshold">{rule.spendThreshold} SEK</span>
                                <span className="period">in {rule.periodDays} days</span>
                            </div>

                            <div className="rule-reward">
                                <span className="reward-label">They get</span>
                                <span className="reward-value">
                                    {rule.discountValue}{rule.discountType === 'PERCENTAGE' ? '%' : ' SEK'} OFF
                                </span>
                                <span className="validity">Valid for {rule.couponValidDays} days</span>
                            </div>

                            <div className="rule-actions">
                                <button onClick={() => openEdit(rule)} className="action-btn edit">✏️ Edit</button>
                                <button onClick={() => handleToggle(rule.id, rule.isActive)} className="action-btn toggle">
                                    {rule.isActive ? '⏸️ Pause' : '▶️ Enable'}
                                </button>
                                <button onClick={() => handleDelete(rule.id)} className="action-btn delete">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit} className="reward-form">
                            {/* Header */}
                            <div className="form-header">
                                <div className="header-content">
                                    <span className="header-icon">🎁</span>
                                    <div>
                                        <h3>{editingRule ? 'Edit Reward Rule' : 'Create Reward Rule'}</h3>
                                        <p>Reward loyal customers automatically</p>
                                    </div>
                                </div>
                                <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                            </div>

                            {/* Rule Name */}
                            <div className="form-section name-section">
                                <label>Rule Name</label>
                                <input
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. VIP Monthly Reward"
                                    className="name-input"
                                />
                            </div>

                            {/* Condition */}
                            <div className="form-section condition-section">
                                <div className="section-title">
                                    <span>📊</span>
                                    <span>Spending Condition</span>
                                </div>
                                <div className="condition-builder">
                                    <span className="condition-text">When customer spends</span>
                                    <div className="threshold-input">
                                        <input
                                            required
                                            type="number"
                                            value={spendThreshold}
                                            onChange={e => setSpendThreshold(e.target.value)}
                                        />
                                        <span>SEK</span>
                                    </div>
                                    <span className="condition-text">within</span>
                                    <div className="period-input">
                                        <input
                                            required
                                            type="number"
                                            value={periodDays}
                                            onChange={e => setPeriodDays(e.target.value)}
                                        />
                                        <span>days</span>
                                    </div>
                                </div>
                            </div>

                            {/* Reward */}
                            <div className="form-section reward-section">
                                <div className="section-title">
                                    <span>🎉</span>
                                    <span>Reward</span>
                                </div>

                                <div className="discount-setup">
                                    <div className="type-selector">
                                        <button
                                            type="button"
                                            className={`type-btn ${discountType === 'PERCENTAGE' ? 'selected' : ''}`}
                                            onClick={() => setDiscountType('PERCENTAGE')}
                                        >
                                            <span className="type-icon">%</span>
                                            <span>Percentage</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`type-btn ${discountType === 'FIXED' ? 'selected' : ''}`}
                                            onClick={() => setDiscountType('FIXED')}
                                        >
                                            <span className="type-icon">kr</span>
                                            <span>Fixed Amount</span>
                                        </button>
                                    </div>
                                    <div className="value-box">
                                        <input
                                            required
                                            type="number"
                                            value={discountValue}
                                            onChange={e => setDiscountValue(e.target.value)}
                                            className="value-input"
                                        />
                                        <span className="value-suffix">{discountType === 'PERCENTAGE' ? '%' : 'SEK'}</span>
                                    </div>
                                </div>

                                <div className="reward-options">
                                    {discountType === 'PERCENTAGE' && (
                                        <div className="option">
                                            <label>Max Discount Cap</label>
                                            <input
                                                type="number"
                                                value={maxDiscount}
                                                onChange={e => setMaxDiscount(e.target.value)}
                                                placeholder="No limit"
                                            />
                                        </div>
                                    )}
                                    <div className="option">
                                        <label>Coupon Valid For</label>
                                        <div className="days-input">
                                            <input
                                                required
                                                type="number"
                                                value={couponValidDays}
                                                onChange={e => setCouponValidDays(e.target.value)}
                                            />
                                            <span>days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="form-section status-section">
                                <label className="status-toggle">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={e => setIsActive(e.target.checked)}
                                    />
                                    <span className="toggle-label">
                                        {isActive ? '✓ Rule is Active' : '✗ Rule is Inactive'}
                                    </span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="form-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="submit-btn">
                                    {loading ? '⏳ Saving...' : (editingRule ? '✓ Update Rule' : '✓ Create Rule')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .reward-manager {
                    margin-top: 2rem;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0 0 0.25rem 0;
                }
                .header p {
                    color: #6b7280;
                    font-size: 0.9rem;
                    margin: 0;
                }

                .add-btn {
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .add-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); }

                /* Empty State */
                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: #fffbeb;
                    border: 2px dashed #fcd34d;
                    border-radius: 16px;
                }
                .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
                .empty-state h3 { font-size: 1.25rem; color: #92400e; margin: 0 0 0.5rem; }
                .empty-state p { color: #a16207; margin: 0 0 1.5rem; }
                .create-first-btn {
                    padding: 0.75rem 2rem;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                }

                /* Rules Grid */
                .rules-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1rem;
                }

                .rule-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 16px;
                    padding: 1.25rem;
                    transition: all 0.2s;
                }
                .rule-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                .rule-card.inactive { opacity: 0.6; }

                .rule-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .rule-name { font-weight: 700; font-size: 1.1rem; }
                .status-badge {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-weight: 600;
                }
                .status-badge.active { background: #dcfce7; color: #15803d; }
                .status-badge.inactive { background: #f3f4f6; color: #6b7280; }

                .rule-condition, .rule-reward {
                    background: #f9fafb;
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    margin-bottom: 0.75rem;
                }
                .condition-label, .reward-label {
                    display: block;
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-bottom: 0.25rem;
                }
                .threshold, .reward-value {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #f59e0b;
                }
                .period, .validity {
                    display: block;
                    font-size: 0.8rem;
                    color: #9ca3af;
                    margin-top: 0.15rem;
                }

                .rule-actions {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f3f4f6;
                }
                .action-btn {
                    flex: 1;
                    padding: 0.5rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    background: white;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .action-btn:hover { background: #f9fafb; }
                .action-btn.delete:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }
                .modal {
                    background: white;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 480px;
                    max-height: 90vh;
                    overflow: hidden;
                }

                .reward-form {
                    display: flex;
                    flex-direction: column;
                }

                .form-header {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .header-content {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }
                .header-icon { font-size: 2.5rem; }
                .form-header h3 { margin: 0; font-size: 1.25rem; }
                .form-header p { margin: 0.25rem 0 0; opacity: 0.9; font-size: 0.9rem; }
                .close-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    font-size: 1.5rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .form-section {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f3f4f6;
                }
                .form-section:last-of-type { border-bottom: none; }

                .section-title {
                    display: flex;
                    gap: 0.5rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 1rem;
                }

                .name-section label {
                    display: block;
                    font-size: 0.85rem;
                    color: #6b7280;
                    margin-bottom: 0.5rem;
                }
                .name-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    transition: border-color 0.2s;
                }
                .name-input:focus { outline: none; border-color: #f59e0b; }

                /* Condition Builder */
                .condition-builder {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 0.75rem;
                    background: #fffbeb;
                    padding: 1rem;
                    border-radius: 12px;
                    border: 1px solid #fcd34d;
                }
                .condition-text { color: #92400e; font-weight: 500; }
                .threshold-input, .period-input {
                    display: flex;
                    align-items: center;
                    background: white;
                    border-radius: 8px;
                    border: 2px solid #fcd34d;
                    overflow: hidden;
                }
                .threshold-input input, .period-input input {
                    width: 80px;
                    padding: 0.5rem 0.75rem;
                    border: none;
                    font-size: 1.1rem;
                    font-weight: 700;
                    text-align: right;
                    color: #d97706;
                }
                .threshold-input input:focus, .period-input input:focus { outline: none; }
                .threshold-input span, .period-input span {
                    padding: 0.5rem 0.75rem;
                    background: #fef3c7;
                    color: #92400e;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                /* Discount Setup */
                .discount-setup {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .type-selector {
                    display: flex;
                    gap: 0.5rem;
                    flex: 1;
                }
                .type-btn {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.75rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .type-btn.selected {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    border-color: transparent;
                }
                .type-icon { font-size: 1.25rem; font-weight: 800; }
                .type-btn span:last-child { font-size: 0.75rem; }

                .value-box {
                    display: flex;
                    align-items: center;
                    background: #fffbeb;
                    border: 2px solid #fcd34d;
                    border-radius: 10px;
                    padding: 0 0.75rem;
                }
                .value-input {
                    width: 60px;
                    border: none;
                    background: transparent;
                    font-size: 1.5rem;
                    font-weight: 800;
                    text-align: right;
                    color: #d97706;
                }
                .value-input:focus { outline: none; }
                .value-suffix { font-size: 1rem; font-weight: 700; color: #d97706; }

                .reward-options {
                    display: flex;
                    gap: 1rem;
                }
                .option {
                    flex: 1;
                }
                .option label {
                    display: block;
                    font-size: 0.8rem;
                    color: #6b7280;
                    margin-bottom: 0.35rem;
                }
                .option input {
                    width: 100%;
                    padding: 0.6rem 0.75rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                }
                .days-input {
                    display: flex;
                    align-items: center;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .days-input input {
                    flex: 1;
                    padding: 0.6rem 0.75rem;
                    border: none;
                }
                .days-input span {
                    padding: 0.6rem 0.75rem;
                    background: #f9fafb;
                    color: #6b7280;
                    font-size: 0.85rem;
                }

                /* Status */
                .status-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                }
                .status-toggle input { width: 20px; height: 20px; }
                .toggle-label { font-weight: 500; }

                /* Actions */
                .form-actions {
                    display: flex;
                    gap: 1rem;
                    padding: 1.25rem 1.5rem;
                    border-top: 1px solid #e5e7eb;
                    background: #f9fafb;
                }
                .cancel-btn {
                    flex: 1;
                    padding: 0.875rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    background: white;
                    font-size: 1rem;
                    cursor: pointer;
                }
                .submit-btn {
                    flex: 2;
                    padding: 0.875rem;
                    border: none;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); }
                .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
            `}</style>
        </div>
    );
}
