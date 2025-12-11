'use client';

import React, { useState } from 'react';
import { printOrder } from './order-receipt';

export default function OrderActions({ order }: { order: any }) {
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printOrder(order);
    } catch (e) {
      console.error('Print error:', e);
    }
    setPrinting(false);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button
        onClick={handlePrint}
        disabled={printing}
        style={{
          padding: '0.75rem 1.5rem',
          background: printing ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: '600',
          cursor: printing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}
      >
        🖨️ {printing ? 'Printing...' : 'Print Receipt'}
      </button>
    </div>
  );
}
