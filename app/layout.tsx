import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TasteProbe | Cultural evidence, carefully considered',
  description: 'Inspect a movie shortlist through traceable cultural evidence from Qloo. Confirm identities, compare rankings, and export your findings.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
