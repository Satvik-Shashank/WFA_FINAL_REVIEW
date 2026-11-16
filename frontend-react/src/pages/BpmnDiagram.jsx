import React, { useState, useEffect, useRef } from 'react';

const NODES = {
  start:   { x: 60,  y: 220, label: 'Start', type: 'start' },
  register:{ x: 160, y: 220, label: 'Register', type: 'task' },
  submit:  { x: 280, y: 220, label: 'Submit Details\n& Documents', type: 'task' },
  review:  { x: 410, y: 220, label: 'Review\nApplication', type: 'task-ops' },
  gw1:     { x: 530, y: 220, label: 'Details\nValid?', type: 'gateway' },
  reqInfo: { x: 530, y: 340, label: 'Request More\nInfo', type: 'task-ops' },
  verifyDocs:{ x: 650, y: 220, label: 'Verify\nDocuments', type: 'task-ops' },
  gw2:     { x: 770, y: 220, label: 'Seller\nApproved?', type: 'gateway' },
  rejectSeller:{ x: 770, y: 340, label: 'Reject\nSeller', type: 'task-ops' },
  endRejected: { x: 900, y: 340, label: 'Rejected', type: 'end-fail' },
  createAccount:{ x: 900, y: 220, label: 'Create\nAccount', type: 'task-sys' },
  notify:  { x: 1000, y: 150, label: 'Notify\nApproval', type: 'task-sys' },
  uploadCatalog:{ x: 1000, y: 290, label: 'Upload\nCatalog', type: 'task' },
  validateCatalog:{ x: 1120, y: 290, label: 'Validate\nCatalog', type: 'task-sys' },
  gw3:     { x: 1240, y: 290, label: 'Catalog\nValid?', type: 'gateway' },
  showErrors:{ x: 1240, y: 390, label: 'Show\nErrors', type: 'task-sys' },
  correctProduct:{ x: 1120, y: 390, label: 'Correct\nProduct', type: 'task' },
  reviewListings:{ x: 1360, y: 290, label: 'Review\nListings', type: 'task-ops' },
  gw4:     { x: 1480, y: 290, label: 'Catalog\nApproved?', type: 'gateway' },
  reqCorrections:{ x: 1480, y: 390, label: 'Request\nCorrections', type: 'task-ops' },
  publish: { x: 1600, y: 290, label: 'Publish\nProducts', type: 'task-sys' },
  activate:{ x: 1700, y: 290, label: 'Activate\nStore', type: 'task-sys' },
  endSuccess:{ x: 1810, y: 290, label: 'Complete', type: 'end-success' },
};

// (x1,y1) -> (x2,y2) with optional label and path type
const EDGES = [
  { from: 'start', to: 'register', label: '' },
  { from: 'register', to: 'submit', label: '' },
  { from: 'submit', to: 'review', label: '' },
  { from: 'review', to: 'gw1', label: '' },
  { from: 'gw1', to: 'reqInfo', label: 'No', bend: 'down' },
  { from: 'reqInfo', to: 'submit', label: '', bend: 'back' },
  { from: 'gw1', to: 'verifyDocs', label: 'Yes' },
  { from: 'verifyDocs', to: 'gw2', label: '' },
  { from: 'gw2', to: 'rejectSeller', label: 'No', bend: 'down' },
  { from: 'rejectSeller', to: 'endRejected', label: '' },
  { from: 'gw2', to: 'createAccount', label: 'Yes' },
  { from: 'createAccount', to: 'notify', label: '', bend: 'up' },
  { from: 'createAccount', to: 'uploadCatalog', label: '', bend: 'down' },
  { from: 'notify', to: 'uploadCatalog', label: '', bend: 'down' },
  { from: 'uploadCatalog', to: 'validateCatalog', label: '' },
  { from: 'validateCatalog', to: 'gw3', label: '' },
  { from: 'gw3', to: 'showErrors', label: 'No', bend: 'down' },
  { from: 'showErrors', to: 'correctProduct', label: '' },
  { from: 'correctProduct', to: 'validateCatalog', label: '', bend: 'up' },
  { from: 'gw3', to: 'reviewListings', label: 'Yes' },
  { from: 'reviewListings', to: 'gw4', label: '' },
  { from: 'gw4', to: 'reqCorrections', label: 'No', bend: 'down' },
  { from: 'reqCorrections', to: 'reviewListings', label: '', bend: 'back' },
  { from: 'gw4', to: 'publish', label: 'Yes' },
  { from: 'publish', to: 'activate', label: '' },
  { from: 'activate', to: 'endSuccess', label: '' },
];

const NODE_W = 90;
const NODE_H = 44;
const GW_SIZE = 36;

function nodeCenter(id) {
  const n = NODES[id];
  return { x: n.x + NODE_W / 2, y: n.y + NODE_H / 2 };
}

function NodeShape({ id, node, active, completed, failed }) {
  const isGateway = node.type === 'gateway';
  const isStart = node.type === 'start';
  const isEndSuccess = node.type === 'end-success';
  const isEndFail = node.type === 'end-fail';
  const isEnd = isEndSuccess || isEndFail;

  const bg = failed ? '#FEF2F2' : active ? '#FFF7ED' :
    completed ? '#F0FDF4' :
    node.type === 'task-ops' ? '#F8FAFC' :
    node.type === 'task-sys' ? '#FAFAF8' : '#FFFFFF';

  const borderColor = failed ? '#FCA5A5' : active ? '#FB923C' :
    completed ? '#86EFAC' :
    node.type === 'task-ops' ? '#CBD5E1' :
    node.type === 'task-sys' ? '#D1D5DB' : '#D1D5DB';

  const textColor = failed ? '#B91C1C' : active ? '#C2410C' :
    completed ? '#15803D' : '#1E293B';

  if (isStart) {
    return (
      <g>
        <circle cx={node.x + NODE_W / 2} cy={node.y + NODE_H / 2} r={18}
          fill={active ? '#FFF7ED' : '#FFF'} stroke={active ? '#F97316' : '#94A3B8'} strokeWidth="2.5" />
        <circle cx={node.x + NODE_W / 2} cy={node.y + NODE_H / 2} r={6} fill={active ? '#F97316' : '#94A3B8'} />
        <text x={node.x + NODE_W / 2} y={node.y + NODE_H / 2 + 28} textAnchor="middle" fontSize="9" fill="#475569" fontWeight="600">{node.label}</text>
      </g>
    );
  }

  if (isEndSuccess) {
    return (
      <g>
        <circle cx={node.x + 22} cy={node.y + 22} r={18} fill="#F0FDF4" stroke="#16A34A" strokeWidth="3.5" />
        <circle cx={node.x + 22} cy={node.y + 22} r={12} fill="#16A34A" />
        <text x={node.x + 22} y={node.y + 22 + 28} textAnchor="middle" fontSize="9" fill="#15803D" fontWeight="600">{node.label}</text>
      </g>
    );
  }

  if (isEndFail) {
    return (
      <g>
        <circle cx={node.x + 22} cy={node.y + 22} r={18} fill="#FEF2F2" stroke="#DC2626" strokeWidth="3.5" />
        <circle cx={node.x + 22} cy={node.y + 22} r={12} fill="#DC2626" />
        <text x={node.x + 22} y={node.y + 22 + 28} textAnchor="middle" fontSize="9" fill="#B91C1C" fontWeight="600">{node.label}</text>
      </g>
    );
  }

  if (isGateway) {
    const cx = node.x + GW_SIZE;
    const cy = node.y + GW_SIZE / 2 + 4;
    const s = 22;
    const pts = `${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`;
    const fill = failed ? '#FEF2F2' : active ? '#FFF7ED' : completed ? '#F0FDF4' : '#FFFBEB';
    const stroke = failed ? '#FCA5A5' : active ? '#F97316' : completed ? '#86EFAC' : '#FCD34D';
    const tColor = failed ? '#B91C1C' : active ? '#C2410C' : completed ? '#15803D' : '#78350F';
    const lines = node.label.split('\n');
    return (
      <g>
        <polygon points={pts} fill={fill} stroke={stroke} strokeWidth="2" />
        {lines.map((l, i) => (
          <text key={i} x={cx} y={cy + (i - (lines.length - 1) / 2) * 11} textAnchor="middle" fontSize="9" fill={tColor} fontWeight="600">{l}</text>
        ))}
      </g>
    );
  }

  const lines = node.label.split('\n');
  const taskTypeColor =
    node.type === 'task-ops' ? { header: '#F1F5F9', headerText: '#475569' } :
    node.type === 'task-sys' ? { header: '#F5F5F4', headerText: '#57534E' } :
    { header: '#FFF7ED', headerText: '#9A3412' };

  return (
    <g>
      <rect x={node.x} y={node.y} width={NODE_W} height={NODE_H} rx="7"
        fill={bg} stroke={borderColor} strokeWidth={active ? 2 : 1.5}
        filter={active ? 'drop-shadow(0 0 6px #FB923C88)' : 'none'} />
      {/* Top lane indicator */}
      <rect x={node.x} y={node.y} width={NODE_W} height={10} rx="7" fill={taskTypeColor.header} />
      <rect x={node.x} y={node.y + 5} width={NODE_W} height={5} fill={taskTypeColor.header} />
      <text x={node.x + 4} y={node.y + 8.5} fontSize="6.5" fill={taskTypeColor.headerText} fontWeight="700">
        {node.type === 'task-ops' ? 'OPS' : node.type === 'task-sys' ? 'SYS' : 'SELLER'}
      </text>
      {lines.map((l, i) => (
        <text key={i} x={node.x + NODE_W / 2} y={node.y + 20 + i * 12} textAnchor="middle" fontSize="9.5" fill={textColor} fontWeight="600">{l}</text>
      ))}
    </g>
  );
}

function EdgePath({ from, to, bend, label, highlight, dashed }) {
  const nf = NODES[from];
  const nt = NODES[to];

  const fIsGW = nf.type === 'gateway';
  const tIsGW = nt.type === 'gateway';

  let fx = nf.x + (fIsGW ? GW_SIZE * 2 : NODE_W);
  let fy = nf.y + (fIsGW ? GW_SIZE / 2 + 4 : NODE_H / 2);
  let tx = nt.x + (tIsGW ? 0 : 0);
  let ty = nt.y + (tIsGW ? GW_SIZE / 2 + 4 : NODE_H / 2);

  let d;
  if (bend === 'down') {
    // from gateway downward
    fx = nf.x + (fIsGW ? GW_SIZE : NODE_W / 2);
    fy = nf.y + (fIsGW ? GW_SIZE * 2 : NODE_H);
    tx = nt.x + NODE_W / 2;
    ty = nt.y;
    const mx = (fx + tx) / 2;
    const my = (fy + ty) / 2;
    d = `M ${fx} ${fy} L ${fx} ${my} L ${tx} ${my} L ${tx} ${ty}`;
  } else if (bend === 'up') {
    fy = nf.y;
    ty = nt.y + NODE_H;
    const mx = (fx + tx) / 2;
    d = `M ${fx} ${fy} L ${fx} ${fy - 20} L ${tx} ${fy - 20} L ${tx} ${ty}`;
  } else if (bend === 'back') {
    // loop back left
    tx = nt.x + NODE_W;
    d = `M ${fx} ${fy} C ${fx + 30} ${fy} ${tx + 30} ${ty} ${tx} ${ty}`;
  } else {
    d = `M ${fx} ${fy} L ${tx} ${ty}`;
  }

  const stroke = highlight ? '#F97316' : dashed ? '#FCA5A5' : '#94A3B8';
  const strokeWidth = highlight ? 2.5 : 1.5;

  // midpoint for label
  const midX = (fx + tx) / 2;
  const midY = (fy + ty) / 2;

  return (
    <g>
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '6,4' : 'none'}
        markerEnd={`url(#arrow-${highlight ? 'orange' : dashed ? 'red' : 'grey'})`} />
      {label && (
        <text x={midX} y={midY - 5} textAnchor="middle" fontSize="9" fill={stroke} fontWeight="700">{label}</text>
      )}
    </g>
  );
}

export default function BpmnDiagramPage() {
  const [activePathIndex, setActivePathIndex] = useState(0);
  const [animStep, setAnimStep] = useState(0);

  const paths = [
    {
      name: 'Success Path',
      desc: 'Seller registers → documents verified → approved → catalog validated → store activated',
      color: 'text-emerald-700',
      tagColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      nodes: ['start','register','submit','review','gw1','verifyDocs','gw2','createAccount','notify','uploadCatalog','validateCatalog','gw3','reviewListings','gw4','publish','activate','endSuccess'],
      highlightEdges: [
        ['start','register'],['register','submit'],['submit','review'],['review','gw1'],
        ['gw1','verifyDocs'],['verifyDocs','gw2'],['gw2','createAccount'],
        ['createAccount','uploadCatalog'],['uploadCatalog','validateCatalog'],
        ['validateCatalog','gw3'],['gw3','reviewListings'],['reviewListings','gw4'],
        ['gw4','publish'],['publish','activate'],['activate','endSuccess']
      ]
    },
    {
      name: 'Seller Rejection Path',
      desc: 'Seller details verified → approval denied → application rejected and closed',
      color: 'text-rose-700',
      tagColor: 'bg-rose-50 border-rose-200 text-rose-700',
      nodes: ['start','register','submit','review','gw1','verifyDocs','gw2','rejectSeller','endRejected'],
      highlightEdges: [
        ['start','register'],['register','submit'],['submit','review'],['review','gw1'],
        ['gw1','verifyDocs'],['verifyDocs','gw2'],['gw2','rejectSeller'],['rejectSeller','endRejected']
      ]
    },
    {
      name: 'Info Request Loop',
      desc: 'Application reviewed → details incomplete → ops requests more info → seller resubmits',
      color: 'text-amber-700',
      tagColor: 'bg-amber-50 border-amber-200 text-amber-700',
      nodes: ['start','register','submit','review','gw1','reqInfo','submit'],
      highlightEdges: [
        ['start','register'],['register','submit'],['submit','review'],['review','gw1'],
        ['gw1','reqInfo'],['reqInfo','submit']
      ]
    },
    {
      name: 'Catalog Correction Loop',
      desc: 'Catalog uploaded → auto-validation fails → errors shown → seller corrects and resubmits',
      color: 'text-orange-700',
      tagColor: 'bg-orange-50 border-orange-200 text-orange-700',
      nodes: ['uploadCatalog','validateCatalog','gw3','showErrors','correctProduct','validateCatalog'],
      highlightEdges: [
        ['uploadCatalog','validateCatalog'],['validateCatalog','gw3'],
        ['gw3','showErrors'],['showErrors','correctProduct'],['correctProduct','validateCatalog']
      ]
    }
  ];

  const activePath = paths[activePathIndex];

  useEffect(() => {
    setAnimStep(0);
    const pathNodes = activePath.nodes;
    if (pathNodes.length === 0) return;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= pathNodes.length) {
        clearInterval(interval);
        setAnimStep(pathNodes.length);
        return;
      }
      setAnimStep(step);
    }, 650);
    return () => clearInterval(interval);
  }, [activePathIndex]);

  const isEdgeHighlighted = (fromId, toId) => {
    if (animStep === 0) return false;
    const visitedNodes = new Set(activePath.nodes.slice(0, animStep + 1));
    return activePath.highlightEdges.some(([f, t]) => f === fromId && t === toId && visitedNodes.has(f) && visitedNodes.has(t));
  };

  const isNodeActive = (id) => activePath.nodes[animStep] === id;
  const isNodeCompleted = (id) => {
    const idx = activePath.nodes.indexOf(id);
    return idx !== -1 && idx < animStep;
  };
  const isNodeFailed = (id) => {
    return (activePathIndex === 1 && animStep >= activePath.nodes.length && id === 'endRejected');
  };

  const SVG_W = 1870;
  const SVG_H = 480;

  const laneLabels = [
    { label: 'Seller', y: 160, height: 100 },
    { label: 'Ops Team', y: 160, height: 100 },
    { label: 'System', y: 160, height: 100 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              Interactive BPMN 2.0 Diagram
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Seller Onboarding Process Flow</h1>
            <p className="text-xs text-slate-700 mt-0.5 max-w-2xl">
              Animated walkthrough of all decision paths — from successful onboarding to rejection and correction loops.
              Select a path below to watch the token travel through the process.
            </p>
          </div>
        </div>

        {/* Path Selector */}
        <div className="mt-5 flex flex-wrap gap-3">
          {paths.map((path, i) => (
            <button
              key={i}
              onClick={() => setActivePathIndex(i)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                activePathIndex === i
                  ? `${path.tagColor} ring-2 ring-offset-1 ring-orange-300`
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {path.name}
            </button>
          ))}
        </div>

        {/* Active path description */}
        <div className="mt-3 px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-xs text-slate-800 font-medium">{activePath.desc}</p>
        </div>
      </div>

      {/* SVG Diagram */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: '900px' }}>
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: 'block' }}>
              <defs>
                {['orange','grey','red'].map(c => (
                  <marker key={c} id={`arrow-${c}`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill={c === 'orange' ? '#F97316' : c === 'red' ? '#FCA5A5' : '#94A3B8'} />
                  </marker>
                ))}
              </defs>

              {/* Lane bands */}
              <rect x={0} y={120} width={SVG_W} height={110} fill="#FAFAFA" stroke="#E2E8F0" strokeWidth="1" />
              <rect x={0} y={230} width={SVG_W} height={100} fill="#FFF" stroke="#E2E8F0" strokeWidth="1" />
              <rect x={0} y={330} width={SVG_W} height={110} fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />

              {/* Lane labels */}
              <text x={8} y={175} fontSize="10" fill="#94A3B8" fontWeight="700" transform="rotate(-90, 8, 175)">SELLER</text>
              <text x={8} y={280} fontSize="10" fill="#94A3B8" fontWeight="700" transform="rotate(-90, 8, 280)">OPS</text>
              <text x={8} y={380} fontSize="10" fill="#94A3B8" fontWeight="700" transform="rotate(-90, 8, 380)">SYSTEM</text>

              {/* Edges first (behind nodes) */}
              {EDGES.map(({ from, to, bend, label }) => {
                const hl = isEdgeHighlighted(from, to);
                const isDashed = (from === 'gw2' && to === 'rejectSeller') || (from === 'rejectSeller' && to === 'endRejected');
                return (
                  <EdgePath key={`${from}-${to}`} from={from} to={to} bend={bend} label={label}
                    highlight={hl} dashed={isDashed && !hl} />
                );
              })}

              {/* Nodes */}
              {Object.entries(NODES).map(([id, node]) => (
                <NodeShape key={id} id={id} node={node}
                  active={isNodeActive(id)}
                  completed={isNodeCompleted(id)}
                  failed={isNodeFailed(id)} />
              ))}
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="border-t border-slate-100 px-6 py-3 flex flex-wrap items-center gap-6 bg-slate-50/50">
          {[
            { color: 'bg-orange-100 border-orange-300', label: 'Active Node' },
            { color: 'bg-emerald-50 border-emerald-200', label: 'Completed' },
            { color: 'bg-rose-50 border-rose-200', label: 'Rejected / Failed' },
            { color: 'bg-slate-50 border-slate-200', label: 'Not Yet Reached' },
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`w-5 h-3 rounded border ${l.color} inline-block`}></span>
              <span className="text-[10px] font-semibold text-slate-600">{l.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <svg width="30" height="8"><line x1="0" y1="4" x2="30" y2="4" stroke="#F97316" strokeWidth="2.5" markerEnd="url(#arrow-orange-leg)" /></svg>
            <span className="text-[10px] font-semibold text-slate-600">Active Path</span>
          </div>
          <div className="ml-auto text-[10px] font-medium text-slate-500">
            Step {Math.min(animStep + 1, activePath.nodes.length)} of {activePath.nodes.length}
            &nbsp;&middot;&nbsp;
            <button
              onClick={() => setActivePathIndex(activePathIndex)}
              className="underline text-orange-600 hover:text-orange-700"
            >Replay</button>
          </div>
        </div>
      </div>

      {/* Process Steps Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Workflow Path Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-2 px-3 font-semibold text-slate-700">Path</th>
                <th className="py-2 px-3 font-semibold text-slate-700">Outcome</th>
                <th className="py-2 px-3 font-semibold text-slate-700">Key Decision</th>
                <th className="py-2 px-3 font-semibold text-slate-700">FEEL Expression</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 font-semibold text-emerald-700">Success Path</td>
                <td className="py-2.5 px-3 text-slate-800">Store Activated</td>
                <td className="py-2.5 px-3 text-slate-700">Seller & Catalog Approved</td>
                <td className="py-2.5 px-3 font-mono text-orange-700 text-[10px]">=sellerApproved = true &amp;&amp; catalogValid = true</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 font-semibold text-rose-700">Seller Rejection</td>
                <td className="py-2.5 px-3 text-slate-800">Application Rejected</td>
                <td className="py-2.5 px-3 text-slate-700">Ops rejects seller</td>
                <td className="py-2.5 px-3 font-mono text-orange-700 text-[10px]">=sellerApproved = false</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 font-semibold text-amber-700">Info Request Loop</td>
                <td className="py-2.5 px-3 text-slate-800">Resubmit Details</td>
                <td className="py-2.5 px-3 text-slate-700">Details incomplete</td>
                <td className="py-2.5 px-3 font-mono text-orange-700 text-[10px]">=detailsValid = false</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 font-semibold text-orange-700">Catalog Correction</td>
                <td className="py-2.5 px-3 text-slate-800">Resubmit Catalog</td>
                <td className="py-2.5 px-3 text-slate-700">Auto-validation fails</td>
                <td className="py-2.5 px-3 font-mono text-orange-700 text-[10px]">=catalogValid = false</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
