import React from 'react';
import { GuideIcon } from '../components/Icons.jsx';

export default function ArchitectureGuide() {
  const feelExpressions = [
    { expr: '=sellerValid = true', location: 'SubProcess_Validation / Gateway', purpose: 'Routes to successful end event when seller business data passes automated validation.' },
    { expr: '=sellerValid = false', location: 'SubProcess_Validation / Gateway', purpose: 'Triggers error end event Error_ValidationFailed to activate boundary event.' },
    { expr: '=sellerApproved = true', location: 'GW_SellerApproved', purpose: 'Proceeds to account creation service task when human ops approves application.' },
    { expr: '=sellerApproved = false', location: 'GW_SellerApproved', purpose: 'Routes token to reject-seller job worker service task.' },
    { expr: '=documents', location: 'SubProcess_DocumentReview (Parallel MI)', purpose: 'Input collection variable representing array of uploaded seller compliance documents.' },
    { expr: '=document', location: 'SubProcess_DocumentReview (Parallel MI)', purpose: 'Current iteration element representing single document passed to review task.' },
    { expr: '=productItems', location: 'SubProcess_ValidateProducts (Seq MI)', purpose: 'Input collection variable representing array of products uploaded for catalog review.' },
    { expr: '=productItem.productId', location: 'Task_ValidateSingleProduct / ioMapping', purpose: 'Input mapping extracting specific product ID for isolated validation worker.' },
    { expr: '=every item in validationResults satisfies item.catalogValid = true', location: 'SubProcess_ValidateProducts (Completion Condition)', purpose: 'FEEL completion condition terminating the sequential loop when all items pass.' },
    { expr: '=count(validationResults[catalogValid = false]) = 0', location: 'GW_CatalogApproved (Gateway)', purpose: 'Approves catalog if zero validation failures exist in results collection.' },
    { expr: '=count(validationResults[catalogValid = false]) > 0', location: 'GW_CatalogApproved (Gateway)', purpose: 'Rejects catalog if at least one validation failure is reported.' },
    { expr: 'PT48H', location: 'BoundaryEvent_ValidationTimer', purpose: 'ISO 8601 duration specifying 48-hour timeout for non-interrupting SLA escalation.' }
  ];

  const constructs = [
    { construct: 'Main BPMN Process', file: 'bpmn-models/seller_onboarding_main.bpmn', desc: 'Process_SellerOnboarding: Root orchestration handling registration, compliance, and child delegation.' },
    { construct: 'Child Call Activity', file: 'bpmn-models/catalog_review_child.bpmn', desc: 'CallActivity_CatalogReview: Modular execution of Process_CatalogReview with defined variable contracts.' },
    { construct: 'Parallel Multi-Instance', file: 'SubProcess_DocumentReview', desc: 'isSequential=false: Concurrently spins up review tasks for all documents in the =documents array.' },
    { construct: 'Sequential Multi-Instance', file: 'SubProcess_ValidateProducts', desc: 'isSequential=true: Step-by-step product validation terminating via FEEL completion condition.' },
    { construct: 'Error Boundary Event', file: 'BoundaryEvent_ValidationError', desc: 'Interrupting error catch event listening for VALIDATION_FAILED ZeebeBpmnError exception.' },
    { construct: 'Timer Boundary Event', file: 'BoundaryEvent_ValidationTimer', desc: 'Non-interrupting timer event firing PT48H delay notification without canceling the review.' },
    { construct: 'Parallel Gateways', file: 'GW_ParallelReview & GW_ParallelJoin', desc: 'Fork-join pattern executing manual listings review and automated price check simultaneously.' },
    { construct: 'Camunda Form', file: 'bpmn-models/catalog_upload_form.form', desc: 'Camunda Forms JSON schema binding sellerNotes and catalogReady to user tasks.' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-slate-100 p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
            <GuideIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/50">
              Technical Specifications &amp; Rubric Compliance
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">BPMN Architecture &amp; FEEL Expression Dictionary</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Comprehensive reference of the implemented BPMN 2.0 constructs, data contracts, and FEEL evaluation rules
              orchestrating the MarketFlow onboarding pipeline across Camunda 8 Zeebe and Spring Boot 3.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory BPMN Constructs Table */}
      <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Mandatory BPMN 2.0 Constructs Implementation</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Construct</th>
                <th className="py-2.5 px-3 font-semibold">Target Location / File</th>
                <th className="py-2.5 px-3 font-semibold">Implementation Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {constructs.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-bold text-orange-700">{c.construct}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-800">{c.file}</td>
                  <td className="py-2.5 px-3 text-slate-600">{c.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FEEL Expressions Dictionary */}
      <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">FEEL Expression Dictionary</h2>
            <p className="text-xs text-slate-400">FEEL expressions used for gateway branching, collection iterations, and completion criteria</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            BPMN FEEL Standard
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3 font-semibold">FEEL Expression</th>
                <th className="py-2.5 px-3 font-semibold">Element / Gateway</th>
                <th className="py-2.5 px-3 font-semibold">Execution Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {feelExpressions.map((f, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-orange-700 bg-orange-50/40">{f.expr}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{f.location}</td>
                  <td className="py-2.5 px-3 text-slate-600">{f.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variable Scoping & Data Contracts */}
      <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Variable Scoping &amp; Isolation Rules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
            <h3 className="font-bold text-slate-900 mb-1">Global Scope</h3>
            <p className="text-slate-500 mb-2">Variables available across the entire instance lifetime:</p>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-orange-700">
              <li>sellerId (Long)</li>
              <li>businessName (String)</li>
              <li>sellerEmail (String)</li>
              <li>sellerStatus (String)</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
            <h3 className="font-bold text-slate-900 mb-1">Sub-Process MI Scope</h3>
            <p className="text-slate-500 mb-2">Isolated per parallel iteration thread:</p>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-emerald-700">
              <li>document (Object)</li>
              <li>reviewResult (Object)</li>
              <li>productItem (Object)</li>
              <li>validationErrors (Array)</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
            <h3 className="font-bold text-slate-900 mb-1">Call Activity Contract</h3>
            <p className="text-slate-500 mb-2">Strict input/output boundary mappings:</p>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-amber-700">
              <li>propagateAll=false</li>
              <li>IN: sellerId, sellerEmail</li>
              <li>OUT: publishedCount</li>
              <li>OUT: catalogApproved</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
