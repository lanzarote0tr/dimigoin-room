// src/components/Spinner.jsx
import React from 'react';

const spinnerStyle = `
@keyframes bounce-bar {
    0%, 100% { transform: scaleY(0.2); }
    50% { transform: scaleY(1); }
}
.bar-1 {
    animation: bounce-bar 1.5s infinite ease-in-out;
    animation-delay: 0s;
}
.bar-2 {
    animation: bounce-bar 1.5s infinite ease-in-out;
    animation-delay: 0.15s;
}
.bar-3 {
    animation: bounce-bar 1.5s infinite ease-in-out;
    animation-delay: 0.3s;
}
`;

export default function Spinner() {
    return (
        <div style={{
            minHeight: '90vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            {/* 인라인 스타일로 Tailwind 일부 대체 */}
            <style>{spinnerStyle}</style>
            <div style={{
                width: '12rem',
                height: '12rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '0.5rem',

                    height: '6rem'
                }}>
                    <div className="bar-1" style={{
                        width: '2rem',
                        height: '100%',
                        background: '#60a5fa',
                        borderTopLeftRadius: '0.5rem',
                        borderTopRightRadius: '0.5rem',
                        transformOrigin: 'bottom'
                    }} />
                    <div className="bar-2" style={{
                        width: '2rem',
                        height: '100%',
                        background: '#3b82f6',
                        borderTopLeftRadius: '0.5rem',
                        borderTopRightRadius: '0.5rem',
                        transformOrigin: 'bottom'
                    }} />
                    <div className="bar-3" style={{
                        width: '2rem',
                        height: '100%',
                        background: '#2563eb',
                        borderTopLeftRadius: '0.5rem',
                        borderTopRightRadius: '0.5rem',
                        transformOrigin: 'bottom'
                    }} />
                </div>
            </div>
        </div>
    );
}