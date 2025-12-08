'use client';

import { Suspense } from 'react';

function SettingsContent() {
    const test = () => {
        console.log('test');
    };

    return (
        <div className="p-6">
            <h1>Settings Page - Minimal Test</h1>
            <p>If you see this, the build works.</p>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SettingsContent />
        </Suspense>
    );
}
