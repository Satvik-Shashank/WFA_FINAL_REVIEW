import React from 'react';
import { ArrowRightIcon, TrackerIcon } from '../components/Icons.jsx';

export default function OverviewDashboard({ sellers, products, tasks, onNavigate, onSeedData }) {
  const approvedSellers = sellers.filter(s => s.status === 'APPROVED');
  const pendingSellers = sellers.filter(s => s.status === 'PENDING');
  const approvedProducts = products.filter(p => p.status === 'APPROVED');
  const pendingProducts = products.filter(p => p.status === 'PENDING_REVIEW');
  const pendingTasks = tasks.filter(t => t.status === 'PENDING');

  const stats = [
    { title: 'Active Sellers', value: approvedSellers.length, sub: `${sellers.length} total registered`, tag: 'Verified', tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { title: 'Pending Applications', value: pendingSellers.length, sub: 'Awaiting doc review', tag: 'Doc Review', tagColor: 'text-amber-800 bg-amber-50 border-amber-200' },
    { title: 'Published Catalog', value: approvedProducts.length, sub: `${products.length} submitted items`, tag: 'Store Active', tagColor: 'text-orange-700 bg-orange-50 border-orange-200' },
    { title: 'Pending Reviews', value: pendingProducts.length, sub: 'Catalog QA queue', tag: 'In Review', tagColor: 'text-slate-800 bg-slate-100 border-slate-300' },
    { title: 'Task Inbox SLA', value: pendingTasks.length, sub: 'Assigned workflow tasks', tag: 'User Tasks', tagColor: 'text-orange-700 bg-orange-50 border-orange-200' }
  ];

  const workers = [
    { type: 'validate-seller-details', group: 'SellerOnboarding', retries: 3, status: 'Active' },
    { type: 'create-seller-account', group: 'SellerOnboarding', retries: 3, status: 'Active' },
    { type: 'reject-seller', group: 'SellerOnboarding', retries: 2, status: 'Active' },
    { type: 'validate-product-catalog', group: 'CatalogReview', retries: 3, status: 'Active' },
    { type: 'publish-products', group: 'CatalogReview', retries: 3, status: 'Active' },
    { type: 'send-approval-notification', group: 'SellerOnboarding', retries: 2, status: 'Active' },
    { type: 'activate-seller-store', group: 'CatalogReview', retries: 2, status: 'Active' }
  ];

  const pipeline = [
    { step: '01', name: 'Registration', desc: 'Payload validation' },
    { step: '02', name: 'Doc Review', desc: 'Parallel Multi-Instance' },
    { step: '03', name: 'Decision GW', desc: 'FEEL: sellerApproved' },
    { step: '04', name: 'Call Activity', desc: 'Child: Catalog Review' },
    { step: '05', name: 'Parallel Ops', desc: 'Listing QA & Price Audit' },
    { step: '06', name: 'Store Active', desc: 'Automatic storefront sync' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 border border-orange-200 mb-3">
            Camunda 8 Zeebe &middot; Workflow Automation
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
            Enterprise Partner Onboarding &amp; Catalog Management
          </h1>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed max-w-2xl">
            Orchestrate partner compliance verification, parallel document evaluation,
            and automated catalog reviews through integrated BPMN 2.0 workflows.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={() => onNavigate('register')} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors">
              <span>Register New Partner</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onNavigate('tracker')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-800 shadow-xs transition-colors">
              <TrackerIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Live Process Tracker</span>
            </button>
            {sellers.length === 0 && (
              <button onClick={onSeedData} className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 px-5 py-2.5 text-xs font-semibold shadow-xs transition-colors">
                Populate Demo Dataset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{s.title}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.tagColor}`}>{s.tag}</span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">{s.value}</span>
            </div>
            <p className="mt-1 text-xs text-slate-600">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* BPMN Pipeline — fixed overflow with wrapped text */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">BPMN 2.0 Orchestration Pipeline</h2>
            <p className="text-xs text-slate-700 mt-0.5">Workflow token flow across parent process and Call Activity sub-processes</p>
          </div>
          <button onClick={() => onNavigate('tracker')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors">
            <span>Open Tracker</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipeline.map((st, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col min-h-[90px]">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Stage {st.step}</span>
              <div className="text-xs font-bold text-slate-900 mt-1 leading-snug">{st.name}</div>
              <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">{st.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column: Recent Applications & Zeebe Workers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Recent Applications</h2>
            <button onClick={() => onNavigate('admin')} className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors">
              Review Queue &rarr;
            </button>
          </div>
          {sellers.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
              <p className="text-xs text-slate-600">No sellers registered yet. Click &quot;Register New Partner&quot; to begin.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sellers.slice(0, 5).map(s => (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{s.businessName}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{s.contactName} &middot; {s.email}</div>
                  </div>
                  <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${
                    s.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    s.status === 'REJECTED' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>{s.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Zeebe Job Workers</h2>
              <p className="text-xs text-slate-700 mt-0.5">7 workers running via Spring Zeebe Starter</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 7 Active
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-2 px-3 font-semibold text-slate-700">Worker Type</th>
                  <th className="py-2 px-3 font-semibold text-slate-700">Group</th>
                  <th className="py-2 px-3 font-semibold text-slate-700">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workers.map((w, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-orange-700 font-mono">{w.type}</td>
                    <td className="py-2 px-3 text-slate-700">{w.group}</td>
                    <td className="py-2 px-3 text-emerald-700 font-medium">&bull; {w.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
