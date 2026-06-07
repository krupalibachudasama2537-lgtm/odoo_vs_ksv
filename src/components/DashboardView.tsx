import React from 'react';
import { 
  Building2, 
  FileText, 
  ShieldAlert, 
  FileCheck, 
  BadgeDollarSign, 
  PiggyBank, 
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import type { Vendor, Rfq, Quotation, PurchaseOrder } from '../mockData';

interface DashboardViewProps {
  vendors: Vendor[];
  rfqs: Rfq[];
  quotations: Quotation[];
  pos: PurchaseOrder[];
  setActiveTab: (tab: string) => void;
  onSelectPO: (po: PurchaseOrder) => void;
  onSelectRFQ: (rfq: Rfq) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vendors,
  rfqs,
  quotations,
  pos,
  setActiveTab,
  onSelectPO,
  onSelectRFQ
}) => {
  // Calculations
  const activeRfqs = rfqs.filter(r => r.status === 'Open' || r.status === 'Quotations Received').length;
  const pendingApprovals = quotations.filter(q => q.status === 'Pending').length;
  const totalVendors = vendors.length;
  const activePOs = pos.length;
  const totalSpend = pos.reduce((sum, po) => sum + po.amount, 0);
  const savingsAmount = pos.reduce((sum, po) => sum + (po.amount * 0.12), 0); // 12% simulated savings
  const savingsRate = pos.length > 0 ? 12.0 : 0.0;

  // Recent lists
  const recentRfqs = rfqs.slice(-3).reverse();
  const recentPOs = pos.slice(-3).reverse();
  const pendingBids = quotations.filter(q => q.status === 'Pending').slice(0, 3);

  // SVG Chart Dimensions
  const chartW = 500;
  const chartH = 200;

  // Generate dynamic last 6 months data for spend trends
  const getLast6Months = () => {
    const list = [];
    const date = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      list.push({
        name: d.toLocaleString('default', { month: 'short' }),
        monthNum: d.getMonth(),
        year: d.getFullYear(),
        spend: 0
      });
    }
    return list;
  };

  const monthlyData = getLast6Months();
  pos.forEach(po => {
    const poDate = new Date(po.createdAt);
    const poMonth = poDate.getMonth();
    const poYear = poDate.getFullYear();
    const match = monthlyData.find(m => m.monthNum === poMonth && m.year === poYear);
    if (match) {
      match.spend += po.amount;
    }
  });

  const maxSpend = Math.max(...monthlyData.map(m => m.spend), 1000); // Baseline max spend scale
  const trendPoints = monthlyData.map((m, idx) => {
    const x = 50 + idx * 80;
    const y = 170 - (m.spend / maxSpend) * 130;
    return { x, y, spend: m.spend, name: m.name };
  });
  const pointsString = trendPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Calculate dynamic category spend for donut chart
  const categorySpend: { [key: string]: number } = {};
  pos.forEach(po => {
    const vendor = vendors.find(v => v.id === po.vendorId);
    const cat = vendor ? vendor.category : 'General Supplies';
    categorySpend[cat] = (categorySpend[cat] || 0) + po.amount;
  });

  const totalSpendAmount = pos.reduce((sum, po) => sum + po.amount, 0);

  const catSpendList = Object.entries(categorySpend).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalSpendAmount > 0 ? (amount / totalSpendAmount) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);

  let currentOffset = 0;
  const colorsList = ['#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
  
  const donutSegments = catSpendList.map((item, index) => {
    const pct = item.percentage;
    const strokeDasharray = `${pct} ${100 - pct}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += pct;
    const color = colorsList[index % colorsList.length];
    return { ...item, color, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Sourcing Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time statistics on enterprise procurements and supplier metrics.</p>
        </div>
        <div className="text-xs text-slate-500 font-semibold bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center space-x-1">
          <Clock className="h-3.5 w-3.5" />
          <span>VB-NET ONLINE</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group animate-popup">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Vendors</span>
            <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-slate-800">{totalVendors}</span>
            <span className="text-xs font-medium text-slate-400">Nodes</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium flex items-center">
            <span className="text-green-600 font-bold flex items-center mr-1">
              <ArrowUpRight className="h-3 w-3" /> +1
            </span> this month
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group animate-popup delay-75">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active RFQs</span>
            <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-slate-800">{activeRfqs}</span>
            <span className="text-xs font-medium text-slate-400">Open</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium">
            Sourcing portal active
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group animate-popup delay-100">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Approvals</span>
            <div className="h-8 w-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-slate-800">{pendingApprovals}</span>
            <span className="text-xs font-medium text-slate-400">Bids</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium flex items-center">
            Needs action soon
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group animate-popup delay-150">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Purchase Orders</span>
            <div className="h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-slate-800">{activePOs}</span>
            <span className="text-xs font-medium text-slate-400">Issued</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium">
            Cloned from Approved bids
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group animate-popup delay-200">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Spend</span>
            <div className="h-8 w-8 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600">
              <BadgeDollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-0.5">
            <span className="text-lg font-bold text-slate-400">$</span>
            <span className="text-2xl font-bold text-slate-800">{(totalSpend / 1000).toFixed(0)}k</span>
            <span className="text-xs font-semibold text-slate-400">USD</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium flex items-center">
            Mainframe expansions spend
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group animate-popup delay-300">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Savings Achieved</span>
            <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-0.5">
            <span className="text-2xl font-bold text-slate-800">{savingsRate}%</span>
            <span className="text-xs font-medium text-slate-400">Rate</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium flex items-center">
            <span className="text-emerald-600 font-bold flex items-center mr-1">
              <TrendingUp className="h-3 w-3" /> ${savingsAmount.toLocaleString()}
            </span> saved
          </div>
        </div>
      </div>

      {/* Spend Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1: Monthly Spend Trend Line Graph */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm animate-popup delay-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight">Monthly Spend Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Procurement spend metrics over the last 6 months.</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded">Overall</span>
          </div>
          <div className="flex justify-center items-center h-56 bg-slate-50 border border-slate-100 rounded-lg p-4">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full">
              {/* Grids */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Dynamic polyline */}
              {totalSpend > 0 ? (
                <polyline
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsString}
                />
              ) : (
                <line x1="50" y1="170" x2="450" y2="170" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
              )}

              {/* Data points */}
              {trendPoints.map((p, idx) => (
                <g key={idx}>
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={idx === 5 && p.spend > 0 ? 5.5 : 4.5} 
                    fill={idx === 5 && p.spend > 0 ? "#16a34a" : "#ffffff"} 
                    stroke="#16a34a" 
                    strokeWidth={idx === 5 && p.spend > 0 ? 2 : 2.5} 
                  />
                  {p.spend > 0 && (
                    <text 
                      x={p.x} 
                      y={p.y - 12} 
                      fontSize="9" 
                      textAnchor="middle" 
                      fontWeight="bold" 
                      fill="#475569" 
                      fontFamily="Inter"
                    >
                      ${p.spend.toLocaleString()}
                    </text>
                  )}
                  <text 
                    x={p.x} 
                    y="186" 
                    fontSize="10" 
                    textAnchor="middle" 
                    fill="#64748b" 
                    fontWeight="semibold" 
                    fontFamily="Inter"
                  >
                    {p.name}
                  </text>
                </g>
              ))}

              {totalSpend === 0 && (
                <text x="250" y="95" fontSize="11" textAnchor="middle" fontWeight="semibold" fill="#94a3b8" fontFamily="Inter">
                  No Spend Registered
                </text>
              )}
            </svg>
          </div>
        </div>

        {/* Graph 2: Donut Category Spend Analysis */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm animate-popup delay-300">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight">Category Spend Analysis</h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of spend across contract categories.</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded">Overall</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-around h-56 bg-slate-50 border border-slate-100 rounded-lg p-4">
            {donutSegments.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-xs text-slate-400 py-6">
                <span>No category spend records.</span>
                <span className="text-[10px] text-slate-400 mt-1">Approve bids to start tracking.</span>
              </div>
            ) : (
              <>
                <svg width="150" height="150" viewBox="0 0 42 42" className="transform -rotate-90">
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="6"></circle>
                  {donutSegments.map((segment, index) => (
                    <circle
                      key={index}
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth="6"
                      strokeDasharray={segment.strokeDasharray}
                      strokeDashoffset={segment.strokeDashoffset}
                    ></circle>
                  ))}
                </svg>
                <div className="space-y-2.5 mt-4 sm:mt-0 max-h-48 overflow-y-auto pr-2">
                  {donutSegments.map((segment, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="h-3 w-3 rounded block shrink-0" style={{ backgroundColor: segment.color }}></span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        {segment.category} ({segment.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lists Summary Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent RFQs */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col animate-popup delay-300">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800 text-sm">Recent RFQs</h3>
            <button onClick={() => setActiveTab('rfqs')} className="text-xs font-semibold text-green-600 hover:text-green-700">View All</button>
          </div>
          <div className="flex-1 space-y-3.5">
            {recentRfqs.map((rfq) => (
              <div 
                key={rfq.id} 
                onClick={() => onSelectRFQ(rfq)}
                className="p-3 bg-slate-50 border border-slate-100 hover:border-green-200 hover:bg-green-50/10 rounded-lg cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono font-bold text-slate-500">{rfq.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full border ${
                    rfq.status === 'Open' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    rfq.status === 'Quotations Received' ? 'bg-green-50 text-green-700 border-green-100' :
                    'bg-slate-50 text-slate-600 border-slate-100'
                  }`}>
                    {rfq.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-1.5 line-clamp-1">{rfq.title}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
                  <span>Lines: {rfq.items.length} Products</span>
                  <span>Due: {rfq.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Purchase Orders */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col animate-popup delay-500">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800 text-sm">Latest POs</h3>
            <button onClick={() => setActiveTab('pos')} className="text-xs font-semibold text-green-600 hover:text-green-700">View All</button>
          </div>
          <div className="flex-1 space-y-3.5">
            {recentPOs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 py-12">
                No PO sequences issued yet.
              </div>
            ) : (
              recentPOs.map((po) => (
                <div 
                  key={po.id} 
                  onClick={() => onSelectPO(po)}
                  className="p-3 bg-slate-50 border border-slate-100 hover:border-green-200 hover:bg-green-50/10 rounded-lg cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold text-slate-700">{po.poNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-green-50 border border-green-100 text-green-700 font-bold rounded-full">
                      {po.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1.5 line-clamp-1">{po.rfqTitle}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
                    <span>Supplier: {po.vendorName}</span>
                    <span className="font-bold text-slate-600">${po.amount.toLocaleString()} {po.currency}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col animate-popup delay-500">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800 text-sm">Pending Bids Approval</h3>
            <button onClick={() => setActiveTab('approvals')} className="text-xs font-semibold text-green-600 hover:text-green-700">View All</button>
          </div>
          <div className="flex-1 space-y-3.5">
            {pendingBids.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 py-12">
                No pending quotes to review.
              </div>
            ) : (
              pendingBids.map((bid) => (
                <div 
                  key={bid.id} 
                  onClick={() => setActiveTab('approvals')}
                  className="p-3 bg-slate-50 border border-slate-100 hover:border-green-200 hover:bg-green-50/10 rounded-lg cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold text-slate-500">{bid.id}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 font-bold rounded-full">
                      Pending Manager
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1.5 line-clamp-1">{bid.vendorName}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
                    <span>RFQ Ref: {bid.rfqId}</span>
                    <span className="font-bold text-slate-600">${bid.totalAmount.toLocaleString()} {bid.currency}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
