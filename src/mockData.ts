export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  gstNumber: string;
  status: 'Verified' | 'Pending' | 'Unverified';
  category: string;
  rating: number;
  onboardingDate: string;
  spend: number;
  activeRfqs: number;
  deliveryRate: number;
  qualityScore: number;
}

export interface RfqItem {
  productName: string;
  quantity: number;
  unit: string;
  specNotes: string;
}

export interface Rfq {
  id: string;
  title: string;
  description: string;
  status: 'Draft' | 'Open' | 'Quotations Received' | 'Closed' | 'Cancelled';
  createdDate: string;
  deadline: string;
  assignedVendors: string[];
  items: RfqItem[];
}

export interface BidItem {
  productName: string;
  qtyAvailable: number;
  unitPrice: number;
  specMatch: string;
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  itemsBids: BidItem[];
  currency: 'USD' | 'EUR' | 'INR' | 'GBP';
  deliveryDays: number;
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
}

export interface POItem {
  productName: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  rfqId: string;
  rfqTitle: string;
  quotationId: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  currency: string;
  deliveryDays: number;
  createdAt: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Issued' | 'Rejected';
  trackingToken: string;
  remarks: string;
  items: POItem[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  rfqTitle: string;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  currency: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Pending Match';
  createdAt: string;
  dueDate: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  module: 'Vendor' | 'RFQ' | 'Quotation' | 'Approval' | 'PO' | 'Invoice' | 'System';
  userId: string;
  timestamp: string;
}

export const INITIAL_VENDORS: Vendor[] = [];

export const INITIAL_RFQS: Rfq[] = [];
export const INITIAL_QUOTATIONS: Quotation[] = [];
export const INITIAL_POS: PurchaseOrder[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];
