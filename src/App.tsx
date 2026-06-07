import React, { useState } from 'react';
import { 
  INITIAL_VENDORS,
  INITIAL_RFQS,
  INITIAL_QUOTATIONS,
  INITIAL_POS,
  INITIAL_INVOICES,
  INITIAL_ACTIVITY_LOGS
} from './mockData';
import type {
  Vendor,
  Rfq,
  Quotation,
  PurchaseOrder,
  Invoice,
  ActivityLog
} from './mockData';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { VendorsView } from './components/VendorsView';
import { RfqsView } from './components/RfqsView';
import { QuotationsView } from './components/QuotationsView';
import { ApprovalsView } from './components/ApprovalsView';
import { PurchaseOrdersView } from './components/PurchaseOrdersView';
import { InvoicesView } from './components/InvoicesView';
import { ReportsView } from './components/ReportsView';
import { ActivityLogsView } from './components/ActivityLogsView';
import { Lock, UserCheck } from 'lucide-react';
import { CursorCanvas } from './components/CursorCanvas';

export default function App() {
  // Application Data States
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [rfqs, setRfqs] = useState<Rfq[]>(INITIAL_RFQS);
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [pos, setPOs] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  // Authentication Context States
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string>('System Admin');
  const [isLoginView, setIsLoginView] = useState(true);

  // Dark Mode state & synchronization
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Active Layout Section state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Selected sub-items overlay caches
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedRFQ, setSelectedRFQ] = useState<Rfq | null>(null);
  const [bidRfqId, setBidRfqId] = useState<string | null>(null);

  // Visual decision flash signals
  const [flashColor, setFlashColor] = useState<string | null>(null);

  // Registration states
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('');
  const [regRole, setRegRole] = useState('Procurement Officer');
  const [regInfo, setRegInfo] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Dynamic Users Database (stored in localStorage)
  const [users, setUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : []; // Starts empty!
  });

  // Auth logins selection mapping
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetKey = loginUsername.toLowerCase().trim();
    
    const userProfile = users.find(
      u => u.email.toLowerCase() === targetKey || u.username.toLowerCase() === targetKey
    );
    
    // Authenticate with password entered at registration
    if (userProfile && userProfile.password === loginPassword) {
      setCurrentUser(userProfile);
      setUserRole(userProfile.role);
      
      // Auto routing based on portal filters
      if (userProfile.role.startsWith('Vendor:')) {
        setActiveTab('rfqs');
      } else if (userProfile.role === 'Manager / Approver') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('dashboard');
      }

      // Log login event
      const logMsg = `User '${userProfile.firstName} ${userProfile.lastName}' authenticated into ${userProfile.role} portal.`;
      const newLog: ActivityLog = {
        id: `act_${Date.now()}`,
        action: logMsg,
        module: 'System',
        userId: `${userProfile.firstName} ${userProfile.lastName}`,
        timestamp: new Date().toISOString()
      };
      setActivities(prev => [newLog, ...prev]);
    } else {
      alert('Authentication failure: invalid login credentials. Use the Username and Access Key Password you registered with.');
    }
  };

  // Register Profile handler
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Numeric validity constraints
    const numericRegex = /^[0-9]{10}$/;
    if (!numericRegex.test(regPhone)) {
      alert('Registration failure: Phone number must be exactly 10 numeric digits.');
      return;
    }

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      alert('Registration failure: Invalid email address syntax.');
      return;
    }

    if (!regPassword) {
      alert('Registration failure: Access Key Password is required.');
      return;
    }

    const newUser = {
      username: regEmail.split('@')[0],
      firstName: regFirstName,
      lastName: regLastName,
      email: regEmail,
      phone: regPhone,
      role: regRole,
      country: regCountry,
      info: regInfo,
      password: regPassword
    };

    // Update users database
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // If they registered as a Vendor, dynamically inject them into the Vendors directory
    if (regRole.startsWith('Vendor:')) {
      const vendorName = regRole.replace('Vendor: ', '');
      const vendorId = vendorName.toLowerCase().split(' ')[0];
      
      const vendorExists = vendors.some(v => v.id === vendorId);
      if (!vendorExists) {
        const newVendorEntry = {
          id: vendorId,
          name: vendorName,
          contactPerson: `${regFirstName} ${regLastName}`,
          email: regEmail,
          phone: regPhone,
          country: regCountry,
          gstNumber: '27GSTIN' + Math.floor(1000 + Math.random() * 9000) + 'A1Z1',
          status: 'Verified' as const,
          category: 'General Supplies',
          rating: 5.0,
          onboardingDate: new Date().toISOString().split('T')[0],
          spend: 0,
          activeRfqs: 0,
          deliveryRate: 100,
          qualityScore: 100
        };
        setVendors(prev => [...prev, newVendorEntry]);
      }
    }

    alert(`Registration successful for ${regFirstName} ${regLastName} as a ${regRole}! Log in using your email/username and Access Key Password.`);
    setIsLoginView(true);

    // Clear Form
    setRegFirstName('');
    setRegLastName('');
    setRegEmail('');
    setRegPhone('');
    setRegCountry('');
    setRegRole('Procurement Officer');
    setRegInfo('');
    setRegPassword('');
  };

  // Approval flow State Machine transitions
  const handleApproveBid = (quoteId: string, remarks: string) => {
    const targetQuote = quotations.find(q => q.id === quoteId);
    if (!targetQuote) return;

    // Trigger visual screen flash color (glowing green/cyan)
    setFlashColor('bg-green-500/30 ring-green-600');
    setTimeout(() => setFlashColor(null), 1000);

    // 1. Set quotation to Approved, set others for same RFQ to Rejected
    setQuotations(prev => prev.map(q => {
      if (q.rfqId === targetQuote.rfqId) {
        return q.id === quoteId ? { ...q, status: 'Approved' } : { ...q, status: 'Rejected' };
      }
      return q;
    }));

    // 2. Set RFQ status to Closed
    setRfqs(prev => prev.map(r => {
      if (r.id === targetQuote.rfqId) {
        return { ...r, status: 'Closed' };
      }
      return r;
    }));

    // 3. Generate PO sequential number string (e.g. #PO-2026-002)
    const poCount = pos.length + 1;
    const poNumber = `#PO-2026-${String(poCount).padStart(3, '0')}`;
    
    // Secure token generation segment
    const hexSeg = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
    const trackingToken = `TOK-${hexSeg()}-${hexSeg()}-${hexSeg()}`;

    // Replicate rfq title
    const rfqObj = rfqs.find(r => r.id === targetQuote.rfqId);

    const newPO: PurchaseOrder = {
      id: `po_${Date.now()}`,
      poNumber,
      rfqId: targetQuote.rfqId,
      rfqTitle: rfqObj ? rfqObj.title : 'Quantum Mainframe Sourcing Unit',
      quotationId: targetQuote.id,
      vendorId: targetQuote.vendorId,
      vendorName: targetQuote.vendorName,
      amount: targetQuote.totalAmount,
      currency: targetQuote.currency,
      deliveryDays: targetQuote.deliveryDays,
      createdAt: new Date().toISOString(),
      status: 'Issued',
      trackingToken,
      remarks,
      items: targetQuote.itemsBids.map(item => ({
        productName: item.productName,
        quantity: item.qtyAvailable,
        unit: 'Units',
        price: item.unitPrice
      }))
    };

    setPOs(prev => [...prev, newPO]);

    // 4. Generate matching Invoice sheet
    const subtotal = targetQuote.totalAmount;
    const gstAmount = parseFloat((subtotal * 0.18).toFixed(2));
    const grandTotal = parseFloat((subtotal + gstAmount).toFixed(2));
    const invoiceNumber = `INV-2026-${String(invoices.length + 1).padStart(4, '0')}`;

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber,
      poNumber: newPO.poNumber,
      vendorId: targetQuote.vendorId,
      vendorName: targetQuote.vendorName,
      rfqTitle: newPO.rfqTitle,
      subtotal,
      gstAmount,
      grandTotal,
      currency: targetQuote.currency,
      status: 'Unpaid',
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Log event
    const auditMsg = `Approved Quote proposal ${targetQuote.id} from '${targetQuote.vendorName}'. Issued order ${poNumber} and billing invoice ${invoiceNumber}.`;
    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      action: auditMsg,
      module: 'Approval',
      userId: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Manager (Marcus Vance)',
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newLog, ...prev]);
  };

  const handleRejectBid = (quoteId: string, remarks: string) => {
    const targetQuote = quotations.find(q => q.id === quoteId);
    if (!targetQuote) return;

    // Trigger visual screen flash color (glowing crimson/red)
    setFlashColor('bg-rose-500/30 ring-rose-600');
    setTimeout(() => setFlashColor(null), 1000);

    setQuotations(prev => prev.map(q => {
      if (q.id === quoteId) {
        return { ...q, status: 'Rejected' };
      }
      return q;
    }));

    // Log event
    const auditMsg = `Rejected Quote proposal ${quoteId} from '${targetQuote.vendorName}'. remarks: ${remarks}`;
    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      action: auditMsg,
      module: 'Approval',
      userId: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Manager (Marcus Vance)',
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newLog, ...prev]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSearchQuery('');
  };

  // Jump triggers helper
  const handleSelectPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setActiveTab('pos');
  };

  const handleSelectRFQ = (rfq: Rfq) => {
    setSelectedRFQ(rfq);
    setActiveTab('rfqs');
  };

  const handleOpenBidForm = (rfqId: string) => {
    setBidRfqId(rfqId);
    setActiveTab('quotations');
  };

  // Render view dispatcher
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            vendors={vendors}
            rfqs={rfqs}
            quotations={quotations}
            pos={pos}
            setActiveTab={setActiveTab}
            onSelectPO={handleSelectPO}
            onSelectRFQ={handleSelectRFQ}
          />
        );
      case 'vendors':
        return (
          <VendorsView
            vendors={vendors}
            setVendors={setVendors}
            onAddLog={(action, mod) => {
              const newLog: ActivityLog = {
                id: `act_${Date.now()}`,
                action,
                module: mod,
                userId: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System Admin',
                timestamp: new Date().toISOString()
              };
              setActivities(prev => [newLog, ...prev]);
            }}
          />
        );
      case 'rfqs':
        return (
          <RfqsView
            rfqs={rfqs}
            setRfqs={setRfqs}
            vendors={vendors}
            userRole={userRole}
            onSelectRFQ={setSelectedRFQ}
            selectedRFQ={selectedRFQ}
            setSelectedRFQ={setSelectedRFQ}
            onAddLog={(action, mod) => {
              const newLog: ActivityLog = {
                id: `act_${Date.now()}`,
                action,
                module: mod,
                userId: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System Admin',
                timestamp: new Date().toISOString()
              };
              setActivities(prev => [newLog, ...prev]);
            }}
            onOpenBidForm={handleOpenBidForm}
          />
        );
      case 'quotations':
        return (
          <QuotationsView
            quotations={quotations}
            setQuotations={setQuotations}
            rfqs={rfqs}
            setRfqs={setRfqs}
            userRole={userRole}
            onAddLog={(action, mod) => {
              const newLog: ActivityLog = {
                id: `act_${Date.now()}`,
                action,
                module: mod,
                userId: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System Admin',
                timestamp: new Date().toISOString()
              };
              setActivities(prev => [newLog, ...prev]);
            }}
            bidRfqId={bidRfqId}
            setBidRfqId={setBidRfqId}
          />
        );
      case 'approvals':
        return (
          <ApprovalsView
            quotations={quotations}
            rfqs={rfqs}
            onApproveBid={handleApproveBid}
            onRejectBid={handleRejectBid}
            userRole={userRole}
          />
        );
      case 'pos':
        return (
          <PurchaseOrdersView
            pos={pos}
            selectedPO={selectedPO}
            setSelectedPO={setSelectedPO}
            userRole={userRole}
          />
        );
      case 'invoices':
        return (
          <InvoicesView
            invoices={invoices}
            setInvoices={setInvoices}
            pos={pos}
            userRole={userRole}
            onAddLog={(action, mod) => {
              const newLog: ActivityLog = {
                id: `act_${Date.now()}`,
                action,
                module: mod,
                userId: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System Admin',
                timestamp: new Date().toISOString()
              };
              setActivities(prev => [newLog, ...prev]);
            }}
          />
        );
      case 'reports':
        return <ReportsView pos={pos} vendors={vendors} />;
      case 'activity':
        return <ActivityLogsView activities={activities} />;
      default:
        return <DashboardView vendors={vendors} rfqs={rfqs} quotations={quotations} pos={pos} setActiveTab={setActiveTab} onSelectPO={handleSelectPO} onSelectRFQ={handleSelectRFQ} />;
    }
  };

  // Non-logged in layout shell (centered login/register desks)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans transition-colors duration-200">
        <CursorCanvas />
        {/* Decorative Grid Mesh Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 dark:opacity-20 z-0"></div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
          <div className="flex justify-center">
            {/* Center top uppercase circular avatar placeholder */}
            <div className="h-16 w-16 bg-white dark:bg-zinc-900 border-2 border-green-600 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-lg shadow-lg shadow-green-100 dark:shadow-none ring-4 ring-green-50 dark:ring-green-950/40">
              VB
            </div>
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-100">
            VendorBridge ERP Portal
          </h2>
          <p className="mt-1 text-center text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            Access secure network node
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10 relative animate-float-sway">
          <div className="bg-white dark:bg-zinc-900 py-8 px-4 border border-slate-200 dark:border-zinc-800 shadow-xl dark:shadow-none rounded-2xl sm:px-10 animate-popup">
            
            {/* Tab Toggles */}
            <div className="flex border-b border-slate-200 pb-px mb-6">
              <button
                onClick={() => setIsLoginView(true)}
                className={`flex-1 text-center pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                  isLoginView 
                    ? 'border-green-600 text-green-600 font-bold' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Login Desk
              </button>
              <button
                onClick={() => setIsLoginView(false)}
                className={`flex-1 text-center pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                  !isLoginView 
                    ? 'border-green-600 text-green-600 font-bold' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Registration Desk
              </button>
            </div>

            {/* LOGIN WINDOW */}
            {isLoginView ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold animate-popup">
                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase tracking-wide text-[10px]">Username / Email Address *</label>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 focus:outline-none focus:border-green-500 text-xs font-bold"
                    placeholder="e.g. officer, manager, admin, or email"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase tracking-wide text-[10px]">Access Key Password *</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 focus:outline-none focus:border-green-500 text-xs"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-1.5 shadow-md shadow-green-100 hover:shadow-lg transition-all"
                >
                  <Lock className="h-4 w-4" />
                  <span>Initialize Secure Session</span>
                </button>
              </form>
            ) : (
              /* REGISTRATION WINDOW */
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-semibold animate-popup">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500 block">First Name *</label>
                    <input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 text-xs"
                      placeholder="e.g. Sarah"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 block">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 text-xs"
                      placeholder="e.g. Apex"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500 block">Email Address (Valid Format) *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 text-xs"
                      placeholder="contact@apexsupplies.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 block">Phone Number (10 Digits) *</label>
                    <input
                      type="text"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 text-xs"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500 block">Country Node *</label>
                    <input
                      type="text"
                      required
                      value={regCountry}
                      onChange={(e) => setRegCountry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 text-xs"
                      placeholder="United States"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 block">System Role Drodown *</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 text-xs font-semibold"
                    >
                      <option value="Procurement Officer">Procurement Officer</option>
                      <option value="Vendor: Apex Supplies">Vendor: Apex Supplies</option>
                      <option value="Vendor: Nexus Industrial">Vendor: Nexus Industrial</option>
                      <option value="Vendor: Vertex Logistics">Vendor: Vertex Logistics</option>
                      <option value="Manager / Approver">Manager / Approver</option>
                      <option value="System Admin">System Admin</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block">Access Key Password *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 text-xs"
                    placeholder="Enter Access Key Password"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block">Additional Information...</label>
                  <textarea
                    rows={2}
                    value={regInfo}
                    onChange={(e) => setRegInfo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 text-xs font-medium"
                    placeholder="Enter security clearance information or catalog tags..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-1.5 shadow-md shadow-green-100 hover:shadow-lg transition-all"
                >
                  <UserCheck className="h-4.5 w-4.5" />
                  <span>Register Secured Profile</span>
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    );
  }

  // Active secure dashboard view layout shell
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex font-sans antialiased relative transition-colors duration-200">
      <CursorCanvas />
      
      {/* Dynamic decision flash notification layout */}
      {flashColor && (
        <div className={`fixed inset-0 z-50 pointer-events-none ring-8 ring-inset transition-opacity duration-300 animate-pulse ${flashColor}`}>
          <div className="absolute inset-0 bg-white/20"></div>
        </div>
      )}

      {/* LEFT SIDEBAR navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Clear sub-states
          setSelectedPO(null);
          setSelectedRFQ(null);
          setBidRfqId(null);
        }} 
        userRole={userRole} 
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main View Area */}
      <div className="flex-1 min-w-0">
        
        {/* Top Header bar */}
        <TopBar
          userRole={userRole}
          currentUser={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          setSidebarOpen={setSidebarOpen}
          activities={activities}
        />

        {/* Dynamic viewport pages content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full lg:w-[calc(100%-16rem)] lg:ml-64 min-h-[calc(100vh-4rem)] transition-all duration-200">
          {renderTabContent()}
        </main>
      </div>

    </div>
  );
}
