import React, { useState } from 'react';
import { sellersApi, productsApi } from '../api/client.js';
import Badge from '../components/Badge.jsx';
import Notification from '../components/Notification.jsx';
import { AdminIcon, CheckIcon, XIcon } from '../components/Icons.jsx';

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

export default function AdminReview({ sellers, products, onSuccess }) {
  const [activeTab, setActiveTab] = useState('sellers');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [rejectionModal, setRejectionModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Compliance criteria not met.');

  async function handleDecision(type, id, decision, reason) {
    setMsg(''); setErr('');
    setLoading(true);
    try {
      if (type === 'seller') {
        await sellersApi.decide(id, decision);
      } else {
        await productsApi.decide(id, decision, decision === 'REJECT' ? reason : undefined);
      }
      setMsg(`${type === 'seller' ? 'Seller application' : 'Product catalog item'} marked ${decision.toLowerCase()}d successfully.`);
      setRejectionModal(null);
      if (onSuccess) onSuccess();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const pendingSellers = sellers.filter(s => s.status === 'PENDING');
  const pendingProducts = products.filter(p => p.status === 'PENDING_REVIEW');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Card */}
      <div className="rounded-3xl bg-white border border-slate-100 p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
              <AdminIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/50">
                Governance &amp; Compliance Hub
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Admin Approval &amp; Decision Queue</h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Review seller dossiers and catalog submissions. Decisions route tokens through the
                BPMN Exclusive Gateways (<code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded-md font-mono text-orange-700">=sellerApproved</code> and <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded-md font-mono text-orange-700">=catalogApproved</code>).
              </p>
            </div>
          </div>

          {/* Sub-tab Switcher */}
          <div className="flex rounded-full bg-slate-100 p-1 border border-slate-200/60">
            <button
              onClick={() => setActiveTab('sellers')}
              className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                activeTab === 'sellers'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Seller Applications ({pendingSellers.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                activeTab === 'products'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Product Catalog ({pendingProducts.length})
            </button>
          </div>
        </div>
      </div>

      <Notification message={msg} error={err} />

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="rounded-3xl bg-white p-7 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-rose-600">Reject {rejectionModal.type === 'seller' ? 'Seller Application' : 'Product Listing'}</h3>
              <button onClick={() => setRejectionModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
            </div>
            <p className="text-xs text-slate-500">
              Provide an official compliance reason for rejecting <strong>{rejectionModal.name}</strong>.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Notes *</label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModal(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDecision(rejectionModal.type, rejectionModal.id, 'REJECT', rejectionReason)}
                disabled={loading}
                className="rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Sellers */}
      {activeTab === 'sellers' && (
        <div className="space-y-3">
          {sellers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
              No seller applications found.
            </div>
          ) : (
            sellers.map(s => {
              const isPending = s.status === 'PENDING';
              return (
                <div key={s.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">{s.businessName}</h2>
                        <Badge value={s.status} />
                        <span className="text-xs font-mono text-slate-400">ID #{s.id}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Contact: <strong>{s.contactName}</strong> &middot; Email: <span className="text-orange-600 font-medium">{s.email}</span> &middot; Tel: {s.phone || 'N/A'}
                      </p>
                      {s.businessAddress && (
                        <p className="text-xs text-slate-400 mt-0.5">Address: {s.businessAddress}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleDecision('seller', s.id, 'APPROVE')}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition disabled:opacity-50"
                          >
                            <CheckIcon className="w-3.5 h-3.5" />
                            <span>Approve Partner</span>
                          </button>
                          <button
                            onClick={() => setRejectionModal({ type: 'seller', id: s.id, name: s.businessName })}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                          >
                            <XIcon className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 italic">Decision Recorded</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Products */}
      {activeTab === 'products' && (
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
              No products submitted for review.
            </div>
          ) : (
            products.map(p => {
              const isPending = p.status === 'PENDING_REVIEW';
              return (
                <div key={p.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">{p.name}</h2>
                        <Badge value={p.status} />
                        <span className="text-xs font-mono text-slate-400">Item #{p.id}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Seller: <strong>{p.seller?.businessName}</strong> &middot; Category: {p.category || 'General'} &middot; SKU: {p.sku || 'N/A'}
                      </p>
                      {p.description && (
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">{p.description}</p>
                      )}
                      {p.rejectionReason && (
                        <p className="text-xs font-semibold text-rose-600 mt-1">Reason: {p.rejectionReason}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span className="text-lg font-black text-slate-900">{money(p.price)}</span>
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecision('product', p.id, 'APPROVE')}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition disabled:opacity-50"
                          >
                            <CheckIcon className="w-3.5 h-3.5" />
                            <span>Publish to Catalog</span>
                          </button>
                          <button
                            onClick={() => setRejectionModal({ type: 'product', id: p.id, name: p.name })}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                          >
                            <XIcon className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 italic">Review Finalized</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
