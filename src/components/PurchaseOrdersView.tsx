import React from 'react';
import { 
  Clock, 
  Printer, 
  ChevronRight, 
  UserCheck, 
  MapPin, 
  Calendar,
  Briefcase
} from 'lucide-react';
import type { PurchaseOrder } from '../mockData';

interface PurchaseOrdersViewProps {
  pos: PurchaseOrder[];
  selectedPO: PurchaseOrder | null;
  setSelectedPO: (po: PurchaseOrder | null) => void;
  userRole: string;
}

export const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({
  pos,
  selectedPO,
  setSelectedPO,
  userRole
}) => {
  const isVendor = userRole.startsWith('Vendor:');
  const vendorNameFromRole = isVendor ? userRole.replace('Vendor: ', '') : '';

  // Filter POs
  const filteredPOs = pos.filter(po => {
    if (isVendor) {
      return po.vendorName === vendorNameFromRole;
    }
    return true;
  });

  // Math Calculations for details PO sheet
  const subtotal = selectedPO ? selectedPO.amount : 0;
  const gstAmount = parseFloat((subtotal * 0.18).toFixed(2));
  const grandTotal = parseFloat((subtotal + gstAmount).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Detail Overlay / PO Document Layout */}
      {selectedPO ? (
        <div className="space-y-6">
          {/* Back Action Bar */}
          <div className="flex justify-between items-center no-print">
            <button
              onClick={() => setSelectedPO(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center"
            >
              ← Back to PO Database Registry
            </button>
            <button
              onClick={() => window.print()}
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 shadow-md shadow-green-100"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Download PDF</span>
            </button>
          </div>

          {/* Official PO Document Sheet */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm print-card text-xs font-semibold relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-green-600"></div>

            {/* Header info */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-base">
                    VB
                  </div>
                  <h3 className="font-bold text-base text-slate-800 tracking-tight leading-none">VendorBridge ERP</h3>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-2.5 space-y-1">
                  <p>Enterprise Procurement Hub</p>
                  <p>Mainframe Expansion Division</p>
                  <p>officer@vendorbridge.io</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-green-600 uppercase tracking-widest block bg-green-50 px-2.5 py-1 rounded inline-block">Official Purchase Order</span>
                <span className="text-xl font-bold text-slate-800 block mt-3 font-mono">{selectedPO.poNumber}</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">Token: <code>{selectedPO.trackingToken}</code></span>
              </div>
            </div>

            {/* Address Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-slate-100 text-xs">
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Contracting Supplier Node</span>
                <div className="space-y-1.5">
                  <p className="font-bold text-slate-800 text-sm">{selectedPO.vendorName}</p>
                  <p className="text-slate-500 font-medium flex items-center">
                    <UserCheck className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" />
                    <span>Vendor Code: <code>{selectedPO.vendorId}</code></span>
                  </p>
                  <p className="text-slate-500 font-medium flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" />
                    <span>Global routing address certified</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Purchase Order Logistics</span>
                <div className="space-y-1.5">
                  <p className="text-slate-500 font-medium flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" />
                    <span>Issue Date: {new Date(selectedPO.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className="text-slate-500 font-medium flex items-center">
                    <Briefcase className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" />
                    <span>Sourcing Reference: {selectedPO.rfqId} ({selectedPO.rfqTitle})</span>
                  </p>
                  <p className="text-slate-500 font-medium flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" />
                    <span>Lead Target Delivery: {selectedPO.deliveryDays} Days</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-6">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-3">PO Line Items list</span>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase">
                      <th className="py-2.5 px-4 w-3/5">Item Description</th>
                      <th className="py-2.5 px-3 w-1/5 text-right">Quantity</th>
                      <th className="py-2.5 px-3 w-1/5 text-right">Unit Rate</th>
                      <th className="py-2.5 px-4 w-1/5 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                    {selectedPO.items ? (
                      selectedPO.items.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 text-slate-800 font-bold">{item.productName}</td>
                          <td className="py-3.5 px-3 text-right">{item.quantity} {item.unit}</td>
                          <td className="py-3.5 px-3 text-right">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-3.5 px-4 text-right text-slate-800 font-bold">${(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-3.5 px-4 text-slate-800 font-bold">{selectedPO.rfqTitle}</td>
                        <td className="py-3.5 px-3 text-right">1</td>
                        <td className="py-3.5 px-3 text-right">${selectedPO.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3.5 px-4 text-right text-slate-800 font-bold">${selectedPO.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              {/* Remarks */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Manager Remarks</span>
                  <p className="text-slate-600 mt-2 font-medium italic">
                    "{selectedPO.remarks || 'No manager remarks registered.'}"
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] text-green-700 font-bold mt-4">
                  <UserCheck className="h-4 w-4" />
                  <span>Clearance status verified by Marcus Vance</span>
                </div>
              </div>

              {/* Math panel */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Subtotal Amount:</span>
                  <span className="text-slate-700">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedPO.currency}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold pb-2 border-b border-slate-200">
                  <span className="text-slate-400">Flat 18% GST (Calculated):</span>
                  <span className="text-slate-700">${gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedPO.currency}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1.5 text-slate-800">
                  <span>Grand Total Cost:</span>
                  <span className="text-green-600">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedPO.currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* List Title */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Purchase Orders Database</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Verify contracting outputs, unique tracking tokens, and issued sheets.</p>
          </div>

          {/* Database Grid */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">PO Number</th>
                    <th className="py-3.5 px-4">RFQ Title</th>
                    <th className="py-3.5 px-4">Contractor Supplier</th>
                    <th className="py-3.5 px-4">Amount Cost</th>
                    <th className="py-3.5 px-4">Tracking Token</th>
                    <th className="py-3.5 px-4">Published Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPOs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center font-medium text-slate-400">
                        No purchase orders registered in stack database.
                      </td>
                    </tr>
                  ) : (
                    filteredPOs.map((po) => (
                      <tr 
                        key={po.id} 
                        onClick={() => setSelectedPO(po)}
                        className="hover:bg-slate-50/70 cursor-pointer group transition-colors"
                      >
                        <td className="py-4 px-6 font-mono font-bold text-slate-800">{po.poNumber}</td>
                        <td className="py-4 px-4 font-bold text-slate-700">
                          <div>
                            <span>{po.rfqTitle}</span>
                            <span className="text-[9px] text-slate-400 block font-normal mt-0.5">RFQ: {po.rfqId}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-600">{po.vendorName}</td>
                        <td className="py-4 px-4 font-bold text-slate-700">${po.amount.toLocaleString()} {po.currency}</td>
                        <td className="py-4 px-4 font-mono font-medium text-slate-500"><code>{po.trackingToken}</code></td>
                        <td className="py-4 px-4 font-medium text-slate-400">{new Date(po.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedPO(po)}
                            className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center justify-end space-x-1 w-full"
                          >
                            <span>Open Sheets</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
