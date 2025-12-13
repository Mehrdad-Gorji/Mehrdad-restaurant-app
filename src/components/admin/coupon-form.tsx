'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CouponForm({ initialData, availableProducts = [], availableUsers = [], onSuccess, onCancel }: { initialData?: any, availableProducts?: any[], availableUsers?: any[], onSuccess?: () => void, onCancel?: () => void }) {
    const router = useRouter();
    const isEdit = !!initialData?.id;

    // Basic
    const [code, setCode] = useState(initialData?.code || '');
    const [type, setType] = useState(initialData?.type || 'PERCENTAGE');
    const [value, setValue] = useState(initialData?.value || 10);
    const [design, setDesign] = useState(initialData?.design || 'TICKET');
    const [isActive, setIsActive] = useState<boolean>(initialData?.isActive ?? true);

    // Rules
    const [minAmount, setMinAmount] = useState(initialData?.minAmount || '');
    const [maxDiscount, setMaxDiscount] = useState(initialData?.maxDiscount || '');
    const [applyTo, setApplyTo] = useState(initialData?.applyTo || 'total');

    // Limits
    const [maxUses, setMaxUses] = useState<string>(initialData?.maxUses || '');
    const [maxUsesPerUser, setMaxUsesPerUser] = useState<string>(initialData?.maxUsesPerUser || '1');
    const [startDate, setStartDate] = useState<string>(initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '');
    const [endDate, setEndDate] = useState<string>(initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '');

    // Restrictions
    const [appliedProductIds, setAppliedProductIds] = useState<string[]>(initialData?.allowedProducts?.map((p: any) => p.id) || []);
    const [appliedUserIds, setAppliedUserIds] = useState<string[]>(initialData?.allowedUsers?.map((u: any) => u.id) || []);
    const [productSearch, setProductSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');

    // Accordion states
    const [showProducts, setShowProducts] = useState(appliedProductIds.length > 0);
    const [showUsers, setShowUsers] = useState(appliedUserIds.length > 0);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Offer
    const [createOffer, setCreateOffer] = useState(false);
    const [offerDescription, setOfferDescription] = useState('');

    const [loading, setLoading] = useState(false);

    // Filter products
    const filteredProducts = availableProducts.filter(p =>
        p.translations?.find((t: any) => t.language === 'en')?.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.slug.toLowerCase().includes(productSearch.toLowerCase())
    );

    const filteredUsers = availableUsers.filter(u =>
        (u.name?.toLowerCase() || '').includes(userSearch.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(userSearch.toLowerCase()) ||
        (u.phone || '').includes(userSearch)
    );

    const toggleProduct = (id: string) => {
        setAppliedProductIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
    };

    const toggleUser = (id: string) => {
        setAppliedUserIds(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let out = '';
        for (let i = 0; i < 8; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
        setCode(out);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                code, type, value, minAmount: minAmount || null,
                maxUses: maxUses || null, maxUsesPerUser: maxUsesPerUser ? Number(maxUsesPerUser) : 1,
                startDate: startDate || null, endDate: endDate || null,
                isActive, maxDiscount: maxDiscount || null, applyTo,
                design,
                appliedProductIds,
                appliedUserIds,
                createOffer: !isEdit && createOffer,
                description: offerDescription
            };

            const url = '/api/admin/coupons';
            const method = isEdit ? 'PATCH' : 'POST';
            const body = isEdit ? { id: initialData.id, ...payload } : payload;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                router.refresh();
                if (onSuccess) onSuccess();
            } else {
                const err = await res.json();
                alert('Error: ' + (err.error || 'Failed to save coupon'));
            }
        } catch (e) {
            console.error(e);
            alert('An unexpected error occurred.');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="coupon-form">
            {/* MAIN SECTION - Discount Setup */}
            <div className="main-section">
                <div className="code-row">
                    <div className="code-input-wrapper">
                        <label>Coupon Code</label>
                        <div className="code-field">
                            <input
                                required
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                placeholder="SUMMER25"
                                className="code-input"
                            />
                            <button type="button" onClick={generateCode} className="generate-btn" title="Generate">
                                🎲
                            </button>
                        </div>
                    </div>
                    <div className="status-toggle">
                        <label>Status</label>
                        <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            className={`status-btn ${isActive ? 'active' : 'inactive'}`}
                        >
                            {isActive ? '✓ Active' : '✗ Inactive'}
                        </button>
                    </div>
                </div>

                <div className="discount-setup">
                    {/* Design Selector - NEW */}
                    <div className="setting-item" style={{ minWidth: '150px' }}>
                        <label>Design Style</label>
                        <select
                            value={design}
                            onChange={e => setDesign(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '12px',
                                border: '2px solid rgba(255,255,255,0.3)',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="TICKET" style={{ color: '#333' }}>🎟️ Classic Ticket</option>
                            <option value="GLASS" style={{ color: '#333' }}>💎 Glassmorphism</option>
                            <option value="LUXE" style={{ color: '#333' }}>✨ Luxe Gold</option>
                            <option value="NEON" style={{ color: '#333' }}>🟢 Neon Cyber</option>
                        </select>
                    </div>

                    <div className="discount-type-selector">
                        <button
                            type="button"
                            className={`type-btn ${type === 'PERCENTAGE' ? 'selected' : ''}`}
                            onClick={() => setType('PERCENTAGE')}
                        >
                            <span className="type-icon">%</span>
                            <span>Percentage</span>
                        </button>
                        <button
                            type="button"
                            className={`type-btn ${type === 'FIXED' ? 'selected' : ''}`}
                            onClick={() => setType('FIXED')}
                        >
                            <span className="type-icon">kr</span>
                            <span>Fixed Amount</span>
                        </button>
                    </div>
                    <div className="value-input-wrapper">
                        <input
                            required
                            type="number"
                            value={value}
                            onChange={e => setValue(Number(e.target.value))}
                            className="value-input"
                            min={0}
                        />
                        <span className="value-suffix">{type === 'PERCENTAGE' ? '%' : 'SEK'}</span>
                    </div>
                </div>

                <div className="quick-settings">
                    <div className="setting-item">
                        <label>Apply To</label>
                        <select value={applyTo} onChange={e => setApplyTo(e.target.value)}>
                            <option value="total">🛒 Total Order</option>
                            <option value="items">📦 Items Only</option>
                            <option value="shipping">🚚 Delivery Fee</option>
                        </select>
                    </div>
                    <div className="setting-item">
                        <label>Min. Order</label>
                        <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="0 SEK" />
                    </div>
                    {type === 'PERCENTAGE' && (
                        <div className="setting-item">
                            <label>Max Discount</label>
                            <input type="number" value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} placeholder="No limit" />
                        </div>
                    )}
                </div>
            </div>

            {/* COLLAPSIBLE SECTIONS */}
            <div className="collapsible-sections">
                {/* Product Restrictions */}
                <div className="accordion-section">
                    <button
                        type="button"
                        className="accordion-header"
                        onClick={() => setShowProducts(!showProducts)}
                    >
                        <span>🎯 Limit to Specific Products</span>
                        <span className="accordion-badge">
                            {appliedProductIds.length > 0 ? `${appliedProductIds.length} selected` : 'All products'}
                        </span>
                        <span className="accordion-arrow">{showProducts ? '▼' : '▶'}</span>
                    </button>
                    {showProducts && (
                        <div className="accordion-content">
                            <input
                                className="search-input"
                                placeholder="🔍 Search products..."
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                            />
                            <div className="checkbox-list">
                                {filteredProducts.map((p: any) => (
                                    <label key={p.id} className={`checkbox-item ${appliedProductIds.includes(p.id) ? 'checked' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={appliedProductIds.includes(p.id)}
                                            onChange={() => toggleProduct(p.id)}
                                        />
                                        <span>{p.translations?.find((t: any) => t.language === 'en')?.name || p.slug}</span>
                                        <span className="price-tag">{p.price} kr</span>
                                    </label>
                                ))}
                                {filteredProducts.length === 0 && <div className="empty-message">No products found</div>}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Restrictions */}
                <div className="accordion-section user-section">
                    <button
                        type="button"
                        className="accordion-header"
                        onClick={() => setShowUsers(!showUsers)}
                    >
                        <span>👥 Assign to Specific Users</span>
                        <span className="accordion-badge">
                            {appliedUserIds.length > 0 ? `🔒 ${appliedUserIds.length} users` : '🌐 Everyone'}
                        </span>
                        <span className="accordion-arrow">{showUsers ? '▼' : '▶'}</span>
                    </button>
                    {showUsers && (
                        <div className="accordion-content">
                            <input
                                className="search-input"
                                placeholder="🔍 Search by name, email, or phone..."
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                            />
                            <div className="checkbox-list">
                                {filteredUsers.map((u: any) => (
                                    <label key={u.id} className={`checkbox-item ${appliedUserIds.includes(u.id) ? 'checked' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={appliedUserIds.includes(u.id)}
                                            onChange={() => toggleUser(u.id)}
                                        />
                                        <div className="user-info">
                                            <strong>{u.name || 'No Name'}</strong>
                                            <span>{u.email}</span>
                                        </div>
                                    </label>
                                ))}
                                {filteredUsers.length === 0 && <div className="empty-message">No users found</div>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Advanced Settings */}
                <div className="accordion-section">
                    <button
                        type="button"
                        className="accordion-header"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <span>⚙️ Advanced Settings</span>
                        <span className="accordion-badge">Usage limits & validity</span>
                        <span className="accordion-arrow">{showAdvanced ? '▼' : '▶'}</span>
                    </button>
                    {showAdvanced && (
                        <div className="accordion-content advanced-grid">
                            <div className="field-group">
                                <label>Total Uses</label>
                                <input type="number" min={1} value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="Unlimited" />
                            </div>
                            <div className="field-group">
                                <label>Per User</label>
                                <input type="number" min={1} value={maxUsesPerUser} onChange={e => setMaxUsesPerUser(e.target.value)} />
                            </div>
                            <div className="field-group">
                                <label>Start Date</label>
                                <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div className="field-group">
                                <label>End Date</label>
                                <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Create Offer */}
                {!isEdit && (
                    <div className="accordion-section offer-section">
                        <label className="offer-toggle">
                            <input type="checkbox" checked={createOffer} onChange={e => setCreateOffer(e.target.checked)} />
                            <span>🚀 Also create a public offer</span>
                        </label>
                        {createOffer && (
                            <div className="offer-desc">
                                <input
                                    value={offerDescription}
                                    onChange={e => setOfferDescription(e.target.value)}
                                    placeholder="e.g. Flash Sale! Get 50% off all pizzas."
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="form-actions">
                <button type="button" onClick={onCancel} className="cancel-btn">
                    Cancel
                </button>
                <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? '⏳ Saving...' : (isEdit ? '✓ Update Coupon' : '✓ Create Coupon')}
                </button>
            </div>

            <style jsx>{`
                .coupon-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    max-height: 75vh;
                    overflow-y: auto;
                    padding: 1.5rem;
                }

                /* MAIN SECTION */
                .main-section {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 16px;
                    padding: 1.5rem;
                    color: white;
                }

                .code-row {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .code-input-wrapper {
                    flex: 1;
                }

                .code-input-wrapper label, .status-toggle label {
                    display: block;
                    font-size: 0.75rem;
                    opacity: 0.8;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .code-field {
                    display: flex;
                    gap: 0.5rem;
                }

                .code-input {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    background: rgba(255,255,255,0.95);
                    color: #333;
                }

                .generate-btn {
                    padding: 0.75rem 1rem;
                    border: none;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.2);
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .generate-btn:hover { background: rgba(255,255,255,0.3); }

                .status-toggle label {
                    text-align: center;
                }

                .status-btn {
                    padding: 0.75rem 1.25rem;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .status-btn.active { background: #22c55e; color: white; }
                .status-btn.inactive { background: rgba(255,255,255,0.2); color: white; }

                .discount-setup {
                    display: flex;
                    gap: 1rem;
                    align-items: stretch;
                    margin-bottom: 1.5rem;
                }

                .discount-type-selector {
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
                    padding: 1rem;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 12px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .type-btn.selected {
                    background: white;
                    color: #667eea;
                    border-color: white;
                }
                .type-btn .type-icon {
                    font-size: 1.5rem;
                    font-weight: 800;
                }
                .type-btn span:last-child {
                    font-size: 0.8rem;
                }

                .value-input-wrapper {
                    display: flex;
                    align-items: center;
                    background: white;
                    border-radius: 12px;
                    padding: 0 1rem;
                    min-width: 140px;
                }
                .value-input {
                    width: 80px;
                    border: none;
                    font-size: 2rem;
                    font-weight: 800;
                    text-align: right;
                    color: #667eea;
                    background: transparent;
                }
                .value-input:focus { outline: none; }
                .value-suffix {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #667eea;
                    margin-left: 0.25rem;
                }

                .quick-settings {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .setting-item {
                    flex: 1;
                    min-width: 120px;
                }
                .setting-item label {
                    display: block;
                    font-size: 0.7rem;
                    opacity: 0.8;
                    margin-bottom: 0.35rem;
                    text-transform: uppercase;
                }
                .setting-item select, .setting-item input {
                    width: 100%;
                    padding: 0.6rem 0.75rem;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    background: rgba(255,255,255,0.9);
                }

                /* COLLAPSIBLE SECTIONS */
                .collapsible-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .accordion-section {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .accordion-section.user-section {
                    background: #faf5ff;
                    border-color: #e9d5ff;
                }
                .accordion-section.offer-section {
                    background: #eff6ff;
                    border-color: #bfdbfe;
                    padding: 1rem;
                }

                .accordion-header {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.25rem;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    text-align: left;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #334155;
                }
                .accordion-header:hover { background: rgba(0,0,0,0.02); }

                .accordion-badge {
                    margin-left: auto;
                    font-size: 0.8rem;
                    color: #64748b;
                    background: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                }

                .accordion-arrow {
                    font-size: 0.7rem;
                    color: #94a3b8;
                }

                .accordion-content {
                    padding: 0 1.25rem 1.25rem;
                }

                .search-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    margin-bottom: 0.75rem;
                    font-size: 0.9rem;
                    background: white;
                    color: #0f172a;
                }

                .checkbox-list {
                    max-height: 180px;
                    overflow-y: auto;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    background: white;
                    color: #0f172a;
                }

                .checkbox-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    cursor: pointer;
                    border-bottom: 1px solid #f1f5f9;
                    transition: background 0.15s;
                    color: #0f172a;
                }
                .checkbox-item:last-child { border-bottom: none; }
                .checkbox-item:hover { background: #f8fafc; }
                .checkbox-item.checked { background: #f0fdf4; }
                .checkbox-item input { width: 18px; height: 18px; }

                .price-tag {
                    margin-left: auto;
                    font-size: 0.85rem;
                    color: #64748b;
                    background: #f1f5f9;
                    padding: 0.15rem 0.5rem;
                    border-radius: 4px;
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.1rem;
                }
                .user-info strong { font-size: 0.9rem; }
                .user-info span { font-size: 0.8rem; color: #64748b; }

                .empty-message {
                    padding: 1.5rem;
                    text-align: center;
                    color: #94a3b8;
                }

                .advanced-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .field-group label {
                    display: block;
                    font-size: 0.8rem;
                    color: #64748b;
                    margin-bottom: 0.35rem;
                }
                .field-group input {
                    width: 100%;
                    padding: 0.6rem 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.9rem;
                }

                .offer-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    font-weight: 500;
                    color: #1e40af;
                }
                .offer-toggle input { width: 18px; height: 18px; }
                .offer-desc {
                    margin-top: 0.75rem;
                }
                .offer-desc input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #bfdbfe;
                    border-radius: 8px;
                    font-size: 0.9rem;
                }

                /* ACTION BUTTONS */
                .form-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 0.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid #e2e8f0;
                }
                .cancel-btn {
                    flex: 1;
                    padding: 1rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    background: white;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .cancel-btn:hover { background: #f8fafc; }

                .submit-btn {
                    flex: 2;
                    padding: 1rem;
                    border: none;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
                .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
            `}</style>
        </form>
    );
}
