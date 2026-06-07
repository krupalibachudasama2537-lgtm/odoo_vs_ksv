import React, { useState } from 'react';
import { Check, X, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import type { Quotation, Rfq } from '../mockData';

interface ApprovalsViewProps {
  quotations: Quotation[];
  rfqs: Rfq[];
  onApproveBid: (quoteId: string, remarks: string) => void;
  onRejectBid: (quoteId: string, remarks: string) => void;
  userRole: string;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  quotations,
  rfqs,
  onApproveBid,
  onRejectBid,
  userRole
}) => {
  const isManager = userRole === 'Manager / Approver' || userRole === 'System Admin';

  // State to hold remarks being entered
  const [remarksQuoteId, setRemarksQuoteId] = useState<string | null>(null);
  const [decisionAction, setDecisionAction] = useState<'Approve' | 'Reject' | null>(null);
  const [remarksText, setRemarksText] = useState('');

  // Grab pending quotations
  const pendingQuotes = quotations.filter(q => q.status === 'Pending');
  
  // Grab approved/rejected list
  const approvedQuotes = quotations.filter(q => q.status === 'Approved');
  const rejectedQuotes = quotations.filter(q => q.status === 'Rejected');

  const handleOpenRemarksModal = (quoteId: string, action: 'Approve' | 'Reject') => {
    setRemarksQuoteId(quoteId);
    setDecisionAction(action);
    setRemarksText('');
  };

  const handleConfirmDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarksQuoteId || !decisionAction) return;

    if (decisionAction === 'Approve') {
      onApproveBid(remarksQuoteId, remarksText);
    } else {
      onRejectBid(remarksQuoteId, remarksText);
    }

    setRemarksQuoteId(null);
    setDecisionAction(null);
    setRemarksText('');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Manager Action Portal & Approvals</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Verify bidder metrics, audit remarks log, and release purchase orders.</p>
      </div>

      {!isManager ? (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs font-semibold text-amber-700 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <span>Security Notice: This portal is restricted to Manager/Approver nodes and System Admin clearances only.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main timeline listing */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Pending Quotations Queue</h3>
            
            {pendingQuotes.length === 0 ? (
              <div className="bg-white border border-slate-200 p-10 text-center rounded-xl font-semibold text-slate-400 text-xs">
                No quotations currently pending manager approval.
              </div>
            ) : (
              pendingQuotes.map((quote) => {
                const rfqObj = rfqs.find(r => r.id === quote.rfqId);
                
                return (
                  <div key={quote.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold font-mono text-slate-400">Quote: {quote.id}</span>
                        <h4 className="font-bold text-slate-800 text-sm mt-1">{quote.vendorName}</h4>
                        <span className="text-[10px] font-medium text-slate-500 block mt-0.5">Sourcing Project: {rfqObj ? rfqObj.title : quote.rfqId}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-800 block">${quote.totalAmount.toLocaleString()} {quote.currency}</span>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5 block">Estimated Cost</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-5 flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-500">
                        <span className="bg-slate-50 border border-slate-100 rounded px-2 py-1 flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Lead Time: {quote.deliveryDays} Days</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenRemarksModal(quote.id, 'Reject')}
                          className="border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center space-x-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleOpenRemarksModal(quote.id, 'Approve')}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center space-x-1 shadow-md shadow-green-100"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve & Issue PO</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* History / Audit tracker list */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Decisions History Log</h3>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm divide-y divide-slate-100 max-h-[50vh] overflow-y-auto">
              {approvedQuotes.length === 0 && rejectedQuotes.length === 0 ? (
                <div className="text-center py-10 text-[11px] font-semibold text-slate-400">
                  No decisions logged yet.
                </div>
              ) : (
                [...approvedQuotes, ...rejectedQuotes]
                  .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
                  .map((quote) => (
                    <div key={quote.id} className="py-3 first:pt-0 last:pb-0 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-slate-500">{quote.id}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          quote.status === 'Approved' 
                            ? 'bg-green-50 text-green-700 border-green-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {quote.status}
                        </span>
                      </div>
                      <p className="font-bold text-slate-700 mt-1">{quote.vendorName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Valuation: ${quote.totalAmount.toLocaleString()} {quote.currency}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* REMARKS / COMMENTS MODAL POPUP */}
      {remarksQuoteId && decisionAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs no-print">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                <MessageSquare className="h-4.5 w-4.5 text-slate-500" />
                <span>Manager Decision Remarks</span>
              </h3>
              <button 
                onClick={() => {
                  setRemarksQuoteId(null);
                  setDecisionAction(null);
                }} 
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleConfirmDecision} className="p-6 space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-500">Provide reason or comments for {decisionAction.toLowerCase()}al</label>
                <textarea
                  required
                  rows={4}
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 font-medium"
                  placeholder="Specify review remarks, budget matching, or lead time validations..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setRemarksQuoteId(null);
                    setDecisionAction(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-bold shadow-md ${
                    decisionAction === 'Approve' 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-100' 
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100'
                  }`}
                >
                  Confirm {decisionAction}al
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
