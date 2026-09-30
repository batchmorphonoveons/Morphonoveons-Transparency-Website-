import React from 'react';
import { X, Download, Printer, FileText, Calendar, DollarSign, Tag } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentData?: string;
  documentName?: string;
  title: string;
  referenceId: string;
  amount?: number;
  date?: string;
  categoryName?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  documentData,
  documentName = 'Supporting_Document',
  title,
  referenceId,
  amount,
  date,
  categoryName,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (!documentData) return;
    const a = document.createElement('a');
    a.href = documentData;
    a.download = documentName || 'financial-proof.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && documentData) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title} - ${referenceId}</title>
            <style>
              body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; padding: 20px; }
              img { max-width: 100%; height: auto; border: 1px solid #ccc; }
              .header { margin-bottom: 20px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>MORPHONOVEONS BATCH 2026 - FINANCIAL PROOF</h2>
              <p>${referenceId} &bull; ${title} &bull; ${date || ''}</p>
            </div>
            <img src="${documentData}" onload="window.print();window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="doc-preview-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="doc-preview-title" className="text-base font-semibold text-slate-900 leading-tight">
                {title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-mono font-medium text-slate-700">{referenceId}</span>
                {categoryName && (
                  <>
                    <span aria-hidden="true">&bull;</span>
                    <span>{categoryName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {documentData && (
              <>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Print Document"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs">
          {amount !== undefined && (
            <div className="flex items-center gap-1.5 text-slate-700">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Verified Sum:</span>
              <span className="font-mono font-semibold text-emerald-700">
                ₱{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {date && (
            <div className="flex items-center gap-1.5 text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Date:</span>
              <span className="font-medium text-slate-800">{date}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-slate-700">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">File:</span>
            <span className="truncate max-w-[140px] font-mono text-slate-800">{documentName}</span>
          </div>
        </div>

        {/* Document Canvas Body */}
        <div className="flex-1 overflow-auto p-6 bg-slate-200/50 flex items-center justify-center min-h-[360px]">
          {documentData ? (
            <div className="max-w-full shadow-lg rounded-lg overflow-hidden bg-white border border-slate-300">
              <img
                src={documentData}
                alt={`Proof document for ${referenceId}`}
                className="max-h-[500px] w-auto object-contain mx-auto"
              />
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-lg border border-slate-200 max-w-sm">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No Document File Attached</p>
              <p className="text-xs text-slate-500 mt-1">
                Authorized administrators can upload digital invoices, official receipts, or collection sheets for this transaction.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Official Treasury Repository Document Verification</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
