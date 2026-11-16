import React, { useState } from 'react';
import { sellersApi, tasksApi } from '../api/client.js';
import ArrayItemBuilder from '../components/ArrayItemBuilder.jsx';
import Notification from '../components/Notification.jsx';
import { RegisterIcon, ArrowRightIcon } from '../components/Icons.jsx';

export default function SellerRegistration({ onSuccess }) {
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([
    { docType: 'GSTIN Certificate', docNumber: '29ABCDE1234F1Z5', docUrl: 'https://gst.gov.in/verify/29ABCDE1234F1Z5' },
    { docType: 'Company PAN Card', docNumber: 'ABCDE1234F', docUrl: 'https://incometax.gov.in/verify/ABCDE1234F' }
  ]);
  const [formData, setFormData] = useState({
    businessName: 'Vanguard Retail Systems Ltd',
    contactName: 'Rohan Sharma',
    email: 'rohan.sharma@vanguardretail.in',
    phone: '+91 98200 12345',
    businessAddress: 'Plot 42, Bandra-Kurla Complex, Mumbai, MH'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const documentPresets = [
    { label: 'GSTIN Certificate', values: { docType: 'GSTIN Certificate', docNumber: '29AAAAA0000A1Z5', docUrl: 'https://gst.gov.in/verify' } },
    { label: 'PAN Card', values: { docType: 'Permanent Account Number', docNumber: 'AAAAA0000A', docUrl: 'https://incometax.gov.in' } },
    { label: 'Trade License', values: { docType: 'Municipal Trade License', docNumber: 'TL-2026-9812', docUrl: 'https://municipal.gov.in/license' } },
    { label: 'Bank Mandate', values: { docType: 'Canceled Cheque / Bank Mandate', docNumber: 'HDFC0001234', docUrl: 'https://banking.verify' } }
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    setLoading(true);
    try {
      const seller = await sellersApi.register({ ...formData, documents });
      try {
        await tasksApi.create({ taskType: 'verify-seller-documents', assignee: 'operations-team', entityId: seller.id, entityType: 'SELLER' });
      } catch { /* silent */ }
      setMsg(`Partner application submitted! Workflow instance initiated in Camunda 8 Zeebe.`);
      if (onSuccess) onSuccess();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* Step-by-step workflow summary panel replacing the JSON payload */
  const workflowSteps = [
    {
      num: '01',
      title: 'Registration & Submission',
      desc: 'Seller details and compliance documents are captured and submitted to initiate a Camunda 8 process instance.',
      tag: 'Start Event',
      tagColor: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    {
      num: '02',
      title: 'Parallel Document Review',
      desc: 'Each uploaded document is independently reviewed by the operations team via a Parallel Multi-Instance sub-process.',
      tag: 'Multi-Instance',
      tagColor: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    {
      num: '03',
      title: 'Approval Decision Gateway',
      desc: 'A FEEL expression gateway evaluates sellerApproved. Approved sellers proceed to account creation; rejected sellers receive a notification.',
      tag: 'Exclusive GW',
      tagColor: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      num: '04',
      title: 'Account Creation & Notification',
      desc: 'On approval, the system automatically creates the seller account and dispatches an approval notification via service tasks.',
      tag: 'Service Task',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      num: '05',
      title: 'Catalog Review Call Activity',
      desc: 'Control transfers to a child process (Process_CatalogReview) where product listings undergo sequential validation and QA review.',
      tag: 'Call Activity',
      tagColor: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    {
      num: '06',
      title: 'Store Activated',
      desc: 'Approved catalog listings are published and the seller store is activated, completing the onboarding workflow.',
      tag: 'End Event',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
  ];

  const bpmnSpecs = [
    { label: 'Multi-Instance Target', value: '=documents (array)' },
    { label: 'Boundary Timer', value: 'PT48H — SLA Escalation' },
    { label: 'Error Code', value: 'VALIDATION_FAILED' },
    { label: 'Child Process', value: 'Process_CatalogReview' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Card */}
      <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
            <RegisterIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              Stage 1 &middot; BPMN Process_SellerOnboarding
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Partner Onboarding Dossier</h1>
            <p className="text-xs text-slate-700 mt-0.5 max-w-2xl leading-relaxed">
              Register commercial seller partners, attach compliance credentials for parallel Multi-Instance review,
              and trigger Camunda 8 Zeebe workflow orchestration.
            </p>
          </div>
        </div>
      </div>

      <Notification message={msg} error={err} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Commercial Entity Details</h2>
              <p className="text-xs text-slate-700">Primary business identification and administrative point of contact.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Business / Brand Name *</label>
                <input name="businessName" value={formData.businessName} onChange={handleInputChange} required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  placeholder="Apex Retail Corp" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Contact Officer Name *</label>
                <input name="contactName" value={formData.contactName} onChange={handleInputChange} required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Corporate Email Address *</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  placeholder="compliance@apexretail.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Telephone / Mobile</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  placeholder="+91 98765 43210" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-800 mb-1">Registered Commercial Address</label>
                <textarea name="businessAddress" value={formData.businessAddress} onChange={handleInputChange} rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  placeholder="704 Tech Park, Whitefield, Bangalore" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <div className="mb-3">
                <h2 className="text-sm font-bold text-slate-900">Compliance &amp; Verification Credentials</h2>
                <p className="text-xs text-slate-700">Each credential generates a concurrent task thread within the Parallel Multi-Instance Sub-Process.</p>
              </div>
              <ArrayItemBuilder
                label="Compliance Document Verification Collection"
                fields={[
                  { key: 'docType', label: 'Document Type', required: true, placeholder: 'e.g. GSTIN Certificate' },
                  { key: 'docNumber', label: 'License / Registration ID', required: true, placeholder: '29ABCDE1234F1Z5' },
                  { key: 'docUrl', label: 'Verification URL / Portal Reference', fullWidth: true, placeholder: 'https://gst.gov.in/verify' },
                ]}
                initialItems={documents}
                presets={documentPresets}
                onChange={setDocuments}
              />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 px-6 py-3 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50">
                <span>{loading ? 'Submitting Application…' : 'Initiate BPMN Seller Onboarding Workflow'}</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: Workflow Process Steps (replaces JSON payload) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Workflow step summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <h2 className="text-sm font-bold text-slate-900">How This Workflow Works</h2>
            </div>
            <div className="space-y-3">
              {workflowSteps.map((step) => (
                <div key={step.num} className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-orange-700">{step.num}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">{step.title}</span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${step.tagColor}`}>{step.tag}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BPMN technical specs — clean table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 mb-3">BPMN Technical Specifications</h2>
            <div className="divide-y divide-slate-100">
              {bpmnSpecs.map((spec, i) => (
                <div key={i} className="py-2 flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-700 font-medium">{spec.label}</span>
                  <span className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded font-mono text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
