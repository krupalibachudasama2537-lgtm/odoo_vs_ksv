import React, { useState, useMemo } from 'react';
import { 
  FileCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { Quotation, Rfq, BidItem } from '../mockData';

interface QuotationsViewProps {
  quotations: Quotation[];
  setQuotations: (quotes: Quotation[]) => void;
  rfqs: Rfq[];
  setRfqs: (rfqs: Rfq[]) => void;
  userRole: string;
  onAddLog: (action: string, module: 'Vendor' | 'RFQ' | 'Quotation' | 'Approval' | 'PO' | 'Invoice' | 'System') => void;
  bidRfqId: string | null;
  setBidRfqId: (id: string | null) => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  quotations,
  setQuotations,
  rfqs,
  setRfqs,
  userRole,
  onAddLog,
  bidRfqId,
  setBidRfqId
}) => {
  const isVendor = userRole.startsWith('Vendor:');
  const vendorNameFromRole = isVendor ? userRole.replace('Vendor: ', '') : '';
  const vendorIdFromRole = isVendor ? userRole.replace('Vendor: ', '').toLowerCase().split(' ')[0] : '';

  // Currency conversion rates to USD for automated evaluation
  const exchangeRates = {
    USD: 1.0,
    EUR: 1.08,
    INR: 0.012,
    GBP: 1.27
  };

  // Compare Portal RFQ Select Option
  const [compareRfqId, setCompareRfqId] = useState('');

  // Submit Quote states
  const selectedRfqForBid = useMemo(() => {
    if (!bidRfqId) return null;
    return rfqs.find(r => r.id === bidRfqId);
  }, [rfqs, bidRfqId]);

  // Initial bids values for the bid items of the selected RFQ
  const [bidRates, setBidRates] = useState<{[key: number]: number}>({});
  const [bidQtys, setBidQtys] = useState<{[key: number]: number}>({});
  const [bidLeadTime, setBidLeadTime] = useState(7);
  const [bidCurrency, setBidCurrency] = useState<'USD' | 'EUR' | 'INR' | 'GBP'>('USD');

  React.useEffect(() => {
    if (selectedRfqForBid) {
      const initialRates: any = {};
      const initialQtys: any = {};
      selectedRfqForBid.items.forEach((item, index) => {
        initialRates[index] = 100;
        initialQtys[index] = item.quantity;
      });
      setBidRates(initialRates);
      setBidQtys(initialQtys);
    }
  }, [selectedRfqForBid]);

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfqForBid || !isVendor) return;

    // Build items bids matrix
    const itemsBids: BidItem[] = selectedRfqForBid.items.map((item, index) => {
      const qty = bidQtys[index] || item.quantity;
      const rate = bidRates[index] || 100;
      return {
        productName: item.productName,
        qtyAvailable: qty,
        unitPrice: rate,
        specMatch: 'Fully matches client requirements specifications.'
      };
    });

    // Calculate total bid amount
    const totalAmount = itemsBids.reduce((sum, item) => sum + (item.qtyAvailable * item.unitPrice), 0);

    const quoteId = `QTN-2026-${String(quotations.length + 1).padStart(3, '0')}`;
    const newQuote: Quotation = {
      id: quoteId,
      rfqId: selectedRfqForBid.id,
      vendorId: vendorIdFromRole,
      vendorName: vendorNameFromRole,
      itemsBids,
      currency: bidCurrency,
      deliveryDays: bidLeadTime,
      totalAmount,
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };

    setQuotations([...quotations, newQuote]);

    // Update RFQ status to Quotations Received if it was Open
    setRfqs(rfqs.map(r => {
      if (r.id === selectedRfqForBid.id && r.status === 'Open') {
        return { ...r, status: 'Quotations Received' };
      }
      return r;
    }));

    onAddLog(`Vendor '${vendorNameFromRole}' submitted quote ${quoteId} totaling ${totalAmount} ${bidCurrency} for ${selectedRfqForBid.id}`, 'Quotation');

    setBidRfqId(null);
    setBidRates({});
    setBidQtys({});
    setBidLeadTime(7);
  };

  // Automated Matrix logic: Filter quotes for the chosen RFQ and find the lowest price
  const comparedQuotes = useMemo(() => {
    if (!compareRfqId) return [];
    
    // Grab all quotes for this RFQ
    const list = quotations.filter(q => q.rfqId === compareRfqId);
    
    // Map their converted values to USD for correct comparisons
    return list.map(q => {
      const rateMultiplier = exchangeRates[q.currency] || 1.0;
      const convertedUsd = q.totalAmount * rateMultiplier;
      return { ...q, convertedUsd };
    });
  }, [quotations, compareRfqId]);

  // Isolate min total cost bid
  const lowestBidId = useMemo(() => {
    if (comparedQuotes.length === 0) return '';
    let minPrice = Infinity;
    let minId = '';
    comparedQuotes.forEach(q => {
      if (q.convertedUsd < minPrice) {
        minPrice = q.convertedUsd;
        minId = q.id;
      }
    });
    return minId;
  }, [comparedQuotes]);

  const getStatusBadge = (status: string) => {
    const badges = {
      Approved: 'bg-green-50 text-green-700 border-green-100',
      Pending: 'bg-amber-50 text-amber-700 border-amber-100',
      Rejected: 'bg-rose-50 text-rose-700 border-rose-100'
    };
    return badges[status as keyof typeof badges] || badges.Pending;
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Quotations Registry & Pricing Analysis</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Evaluate bidder cost proposals, run side-by-side matrices, and award optimal contracts.</p>
      </div>

      {/* VENDOR SPECIFIC BID FORM PORTAL */}
      {isVendor && selectedRfqForBid ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider block">Lock Bid Proposal</span>
              <h3 className="font-bold text-slate-800 text-sm mt-1">{selectedRfqForBid.title} ({selectedRfqForBid.id})</h3>
            </div>
            <button
              onClick={() => setBidRfqId(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Cancel Bid
            </button>
          </div>

          <form onSubmit={handleBidSubmit} className="space-y-6 text-xs font-semibold">
            {/* Bid Config line items */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Log Unit Rates and Quantities Available</span>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase">
                      <th className="py-2.5 px-4 w-2/5">Product Sourced</th>
                      <th className="py-2.5 px-3 w-1/5">Client Required Qty</th>
                      <th className="py-2.5 px-3 w-1/5">Qty Available *</th>
                      <th className="py-2.5 px-4 w-1/5">Unit Price (Rate) *</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRfqForBid.items.map((item, index) => (
                      <tr key={index} className="bg-white hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-700">
                          <div>
                            <span>{item.productName}</span>
                            {item.specNotes && <span className="text-[9px] text-slate-400 block font-normal mt-0.5">{item.specNotes}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-500">{item.quantity} {item.unit}</td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            required
                            min="1"
                            value={bidQtys[index] !== undefined ? bidQtys[index] : item.quantity}
                            onChange={(e) => setBidQtys({ ...bidQtys, [index]: parseInt(e.target.value) || 1 })}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-700 focus:outline-none focus:border-green-500 font-semibold"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            required
                            min="0.1"
                            step="any"
                            value={bidRates[index] !== undefined ? bidRates[index] : ''}
                            onChange={(e) => setBidRates({ ...bidRates, [index]: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-700 focus:outline-none focus:border-green-500 font-bold"
                            placeholder="Unit Rate"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* General parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-slate-500">Proposal Currency</label>
                <select
                  value={bidCurrency}
                  onChange={(e) => setBidCurrency(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 font-semibold"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Estimated Lead Time (Days)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={bidLeadTime}
                  onChange={(e) => setBidLeadTime(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 font-semibold"
                />
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Total Bid Proposal Amount</span>
                <span className="text-xl font-bold text-slate-700 mt-2 block">
                  {Object.keys(bidRates).length === 0 ? '0.00' : (
                    selectedRfqForBid.items.reduce((sum, item, idx) => {
                      const qty = bidQtys[idx] !== undefined ? bidQtys[idx] : item.quantity;
                      const rate = bidRates[idx] || 0;
                      return sum + (qty * rate);
                    }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  )} {bidCurrency}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBidRfqId(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold"
              >
                Cancel Proposal
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-bold flex items-center space-x-1.5 shadow-md shadow-green-100"
              >
                <FileCheck className="h-4.5 w-4.5" />
                <span>Confirm & Submit Bid</span>
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* OFFICER SPECIFIC SIDE-BY-SIDE COMPARE MATRIX */}
      {!isVendor && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Automated Cost Analysis Engine</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Select an active RFQ from the registry to run pricing matrices comparison.</p>
            </div>
            
            <select
              value={compareRfqId}
              onChange={(e) => setCompareRfqId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs px-3.5 py-2.5 text-slate-700 focus:outline-none focus:border-green-500 font-bold"
            >
              <option value="">Choose an active RFQ node...</option>
              {rfqs.filter(r => r.status === 'Quotations Received' || r.status === 'Closed').map(r => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.title}
                </option>
              ))}
            </select>
          </div>

          {/* Matrix side-by-side grids */}
          {compareRfqId ? (
            comparedQuotes.length === 0 ? (
              <div className="text-center py-12 text-xs font-semibold text-slate-400">
                No quotations submitted for this sourcing request.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {comparedQuotes.map((quote) => {
                    const isOptimal = quote.id === lowestBidId;
                    
                    return (
                      <div 
                        key={quote.id}
                        className={`border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between transition-all ${
                          isOptimal 
                            ? 'border-green-500 bg-green-50/5 ring-1 ring-green-400 shadow-md shadow-green-50/30' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {isOptimal && (
                          <div className="absolute top-0 right-0 bg-green-600 text-white font-bold text-[8px] uppercase tracking-wider px-3.5 py-1 rounded-bl-lg flex items-center space-x-1">
                            <Sparkles className="h-3 w-3 fill-white" />
                            <span>Optimal Bid Selection</span>
                          </div>
                        )}

                        <div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                            <span>{quote.id}</span>
                            <span className={`px-2 py-0.5 rounded border text-[9px] ${getStatusBadge(quote.status)}`}>
                              {quote.status}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-slate-800 text-sm mt-3">{quote.vendorName}</h4>
                          
                          {/* Financials details */}
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-400">Base Quote Proposal:</span>
                              <span className="text-slate-700">{quote.totalAmount.toLocaleString()} {quote.currency}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold border-b border-slate-100 pb-2">
                              <span className="text-slate-400">Converted USD Valuation:</span>
                              <span className="text-green-600">${quote.convertedUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold pt-1">
                              <span className="text-slate-400">Estimated Lead Time:</span>
                              <span className="text-slate-700">{quote.deliveryDays} Days</span>
                            </div>
                          </div>

                          {/* Line items details breakdown */}
                          <div className="mt-5 space-y-2">
                            <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Line Items Bidding Matrix</h5>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                              {quote.itemsBids.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 border border-slate-100 p-2.5 rounded text-[11px] font-semibold text-slate-600">
                                  <span className="text-slate-700 block font-bold leading-tight">{item.productName}</span>
                                  <div className="flex justify-between mt-1.5 font-medium">
                                    <span>Quantity: {item.qtyAvailable}</span>
                                    <span>Rate: {item.unitPrice} {quote.currency}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {quote.status === 'Pending' && (
                          <div className="border-t border-slate-100 pt-4 mt-5 flex justify-end">
                            <button
                              onClick={() => {
                                // Jump directly to approvals section
                                const approvalsTab = document.getElementById('nav-approvals');
                                if (approvalsTab) approvalsTab.click();
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] py-1.5 px-3 rounded flex items-center space-x-1"
                            >
                              <span>Award Bid</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-10 text-xs font-semibold text-slate-400">
              Select an RFQ Sourcing contract above to initialize pricing analysis.
            </div>
          )}
        </div>
      )}

      {/* ALL QUOTATIONS TABLE REGISTRY */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm">Quotations Submission History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Quotation ID</th>
                <th className="py-3.5 px-4">RFQ ID</th>
                <th className="py-3.5 px-4">Vendor Name</th>
                <th className="py-3.5 px-4">Proposal Cost</th>
                <th className="py-3.5 px-4">USD Valuation</th>
                <th className="py-3.5 px-4">Lead Time</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center font-medium text-slate-400">
                    No quotation proposals submitted.
                  </td>
                </tr>
              ) : (
                quotations
                  .filter(q => {
                    if (isVendor) {
                      return q.vendorId === vendorIdFromRole;
                    }
                    return true;
                  })
                  .map((quote) => {
                    const rateMultiplier = exchangeRates[quote.currency] || 1.0;
                    const usdVal = quote.totalAmount * rateMultiplier;
                    
                    return (
                      <tr key={quote.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{quote.id}</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-500">{quote.rfqId}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">{quote.vendorName}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-600">
                          {quote.totalAmount.toLocaleString()} {quote.currency}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          ${usdVal.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-500">{quote.deliveryDays} Days</td>
                        <td className="py-3.5 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadge(quote.status)}`}>
                            {quote.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
