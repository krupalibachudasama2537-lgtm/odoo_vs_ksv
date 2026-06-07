import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  Clock, 
  FileCheck
} from 'lucide-react';
import type { Invoice, PurchaseOrder } from '../mockData';

interface InvoicesViewProps {
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  pos: PurchaseOrder[];
  userRole: string;
  onAddLog: (action: string, module: 'Vendor' | 'RFQ' | 'Quotation' | 'Approval' | 'PO' | 'Invoice' | 'System') => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  setInvoices,
  pos,
  userRole,
  onAddLog
}) => {
  const isVendor = userRole.startsWith('Vendor:');
  const vendorNameFromRole = isVendor ? userRole.replace('Vendor: ', '') : '';

  // Filter Invoices
  const filteredInvoices = invoices.filter(inv => {
    if (isVendor) {
      return inv.vendorName === vendorNameFromRole;
    }
    return true;
  });

  // Simulated drag-and-drop / upload state
  const [selectedPoNumber, setSelectedPoNumber] = useState('');
  const [invoiceFileName, setInvoiceFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvoiceFileName(file.name);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoNumber || !invoiceFileName) return;

    // Grab targeted PO details to replicate subtotal/total
    const poObj = pos.find(p => p.poNumber === selectedPoNumber);
    if (!poObj) return;

    setIsUploading(true);
    
    setTimeout(() => {
      // Create new invoice object
      const subtotal = poObj.amount;
      const gstAmount = parseFloat((subtotal * 0.18).toFixed(2));
      const grandTotal = parseFloat((subtotal + gstAmount).toFixed(2));
      const invoiceNumber = `INV-2026-${String(invoices.length + 1).padStart(4, '0')}`;

      const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        invoiceNumber,
        poNumber: poObj.poNumber,
        vendorId: poObj.vendorId,
        vendorName: poObj.vendorName,
        rfqTitle: poObj.rfqTitle,
        subtotal,
        gstAmount,
        grandTotal,
        currency: poObj.currency,
        status: 'Unpaid',
        createdAt: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days due
      };

      setInvoices([newInvoice, ...invoices]);
      onAddLog(`Uploaded Invoice ${invoiceNumber} matching reference ${poObj.poNumber} for total ${grandTotal} ${poObj.currency}`, 'Invoice');

      setIsUploading(false);
      setUploadSuccess(true);
      setInvoiceFileName('');
      setSelectedPoNumber('');

      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1200);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      Paid: 'bg-green-50 text-green-700 border-green-100',
      Unpaid: 'bg-amber-50 text-amber-700 border-amber-100',
      Overdue: 'bg-rose-50 text-rose-700 border-rose-100',
      'Pending Match': 'bg-slate-50 text-slate-600 border-slate-100'
    };
    return badges[status as keyof typeof badges] || badges.Unpaid;
  };

  // Calculations KPI
  const unpaidTotal = filteredInvoices.filter(i => i.status === 'Unpaid').reduce((sum, i) => sum + i.grandTotal, 0);
  const paidTotal = filteredInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tax Billing & Invoices</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Verify billings ledger sheets, matching inputs to purchase orders references, and track payouts.</p>
      </div>

      {/* KPI stats invoice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center space-x-3.5 shadow-sm">
          <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold leading-none uppercase">Pending Payouts Ledger</span>
            <span className="text-lg font-bold text-slate-700 mt-1 block">${unpaidTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center space-x-3.5 shadow-sm">
          <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold leading-none uppercase">Paid Billing Transactions</span>
            <span className="text-lg font-bold text-slate-700 mt-1 block">${paidTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center space-x-3.5 shadow-sm">
          <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold leading-none uppercase">Invoice Ledger Density</span>
            <span className="text-lg font-bold text-slate-700 mt-1 block">{filteredInvoices.length} Sheets</span>
          </div>
        </div>
      </div>

      {/* UPLOAD & MATCH PORTAL CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload portal */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Invoice Upload Portal</h3>
          
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-semibold">
            {/* Select PO */}
            <div className="space-y-1">
              <label className="text-slate-500">Associate Purchase Order *</label>
              <select
                required
                value={selectedPoNumber}
                onChange={(e) => setSelectedPoNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 focus:outline-none focus:border-green-500 font-bold"
              >
                <option value="">Choose matching PO contract...</option>
                {pos
                  .filter(p => {
                    if (isVendor) return p.vendorName === vendorNameFromRole;
                    return true;
                  })
                  .map(p => (
                    <option key={p.id} value={p.poNumber}>
                      {p.poNumber} - {p.vendorName} (${p.amount.toLocaleString()})
                    </option>
                  ))}
              </select>
            </div>

            {/* Drag Drop simulate */}
            <div className="space-y-1">
              <label className="text-slate-500">Upload Digital PDF Invoice *</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-green-500 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.xlsx"
                  onChange={handleFileUploadSimulate}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-8 w-8 text-slate-400 group-hover:text-green-600 mx-auto transition-colors" />
                <p className="text-[11px] text-slate-500 mt-2 font-bold leading-normal">
                  {invoiceFileName ? (
                    <span className="text-green-600 font-bold">{invoiceFileName}</span>
                  ) : (
                    <span>Drag and drop invoice document here, or <span className="text-green-600">browse files</span></span>
                  )}
                </p>
                <span className="text-[9px] text-slate-400 block mt-1">PDF, Excel, PNG files allowed</span>
              </div>
            </div>

            {uploadSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-[11px] font-bold text-green-700 flex items-center space-x-1.5 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4.5 w-4.5" />
                <span>Invoice matched and queued in database.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading || !selectedPoNumber || !invoiceFileName}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-1.5 shadow-md shadow-green-100 transition-all"
            >
              <FileCheck className="h-4.5 w-4.5" />
              <span>{isUploading ? 'Validating Contract Details...' : 'Confirm Upload & Match'}</span>
            </button>
          </form>
        </div>

        {/* Payments registry table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-4">Billing Invoices Stack</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Invoice Number</th>
                    <th className="py-2.5 px-3">Linked PO</th>
                    <th className="py-2.5 px-3">Sourced Project</th>
                    <th className="py-2.5 px-3 text-right">Grand Total</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center font-medium text-slate-400">
                        No billing transactions logged.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-500">{inv.poNumber}</td>
                        <td className="py-3 px-3 text-slate-700 font-bold line-clamp-1 mt-1">{inv.rfqTitle}</td>
                        <td className="py-3 px-3 text-right text-slate-800 font-bold">${inv.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadge(inv.status)}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
