export type CategoryId = 'general' | 'selling' | 'batch_jersey' | 'mol_blue' | 'mmc_white';

export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Unpaid' | 'Completed' | 'Pending';

export type SupplierPaymentStatus = 'Paid to Supplier' | 'Downpayment Paid' | 'Pending Supplier Payment';

export interface CollectionItem {
  id: string;
  categoryId: CategoryId;
  referenceId: string; // e.g. "Batch Member #01", "Section Slot A-03" (NO imaginary personal names)
  description: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Partially Paid' | 'Pending';
  documentName?: string;
  documentData?: string; // base64 or SVG
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseItem {
  id: string;
  categoryId: CategoryId;
  title: string;
  payee: string; // e.g. "Official Venue Services", "Sublimation Printer Supplier"
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Paid';
  documentName?: string;
  documentData?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellingActivityItem {
  id: string;
  activityName: string;
  date: string;
  totalSales: number;
  productionCost: number;
  netProceeds: number; // totalSales - productionCost
  status: 'Completed' | 'Ongoing' | 'Pending';
  documentName?: string;
  documentData?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JerseyRecordItem {
  id: string;
  jerseyType: 'batch_jersey' | 'mol_blue' | 'mmc_white';
  orderSlot: string; // e.g. "Jersey Slot #01", "Member Pre-order #12"
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';
  customNumber?: string;
  customBatchText?: string; // e.g. "MN-26" or "BATCH 2026"
  unitPrice: number;
  amountPaid: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Unpaid';
  supplierPaymentStatus: SupplierPaymentStatus;
  documentName?: string;
  documentData?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: string;
  recordChanged: string;
  previousInfo: string;
  updatedInfo: string;
  admin: string;
}

export interface PortalData {
  collections: CollectionItem[];
  expenses: ExpenseItem[];
  sellingActivities: SellingActivityItem[];
  jerseyRecords: JerseyRecordItem[];
  auditLogs: AuditLogEntry[];
  lastUpdated: string;
}
