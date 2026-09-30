import React, { useState } from 'react';
import { X, Upload, Trash2, Check, AlertCircle, FileCheck } from 'lucide-react';
import { CategoryId, CollectionItem, ExpenseItem, SellingActivityItem, JerseyRecordItem } from '../types';
import { CATEGORY_DEFINITIONS, createSampleDocDataUri } from '../data/initialData';

export type ModalMode =
  | { type: 'add_collection'; categoryId: CategoryId }
  | { type: 'edit_collection'; item: CollectionItem }
  | { type: 'add_expense'; categoryId: CategoryId }
  | { type: 'edit_expense'; item: ExpenseItem }
  | { type: 'add_selling' }
  | { type: 'edit_selling'; item: SellingActivityItem }
  | { type: 'add_jersey'; jerseyType: 'batch_jersey' | 'mol_blue' | 'mmc_white' }
  | { type: 'edit_jersey'; item: JerseyRecordItem };

interface RecordModalProps {
  mode: ModalMode | null;
  onClose: () => void;
  onSaveCollection: (data: Omit<CollectionItem, 'id' | 'createdAt' | 'updatedAt'>, prev?: CollectionItem) => void;
  onDeleteCollection?: (id: string) => void;
  onSaveExpense: (data: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>, prev?: ExpenseItem) => void;
  onDeleteExpense?: (id: string) => void;
  onSaveSelling: (data: Omit<SellingActivityItem, 'id' | 'createdAt' | 'updatedAt'>, prev?: SellingActivityItem) => void;
  onDeleteSelling?: (id: string) => void;
  onSaveJersey: (data: Omit<JerseyRecordItem, 'id' | 'createdAt' | 'updatedAt'>, prev?: JerseyRecordItem) => void;
  onDeleteJersey?: (id: string) => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  mode,
  onClose,
  onSaveCollection,
  onDeleteCollection,
  onSaveExpense,
  onDeleteExpense,
  onSaveSelling,
  onDeleteSelling,
  onSaveJersey,
  onDeleteJersey,
}) => {
  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {mode.type === 'add_collection' && (
          <CollectionForm
            initialCategoryId={mode.categoryId}
            onClose={onClose}
            onSave={(data) => {
              onSaveCollection(data);
              onClose();
            }}
          />
        )}

        {mode.type === 'edit_collection' && (
          <CollectionForm
            initialCategoryId={mode.item.categoryId}
            initialItem={mode.item}
            onClose={onClose}
            onSave={(data) => {
              onSaveCollection(data, mode.item);
              onClose();
            }}
            onDelete={onDeleteCollection ? () => {
              onDeleteCollection(mode.item.id);
              onClose();
            } : undefined}
          />
        )}

        {mode.type === 'add_expense' && (
          <ExpenseForm
            initialCategoryId={mode.categoryId}
            onClose={onClose}
            onSave={(data) => {
              onSaveExpense(data);
              onClose();
            }}
          />
        )}

        {mode.type === 'edit_expense' && (
          <ExpenseForm
            initialCategoryId={mode.item.categoryId}
            initialItem={mode.item}
            onClose={onClose}
            onSave={(data) => {
              onSaveExpense(data, mode.item);
              onClose();
            }}
            onDelete={onDeleteExpense ? () => {
              onDeleteExpense(mode.item.id);
              onClose();
            } : undefined}
          />
        )}

        {mode.type === 'add_selling' && (
          <SellingForm
            onClose={onClose}
            onSave={(data) => {
              onSaveSelling(data);
              onClose();
            }}
          />
        )}

        {mode.type === 'edit_selling' && (
          <SellingForm
            initialItem={mode.item}
            onClose={onClose}
            onSave={(data) => {
              onSaveSelling(data, mode.item);
              onClose();
            }}
            onDelete={onDeleteSelling ? () => {
              onDeleteSelling(mode.item.id);
              onClose();
            } : undefined}
          />
        )}

        {mode.type === 'add_jersey' && (
          <JerseyForm
            jerseyType={mode.jerseyType}
            onClose={onClose}
            onSave={(data) => {
              onSaveJersey(data);
              onClose();
            }}
          />
        )}

        {mode.type === 'edit_jersey' && (
          <JerseyForm
            jerseyType={mode.item.jerseyType}
            initialItem={mode.item}
            onClose={onClose}
            onSave={(data) => {
              onSaveJersey(data, mode.item);
              onClose();
            }}
            onDelete={onDeleteJersey ? () => {
              onDeleteJersey(mode.item.id);
              onClose();
            } : undefined}
          />
        )}
      </div>
    </div>
  );
};

// ==================== COLLECTION FORM ====================
function CollectionForm({
  initialCategoryId,
  initialItem,
  onClose,
  onSave,
  onDelete,
}: {
  initialCategoryId: CategoryId;
  initialItem?: CollectionItem;
  onClose: () => void;
  onSave: (data: Omit<CollectionItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: () => void;
}) {
  const [categoryId, setCategoryId] = useState<CategoryId>(initialCategoryId);
  const [referenceId, setReferenceId] = useState(initialItem?.referenceId || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [amount, setAmount] = useState(initialItem ? String(initialItem.amount) : '');
  const [date, setDate] = useState(initialItem?.date || new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'Paid' | 'Partially Paid' | 'Pending'>(initialItem?.status || 'Paid');
  const [notes, setNotes] = useState(initialItem?.notes || '');
  const [docName, setDocName] = useState(initialItem?.documentName || '');
  const [docData, setDocData] = useState(initialItem?.documentData || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setDocData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateSampleDoc = () => {
    const ref = referenceId || 'COL-NEW';
    const amt = amount ? `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '₱0.00';
    const generated = createSampleDocDataUri(description || 'Collection Remittance', ref, amt, date, 'Official Receipt');
    setDocName(`${ref}-RECEIPT.svg`);
    setDocData(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceId.trim()) return;

    onSave({
      categoryId,
      referenceId: referenceId.trim(),
      description: description.trim() || 'Batch Collection Deposit',
      amount: parseFloat(amount) || 0,
      date,
      status,
      notes: notes.trim(),
      documentName: docName || undefined,
      documentData: docData || undefined,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {initialItem ? 'Edit Collection Record' : 'Add New Collection'}
          </h2>
          <p className="text-xs text-slate-500">
            Record batch fee, dues, or jersey remittances (Use member IDs, no imaginary names)
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value as CategoryId)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            >
              {CATEGORY_DEFINITIONS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Reference / Contributor ID *
            </label>
            <input
              type="text"
              required
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. Batch Member #08 or Section A Slot 4"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Amount (₱) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Financial Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            >
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Description / Particulars
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Operational Due installment or Pre-order deposit"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Supporting Document Section */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Supporting Document (Proof / Receipt)
            </span>
            {docData && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                <FileCheck className="w-3.5 h-3.5" />
                Attached: {docName}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
              <input type="file" accept="image/*,.pdf,.svg" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleGenerateSampleDoc}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Generate Digital Receipt
            </button>

            {docData && (
              <button
                type="button"
                onClick={() => {
                  setDocData('');
                  setDocName('');
                }}
                className="text-xs text-rose-600 hover:underline px-2 py-1"
              >
                Remove File
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Notes / Internal Remarks
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional details, bank confirmation, or balance schedule"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            {onDelete && (
              <>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Record</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onDelete}
                      className="px-2.5 py-1 text-xs font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialItem ? 'Save Changes' : 'Record Collection'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ==================== EXPENSE FORM ====================
function ExpenseForm({
  initialCategoryId,
  initialItem,
  onClose,
  onSave,
  onDelete,
}: {
  initialCategoryId: CategoryId;
  initialItem?: ExpenseItem;
  onClose: () => void;
  onSave: (data: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: () => void;
}) {
  const [categoryId, setCategoryId] = useState<CategoryId>(initialCategoryId);
  const [title, setTitle] = useState(initialItem?.title || '');
  const [payee, setPayee] = useState(initialItem?.payee || '');
  const [amount, setAmount] = useState(initialItem ? String(initialItem.amount) : '');
  const [date, setDate] = useState(initialItem?.date || new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'Completed' | 'Pending' | 'Paid'>(initialItem?.status || 'Completed');
  const [notes, setNotes] = useState(initialItem?.notes || '');
  const [docName, setDocName] = useState(initialItem?.documentName || '');
  const [docData, setDocData] = useState(initialItem?.documentData || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setDocData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateSampleDoc = () => {
    const amt = amount ? `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '₱0.00';
    const ref = `EXP-${Date.now().toString().slice(-4)}`;
    const generated = createSampleDocDataUri(title || 'Batch Disbursement Expense', ref, amt, date, 'Supplier Invoice');
    setDocName(`${ref}-INVOICE.svg`);
    setDocData(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !payee.trim()) return;

    onSave({
      categoryId,
      title: title.trim(),
      payee: payee.trim(),
      amount: parseFloat(amount) || 0,
      date,
      status,
      notes: notes.trim(),
      documentName: docName || undefined,
      documentData: docData || undefined,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {initialItem ? 'Edit Expense Record' : 'Record New Expense'}
          </h2>
          <p className="text-xs text-slate-500">
            Log official supplier disbursements, venue downpayments, or material purchases
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Fund Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value as CategoryId)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            >
              {CATEGORY_DEFINITIONS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Payee / Supplier *
            </label>
            <input
              type="text"
              required
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              placeholder="e.g. Athletix Fabric Works or Grand Pavilions"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Expense Title / Particulars *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Initial Ballroom Reservation Downpayment"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Disbursed Amount (₱) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            >
              <option value="Completed">Completed</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Supporting Document Section */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Supporting Invoice / Official Receipt
            </span>
            {docData && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                <FileCheck className="w-3.5 h-3.5" />
                Attached: {docName}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
              <input type="file" accept="image/*,.pdf,.svg" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleGenerateSampleDoc}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Generate Digital Invoice
            </button>

            {docData && (
              <button
                type="button"
                onClick={() => {
                  setDocData('');
                  setDocName('');
                }}
                className="text-xs text-rose-600 hover:underline px-2 py-1"
              >
                Remove File
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Purchase breakdown, voucher tracking, or invoice reference"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            {onDelete && (
              <>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Expense</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onDelete}
                      className="px-2.5 py-1 text-xs font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialItem ? 'Save Changes' : 'Record Expense'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ==================== SELLING ACTIVITY FORM ====================
function SellingForm({
  initialItem,
  onClose,
  onSave,
  onDelete,
}: {
  initialItem?: SellingActivityItem;
  onClose: () => void;
  onSave: (data: Omit<SellingActivityItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: () => void;
}) {
  const [activityName, setActivityName] = useState(initialItem?.activityName || '');
  const [date, setDate] = useState(initialItem?.date || new Date().toISOString().slice(0, 10));
  const [totalSales, setTotalSales] = useState(initialItem ? String(initialItem.totalSales) : '');
  const [productionCost, setProductionCost] = useState(initialItem ? String(initialItem.productionCost) : '');
  const [status, setStatus] = useState<'Completed' | 'Ongoing' | 'Pending'>(initialItem?.status || 'Completed');
  const [notes, setNotes] = useState(initialItem?.notes || '');
  const [docName, setDocName] = useState(initialItem?.documentName || '');
  const [docData, setDocData] = useState(initialItem?.documentData || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const salesNum = parseFloat(totalSales) || 0;
  const costNum = parseFloat(productionCost) || 0;
  const netProceeds = salesNum - costNum;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setDocData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateSampleDoc = () => {
    const ref = `ACT-${Date.now().toString().slice(-4)}`;
    const generated = createSampleDocDataUri(
      activityName || 'Selling Activity Statement',
      ref,
      `₱${netProceeds.toLocaleString('en-US', { minimumFractionDigits: 2 })} Net`,
      date,
      'Activity Statement'
    );
    setDocName(`${ref}-STATEMENT.svg`);
    setDocData(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim()) return;

    onSave({
      activityName: activityName.trim(),
      date,
      totalSales: salesNum,
      productionCost: costNum,
      netProceeds,
      status,
      notes: notes.trim(),
      documentName: docName || undefined,
      documentData: docData || undefined,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {initialItem ? 'Edit Selling Activity' : 'Record New Selling Activity'}
          </h2>
          <p className="text-xs text-slate-500">
            Track merchandise sales, gross revenue, production costs, and net proceeds
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Activity Name / Merchandise Item *
          </label>
          <input
            type="text"
            required
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            placeholder="e.g. Batch 2026 Holographic Sticker Packs"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Activity Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Activity Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            >
              <option value="Completed">Completed</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Total Gross Sales (₱) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={totalSales}
              onChange={(e) => setTotalSales(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Production Cost (₱) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={productionCost}
              onChange={(e) => setProductionCost(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Net Batch Proceeds (₱)
            </label>
            <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-mono font-bold text-emerald-800">
              ₱{netProceeds.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Supporting Document Section */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Sales Breakdown Sheet / Document
            </span>
            {docData && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                <FileCheck className="w-3.5 h-3.5" />
                Attached: {docName}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
              <input type="file" accept="image/*,.pdf,.svg" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleGenerateSampleDoc}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Generate Statement
            </button>

            {docData && (
              <button
                type="button"
                onClick={() => {
                  setDocData('');
                  setDocName('');
                }}
                className="text-xs text-rose-600 hover:underline px-2 py-1"
              >
                Remove File
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Notes / Inventory Metrics
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Units manufactured, units sold, unit selling price"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            {onDelete && (
              <>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Activity</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onDelete}
                      className="px-2.5 py-1 text-xs font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialItem ? 'Save Changes' : 'Record Activity'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ==================== JERSEY ORDER RECORD FORM ====================
function JerseyForm({
  jerseyType,
  initialItem,
  onClose,
  onSave,
  onDelete,
}: {
  jerseyType: 'batch_jersey' | 'mol_blue' | 'mmc_white';
  initialItem?: JerseyRecordItem;
  onClose: () => void;
  onSave: (data: Omit<JerseyRecordItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: () => void;
}) {
  const defaultUnitPrice = jerseyType === 'batch_jersey' ? 650 : 700;

  const [orderSlot, setOrderSlot] = useState(initialItem?.orderSlot || '');
  const [size, setSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL'>(initialItem?.size || 'L');
  const [customNumber, setCustomNumber] = useState(initialItem?.customNumber || '');
  const [customBatchText, setCustomBatchText] = useState(initialItem?.customBatchText || '');
  const [unitPrice, setUnitPrice] = useState(initialItem ? String(initialItem.unitPrice) : String(defaultUnitPrice));
  const [amountPaid, setAmountPaid] = useState(initialItem ? String(initialItem.amountPaid) : String(defaultUnitPrice));
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partially Paid' | 'Unpaid'>(
    initialItem?.paymentStatus || 'Paid'
  );
  const [supplierPaymentStatus, setSupplierPaymentStatus] = useState<any>(
    initialItem?.supplierPaymentStatus || 'Paid to Supplier'
  );
  const [notes, setNotes] = useState(initialItem?.notes || '');
  const [docName, setDocName] = useState(initialItem?.documentName || '');
  const [docData, setDocData] = useState(initialItem?.documentData || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setDocData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateSampleDoc = () => {
    const ref = orderSlot || 'JER-SLOT';
    const amt = `₱${(parseFloat(amountPaid) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const generated = createSampleDocDataUri(
      `${jerseyType.toUpperCase()} Order ${orderSlot}`,
      ref,
      amt,
      new Date().toISOString().slice(0, 10),
      'Order Verification'
    );
    setDocName(`${ref}-PROOF.svg`);
    setDocData(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSlot.trim()) return;

    onSave({
      jerseyType,
      orderSlot: orderSlot.trim(),
      size,
      customNumber: customNumber.trim() || undefined,
      customBatchText: customBatchText.trim() || undefined,
      unitPrice: parseFloat(unitPrice) || defaultUnitPrice,
      amountPaid: parseFloat(amountPaid) || 0,
      paymentStatus,
      supplierPaymentStatus,
      notes: notes.trim(),
      documentName: docName || undefined,
      documentData: docData || undefined,
    });
  };

  const jerseyTitle =
    jerseyType === 'batch_jersey'
      ? 'Batch Jersey'
      : jerseyType === 'mol_blue'
      ? 'MOL Blue Jersey'
      : 'MMC White Jersey';

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {initialItem ? `Edit ${jerseyTitle} Order` : `Add ${jerseyTitle} Order`}
          </h2>
          <p className="text-xs text-slate-500">
            Order slot management, sizing, payments, and supplier payment status (No imaginary names)
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Order Slot / Reference ID *
            </label>
            <input
              type="text"
              required
              value={orderSlot}
              onChange={(e) => setOrderSlot(e.target.value)}
              placeholder="e.g. Order Slot #15 or Pre-order Slot #08"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Jersey Size *
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 font-mono font-medium"
            >
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="2XL">2XL</option>
              <option value="3XL">3XL</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Custom Number
            </label>
            <input
              type="text"
              value={customNumber}
              onChange={(e) => setCustomNumber(e.target.value)}
              placeholder="e.g. 26 or 07"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Custom Batch Inscription / Text
            </label>
            <input
              type="text"
              value={customBatchText}
              onChange={(e) => setCustomBatchText(e.target.value)}
              placeholder="e.g. BATCH 2026 or MN-26"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Unit Price (₱) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Amount Paid (₱) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Member Payment Status *
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            >
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Supplier Payment Status *
            </label>
            <select
              value={supplierPaymentStatus}
              onChange={(e) => setSupplierPaymentStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
            >
              <option value="Paid to Supplier">Paid to Supplier</option>
              <option value="Downpayment Paid">Downpayment Paid</option>
              <option value="Pending Supplier Payment">Pending Supplier Payment</option>
            </select>
          </div>
        </div>

        {/* Supporting Document Section */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Proof of Payment / Slip
            </span>
            {docData && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                <FileCheck className="w-3.5 h-3.5" />
                Attached: {docName}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
              <input type="file" accept="image/*,.pdf,.svg" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleGenerateSampleDoc}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Generate Digital Proof
            </button>

            {docData && (
              <button
                type="button"
                onClick={() => {
                  setDocData('');
                  setDocName('');
                }}
                className="text-xs text-rose-600 hover:underline px-2 py-1"
              >
                Remove File
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Fabric specifications, delivery notes, or balance due dates"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            {onDelete && (
              <>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Record</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onDelete}
                      className="px-2.5 py-1 text-xs font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialItem ? 'Save Changes' : 'Record Order'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
