'use client';
import { useState } from 'react';
import Discover from './discover';
import AuditWorkspace from './audit-workspace';
export default function Home() {
  const [mode, setMode] = useState<'discover' | 'audit'>('discover');
  return <><nav className="product-modes" aria-label="TasteProbe mode"><button aria-pressed={mode === 'discover'} onClick={() => setMode('discover')}>Discover for me</button><button aria-pressed={mode === 'audit'} onClick={() => setMode('audit')}>Audit another AI</button></nav>{mode === 'discover' ? <Discover onAudit={() => setMode('audit')}/> : <AuditWorkspace/>}</>;
}
