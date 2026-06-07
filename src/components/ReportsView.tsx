import React from 'react';
import { Download, Printer, TrendingUp, Sparkles, Building } from 'lucide-react';
import type { PurchaseOrder, Vendor } from '../mockData';

interface ReportsViewProps {
  pos: PurchaseOrder[];
  vendors: Vendor[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ pos, vendors }) => {
  
  // Calculations
  const totalSpend = pos.reduce((sum, po) => sum + po.amount, 0);
  const avgOrderVal = pos.length > 0 ? (pos.reduce((sum, po) => sum + po.amount, 0) / pos.length) : 0;

  // Calculate dynamic category spend for ratios
  const categorySpend: { [key: string]: number } = {};
  pos.forEach(po => {
    const vendor = vendors.find(v => v.id === po.vendorId);
    const cat = vendor ? vendor.category : 'General Supplies';
    categorySpend[cat] = (categorySpend[cat] || 0) + po.amount;
  });

  const catSpendList = Object.entries(categorySpend).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalSpend > 0 ? (amount / totalSpend) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);

  const colorsList = ['bg-green-600', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
  
  // Format to USD
  const formatUSD = (val: number) => {
    return `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD`;
  };

  // Generate mock CSV data
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'PO Number,Vendor,RFQ Title,Amount,Currency,Date,Status\n';
    
    pos.forEach(po => {
      csvContent += `"${po.poNumber}","${po.vendorName}","${po.rfqTitle}",${po.amount},"${po.currency}","${po.createdAt}","${po.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `procurement_spend_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Analytical Spend & Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Download audited contract ledgers, inspect department category trends, and review KPIs.</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg flex items-center space-x-1.5 transition-all"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Print Report Sheet</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center space-x-1.5 shadow-md shadow-green-100 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Export Spend CSV</span>
          </button>
        </div>
      </div>

      {/* KPI stats charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-600"></div>
          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Gross Procurement Volume</span>
          <span className="text-2xl font-bold text-slate-800 mt-2 block">{formatUSD(totalSpend)}</span>
          <div className="text-[10px] text-slate-400 font-semibold flex items-center pt-2">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1 shrink-0" />
            <span>Inclusive of mainframe upgrades budgets</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Average Order Value (AOV)</span>
          <span className="text-2xl font-bold text-slate-800 mt-2 block">
            {pos.length > 0 ? formatUSD(avgOrderVal) : '$0.00'}
          </span>
          <div className="text-[10px] text-slate-400 font-semibold flex items-center pt-2">
            <Sparkles className="h-4 w-4 text-blue-600 mr-1 shrink-0" />
            <span>Based on Issued PO contracts</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Active Bidding Channels</span>
          <span className="text-2xl font-bold text-slate-800 mt-2 block">{vendors.length} Suppliers</span>
          <div className="text-[10px] text-slate-400 font-semibold flex items-center pt-2">
            <Building className="h-4 w-4 text-amber-500 mr-1 shrink-0" />
            <span>Verified nodes across global supply logs</span>
          </div>
        </div>
      </div>

      {/* Spend Trends & charts graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graph 1: Category Spend */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Procurement Category Ratios</h3>
          
          <div className="space-y-4 text-xs font-semibold">
            {catSpendList.length === 0 ? (
              <div className="text-center text-xs text-slate-400 dark:text-zinc-500 py-12">
                No category data. Create and issue purchase orders to calculate ratio distributions.
              </div>
            ) : (
              catSpendList.map((item, index) => {
                const colorClass = colorsList[index % colorsList.length];
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-slate-700 dark:text-zinc-300">
                      <span className="font-bold">{item.category}</span>
                      <span className="font-bold">${item.amount.toLocaleString()} USD ({item.percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Graph 2: Vendor Performance ratings */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Supplier Performance Audits</h3>
          
          <div className="space-y-4 text-xs font-semibold">
            {vendors.map(v => (
              <div key={v.id} className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                <div>
                  <span className="font-bold text-slate-800 block">{v.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium font-mono mt-0.5 block">Category: {v.category}</span>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block leading-none">Quality Score</span>
                    <span className="text-xs font-bold text-slate-700 mt-1 block">{v.qualityScore}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block leading-none">On-Time Rate</span>
                    <span className="text-xs font-bold text-green-600 mt-1 block">{v.deliveryRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
