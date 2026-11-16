import React, { useEffect, useState } from 'react';
import { sellersApi, productsApi, tasksApi } from './api/client.js';
import OverviewDashboard from './pages/OverviewDashboard.jsx';
import SellerRegistration from './pages/SellerRegistration.jsx';
import SellerWorkspace from './pages/SellerWorkspace.jsx';
import AdminReview from './pages/AdminReview.jsx';
import MarketplaceCatalog from './pages/MarketplaceCatalog.jsx';
import ArchitectureGuide from './pages/ArchitectureGuide.jsx';
import BpmnDiagram from './pages/BpmnDiagram.jsx';
import TasklistInbox from './components/TasklistInbox.jsx';
import ProcessStatusTracker from './components/ProcessStatusTracker.jsx';
import {
  DashboardIcon,
  RegisterIcon,
  WorkspaceIcon,
  TasklistIcon,
  AdminIcon,
  TrackerIcon,
  CatalogIcon,
  GuideIcon,
  RefreshIcon,
  MenuIcon,
  CloseIcon,
  BpmnIcon
} from './components/Icons.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',       icon: DashboardIcon },
  { id: 'bpmn',     label: 'BPMN Flow',        icon: BpmnIcon      },
  { id: 'register', label: 'Onboarding',       icon: RegisterIcon  },
  { id: 'workspace',label: 'Workspace',        icon: WorkspaceIcon },
  { id: 'tasklist', label: 'Tasklist',         icon: TasklistIcon  },
  { id: 'admin',    label: 'Review Queue',     icon: AdminIcon     },
  { id: 'tracker',  label: 'Process Tracker',  icon: TrackerIcon   },
  { id: 'catalog',  label: 'Catalog',          icon: CatalogIcon   },
  { id: 'guide',    label: 'BPMN Specs',       icon: GuideIcon     },
];

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [approvedProducts, setApprovedProducts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bannerMsg, setBannerMsg] = useState('');

  async function loadAllData() {
    setLoading(true);
    try {
      const [s, p, a, t] = await Promise.all([
        sellersApi.getAll().catch(() => []),
        productsApi.getAll().catch(() => []),
        productsApi.getApproved().catch(() => []),
        tasksApi.getAll().catch(() => [])
      ]);
      setSellers(s); setProducts(p); setApprovedProducts(a); setTasks(t);
    } catch { /* silent */ } finally { setLoading(false); }
  }

  useEffect(() => {
    loadAllData();
    const iv = setInterval(loadAllData, 8000);
    return () => clearInterval(iv);
  }, []);

  async function handleSeedDemoData() {
    setLoading(true);
    setBannerMsg('Loading demo data...');
    try {
      const s1 = await sellersApi.register({
        businessName: 'Starlight Quantum Audio Ltd', contactName: 'Elena Rostova',
        email: 'elena@starlightaudio.com', phone: '+91 98112 34567',
        businessAddress: '404 Cyber City, Phase III, Gurugram, India',
        documents: [
          { docType: 'GSTIN Certificate', docNumber: '06ABCDE1234F1Z5', docUrl: 'https://gst.gov.in/verify' },
          { docType: 'Trade Mark Registry', docNumber: 'TM-2026-STLIGHT', docUrl: 'https://ipindia.gov.in' }
        ]
      });
      await sellersApi.decide(s1.id, 'APPROVE');
      await sellersApi.register({
        businessName: 'Nordic Organic Botanicals AB', contactName: 'Lars Lindqvist',
        email: 'lars@nordicbotanicals.se', phone: '+46 8 123 4567',
        businessAddress: 'Hamngatan 12, Stockholm, Sweden',
        documents: [{ docType: 'EU Organic Certification', docNumber: 'SE-EKO-01', docUrl: 'https://jordbruksverket.se' }]
      });
      const p1 = await productsApi.submit(s1.id, { name: 'Starlight ANC Pro Wireless Headphones', category: 'Audio & Electronics', price: 14999, stockQuantity: 85, sku: 'STA-ANC-01', description: 'Audiophile grade wireless headphones.' });
      await productsApi.decide(p1.id, 'APPROVE');
      const p2 = await productsApi.submit(s1.id, { name: 'HyperBass Earbuds with Spatial Audio', category: 'Audio & Electronics', price: 4499, stockQuantity: 120, sku: 'HYP-TWS-02', description: 'True wireless stereo earbuds.' });
      await productsApi.decide(p2.id, 'APPROVE');
      await productsApi.submit(s1.id, { name: 'Studio Reference Mic MK-II', category: 'Studio Equipment', price: 9999, stockQuantity: 30, sku: 'MIC-REF-03', description: 'Large diaphragm cardioid condenser microphone.' });
      try { await tasksApi.create({ taskType: 'verify-seller-documents', assignee: 'operations-team', entityId: s1.id, entityType: 'SELLER' }); } catch { /* silent */ }
      setBannerMsg('Demo data loaded successfully.');
      await loadAllData();
      setTimeout(() => setBannerMsg(''), 4000);
    } catch (e) {
      setBannerMsg('Failed: ' + e.message);
    } finally { setLoading(false); }
  }

  const pendingTasksCount = tasks.filter(t => t.status === 'PENDING').length;
  const pendingReviewCount = sellers.filter(s => s.status === 'PENDING').length + products.filter(p => p.status === 'PENDING_REVIEW').length;

  const getBadgeCount = (id) => {
    if (id === 'tasklist' && pendingTasksCount > 0) return pendingTasksCount;
    if (id === 'admin' && pendingReviewCount > 0) return pendingReviewCount;
    if (id === 'catalog' && approvedProducts.length > 0) return approvedProducts.length;
    return null;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
            M
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-slate-900 leading-tight">MarketFlow</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Workflow Automation</div>
          </div>
        </div>
      </div>

      {/* Nav items — scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">Navigation</div>
        <nav className="space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = tab === item.id;
            const Icon = item.icon;
            const badge = getBadgeCount(item.id);
            return (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors duration-100 ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {badge !== null && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>{badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer actions */}
      <div className="px-4 py-4 border-t border-slate-200 space-y-2">
        {sellers.length === 0 && (
          <button onClick={handleSeedDemoData} disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50">
            Seed Demo Data
          </button>
        )}
        <button onClick={loadAllData} disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 shadow-xs transition-colors disabled:opacity-50">
          <RefreshIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>{loading ? 'Refreshing…' : 'Sync Telemetry'}</span>
        </button>
        <div className="text-center text-[10px] text-slate-500 pt-1">Camunda 8 &middot; Spring Boot 3</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9FB] flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-slate-200 z-20 shadow-sm">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-sm">M</div>
          <span className="font-bold text-base text-slate-900">MarketFlow</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
          {mobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-40 bg-white flex flex-col overflow-y-auto">
          {sidebarContent}
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {bannerMsg && (
          <div className="max-w-6xl mx-auto px-6 lg:px-8 mt-4 w-full">
            <div className="rounded-lg bg-slate-900 text-white text-xs font-medium px-4 py-2.5 flex items-center justify-between">
              <span>{bannerMsg}</span>
              <button onClick={() => setBannerMsg('')} className="text-slate-400 hover:text-white text-base leading-none ml-4">&times;</button>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-6xl mx-auto px-6 lg:px-8 py-8 w-full">
          {tab === 'dashboard' && <OverviewDashboard sellers={sellers} products={products} tasks={tasks} onNavigate={setTab} onSeedData={handleSeedDemoData} />}
          {tab === 'bpmn'      && <BpmnDiagram />}
          {tab === 'register'  && <SellerRegistration onSuccess={loadAllData} />}
          {tab === 'workspace' && <SellerWorkspace sellers={sellers} products={products} onSuccess={loadAllData} onNavigate={setTab} />}
          {tab === 'tasklist'  && <TasklistInbox onTaskCompleted={loadAllData} />}
          {tab === 'admin'     && <AdminReview sellers={sellers} products={products} onSuccess={loadAllData} />}
          {tab === 'tracker'   && <ProcessStatusTracker />}
          {tab === 'catalog'   && <MarketplaceCatalog approved={approvedProducts} />}
          {tab === 'guide'     && <ArchitectureGuide />}
        </main>

        <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-8 text-xs text-slate-500">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">MarketFlow</span>
              <span>&middot;</span>
              <span>Camunda 8 Zeebe &middot; Spring Boot 3 &middot; React 18</span>
            </div>
            <span>BPMN 2.0 Academic Workflow Evaluation Suite</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
