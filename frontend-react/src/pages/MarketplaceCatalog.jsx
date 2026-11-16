import React, { useState } from 'react';
import Badge from '../components/Badge.jsx';
import { CatalogIcon, CheckIcon } from '../components/Icons.jsx';

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

export default function MarketplaceCatalog({ approved }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', ...Array.from(new Set(approved.map(p => p.category || 'General')))];

  const filtered = approved.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.seller?.businessName && p.seller.businessName.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || (p.category || 'General') === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Banner */}
      <div className="rounded-3xl bg-white border border-slate-100 p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
              <CatalogIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/50">
                Verified Consumer Storefront
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Live Commercial Marketplace</h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Displaying published items approved through the Camunda 8 automated catalog orchestration pipeline.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200">
            {approved.length} Published Listings
          </span>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by product, merchant, or specifications..."
              className="w-full rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  selectedCategory === c
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center text-slate-400">
          <p className="text-sm font-semibold text-slate-700">No published items match your search</p>
          <p className="text-xs text-slate-400 mt-1">
            Once products are approved via the <strong>Admin Review</strong> queue, they will appear live here in the public marketplace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <div
              key={p.id}
              className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-xs hover:shadow-sm transition flex flex-col justify-between"
            >
              <div>
                {/* Header Artwork */}
                <div className="h-32 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100/50 p-4 flex items-center justify-between relative border-b border-orange-100/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-white/90 px-2.5 py-1 rounded-full shadow-xs border border-orange-200/50">
                    {p.category || 'General'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckIcon className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {p.description || 'Verified manufacturer specification compliant with marketplace commercial standards.'}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Retail Price</span>
                    <span className="text-base font-black text-slate-900">{money(p.price)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Merchant Partner</span>
                    <span className="text-xs font-semibold text-slate-700 block">
                      {p.seller?.businessName || 'Verified Merchant'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
