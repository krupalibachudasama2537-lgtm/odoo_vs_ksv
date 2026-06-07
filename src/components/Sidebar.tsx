import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  Layers, 
  ShieldCheck, 
  ClipboardList, 
  FileSpreadsheet, 
  BarChart3, 
  History,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  userRole,
  onLogout,
  sidebarOpen,
  setSidebarOpen
}) => {
  // Navigation links with visibility checks based on roles
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vendors', label: 'Vendors', icon: Building2 },
    { id: 'rfqs', label: 'RFQs', icon: FileText },
    { id: 'quotations', label: 'Quotations', icon: Layers },
    { id: 'approvals', label: 'Approvals', icon: ShieldCheck },
    { id: 'pos', label: 'Purchase Orders', icon: ClipboardList },
    { id: 'invoices', label: 'Invoices', icon: FileSpreadsheet },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'activity', label: 'Activity Logs', icon: History }
  ];

  const isLinkVisible = (id: string) => {
    if (userRole === 'System Admin') return true;
    
    if (userRole === 'Procurement Officer') {
      return ['dashboard', 'vendors', 'rfqs', 'quotations', 'pos', 'invoices', 'reports'].includes(id);
    }
    
    if (userRole.startsWith('Vendor:')) {
      return ['rfqs', 'quotations', 'pos'].includes(id);
    }
    
    if (userRole === 'Manager / Approver') {
      return ['dashboard', 'approvals', 'reports', 'activity'].includes(id);
    }
    
    return false;
  };

  // Human-readable labels for badges
  const getRoleBadgeColor = () => {
    if (userRole === 'Procurement Officer') return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    if (userRole.startsWith('Vendor:')) return 'bg-pink-100 text-pink-800 border-pink-200';
    if (userRole === 'Manager / Approver') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/50 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      <aside className={`w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col h-screen fixed left-0 top-0 z-40 no-print transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-green-200">
              VB
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800 dark:text-zinc-100 tracking-tight leading-none">VendorBridge</h1>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Enterprise ERP</span>
            </div>
          </div>
          
          {/* Role Badge */}
          <div className={`mt-4 px-2.5 py-1 text-xs font-semibold rounded-full border text-center ${getRoleBadgeColor()}`}>
            {userRole}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {menuItems.map((item) => {
            if (!isLinkVisible(item.id)) return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false); // Auto close mobile drawer on click
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-l-4 border-green-600 shadow-sm' 
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100 border-l-4 border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Section */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-700 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Exit Secure Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
