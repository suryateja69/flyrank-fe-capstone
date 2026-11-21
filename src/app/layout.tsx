import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'TaskFlow — make room for progress', description: 'A focused personal task planner. Plan, prioritize, and track your work.' };
export default function Layout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body><a className="skip" href="#main">Skip to content</a>{children}</body></html>; }
