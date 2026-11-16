import React from 'react';

const colorMap = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-800 border-rose-200',
  pending_review: 'bg-orange-50 text-orange-800 border-orange-200',
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
  started: 'bg-orange-50 text-orange-800 border-orange-200',
};

const dotMap = {
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-rose-500',
  pending_review: 'bg-orange-500',
  active: 'bg-emerald-500',
  completed: 'bg-slate-400',
  started: 'bg-orange-500',
};

export default function Badge({ value }) {
  const key = String(value).toLowerCase();
  const color = colorMap[key] || 'bg-slate-50 text-slate-700 border-slate-200';
  const dot = dotMap[key] || 'bg-slate-400';
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {String(value).replace(/_/g, ' ')}
    </span>
  );
}
