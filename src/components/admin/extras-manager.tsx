'use client';

import { useState } from 'react';
import ExtraForm from './extra-form';
import ExtraList from './extra-list';
import ResponsiveGrid from './responsive-grid';

export default function ExtrasManager({ initialExtras, categories }: { initialExtras: any[], categories: any[] }) {
    const [editingExtra, setEditingExtra] = useState<any>(null);

    return (
        <ResponsiveGrid columns="1-2">
            <ExtraForm
                key={editingExtra ? editingExtra.id : 'new'}
                initialData={editingExtra}
                categories={categories}
                onCancel={() => setEditingExtra(null)}
            />
            <ExtraList
                initialExtras={initialExtras}
                onEdit={(extra) => setEditingExtra(extra)}
            />
        </ResponsiveGrid>
    );
}
