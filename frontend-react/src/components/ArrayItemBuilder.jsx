import React, { useState } from 'react';

/**
 * ArrayItemBuilder — Dynamic array item builder for Multi-Instance process inputs.
 * Subtle, professional styling matching the warm sunset theme without emojis.
 */
export default function ArrayItemBuilder({ label, fields, onChange, initialItems = [], presets = [] }) {
  const [items, setItems] = useState(initialItems);

  const addItem = (customValues = {}) => {
    const blank = Object.fromEntries(fields.map(f => [f.key, customValues[f.key] || '']));
    const updated = [...items, blank];
    setItems(updated);
    onChange(updated);
  };

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange(updated);
  };

  const updateItem = (index, fieldKey, value) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [fieldKey]: value } : item
    );
    setItems(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="block text-xs font-bold text-slate-800 uppercase tracking-wide">{label}</span>
          <span className="text-[11px] text-slate-500">Multi-Instance collection elements</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addItem(p.values)}
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 hover:bg-orange-100 transition border border-orange-200"
            >
              + {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => addItem()}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs"
          >
            <span>+</span> Add Custom Entry
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50">
          <p className="text-xs text-slate-500 font-medium">No items currently in this Multi-Instance collection.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Use the quick presets above to populate standard credentials.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="border border-slate-200/80 rounded-2xl p-4 bg-white shadow-xs space-y-3 relative hover:border-orange-200 transition"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 inline-flex items-center justify-center text-[10px] font-bold">
                    {index + 1}
                  </span>
                  Instance #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fields.map(field => (
                  <div key={field.key} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {field.label}{field.required && ' *'}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
                        rows={2}
                        value={item[field.key] || ''}
                        onChange={e => updateItem(index, field.key, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder || ''}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
                        value={item[field.key] || ''}
                        onChange={e => updateItem(index, field.key, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder || ''}
                        min={field.min}
                        step={field.step}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>{items.length} element{items.length !== 1 ? 's' : ''} in collection payload</span>
          <span className="text-[11px] font-mono text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
            target: =documents
          </span>
        </div>
      )}
    </div>
  );
}
