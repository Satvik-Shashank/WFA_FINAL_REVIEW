import React from 'react';
import { CheckIcon, XIcon } from './Icons.jsx';

export default function Notification({ message, error }) {
  if (!message && !error) return null;
  return (
    <div className="mb-4 space-y-2">
      {message && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-xs font-semibold shadow-xs">
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckIcon className="w-3 h-3" />
          </span>
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-xs font-semibold shadow-xs">
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
            <XIcon className="w-3 h-3" />
          </span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
