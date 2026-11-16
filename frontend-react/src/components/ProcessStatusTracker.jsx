import React, { useEffect, useState } from 'react';
import { sellersApi, productsApi } from '../api/client.js';
import Badge from './Badge.jsx';
import { TrackerIcon, RefreshIcon, CheckIcon, XIcon } from './Icons.jsx';

export default function ProcessStatusTracker() {
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedSellerId, setSelectedSellerId] = useState('ALL');

  async function loadData() {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([sellersApi.getAll(), productsApi.getAll()]);
      setSellers(s);
      setProducts(p);
      setLastUpdated(new Date());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const pipelineStages = [
    { id: 'REG', name: 'Start', sub: 'Registration' },
    { id: 'VAL', name: 'Validation', sub: 'Error & Timer' },
    { id: 'DOC', name: 'Doc Review', sub: 'Parallel MI' },
    { id: 'GW1', name: 'Decision', sub: 'FEEL Gateway' },
    { id: 'ACT', name: 'Account', sub: 'Service Task' },
    { id: 'CAL', name: 'Catalog', sub: 'Call Activity' },
    { id: 'VALP', name: 'QA Check', sub: 'Sequential MI' },
    { id: 'PUB', name: 'Published', sub: 'Store Active' },
  ];

  const filteredSellers = selectedSellerId === 'ALL'
    ? sellers
    : sellers.filter(s => String(s.id) === selectedSellerId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Card */}
      <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
              <TrackerIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                Camunda 8 Telemetry
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">Live Process Status Tracker</h1>
              <p className="text-xs text-slate-700 mt-0.5 max-w-xl">
                Real-time tracking of process instances across BPMN stages, Multi-Instance executions, and Call Activities.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedSellerId}
              onChange={e => setSelectedSellerId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="ALL">All Instances ({sellers.length})</option>
              {sellers.map(s => (
                <option key={s.id} value={s.id}>{s.businessName} (ID: #{s.id})</option>
              ))}
            </select>
            <button onClick={loadData} disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs transition-colors">
              <RefreshIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>{loading ? 'Polling…' : 'Refresh'}</span>
            </button>
          </div>
        </div>
        {lastUpdated && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Last polled: {lastUpdated.toLocaleTimeString()} (6s interval)</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Zeebe Stream Active
            </span>
          </div>
        )}
      </div>

      {/* Pipeline Stage Reference — fixed: short names, no overflow */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
          BPMN 2.0 Architectural Pipeline Stages
        </h2>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          {pipelineStages.map((st, i) => (
            <div key={st.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center flex flex-col items-center gap-1 overflow-hidden">
              <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-700 text-[10px] font-bold inline-flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-[10px] font-bold text-slate-900 leading-tight w-full truncate">{st.name}</span>
              <span className="text-[9px] text-slate-500 leading-tight w-full truncate">{st.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instance Timelines */}
      {filteredSellers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-900">No active process instances</p>
          <p className="text-xs text-slate-600 mt-1">Register a seller to initiate a new BPMN workflow instance.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSellers.map(seller => {
            const sellerProducts = products.filter(p => p.seller?.id === seller.id);
            const isApproved = seller.status === 'APPROVED';
            const isRejected = seller.status === 'REJECTED';
            const hasPublishedProducts = sellerProducts.some(p => p.status === 'APPROVED');

            let currentStageIndex = 0;
            if (seller.status === 'PENDING') currentStageIndex = 2;
            else if (isApproved && sellerProducts.length === 0) currentStageIndex = 4;
            else if (isApproved && sellerProducts.length > 0 && !hasPublishedProducts) currentStageIndex = 6;
            else if (isApproved && hasPublishedProducts) currentStageIndex = 7;
            else if (isRejected) currentStageIndex = 3;

            return (
              <div key={seller.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">{seller.businessName}</span>
                      <Badge value={seller.status} />
                      <span className="text-xs font-mono text-slate-600">ID #{seller.id}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">
                      {seller.contactName} &middot; {seller.email} &middot; Started: {new Date(seller.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">Current Step</span>
                    <span className="text-xs font-bold text-orange-600 font-mono">{pipelineStages[currentStageIndex]?.name}</span>
                  </div>
                </div>

                {/* Progress Nodes — 4 col on mobile, 8 on lg */}
                <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
                  {pipelineStages.map((stage, idx) => {
                    const isPast = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    const isFailed = isRejected && idx === 3;
                    return (
                      <div key={stage.id}
                        className={`rounded-lg p-2 text-center border flex flex-col items-center gap-1 overflow-hidden ${
                          isFailed ? 'border-rose-200 bg-rose-50 text-rose-800' :
                          isPast ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
                          isCurrent ? 'border-orange-300 bg-orange-50 text-orange-900 ring-1 ring-orange-200' :
                          'border-slate-100 bg-slate-50 text-slate-500'
                        }`}>
                        <div>
                          {isFailed ? (
                            <span className="w-5 h-5 rounded-full bg-rose-600 text-white inline-flex items-center justify-center"><XIcon className="w-3 h-3" /></span>
                          ) : isPast ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center"><CheckIcon className="w-3 h-3" /></span>
                          ) : isCurrent ? (
                            <span className="w-5 h-5 rounded-full bg-orange-600 text-white inline-flex items-center justify-center text-[10px] font-bold">&bull;</span>
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 inline-flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold leading-tight w-full truncate">{stage.name}</span>
                      </div>
                    );
                  })}
                </div>

                {sellerProducts.length > 0 && (
                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-xs font-semibold text-slate-700 block mb-2">
                      Child Process Products ({sellerProducts.length} items):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {sellerProducts.map(p => (
                        <div key={p.id} className="inline-flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1 text-xs">
                          <span className="font-semibold text-slate-900">{p.name}</span>
                          <Badge value={p.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
