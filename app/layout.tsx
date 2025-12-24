import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Sales Analyst Dashboard',
  description: 'AI-powered sales analytics dashboard with intelligent insights',
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

