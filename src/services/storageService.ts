import { PortalData, CollectionItem, ExpenseItem, SellingActivityItem, JerseyRecordItem, AuditLogEntry } from '../types';
import { INITIAL_PORTAL_DATA } from '../data/initialData';

const STORAGE_KEY = 'morphonoveons_batch_2026_portal_data';
const CHANNEL_NAME = 'morphonoveons_portal_channel';
const ADMIN_NAME = 'Batch 2026 Finance Admin';

class PortalStorageService {
  private currentData: PortalData;
  private listeners: Set<(data: PortalData) => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;

  constructor() {
    this.currentData = this.loadFromStorage();
    this.initBroadcastChannel();
    this.initServerSync();
  }

  private loadFromStorage(): PortalData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.collections)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PORTAL_DATA;
  }

  private saveToStorage(data: PortalData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'PORTAL_DATA_SYNC' && event.data.payload) {
            this.handleRemoteUpdate(event.data.payload);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            this.handleRemoteUpdate(parsed);
          } catch {
            // ignore
          }
        }
      });
    }
  }

  private initServerSync() {
    // Attempt to fetch latest from server API
    this.syncFromServer();

    // Listen to Server-Sent Events (SSE) for multi-device instant updates
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        this.eventSource = new EventSource('/api/events');
        this.eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data && data.collections) {
              this.handleRemoteUpdate(data);
            }
          } catch {
            // ignore
          }
        };
      } catch {
        // SSE not available or running pure client, fallback to periodic check
      }
    }

    // Periodic check every 5 seconds for cross-device freshness
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.syncFromServer();
      }, 5000);
    }
  }

  private async syncFromServer() {
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.collections && data.lastUpdated) {
          if (!this.currentData.lastUpdated || new Date(data.lastUpdated) > new Date(this.currentData.lastUpdated)) {
            this.handleRemoteUpdate(data);
          }
        }
      }
    } catch {
      // Network failure or pure client mode, ignore
    }
  }

  private async pushToServer(data: PortalData) {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // server offline / running in client-only mode
    }
  }

  private handleRemoteUpdate(newData: PortalData) {
    this.currentData = newData;
    this.saveToStorage(newData);
    this.notifyListeners();
  }

  public subscribe(listener: (data: PortalData) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentData);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentData);
      } catch (err) {
        console.error('Error in portal listener:', err);
      }
    }
  }

  public getData(): PortalData {
    return this.currentData;
  }

  public commitUpdate(
    updater: (prev: PortalData) => PortalData,
    auditLog?: {
      action: string;
      category: string;
      recordChanged: string;
      previousInfo: string;
      updatedInfo: string;
    }
  ): PortalData {
    const updated = updater(this.currentData);
    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const logs = [...updated.auditLogs];
    if (auditLog) {
      const newEntry: AuditLogEntry = {
        id: `LOG-${Date.now().toString(36).toUpperCase()}`,
        timestamp: formattedTimestamp,
        action: auditLog.action,
        category: auditLog.category,
        recordChanged: auditLog.recordChanged,
        previousInfo: auditLog.previousInfo,
        updatedInfo: auditLog.updatedInfo,
        admin: ADMIN_NAME,
      };
      logs.unshift(newEntry);
    }

    const finalData: PortalData = {
      ...updated,
      auditLogs: logs.slice(0, 300), // maintain last 300 logs
      lastUpdated: nowIso,
    };

    this.currentData = finalData;
    this.saveToStorage(finalData);
    this.notifyListeners();

    // Broadcast to other tabs immediately
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'PORTAL_DATA_SYNC',
          payload: finalData,
        });
      } catch {
        // ignore
      }
    }

    // Push to server for multi-device sync
    this.pushToServer(finalData);

    return finalData;
  }

  // --- Collection Operations ---
  public addCollection(data: Omit<CollectionItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const id = `COL-${Date.now().toString().slice(-5)}`;
    const newItem: CollectionItem = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    return this.commitUpdate(
      (prev) => ({
        ...prev,
        collections: [newItem, ...prev.collections],
      }),
      {
        action: 'Added Collection Record',
        category: data.categoryId,
        recordChanged: `${newItem.referenceId} (${newItem.id})`,
        previousInfo: 'None (New Record)',
        updatedInfo: `Amount: ₱${newItem.amount.toLocaleString()}, Status: ${newItem.status}`,
      }
    );
  }

  public updateCollection(item: CollectionItem, prevItem: CollectionItem) {
    const now = new Date().toISOString();
    const updatedItem: CollectionItem = { ...item, updatedAt: now };

    return this.commitUpdate(
      (prev) => ({
        ...prev,
        collections: prev.collections.map((c) => (c.id === item.id ? updatedItem : c)),
      }),
      {
        action: 'Updated Collection Record',
        category: item.categoryId,
        recordChanged: `${item.referenceId} (${item.id})`,
        previousInfo: `Amt: ₱${prevItem.amount}, Status: ${prevItem.status}`,
        updatedInfo: `Amt: ₱${item.amount}, Status: ${item.status}`,
      }
    );
  }

  public deleteCollection(id: string) {
    const target = this.currentData.collections.find((c) => c.id === id);
    if (!target) return this.currentData;

    return this.commitUpdate(
      (prev) => ({
        ...prev,
        collections: prev.collections.filter((c) => c.id !== id),
      }),
      {
        action: 'Deleted Collection Record',
        category: target.categoryId,
        recordChanged: `${target.referenceId} (${target.id})`,
        previousInfo: `Amt: ₱${target.amount}, Desc: ${target.description}`,
        updatedInfo: 'Permanently Removed',
      }
    );
  }

  // --- Expense Operations ---
  public addExpense(data: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const id = `EXP-${Date.now().toString().slice(-5)}`;
    const newItem: ExpenseItem = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    return this.commitUpdate(
      (prev) => ({
        ...prev,
        expenses: [newItem, ...prev.expenses],
      }),
      {
        action: 'Added Expense Record',
        category: data.categoryId,
        recordChanged: `${newItem.title} (${newItem.id})`,
        previousInfo: 'None (New Record)',
        updatedInfo: `Amount: ₱${newItem.amount.toLocaleString()}, Payee: ${newItem.payee}`,
      }
    );
  }

  public updateExpense(item: ExpenseItem, prevItem: ExpenseItem) {
    const now = new Date().toISOString();
    const updatedItem: ExpenseItem = { ...item, updatedAt: now };

    return this.commitUpdate(
      (prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) => (e.id === item.id ? updatedItem : e)),
      }),
      {
        action: 'Updated Expense Record',
        category: item.categoryId,
        recordChanged: `${item.title} (${item.id})`,
        previousInfo: `Amt: ₱${prevItem.amount}, Payee: ${prevItem.payee}`,
        updatedInfo: `Amt: ₱${item.amount}, Payee: ${item.payee}`,
      }
    );
  }

  public deleteExpense(id: string) {
    const target = this.currentData.expenses.find((e) => e.id === id);
    if (!target) return this.currentData;

    return this.commitUpdate(
      (prev) => ({
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== id),
      }),
      {
        action: 'Deleted Expense Record',
        category: target.categoryId,
        recordChanged: `${target.title} (${target.id})`,
        previousInfo: `Amt: ₱${target.amount}, Payee: ${target.payee}`,
        updatedInfo: 'Permanently Removed',
      }
    );
  }

  // --- Selling Activity Operations ---
  public addSellingActivity(data: Omit<SellingActivityItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const id = `ACT-${Date.now().toString().slice(-5)}`;
    const newItem: SellingActivityItem = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    return this.commitUpdate(
      (prev) => ({
        ...prev,
        sellingActivities: [newItem, ...prev.sellingActivities],
      }),
      {
        action: 'Added Selling Activity',
        category: 'Selling Activities',
        recordChanged: `${newItem.activityName} (${newItem.id})`,
        previousInfo: 'None (New Activity)',
        updatedInfo: `Sales: ₱${newItem.totalSales.toLocaleString()}, Net: ₱${newItem.netProceeds.toLocaleString()}`,
      }
    );
  }

  public updateSellingActivity(item: SellingActivityItem, prevItem: SellingActivityItem) {
    const now = new Date().toISOString();
    const updatedItem: SellingActivityItem = { ...item, updatedAt: now };

    return this.commitUpdate(
      (prev) => ({
        ...prev,
        sellingActivities: prev.sellingActivities.map((a) => (a.id === item.id ? updatedItem : a)),
      }),
      {
        action: 'Updated Selling Activity',
        category: 'Selling Activities',
        recordChanged: `${item.activityName} (${item.id})`,
        previousInfo: `Sales: ₱${prevItem.totalSales}, Net: ₱${prevItem.netProceeds}`,
        updatedInfo: `Sales: ₱${item.totalSales}, Net: ₱${item.netProceeds}`,
      }
    );
  }

  public deleteSellingActivity(id: string) {
    const target = this.currentData.sellingActivities.find((a) => a.id === id);
    if (!target) return this.currentData;

    return this.commitUpdate(
      (prev) => ({
        ...prev,
        sellingActivities: prev.sellingActivities.filter((a) => a.id !== id),
      }),
      {
        action: 'Deleted Selling Activity',
        category: 'Selling Activities',
        recordChanged: `${target.activityName} (${target.id})`,
        previousInfo: `Sales: ₱${target.totalSales}, Net: ₱${target.netProceeds}`,
        updatedInfo: 'Permanently Removed',
      }
    );
  }

  // --- Jersey Record Operations ---
  public addJerseyRecord(data: Omit<JerseyRecordItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const id = `JER-${Date.now().toString().slice(-5)}`;
    const newItem: JerseyRecordItem = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    return this.commitUpdate(
      (prev) => ({
        ...prev,
        jerseyRecords: [newItem, ...prev.jerseyRecords],
      }),
      {
        action: 'Added Jersey Order Slot',
        category: data.jerseyType,
        recordChanged: `${newItem.orderSlot} (${newItem.id})`,
        previousInfo: 'None (New Record)',
        updatedInfo: `Status: ${newItem.paymentStatus}, Supplier: ${newItem.supplierPaymentStatus}`,
      }
    );
  }

  public updateJerseyRecord(item: JerseyRecordItem, prevItem: JerseyRecordItem) {
    const now = new Date().toISOString();
    const updatedItem: JerseyRecordItem = { ...item, updatedAt: now };

    return this.commitUpdate(
      (prev) => ({
        ...prev,
        jerseyRecords: prev.jerseyRecords.map((j) => (j.id === item.id ? updatedItem : j)),
      }),
      {
        action: 'Updated Jersey Record',
        category: item.jerseyType,
        recordChanged: `${item.orderSlot} (${item.id})`,
        previousInfo: `Paid: ₱${prevItem.amountPaid}, Status: ${prevItem.paymentStatus}, Supplier: ${prevItem.supplierPaymentStatus}`,
        updatedInfo: `Paid: ₱${item.amountPaid}, Status: ${item.paymentStatus}, Supplier: ${item.supplierPaymentStatus}`,
      }
    );
  }

  public deleteJerseyRecord(id: string) {
    const target = this.currentData.jerseyRecords.find((j) => j.id === id);
    if (!target) return this.currentData;

    return this.commitUpdate(
      (prev) => ({
        ...prev,
        jerseyRecords: prev.jerseyRecords.filter((j) => j.id !== id),
      }),
      {
        action: 'Deleted Jersey Record',
        category: target.jerseyType,
        recordChanged: `${target.orderSlot} (${target.id})`,
        previousInfo: `Size: ${target.size}, Paid: ₱${target.amountPaid}`,
        updatedInfo: 'Permanently Removed',
      }
    );
  }

  public resetToDefault() {
    this.commitUpdate(() => INITIAL_PORTAL_DATA, {
      action: 'Reset System to Sample Data',
      category: 'System',
      recordChanged: 'All Categories',
      previousInfo: 'Modified State',
      updatedInfo: 'Default Verified Baseline',
    });
  }
}

export const portalStorage = new PortalStorageService();
