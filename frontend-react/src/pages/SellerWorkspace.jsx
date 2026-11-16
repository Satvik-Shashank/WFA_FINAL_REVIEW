import React, { useState } from 'react';
import { productsApi, tasksApi } from '../api/client.js';
import ArrayItemBuilder from '../components/ArrayItemBuilder.jsx';
import Notification from '../components/Notification.jsx';
import Badge from '../components/Badge.jsx';
import { WorkspaceIcon, ArrowRightIcon } from '../components/Icons.jsx';

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

export default function SellerWorkspace({ sellers, products, onSuccess, onNavigate }) {
  const [sellerId, setSellerId] = useState(sellers.find(s => s.status === 'APPROVED')?.id?.toString() || '');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [catalogItems, setCatalogItems] = useState([
    { variantName: 'Matte Space Grey', variantValue: 'Grey', variantPrice: '14999.00' },
    { variantName: 'Starlight White', variantValue: 'White', variantPrice: '14999.00' }
  ]);
  const [formData, setFormData] = useState({
    name: 'Precision Wireless ANC Over-Ear Headset',
    category: 'Consumer Electronics',
    price: '14999.00',
    stockQuantity: '150',
    sku: 'ANC-PRO-2026',
    description: 'Flagship studio-grade noise-cancelling headphones featuring 50mm beryllium dynamic drivers, LDAC high-resolution wireless codec, 40-hour battery life, and rapid USB-C fast charging.'
  });

  const approvedSellers = sellers.filter(s => s.status === 'APPROVED');
  const myProducts = products.filter(p => String(p.seller?.id) === sellerId);
  const selectedSeller = sellers.find(s => String(s.id) === sellerId);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const variantPresets = [
    { label: 'Color Variant', values: { variantName: 'Midnight Black Edition', variantValue: 'Black', variantPrice: formData.price || '0' } },
    { label: 'Storage Variant', values: { variantName: '256GB High-Speed Storage', variantValue: '256GB', variantPrice: '2000.00' } },
    { label: 'Bundle Warranty', values: { variantName: '2-Year Extended Protection', variantValue: '2Y Extended', variantPrice: '1499.00' } }
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!sellerId) { setErr('Please select an active, approved seller partner.'); return; }
    setMsg(''); setErr('');
    setLoading(true);
    try {
      const prod = await productsApi.submit(sellerId, {
        ...formData,
        price: Number(formData.price),
        stockQuantity: formData.stockQuantity ? Number(formData.stockQuantity) : 0,
        catalogItems
      });

      try {
        await tasksApi.create({
          taskType: 'ops-review-listings',
          assignee: 'operations-team',
          entityId: prod.id,
          entityType: 'PRODUCT'
        });
      } catch {
        // silent
      }

      setMsg(`Product "${formData.name}" submitted! Child BPMN process "Process_CatalogReview" triggered in Camunda 8.`);
      setFormData({
        name: '',
        category: '',
        price: '',
        stockQuantity: '',
        sku: '',
        description: ''
      });
      if (onSuccess) onSuccess();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Seller Switcher */}
      <div className="rounded-3xl bg-white border border-slate-100 p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
              <WorkspaceIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/50">
                Stage 2 &middot; Call Activity Process_CatalogReview
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Catalog &amp; Product Workspace</h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Submit product listings and Multi-Instance variant attributes for automated sequential validation,
                parallel ops review, and catalog publication.
              </p>
            </div>
          </div>

          <div className="min-w-[260px]">
            <label className="block text-xs font-bold text-slate-700 mb-1">Active Seller Context</label>
            <select
              value={sellerId}
              onChange={e => setSellerId(e.target.value)}
              className="w-full border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
            >
              <option value="">-- Choose Approved Partner --</option>
              {approvedSellers.map(s => (
                <option key={s.id} value={s.id}>{s.businessName} (ID: #{s.id})</option>
              ))}
            </select>
          </div>
        </div>

        {approvedSellers.length === 0 && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
            <div className="text-xs text-amber-800">
              No approved sellers exist yet. Please navigate to <strong>Admin Review</strong> to approve a registered partner.
            </div>
            <button
              onClick={() => onNavigate('admin')}
              className="text-xs font-bold text-amber-900 underline hover:text-amber-700"
            >
              Go to Admin Review &rarr;
            </button>
          </div>
        )}
      </div>

      <Notification message={msg} error={err} />

      {sellerId && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Submission Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Product Specifications</h2>
                <p className="text-xs text-slate-400">Provide catalog item metadata and pricing.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition shadow-xs"
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Taxonomy / Category *</label>
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition shadow-xs"
                    placeholder="Audio &amp; Electronics"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Retail Price (INR) *</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition shadow-xs"
                    placeholder="4999.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Inventory Stock Units</label>
                  <input
                    name="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition shadow-xs"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Code ID</label>
                  <input
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition shadow-xs"
                    placeholder="SKU-8921"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description &amp; Highlights</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition shadow-xs"
                    placeholder="Detailed commercial description..."
                  />
                </div>
              </div>

              {/* Dynamic Array Builder */}
              <div className="border-t border-slate-100 pt-5">
                <div className="mb-3">
                  <h2 className="text-sm font-bold text-slate-900">Product Variants &amp; Attributes (Multi-Instance)</h2>
                  <p className="text-xs text-slate-400">
                    Each variant is evaluated by the Sequential Multi-Instance validation sub-process.
                  </p>
                </div>

                <ArrayItemBuilder
                  label="Catalog Variants Collection"
                  fields={[
                    { key: 'variantName', label: 'Variant Descriptor', required: true, placeholder: 'e.g. Color: Matte Black' },
                    { key: 'variantValue', label: 'Attribute Code', required: true, placeholder: 'e.g. BLK' },
                    { key: 'variantPrice', label: 'Specific Price (INR)', type: 'number', step: '0.01', placeholder: '4999.00' },
                  ]}
                  initialItems={catalogItems}
                  presets={variantPresets}
                  onChange={setCatalogItems}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition disabled:opacity-50"
                >
                  <span>{loading ? 'Submitting to Review…' : 'Submit for BPMN Catalog Review & Publishing'}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Submitted Products Table for Current Seller */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Submitted Catalog Items</h2>
                  <p className="text-xs text-slate-400">
                    Seller: <strong>{selectedSeller?.businessName}</strong> ({myProducts.length} items)
                  </p>
                </div>
                <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                  Live
                </span>
              </div>

              {myProducts.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-xs font-medium">No items submitted yet for this seller.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myProducts.map(p => (
                    <div key={p.id} className="rounded-2xl border border-slate-100 p-3 hover:bg-slate-50/50 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-xs text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {p.category || 'General'} &middot; SKU: {p.sku || 'N/A'}
                          </div>
                        </div>
                        <Badge value={p.status} />
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                        <span className="font-bold text-slate-900">{money(p.price)}</span>
                        <span className="text-[11px] text-slate-400">Stock: {p.stockQuantity || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
