import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Users, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Trash2, 
  X,
  PlusCircle,
  FileCheck
} from 'lucide-react';
import type { Rfq, Vendor, RfqItem } from '../mockData';

interface RfqsViewProps {
  rfqs: Rfq[];
  setRfqs: (rfqs: Rfq[]) => void;
  vendors: Vendor[];
  userRole: string;
  onSelectRFQ: (rfq: Rfq) => void;
  selectedRFQ: Rfq | null;
  setSelectedRFQ: (rfq: Rfq | null) => void;
  onAddLog: (action: string, module: 'Vendor' | 'RFQ' | 'Quotation' | 'Approval' | 'PO' | 'Invoice' | 'System') => void;
  onOpenBidForm: (rfqId: string) => void;
}

export const RfqsView: React.FC<RfqsViewProps> = ({
  rfqs,
  setRfqs,
  vendors,
  userRole,
  onSelectRFQ,
  selectedRFQ,
  setSelectedRFQ,
  onAddLog,
  onOpenBidForm
}) => {
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');

  const isVendor = userRole.startsWith('Vendor:');
  const vendorIdFromRole = isVendor ? userRole.replace('Vendor: ', '').toLowerCase().split(' ')[0] : '';

  // Filter RFQs
  const filteredRfqs = useMemo(() => {
    return rfqs.filter(r => {
      // Vendor can only see RFQs they are assigned to
      if (isVendor) {
        const isAssigned = r.assignedVendors.some(id => vendorIdFromRole.includes(id) || id.includes(vendorIdFromRole));
        if (!isAssigned) return false;
      }
      
      if (statusFilter === 'All') return true;
      return r.status === statusFilter;
    });
  }, [rfqs, statusFilter, isVendor, vendorIdFromRole]);

  // Create RFQ Wizard States
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqDesc, setRfqDesc] = useState('');
  const [rfqDeadline, setRfqDeadline] = useState('');
  
  // Step 2 line items
  const [rfqItems, setRfqItems] = useState<RfqItem[]>([
    { productName: '', quantity: 10, unit: 'Units', specNotes: '' }
  ]);
  
  // Step 3 vendor targets
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  const handleAddLineItem = () => {
    setRfqItems([...rfqItems, { productName: '', quantity: 1, unit: 'Units', specNotes: '' }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (rfqItems.length === 1) return;
    setRfqItems(rfqItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: keyof RfqItem, value: any) => {
    setRfqItems(rfqItems.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleVendorCheckboxChange = (vendorId: string) => {
    if (selectedVendors.includes(vendorId)) {
      setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
    } else {
      setSelectedVendors([...selectedVendors, vendorId]);
    }
  };

  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqTitle || !rfqDeadline || rfqItems.some(item => !item.productName) || selectedVendors.length === 0) return;

    const rfqId = `RFQ-2026-${String(rfqs.length + 1).padStart(3, '0')}`;
    const newRfq: Rfq = {
      id: rfqId,
      title: rfqTitle,
      description: rfqDesc,
      status: 'Open',
      createdDate: new Date().toISOString().split('T')[0],
      deadline: rfqDeadline,
      assignedVendors: selectedVendors,
      items: rfqItems
    };

    setRfqs([...rfqs, newRfq]);
    onAddLog(`Dispatched RFQ ${rfqId} for '${rfqTitle}' targeting: ${selectedVendors.join(', ')}`, 'RFQ');
    
    // Reset wizard
    setRfqTitle('');
    setRfqDesc('');
    setRfqDeadline('');
    setRfqItems([{ productName: '', quantity: 10, unit: 'Units', specNotes: '' }]);
    setSelectedVendors([]);
    setWizardStep(1);
    setShowWizardModal(false);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      Draft: 'bg-slate-50 text-slate-600 border-slate-100',
      Open: 'bg-blue-50 text-blue-700 border-blue-100',
      'Quotations Received': 'bg-green-50 text-green-700 border-green-100',
      Closed: 'bg-slate-100 text-slate-700 border-slate-200',
      Cancelled: 'bg-rose-50 text-rose-700 border-rose-100'
    };
    return badges[status as keyof typeof badges] || badges.Open;
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">RFQ Management Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Issue requests for quotations, specify technical requirements, and audit vendor bids.</p>
        </div>
        {!isVendor && (
          <button
            onClick={() => setShowWizardModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center space-x-1.5 shadow-md shadow-green-200 hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create New RFQ</span>
          </button>
        )}
      </div>

      {/* RFQ Status Filters */}
      <div className="flex space-x-2 border-b border-slate-200 pb-px">
        {['All', 'Open', 'Quotations Received', 'Closed', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px ${
              statusFilter === status 
                ? 'border-green-600 text-green-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* RFQ Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredRfqs.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 p-12 text-center rounded-xl font-medium text-slate-400">
            No active RFQ contracts matching the filter.
          </div>
        ) : (
          filteredRfqs.map((rfq) => {
            const isAssignedToVendor = isVendor && rfq.assignedVendors.some(id => vendorIdFromRole.includes(id) || id.includes(vendorIdFromRole));
            
            return (
              <div 
                key={rfq.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold font-mono text-slate-400">{rfq.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadge(rfq.status)}`}>
                      {rfq.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mt-3 line-clamp-1">{rfq.title}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{rfq.description}</p>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-[10px] font-bold text-slate-500">
                    <div className="bg-slate-50 border border-slate-100 rounded p-2 flex items-center space-x-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[8px] text-slate-400 font-medium block leading-none">Due Date</span>
                        <span className="mt-0.5 block">{rfq.deadline}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded p-2 flex items-center space-x-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[8px] text-slate-400 font-medium block leading-none">Bidders</span>
                        <span className="mt-0.5 block">{rfq.assignedVendors.length} Suppliers</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-5 flex justify-between items-center">
                  <button 
                    onClick={() => onSelectRFQ(rfq)}
                    className="text-xs font-bold text-slate-600 hover:text-green-600 transition-colors flex items-center"
                  >
                    View Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </button>

                  {isVendor && isAssignedToVendor && rfq.status === 'Open' && (
                    <button 
                      onClick={() => onOpenBidForm(rfq.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] py-1.5 px-3 rounded shadow-sm hover:shadow transition-all"
                    >
                      Log Pricing Bid
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RFQ DETAIL MODAL SHEET */}
      {selectedRFQ && (
        <div className="fixed inset-0 z-50 overflow-hidden no-print animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSelectedRFQ(null)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="h-10 w-10 bg-green-100 rounded-lg border border-green-200 flex items-center justify-center text-green-700">
                    <FileText className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{selectedRFQ.title}</h3>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">Contract Ref: {selectedRFQ.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRFQ(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X className="h-5.5 w-5.5" />
                </button>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Description */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">Sourcing Objective</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-lg">
                    {selectedRFQ.description || 'No sourcing details entered.'}
                  </p>
                </div>

                {/* Deadlines info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-3 flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-green-600 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase leading-none block">Published Stamp</span>
                      <span className="text-xs font-bold text-slate-700 mt-1 block">{selectedRFQ.createdDate}</span>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3 flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase leading-none block">Closing Deadline</span>
                      <span className="text-xs font-bold text-slate-700 mt-1 block">{selectedRFQ.deadline}</span>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">Line Items Sourcing Matrix</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase">
                          <th className="py-2.5 px-4">Product Name</th>
                          <th className="py-2.5 px-3">Target Qty</th>
                          <th className="py-2.5 px-3">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedRFQ.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-700">
                              <div>
                                <span>{item.productName}</span>
                                {item.specNotes && <span className="text-[9px] text-slate-400 block font-normal mt-0.5">{item.specNotes}</span>}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-600">{item.quantity}</td>
                            <td className="py-3 px-3 font-medium text-slate-500">{item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bidding targets */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">Participating Bidder Houses</h4>
                  <div className="space-y-2">
                    {selectedRFQ.assignedVendors.map((vendorId) => {
                      const vendorObj = vendors.find(v => v.id === vendorId);
                      return (
                        <div key={vendorId} className="flex items-center justify-between border border-slate-200 p-3 rounded-lg text-xs bg-white">
                          <span className="font-semibold text-slate-700">{vendorObj ? vendorObj.name : vendorId}</span>
                          <span className="font-mono text-[10px] text-slate-400">{vendorId}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE RFQ 3-STEP WIZARD MODAL */}
      {showWizardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs no-print">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Wizard Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">RFQ Sourcing Wizard</h3>
                <p className="text-[10px] text-slate-400 font-medium">Step {wizardStep} of 3 - Configure sourcing metrics</p>
              </div>
              <button onClick={() => setShowWizardModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
            </div>

            {/* Steps Indicator Bar */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-12 w-full max-w-md mx-auto">
                <div className="flex items-center space-x-2">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    wizardStep >= 1 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {wizardStep > 1 ? <Check className="h-3.5 w-3.5" /> : '1'}
                  </span>
                  <span className={`text-[10px] font-bold ${wizardStep >= 1 ? 'text-slate-700' : 'text-slate-400'}`}>Base Data</span>
                </div>
                <div className="h-px bg-slate-200 flex-1"></div>
                <div className="flex items-center space-x-2">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    wizardStep >= 2 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {wizardStep > 2 ? <Check className="h-3.5 w-3.5" /> : '2'}
                  </span>
                  <span className={`text-[10px] font-bold ${wizardStep >= 2 ? 'text-slate-700' : 'text-slate-400'}`}>Line Items</span>
                </div>
                <div className="h-px bg-slate-200 flex-1"></div>
                <div className="flex items-center space-x-2">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    wizardStep >= 3 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    '3'
                  </span>
                  <span className={`text-[10px] font-bold ${wizardStep >= 3 ? 'text-slate-700' : 'text-slate-400'}`}>Target Bidders</span>
                </div>
              </div>
            </div>

            {/* Wizard Forms */}
            <form onSubmit={handleWizardSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold">
              
              {/* STEP 1: BASE DATA */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-500">RFQ Sourcing Title *</label>
                    <input
                      type="text"
                      required
                      value={rfqTitle}
                      onChange={(e) => setRfqTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500"
                      placeholder="e.g. Server Cabinets cooling infrastructure contract"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500">Submission Closing Deadline *</label>
                    <input
                      type="date"
                      required
                      value={rfqDeadline}
                      onChange={(e) => setRfqDeadline(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500">Sourcing Objective & Detailed Description</label>
                    <textarea
                      rows={4}
                      value={rfqDesc}
                      onChange={(e) => setRfqDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 font-medium"
                      placeholder="Specify project parameters, certifications required, and delivery schedules..."
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: LINE ITEMS MATRIX */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Add Products To Sourcing Checklist</span>
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="text-green-600 hover:text-green-700 font-bold text-xs flex items-center space-x-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Add Item Line</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase">
                          <th className="py-2.5 px-4 w-2/5">Product Name *</th>
                          <th className="py-2.5 px-2 w-1/5">Target Qty *</th>
                          <th className="py-2.5 px-2 w-1/5">Unit</th>
                          <th className="py-2.5 px-3 w-1/5">Technical Notes</th>
                          <th className="py-2.5 px-4 text-center shrink-0"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rfqItems.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4">
                              <input
                                type="text"
                                required
                                value={item.productName}
                                onChange={(e) => handleLineItemChange(index, 'productName', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:border-green-500 font-bold"
                                placeholder="Cabling Spool"
                              />
                            </td>
                            <td className="py-2.5 px-2">
                              <input
                                type="number"
                                required
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleLineItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:border-green-500 font-semibold"
                              />
                            </td>
                            <td className="py-2.5 px-2">
                              <select
                                value={item.unit}
                                onChange={(e) => handleLineItemChange(index, 'unit', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:border-green-500 font-medium"
                              >
                                <option value="Units">Units</option>
                                <option value="Liters">Liters</option>
                                <option value="Kilograms">Kilograms</option>
                                <option value="Spools">Spools</option>
                                <option value="Hours">Hours</option>
                              </select>
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={item.specNotes}
                                onChange={(e) => handleLineItemChange(index, 'specNotes', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:border-green-500 font-medium"
                                placeholder="Tolerance/Coherence..."
                              />
                            </td>
                            <td className="py-2.5 px-4 text-center shrink-0">
                              <button
                                type="button"
                                disabled={rfqItems.length === 1}
                                onClick={() => handleRemoveLineItem(index)}
                                className="text-slate-400 hover:text-rose-600 disabled:opacity-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 3: VENDORS TARGETING */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assign Bidder Houses For Tenders</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                    {vendors.length === 0 ? (
                      <div className="col-span-full border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-6 text-center space-y-2 bg-slate-50 dark:bg-zinc-800/30">
                        <p className="text-slate-600 dark:text-zinc-300 font-bold">No Bidders Available</p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                          You must register a Vendor account first to target them. Logout, go to the <strong>Registration Desk</strong>, and register with a Vendor role (e.g. <em>Vendor: Apex Supplies</em>).
                        </p>
                      </div>
                    ) : (
                      vendors.map((vendor) => {
                        const isChecked = selectedVendors.includes(vendor.id);
                        return (
                          <div 
                            key={vendor.id}
                            onClick={() => handleVendorCheckboxChange(vendor.id)}
                            className={`border p-3.5 rounded-lg flex items-start space-x-3 cursor-pointer transition-all ${
                              isChecked 
                                ? 'border-green-500 bg-green-50/10 shadow-xs' 
                                : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <div className={`h-4.5 w-4.5 border rounded flex items-center justify-center shrink-0 mt-0.5 ${
                              isChecked ? 'bg-green-600 border-green-600 text-white' : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                            }`}>
                              {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <div>
                              <span className="text-slate-800 dark:text-zinc-100 font-bold block">{vendor.name}</span>
                              <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold uppercase mt-0.5 block">{vendor.category}</span>
                              <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5 block">GST: {vendor.gstNumber}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-6">
                <div>
                  {wizardStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setWizardStep(wizardStep - 1)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center space-x-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowWizardModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  {wizardStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        // Basic Step validation
                        if (wizardStep === 1 && (!rfqTitle || !rfqDeadline)) return;
                        if (wizardStep === 2 && rfqItems.some(item => !item.productName)) return;
                        setWizardStep(wizardStep + 1);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-1 shadow-md shadow-green-100"
                    >
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={selectedVendors.length === 0}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-1 shadow-md shadow-green-100"
                    >
                      <FileCheck className="h-4 w-4" />
                      <span>Confirm & Publish RFQ</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
