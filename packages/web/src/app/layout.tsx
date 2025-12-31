import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'PMP Study Application',
    description: 'Comprehensive study platform for the 2026 PMP certification exam',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
