export type KpiIconName='clapperboard'|'heart'|'sparkles'|'shield-check';
export default function KpiIcon({name}:{name:KpiIconName}){
  return <svg className="kpi-icon" data-icon={name} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name==='clapperboard'&&<><path d="M3 10h18v10H3zM3 10 2 5l17-3 1 5zM7 4l4 4m3-5 4 4"/></>}
    {name==='heart'&&<path d="M20.5 4.8a5.2 5.2 0 0 0-7.3 0L12 6l-1.2-1.2a5.2 5.2 0 0 0-7.3 7.4L12 21l8.5-8.8a5.2 5.2 0 0 0 0-7.4Z"/>}
    {name==='sparkles'&&<><path d="m13 3 2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5Z"/><path d="M4 2v4M2 4h4"/></>}
    {name==='shield-check'&&<><path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></>}
  </svg>;
}
