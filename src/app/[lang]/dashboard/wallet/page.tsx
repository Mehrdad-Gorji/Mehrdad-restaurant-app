'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface Transaction {
    id: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    description: string;
    createdAt: string;
}

interface Wallet {
    id: string;
    balance: number;
    transactions: Transaction[];
}

export default function UserWalletPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(true);
    const [pointsToRedeem, setPointsToRedeem] = useState<number>(100);
    const [redeeming, setRedeeming] = useState(false);
    const pathname = usePathname();
    const lang = pathname.split('/')[1] === 'fa' ? 'fa' : 'en';

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = () => {
        fetch('/api/user/wallet')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setWallet(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleRedeem = async () => {
        if (!wallet || wallet.balance < pointsToRedeem) return;

        setRedeeming(true);
        try {
            const res = await fetch('/api/user/wallet/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pointsToRedeem })
            });
            const data = await res.json();

            if (res.ok) {
                alert(lang === 'fa'
                    ? `تبریک! کوپن شما صادر شد: ${data.code}`
                    : `Success! Your coupon code is: ${data.code}`);
                fetchWallet(); // Refresh balance
            } else {
                alert(data.error || 'Redemption failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error processing redemption');
        } finally {
            setRedeeming(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading wallet...</div>;

    const isFa = lang === 'fa';

    return (
        <div style={{ color: 'white', maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: isFa ? 'right' : 'left' }}>
                {isFa ? 'باشگاه مشتریان' : 'My Loyalty Wallet'} 🏅
            </h1>

            {/* Balance Card */}
            <div style={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                borderRadius: '24px',
                padding: '2.5rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                        {isFa ? 'موجودی شما' : 'Current Balance'}
                    </div>
                    <div style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1 }}>
                        {Number(wallet?.balance || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '1rem', opacity: 0.8, marginTop: '0.5rem' }}>
                        {isFa ? 'امتیاز' : 'Points'}
                    </div>
                </div>
            </div>

            {/* Redeem Section */}
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '2rem',
                marginBottom: '2rem'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: isFa ? 'right' : 'left' }}>
                    {isFa ? 'تبدیل امتیاز به کوپن' : 'Redeem Points'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: isFa ? 'right' : 'left' }}>
                        {isFa
                            ? 'امتیاز خود را وارد کنید تا به کد تخفیف تبدیل شود.'
                            : 'Enter amount of points to convert into a discount coupon.'}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', direction: isFa ? 'rtl' : 'ltr' }}>
                        <input
                            type="number"
                            min="100"
                            step="100"
                            value={pointsToRedeem}
                            onChange={e => setPointsToRedeem(Number(e.target.value))}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '12px',
                                flex: 1,
                                fontSize: '1.2rem'
                            }}
                        />
                        <button
                            onClick={handleRedeem}
                            disabled={redeeming || !wallet || wallet.balance < pointsToRedeem || pointsToRedeem <= 0}
                            style={{
                                background: 'white',
                                color: 'black',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                opacity: (redeeming || !wallet || wallet.balance < pointsToRedeem) ? 0.5 : 1
                            }}
                        >
                            {redeeming
                                ? (isFa ? 'در حال پردازش...' : 'Processing...')
                                : (isFa ? 'دریافت کوپن' : 'Get Coupon')}
                        </button>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '2rem'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: isFa ? 'right' : 'left' }}>
                    {isFa ? 'تاریخچه تراکنش‌ها' : 'Transaction History'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {wallet?.transactions && wallet.transactions.length > 0 ? (
                        wallet.transactions.map(tx => (
                            <div key={tx.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                borderLeft: `4px solid ${tx.type === 'CREDIT' ? '#4CAF50' : '#FF5252'}`
                            }}>
                                <div style={{ textAlign: isFa ? 'right' : 'left' }}>
                                    <div style={{ fontWeight: 'bold' }}>{tx.description}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    color: tx.type === 'CREDIT' ? '#4CAF50' : '#FF5252'
                                }}>
                                    {tx.type === 'CREDIT' ? '+' : '-'}{Number(tx.amount)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>
                            {isFa ? 'هنوز تراکنشی ثبت نشده است' : 'No transactions yet'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
