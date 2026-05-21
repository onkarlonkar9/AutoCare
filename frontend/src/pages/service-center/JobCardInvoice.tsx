import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Printer, Pencil, Save, RotateCcw, Plus, Trash2, Zap, Battery, Droplets, PenTool, Calendar, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobCard } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppRouter, DemoLink as Link } from '@/hooks/useAppRouter';
import { parseJobNotes, isInSpec, AlignmentSpecKey, ALIGNMENT_SPECS } from '@/lib/jobCardStandards';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { JobCardRow } from '@/types/backendRows';

const INVOICE_GUARD_KEY = 'sc-invoice-guard-v1';

type LineItem = {
  description: string;
  qty: number;
  rate: number;
};

type InvoiceDraft = {
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;
  paymentMode: string;
  serviceCenterName: string;
  serviceCenterPhone: string;
  serviceCenterEmail: string;
  serviceCenterAddress: string;
  serviceCenterGstin: string;
  serviceCenterPan: string;
  billToName: string;
  billToPhone: string;
  billToAddress: string;
  billToGstin: string;
  vehicleNo: string;
  vehicleModel: string;
  odometerKm: string;
  mechanic: string;
  complaint: string;
  labourItems: LineItem[];
  partsItems: LineItem[];
  discount: number;
  otherCharges: number;
  cgstRate: number;
  sgstRate: number;
  notes: string;
  terms: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNo: string;
  bankIfsc: string;
  gatePassNo: string;
  gatePassDate: string;
  gateOutTime: string;
  receiverName: string;
  receiverPhone: string;
  receiverIdRef: string;
  kmOut: string;
  fuelLevelOut: string;
  fuelLevelIn: string;
  engineNo: string;
  chassisNo: string;
  complaintCategory: string;
  gateRemarks: string;
};

type JobCardMeta = {
  engineNumber?: string;
  chassisNumber?: string;
  fuelLevelIn?: string;
  complaintCategory?: string;
  customerConcerns?: string[];
};

type JobCardWithMeta = JobCardRow & {
  notes?: string | null;
  job_card_meta?: JobCardMeta;
};

const InvoiceAlignmentGauge = ({ label, value, specKey }: { label: string, value: string | number | undefined, specKey: AlignmentSpecKey }) => {
  const inSpec = isInSpec(value, specKey);
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100">
      <span className="text-[10px] font-black text-slate-500 uppercase">{label}</span>
      <span className={`text-sm font-mono font-bold ${inSpec === true ? 'text-emerald-600' : inSpec === false ? 'text-rose-600' : 'text-slate-400'}`}>
        {value ?? '--'}°
      </span>
    </div>
  );
};

const InvoiceAlignmentCard = ({ label, value, specKey }: { label: string, value: string | number | undefined, specKey: AlignmentSpecKey }) => {
  const inSpec = isInSpec(value, specKey);
  const spec = ALIGNMENT_SPECS[specKey];
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center text-center">
      <span className="text-[10px] font-black text-slate-400 uppercase mb-2 leading-tight h-5 flex items-center">{label}</span>
      <span className={`text-xl font-black font-mono mb-1 ${inSpec === true ? 'text-emerald-600' : inSpec === false ? 'text-rose-600' : 'text-slate-400'}`}>
        {value ?? '--'}°
      </span>
      <span className="text-[9px] font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full">
        SPEC: {spec.min}/{spec.max}
      </span>
    </div>
  );
};

const JobCardInvoice = () => {
  const { params, navigate } = useAppRouter();
  const id = params.id;
  const { data: job, isLoading } = useJobCard(id);
  const { profile } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [draft, setDraft] = useState<InvoiceDraft | null>(null);

  const storageKey = useMemo(() => (job ? `invoice-draft-${job.id}` : ''), [job]);
  const meta = useMemo(() => parseJobNotes(job?.notes ?? '').meta, [job?.notes]);

  const invoiceGuard = useMemo(() => {
    try {
      const raw = localStorage.getItem(INVOICE_GUARD_KEY);
      if (!raw) return { blocked: false, missingFields: [] as string[] };
      const parsed = JSON.parse(raw) as { blocked?: boolean; missingFields?: string[] };
      return {
        blocked: !!parsed.blocked,
        missingFields: Array.isArray(parsed.missingFields) ? parsed.missingFields : [],
      };
    } catch {
      return { blocked: false, missingFields: [] as string[] };
    }
  }, []);

  const handlePrint = () => {
    if (invoiceGuard.blocked) {
      toast.error(`Invoice generation blocked: ${invoiceGuard.missingFields.join(', ')}`);
      return;
    }
    window.print();
  };

  const updateDraft = <K extends keyof InvoiceDraft>(key: K, value: InvoiceDraft[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateLineItem = (section: 'labourItems' | 'partsItems', index: number, patch: Partial<LineItem>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const nextItems = [...prev[section]];
      nextItems[index] = { ...nextItems[index], ...patch };
      return { ...prev, [section]: nextItems };
    });
  };

  const addLineItem = (section: 'labourItems' | 'partsItems') => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: [...prev[section], { description: '', qty: 1, rate: 0 }],
      };
    });
  };

  const removeLineItem = (section: 'labourItems' | 'partsItems', index: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      if (prev[section].length <= 1) return prev;
      return {
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index),
      };
    });
  };

  const saveDraft = () => {
    if (!draft || !storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(draft));
    setIsEditMode(false);
  };

  const resetDraft = () => {
    if (!job) return;
    const fresh = createDefaultDraft(job, profile?.name ?? 'Service Center', profile?.phone ?? '', profile?.email ?? '');
    setDraft(fresh);
    if (storageKey) localStorage.removeItem(storageKey);
    setIsEditMode(false);
  };

  useEffect(() => {
    if (!job || !storageKey) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as InvoiceDraft;
        setDraft(parsed);
        return;
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
    setDraft(createDefaultDraft(job, profile?.name ?? 'Service Center', profile?.phone ?? '', profile?.email ?? ''));
  }, [job, profile?.name, profile?.phone, profile?.email, storageKey]);

  if (isLoading) return <div className="space-y-4 p-8"><Skeleton className="h-8 w-48" /><Skeleton className="h-[600px] rounded-xl" /></div>;
  if (!job) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Job card not found</p>
      <Link to="/service-center/jobs"><Button variant="outline" className="mt-4">Back</Button></Link>
    </div>
  );

  if (!draft) return null;

  const jobNumber = `JC-${job.id.slice(0, 8).toUpperCase()}`;
  const labourSubtotal = draft.labourItems.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const partsSubtotal = draft.partsItems.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const taxableAmount = Math.max(0, labourSubtotal + partsSubtotal + draft.otherCharges - draft.discount);
  const cgst = taxableAmount * (draft.cgstRate / 100);
  const sgst = taxableAmount * (draft.sgstRate / 100);
  const grandTotal = isNaN(taxableAmount + cgst + sgst) ? 0 : (taxableAmount + cgst + sgst);

  return (
    <div className="max-w-5xl mx-auto">
      {invoiceGuard.blocked && (
        <div className="print:hidden mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Invoice generation is blocked by workshop settings. Missing critical fields: {invoiceGuard.missingFields.join(', ')}.
        </div>
      )}

      {/* Screen-only toolbar */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/service-center/jobs/${job.id}`)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Job Card
        </Button>
        <div className="flex flex-wrap gap-2">
          {!isEditMode ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)} className="gap-2">
              <Pencil className="h-4 w-4" /> Edit Invoice
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={saveDraft} className="gap-2">
                <Save className="h-4 w-4" /> Save Draft
              </Button>
              <Button variant="outline" size="sm" onClick={resetDraft} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2" disabled={invoiceGuard.blocked}>
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
        </div>
      </div>

      <div className="print:hidden mb-4 text-xs text-muted-foreground">
        Edit invoice fields, save draft, then use <span className="font-medium">Print / Save PDF</span> and choose <span className="font-medium">Save as PDF</span> in the print dialog.
      </div>

      {/* ===== PRINTABLE INVOICE ===== */}
      <div
        id="print-invoice"
        className="bg-white text-slate-900 print:text-black print:bg-white rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:rounded-none"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* ---- HEADER ---- */}
        <div className="border-b-[6px] border-slate-900 p-8 pb-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Tax Invoice</h1>
              <p className="text-sm text-slate-500 font-medium tracking-wide">Original for Recipient</p>
            </div>
            <div className="text-right flex flex-col items-end">
              {isEditMode ? (
                <div className="space-y-2 print:hidden w-72 mb-4">
                  <Input value={draft.serviceCenterName} onChange={(e) => updateDraft('serviceCenterName', e.target.value)} />
                  <Input value={draft.serviceCenterAddress} onChange={(e) => updateDraft('serviceCenterAddress', e.target.value)} placeholder="Service center address" />
                  <Input value={draft.serviceCenterPhone} onChange={(e) => updateDraft('serviceCenterPhone', e.target.value)} placeholder="Phone" />
                  <Input value={draft.serviceCenterEmail} onChange={(e) => updateDraft('serviceCenterEmail', e.target.value)} placeholder="Email" />
                  <Input value={draft.serviceCenterGstin} onChange={(e) => updateDraft('serviceCenterGstin', e.target.value)} placeholder="GSTIN" />
                  <Input value={draft.serviceCenterPan} onChange={(e) => updateDraft('serviceCenterPan', e.target.value)} placeholder="PAN" />
                </div>
              ) : null}
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{draft.serviceCenterName}</h2>
              <div className="mt-2 space-y-0.5 text-sm text-slate-500 text-right max-w-sm">
                <p>{draft.serviceCenterAddress}</p>
                <div className="flex gap-3 justify-end pt-1">
                  <p>{draft.serviceCenterPhone}</p>
                  <p>&bull;</p>
                  <p>{draft.serviceCenterEmail}</p>
                </div>
                <div className="flex justify-end gap-4 pt-1 text-xs">
                  <p><span className="font-semibold text-slate-700">GSTIN:</span> {draft.serviceCenterGstin || 'N/A'}</p>
                  <p><span className="font-semibold text-slate-700">PAN:</span> {draft.serviceCenterPan || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---- INVOICE META ---- */}
        <div className="grid grid-cols-2 gap-0 border-b border-slate-200">
          <div className="p-8 border-r border-slate-200 space-y-2">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-slate-500 font-medium">Invoice No.</span>
              <span className="font-bold text-slate-900">{draft.invoiceNo}</span>
              <span className="text-slate-500 font-medium">Job Card No.</span>
              <span className="font-mono text-slate-900">{jobNumber}</span>
              <span className="text-slate-500 font-medium">Invoice Date</span>
              <span className="text-slate-900">{formatDate(draft.invoiceDate)}</span>
              <span className="text-slate-500 font-medium">Due Date</span>
              <span className="text-slate-900">{formatDate(draft.dueDate)}</span>
              <span className="text-slate-500 font-medium pt-2 border-t border-slate-100">Place of Supply</span>
              <span className="text-slate-900 pt-2 border-t border-slate-100">{draft.placeOfSupply || 'N/A'}</span>
              <span className="text-slate-500 font-medium">Payment Mode</span>
              <span className="text-slate-900">{draft.paymentMode || 'N/A'}</span>
              <span className="text-slate-500 font-medium">Payment Status</span>
              <span className={`font-semibold ${job.status === 'delivered' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {job.status === 'delivered' ? 'PAID' : 'PENDING'}
              </span>
            </div>
            {isEditMode && (
              <div className="grid grid-cols-2 gap-2 mt-4 print:hidden">
                <Input value={draft.invoiceNo} onChange={(e) => updateDraft('invoiceNo', e.target.value)} placeholder="Invoice number" />
                <Input type="date" value={draft.invoiceDate} onChange={(e) => updateDraft('invoiceDate', e.target.value)} />
                <Input type="date" value={draft.dueDate} onChange={(e) => updateDraft('dueDate', e.target.value)} />
                <Input value={draft.placeOfSupply} onChange={(e) => updateDraft('placeOfSupply', e.target.value)} placeholder="Place of supply" />
                <Input value={draft.paymentMode} onChange={(e) => updateDraft('paymentMode', e.target.value)} placeholder="Payment mode" />
              </div>
            )}
          </div>
          <div className="p-8 pb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Bill To</p>
            <p className="text-xl font-bold text-slate-900 tracking-tight">{draft.billToName}</p>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p>{draft.billToPhone}</p>
              <p className="max-w-[250px]">{draft.billToAddress || 'N/A'}</p>
              <p className="pt-2"><span className="font-medium text-slate-500">GSTIN:</span> {draft.billToGstin || 'N/A'}</p>
            </div>
            {isEditMode && (
              <div className="space-y-2 mt-4 print:hidden">
                <Input value={draft.billToName} onChange={(e) => updateDraft('billToName', e.target.value)} placeholder="Customer name" />
                <Input value={draft.billToPhone} onChange={(e) => updateDraft('billToPhone', e.target.value)} placeholder="Customer phone" />
                <Input value={draft.billToAddress} onChange={(e) => updateDraft('billToAddress', e.target.value)} placeholder="Customer address" />
                <Input value={draft.billToGstin} onChange={(e) => updateDraft('billToGstin', e.target.value)} placeholder="Customer GSTIN" />
              </div>
            )}
          </div>
        </div>

        {/* ---- VEHICLE INFO ---- */}
        <div className="bg-slate-50 print:bg-slate-50 p-8 border-b border-slate-200">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Vehicle Details</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Reg. Number</p>
              <p className="font-mono font-bold text-slate-900 mt-1">{draft.vehicleNo}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Make / Model</p>
              <p className="font-medium text-slate-900 mt-1">{draft.vehicleModel}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Engine Number</p>
              <p className="font-mono text-slate-900 mt-1">{draft.engineNo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Chassis Number</p>
              <p className="font-mono text-slate-900 mt-1">{draft.chassisNo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Odometer</p>
              <p className="font-medium text-slate-900 mt-1">{Number(draft.odometerKm || 0).toLocaleString('en-IN')} km</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Technician</p>
              <p className="font-medium text-slate-900 mt-1">{draft.mechanic || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Fuel Level (In)</p>
              <p className="font-medium text-slate-900 mt-1">{draft.fuelLevelIn || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Category</p>
              <p className="font-medium text-slate-900 mt-1 capitalize">{draft.complaintCategory?.replace('_', ' ') || 'General'}</p>
            </div>
          </div>
          {isEditMode && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 print:hidden">
              <Input value={draft.vehicleNo} onChange={(e) => updateDraft('vehicleNo', e.target.value)} placeholder="Vehicle number" />
              <Input value={draft.vehicleModel} onChange={(e) => updateDraft('vehicleModel', e.target.value)} placeholder="Vehicle model" />
              <Input value={draft.engineNo} onChange={(e) => updateDraft('engineNo', e.target.value)} placeholder="Engine number" />
              <Input value={draft.chassisNo} onChange={(e) => updateDraft('chassisNo', e.target.value)} placeholder="Chassis number" />
              <Input value={draft.odometerKm} onChange={(e) => updateDraft('odometerKm', e.target.value)} placeholder="Odometer" />
              <Input value={draft.mechanic} onChange={(e) => updateDraft('mechanic', e.target.value)} placeholder="Technician" />
              <Input value={draft.fuelLevelIn} onChange={(e) => updateDraft('fuelLevelIn', e.target.value)} placeholder="Fuel Level" />
            </div>
          )}
        </div>

        {/* ---- PROBLEM DESCRIPTION ---- */}
        <div className="p-8 border-b border-slate-200">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Problem Description</p>
          <p className="text-sm text-slate-700 leading-relaxed max-w-4xl whitespace-pre-wrap">{draft.complaint}</p>
          {isEditMode && (
            <Textarea
              className="mt-4 print:hidden"
              value={draft.complaint}
              onChange={(e) => updateDraft('complaint', e.target.value)}
              rows={3}
            />
          )}
        </div>

        {/* ---- SERVICE TASKS TABLE ---- */}
        <div className="p-8 border-b border-slate-200">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Service & Labour Charges</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 print:bg-slate-50">
                <th className="text-left py-3 px-4 text-slate-500 font-semibold w-12 rounded-l-md">#</th>
                <th className="text-left py-3 pr-4 text-slate-500 font-semibold">Description</th>
                <th className="text-center py-3 text-slate-500 font-semibold w-20">Qty</th>
                <th className="text-right py-3 text-slate-500 font-semibold w-32">Rate (₹)</th>
                <th className="text-right py-3 px-4 text-slate-500 font-semibold w-32 rounded-r-md">Amount (₹)</th>
                {isEditMode && <th className="print:hidden w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {draft.labourItems.map((task, i) => {
                const amount = task.qty * task.rate;
                return (
                  <tr key={i} className="group hover:bg-slate-50/50 print:hover:bg-transparent transition-colors">
                    <td className="py-3 px-4 text-slate-400">{i + 1}</td>
                    <td className="py-3 pr-4 text-slate-900 font-medium">
                      {isEditMode ? (
                        <Input
                          value={task.description}
                          onChange={(e) => updateLineItem('labourItems', i, { description: e.target.value })}
                        />
                      ) : task.description}
                    </td>
                    <td className="py-3 text-center text-slate-700">
                      {isEditMode ? (
                        <Input
                          type="number"
                          min={1}
                          value={task.qty}
                          onChange={(e) => updateLineItem('labourItems', i, { qty: parseNumber(e.target.value, 1) })}
                        />
                      ) : task.qty}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-700">
                      {isEditMode ? (
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={task.rate}
                          onChange={(e) => updateLineItem('labourItems', i, { rate: parseNumber(e.target.value) })}
                        />
                      ) : task.rate.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">{amount.toFixed(2)}</td>
                    {isEditMode && (
                      <td className="print:hidden py-1">
                        <Button variant="ghost" size="sm" onClick={() => removeLineItem('labourItems', i)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
              <tr className="border-t border-slate-200">
                <td colSpan={4} className="py-4 pr-4 text-right font-semibold text-slate-500 uppercase tracking-wide text-xs">Labour Subtotal</td>
                <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">₹{labourSubtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          {isEditMode && (
            <div className="print:hidden mt-4">
              <Button variant="outline" size="sm" onClick={() => addLineItem('labourItems')} className="gap-2 border-dashed">
                <Plus className="h-4 w-4" /> Add Labour Item
              </Button>
            </div>
          )}
        </div>

        {/* ---- PARTS TABLE ---- */}
        <div className="p-8 border-b border-slate-200">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Parts & Materials</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 print:bg-slate-50">
                <th className="text-left py-3 px-4 text-slate-500 font-semibold w-12 rounded-l-md">#</th>
                <th className="text-left py-3 pr-4 text-slate-500 font-semibold">Part Name</th>
                <th className="text-center py-3 text-slate-500 font-semibold w-20">Qty</th>
                <th className="text-right py-3 text-slate-500 font-semibold w-32">Rate (₹)</th>
                <th className="text-right py-3 px-4 text-slate-500 font-semibold w-32 rounded-r-md">Amount (₹)</th>
                {isEditMode && <th className="print:hidden w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {draft.partsItems.map((part, i) => {
                const amount = part.qty * part.rate;
                return (
                  <tr key={i} className="group hover:bg-slate-50/50 print:hover:bg-transparent transition-colors">
                    <td className="py-3 px-4 text-slate-400">{i + 1}</td>
                    <td className="py-3 pr-4 text-slate-900 font-medium">
                      {isEditMode ? (
                        <Input
                          value={part.description}
                          onChange={(e) => updateLineItem('partsItems', i, { description: e.target.value })}
                        />
                      ) : part.description}
                    </td>
                    <td className="py-3 text-center text-slate-700">
                      {isEditMode ? (
                        <Input
                          type="number"
                          min={1}
                          value={part.qty}
                          onChange={(e) => updateLineItem('partsItems', i, { qty: parseNumber(e.target.value, 1) })}
                        />
                      ) : part.qty}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-700">
                      {isEditMode ? (
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={part.rate}
                          onChange={(e) => updateLineItem('partsItems', i, { rate: parseNumber(e.target.value) })}
                        />
                      ) : part.rate.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">{amount.toFixed(2)}</td>
                    {isEditMode && (
                      <td className="print:hidden py-1">
                        <Button variant="ghost" size="sm" onClick={() => removeLineItem('partsItems', i)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
              <tr className="border-t border-slate-200">
                <td colSpan={4} className="py-4 pr-4 text-right font-semibold text-slate-500 uppercase tracking-wide text-xs">Parts Subtotal</td>
                <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">₹{partsSubtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          {isEditMode && (
            <div className="print:hidden mt-4">
              <Button variant="outline" size="sm" onClick={() => addLineItem('partsItems')} className="gap-2 border-dashed">
                <Plus className="h-4 w-4" /> Add Part Item
              </Button>
            </div>
          )}
        </div>

        {/* ---- TOTALS ---- */}
        <div className="p-8 border-b border-slate-200">
          <div className="flex justify-end">
            <div className="w-80 space-y-3 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Labour Charges</span>
                <span className="font-mono text-slate-900">₹{labourSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Parts & Materials</span>
                <span className="font-mono text-slate-900">₹{partsSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Other Charges</span>
                <span className="font-mono text-slate-900">₹{draft.otherCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-rose-500">
                <span>Discount</span>
                <span className="font-mono">- ₹{draft.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-900">Taxable Amount</span>
                <span className="font-mono font-bold text-slate-900">₹{taxableAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>CGST @ {draft.cgstRate}%</span>
                <span className="font-mono text-slate-900">₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>SGST @ {draft.sgstRate}%</span>
                <span className="font-mono text-slate-900">₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-slate-900 pt-4 mt-2">
                <span className="text-xl font-black text-slate-900 tracking-tight">GRAND TOTAL</span>
                <span className="text-2xl font-black font-mono text-slate-900">₹{grandTotal.toFixed(2)}</span>
              </div>
              {isEditMode && (
                <div className="grid grid-cols-2 gap-3 mt-6 print:hidden">
                  <Input type="number" min={0} step="0.01" value={draft.otherCharges} onChange={(e) => updateDraft('otherCharges', parseNumber(e.target.value))} placeholder="Other charges" />
                  <Input type="number" min={0} step="0.01" value={draft.discount} onChange={(e) => updateDraft('discount', parseNumber(e.target.value))} placeholder="Discount" />
                  <Input type="number" min={0} step="0.01" value={draft.cgstRate} onChange={(e) => updateDraft('cgstRate', parseNumber(e.target.value))} placeholder="CGST %" />
                  <Input type="number" min={0} step="0.01" value={draft.sgstRate} onChange={(e) => updateDraft('sgstRate', parseNumber(e.target.value))} placeholder="SGST %" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- AMOUNT IN WORDS ---- */}
        <div className="px-8 py-4 border-b border-slate-200 bg-slate-50 print:bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Amount in Words</p>
          <p className="text-sm font-medium text-slate-900 italic">{numberToWords(Math.round(grandTotal))} Rupees Only</p>
        </div>

        {/* ---- NOTES ---- */}
        <div className="px-8 py-6 border-b border-slate-200">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Notes</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{draft.notes || 'N/A'}</p>
          {isEditMode && (
            <Textarea className="mt-3 print:hidden" rows={3} value={draft.notes} onChange={(e) => updateDraft('notes', e.target.value)} />
          )}
        </div>

        {/* ---- WARRANTY & TERMS ---- */}
        <div className="p-8 border-b border-slate-200">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Terms & Conditions</p>
          <pre className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed font-sans">{draft.terms}</pre>
          {isEditMode && (
            <Textarea className="mt-4 print:hidden" rows={7} value={draft.terms} onChange={(e) => updateDraft('terms', e.target.value)} />
          )}
        </div>

        {/* ---- BANK DETAILS ---- */}
        <div className="p-8 border-b border-slate-200 bg-slate-50/50 print:bg-slate-50/50">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Bank Details</p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-sm text-slate-700">
            <p className="flex justify-between border-b border-slate-200/50 pb-1"><span className="text-slate-500">Bank:</span> <span className="font-medium text-slate-900">{draft.bankName || 'N/A'}</span></p>
            <p className="flex justify-between border-b border-slate-200/50 pb-1"><span className="text-slate-500">A/C Name:</span> <span className="font-medium text-slate-900">{draft.bankAccountName || 'N/A'}</span></p>
            <p className="flex justify-between border-b border-slate-200/50 pb-1"><span className="text-slate-500">A/C No:</span> <span className="font-mono font-medium text-slate-900">{draft.bankAccountNo || 'N/A'}</span></p>
            <p className="flex justify-between border-b border-slate-200/50 pb-1"><span className="text-slate-500">IFSC:</span> <span className="font-mono font-medium text-slate-900">{draft.bankIfsc || 'N/A'}</span></p>
          </div>
          {isEditMode && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 print:hidden">
              <Input value={draft.bankName} onChange={(e) => updateDraft('bankName', e.target.value)} placeholder="Bank name" />
              <Input value={draft.bankAccountName} onChange={(e) => updateDraft('bankAccountName', e.target.value)} placeholder="Account name" />
              <Input value={draft.bankAccountNo} onChange={(e) => updateDraft('bankAccountNo', e.target.value)} placeholder="Account number" />
              <Input value={draft.bankIfsc} onChange={(e) => updateDraft('bankIfsc', e.target.value)} placeholder="IFSC code" />
            </div>
          )}
        </div>

        {/* ---- SIGNATURES ---- */}
        <div className="grid grid-cols-2 gap-0 pt-8">
          <div className="p-8 border-r border-slate-200">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-20 text-center">Customer Acknowledgement</p>
            <div className="border-t border-slate-300 pt-3 text-center">
              <p className="text-sm font-medium text-slate-900">{draft.billToName || job.customer_name}</p>
              <p className="text-xs text-slate-500 mt-1">Authorized Signature</p>
            </div>
          </div>
          <div className="p-8">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-20 text-center">For {profile?.name || 'Service Center'}</p>
            <div className="border-t border-slate-300 pt-3 text-center">
              <p className="text-sm font-medium text-slate-900">Authorised Signatory</p>
              <p className="text-xs text-slate-500 mt-1">Signature & Stamp</p>
            </div>
          </div>
        </div>

        {/* ---- FOOTER ---- */}
        <div className="bg-slate-900 text-slate-300 print:text-black print:bg-slate-100 text-center py-4 text-xs font-medium tracking-widest uppercase mt-4">
          Thank you for your business. Drive safe.
        </div>

        {/* ---- PAGE 2: GATE PASS ---- */}
        <div className="gate-pass-page bg-white text-slate-900 mt-8 print:mt-0 border border-slate-200 print:border-none rounded-xl print:rounded-none shadow-lg print:shadow-none">
          <div className="border-b-[6px] border-slate-900 p-8 pb-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-4xl font-black tracking-tight uppercase text-slate-900">Vehicle Gate Pass</h2>
                <p className="text-sm font-medium tracking-wide text-slate-500">Vehicle release authorization slip</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tracking-tight text-slate-900">{draft.serviceCenterName}</p>
                <p className="text-sm text-slate-500 mt-1">{draft.serviceCenterPhone || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-0 border-b border-slate-200">
            <div className="p-8 border-r border-slate-200">
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <span className="text-slate-500 font-medium">Gate Pass No.</span>
                <span className="font-bold text-slate-900">{draft.gatePassNo}</span>
                <span className="text-slate-500 font-medium border-b border-slate-100 pb-2 mb-1">Date</span>
                <span className="text-slate-900 border-b border-slate-100 pb-2 mb-1">{formatDate(draft.gatePassDate)}</span>
                <span className="text-slate-500 font-medium">Gate Out Time</span>
                <span className="text-slate-900">{draft.gateOutTime || 'N/A'}</span>
                <span className="text-slate-500 font-medium">Ref Invoice</span>
                <span className="text-slate-900">{draft.invoiceNo}</span>
              </div>
              {isEditMode && (
                <div className="grid grid-cols-2 gap-3 mt-6 print:hidden">
                  <Input value={draft.gatePassNo} onChange={(e) => updateDraft('gatePassNo', e.target.value)} placeholder="Gate pass number" />
                  <Input type="date" value={draft.gatePassDate} onChange={(e) => updateDraft('gatePassDate', e.target.value)} />
                  <Input type="time" value={draft.gateOutTime} onChange={(e) => updateDraft('gateOutTime', e.target.value)} />
                </div>
              )}
            </div>
            <div className="p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Vehicle & Receiver</p>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Vehicle No:</span> <span className="font-semibold text-slate-900">{draft.vehicleNo}</span></p>
                <p className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Model:</span> <span className="font-semibold text-slate-900">{draft.vehicleModel}</span></p>
                <p className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Released To:</span> <span className="font-semibold text-slate-900">{draft.receiverName || draft.billToName || 'N/A'}</span></p>
                <p className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Receiver Phone:</span> <span className="font-semibold text-slate-900">{draft.receiverPhone || 'N/A'}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">ID Reference:</span> <span className="font-semibold text-slate-900">{draft.receiverIdRef || 'N/A'}</span></p>
              </div>
              {isEditMode && (
                <div className="space-y-3 mt-6 print:hidden">
                  <Input value={draft.receiverName} onChange={(e) => updateDraft('receiverName', e.target.value)} placeholder="Receiver name" />
                  <Input value={draft.receiverPhone} onChange={(e) => updateDraft('receiverPhone', e.target.value)} placeholder="Receiver phone" />
                  <Input value={draft.receiverIdRef} onChange={(e) => updateDraft('receiverIdRef', e.target.value)} placeholder="ID proof reference" />
                </div>
              )}
            </div>
          </div>

          <div className="p-8 border-b border-slate-200 bg-slate-50/50 print:bg-slate-50/50">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Release Checklist</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                <p className="text-slate-500 text-xs font-medium mb-1">KM Out</p>
                <p className="font-semibold text-slate-900">{draft.kmOut || 'N/A'}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                <p className="text-slate-500 text-xs font-medium mb-1">Fuel Level</p>
                <p className="font-semibold text-slate-900">{draft.fuelLevelOut || 'N/A'}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                <p className="text-slate-500 text-xs font-medium mb-1">Invoice Settled</p>
                <p className={`font-semibold ${job.status === 'delivered' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {job.status === 'delivered' ? 'Yes' : 'Pending'}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                <p className="text-slate-500 text-xs font-medium mb-1">Keys Returned</p>
                <p className="font-semibold text-slate-900">Yes</p>
              </div>
            </div>
            {isEditMode && (
              <div className="grid grid-cols-2 gap-3 mt-4 print:hidden">
                <Input value={draft.kmOut} onChange={(e) => updateDraft('kmOut', e.target.value)} placeholder="KM out" />
                <Input value={draft.fuelLevelOut} onChange={(e) => updateDraft('fuelLevelOut', e.target.value)} placeholder="Fuel level (e.g. Half)" />
              </div>
            )}
          </div>

          <div className="p-8 border-b border-slate-200">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Gate Remarks</p>
            <p className="text-sm whitespace-pre-wrap text-slate-700">{draft.gateRemarks || 'N/A'}</p>
            {isEditMode && (
              <Textarea
                className="mt-4 print:hidden"
                rows={3}
                value={draft.gateRemarks}
                onChange={(e) => updateDraft('gateRemarks', e.target.value)}
              />
            )}
          </div>

          <div className="grid grid-cols-2 pt-8">
            <div className="p-8 border-r border-slate-200">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-20 text-center">Gate Security</p>
              <div className="border-t border-slate-300 pt-3 text-center">
                <p className="text-sm font-medium text-slate-900">Security Officer</p>
                <p className="text-xs text-slate-500 mt-1">Signature</p>
              </div>
            </div>
            <div className="p-8">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-20 text-center">Receiver Acknowledgement</p>
              <div className="border-t border-slate-300 pt-3 text-center">
                <p className="text-sm font-medium text-slate-900">{draft.receiverName || draft.billToName || '________________________'}</p>
                <p className="text-xs text-slate-500 mt-1">Signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---- WHEEL ALIGNMENT REPORT PAGE ---- */}
        {meta?.alignment && (
          <div className="bg-white min-h-[29.7cm] relative print:mt-0 print:shadow-none break-before-page page-break-before-always diagnosis-page mt-12 mx-auto max-w-[21cm] border border-slate-200 print:border-none shadow-lg print:shadow-none rounded-xl print:rounded-none">
            {/* ---- HEADER MATCHING TAX INVOICE ---- */}
            <div className="border-b-[6px] border-slate-900 p-8 pb-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Alignment Report</h1>
                  <p className="text-sm text-slate-500 font-medium tracking-wide italic">Steering & Suspension Diagnostic</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{draft.serviceCenterName}</h2>
                  <div className="mt-2 space-y-0.5 text-sm text-slate-500 text-right max-w-sm">
                    <p>{draft.serviceCenterAddress}</p>
                    <div className="flex gap-3 justify-end pt-1">
                      <p>{draft.serviceCenterPhone}</p>
                      <p>&bull;</p>
                      <p>{draft.serviceCenterEmail}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>REPORT ID: #{job.id.slice(0, 6).toUpperCase()}-WA</span>
                    <span>DATE: {formatDate(meta.alignment.lastChecked)}</span>
                  </div>
                </div>
              </div>
            </div>

             <div className="p-10">
                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-6">
                    <h2 className="text-xs font-black text-slate-900 border-b-2 border-slate-900 pb-1 mb-4 uppercase tracking-[0.1em]">FRONT AXLE READINGS</h2>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Left Front</p>
                        <InvoiceAlignmentGauge label="Camber" value={meta.alignment.leftFront.camber} specKey="camberFront" />
                        <InvoiceAlignmentGauge label="Caster" value={meta.alignment.leftFront.caster} specKey="casterFront" />
                        <InvoiceAlignmentGauge label="Toe" value={meta.alignment.leftFront.toe} specKey="toeFront" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Right Front</p>
                        <InvoiceAlignmentGauge label="Camber" value={meta.alignment.rightFront.camber} specKey="camberFront" />
                        <InvoiceAlignmentGauge label="Caster" value={meta.alignment.rightFront.caster} specKey="casterFront" />
                        <InvoiceAlignmentGauge label="Toe" value={meta.alignment.rightFront.toe} specKey="toeFront" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-xs font-black text-slate-900 border-b-2 border-slate-900 pb-1 mb-4 uppercase tracking-[0.1em]">REAR AXLE READINGS</h2>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Left Rear</p>
                        <InvoiceAlignmentGauge label="Camber" value={meta.alignment.leftRear.camber} specKey="camberRear" />
                        <InvoiceAlignmentGauge label="Toe" value={meta.alignment.leftRear.toe} specKey="toeRear" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Right Rear</p>
                        <InvoiceAlignmentGauge label="Camber" value={meta.alignment.rightRear.camber} specKey="camberRear" />
                        <InvoiceAlignmentGauge label="Toe" value={meta.alignment.rightRear.toe} specKey="toeRear" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200">
                  <h2 className="text-xs font-black text-slate-900 border-b-2 border-slate-900 pb-1 mb-6 uppercase tracking-[0.1em]">Centerline & Steering Alignment</h2>
                  <div className="grid grid-cols-4 gap-4">
                     <InvoiceAlignmentCard label="Front Total Toe" value={meta.alignment.centerline.frontTotalToe} specKey="frontTotalToe" />
                     <InvoiceAlignmentCard label="Rear Total Toe" value={meta.alignment.centerline.rearTotalToe} specKey="rearTotalToe" />
                     <InvoiceAlignmentCard label="Steer Ahead" value={meta.alignment.centerline.steerAhead} specKey="steerAhead" />
                     <InvoiceAlignmentCard label="Thrust Angle" value={meta.alignment.centerline.thrustAngle} specKey="thrustAngle" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10 mt-12">
                   <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Calendar className="w-12 h-12" />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-rose-500" />
                        <span className="text-xs font-black uppercase text-slate-900">Maintenance Recommendation</span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 mb-2 leading-relaxed">Regular alignment checks improve tyre life and fuel efficiency. Based on current status, we recommend your next check:</p>
                      <p className="text-3xl font-black text-rose-600 italic">In {meta.alignment.nextCheckDate}</p>
                   </div>
                   
                   <div className="p-6 bg-slate-900 text-white rounded-xl relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <PenTool className="w-12 h-12" />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <PenTool className="w-5 h-5 text-rose-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-100">Technician Notes</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed italic opacity-85">"{meta.alignment.technicianNotes || 'Alignment adjusted to within manufacturer specifications. Steering wheel centered and suspension components inspected.'}"</p>
                   </div>
                </div>

                <div className="mt-auto pt-16 grid grid-cols-2 gap-10">
                  <div className="text-center">
                    <div className="h-20 border-b border-slate-300 mb-2"></div>
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Technician Signature</p>
                  </div>
                  <div className="text-center">
                    <div className="h-20 border-b border-slate-300 mb-2"></div>
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Quality Inspector</p>
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* ---- BATTERY DIAGNOSTIC REPORT PAGE ---- */}
        {meta?.battery && (
          <div className="bg-white min-h-[29.7cm] relative print:mt-0 print:shadow-none break-before-page page-break-before-always diagnosis-page mt-12 mx-auto max-w-[21cm] border border-slate-200 print:border-none shadow-lg print:shadow-none rounded-xl print:rounded-none">
            {/* ---- HEADER MATCHING TAX INVOICE ---- */}
            <div className="border-b-[6px] border-slate-900 p-8 pb-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Battery Report</h1>
                  <p className="text-sm text-slate-500 font-medium tracking-wide italic">Electrical System & Capacity Analysis</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{draft.serviceCenterName}</h2>
                  <div className="mt-2 space-y-0.5 text-sm text-slate-500 text-right max-w-sm">
                    <p>{draft.serviceCenterAddress}</p>
                    <div className="flex gap-3 justify-end pt-1">
                      <p>{draft.serviceCenterPhone}</p>
                      <p>&bull;</p>
                      <p>{draft.serviceCenterEmail}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>REPORT ID: #{job.id.slice(0, 6).toUpperCase()}-BT</span>
                    <span>DATE: {formatDate(meta.alignment?.lastChecked || new Date().toISOString())}</span>
                  </div>
                </div>
              </div>
            </div>

             <div className="p-10">
                <div className="grid grid-cols-3 gap-8">
                   <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-2xl flex flex-col items-center text-center shadow-sm">
                      <div className="p-4 rounded-full bg-amber-100 text-amber-600 mb-4 ring-4 ring-amber-50">
                        <Zap className="w-8 h-8" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tested Voltage</p>
                      <p className="text-4xl font-black font-mono text-slate-900">{meta.battery.voltage}V</p>
                      <Badge className="mt-4 bg-emerald-500 text-white border-0 py-1.5 px-6 font-black tracking-widest text-[10px] uppercase">{Number(meta.battery.voltage) > 12.4 ? 'OPTIMAL' : 'LOW CHARGE'}</Badge>
                   </div>
                   
                   <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-2xl flex flex-col items-center text-center shadow-sm">
                      <div className="p-4 rounded-full bg-blue-100 text-blue-600 mb-4 ring-4 ring-blue-50">
                        <Droplets className="w-8 h-8" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Water Level</p>
                      <p className="text-4xl font-black font-mono text-slate-900">{meta.battery.waterLevel}%</p>
                      <Badge className="mt-4 bg-blue-500 text-white border-0 py-1.5 px-6 font-black tracking-widest text-[10px] uppercase">{Number(meta.battery.waterLevel) > 50 ? 'HEALTHY' : 'NEEDS TOPUP'}</Badge>
                   </div>

                   <div className="p-8 bg-slate-900 rounded-2xl flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-5">
                        <Battery className="w-20 h-20 text-white" />
                      </div>
                      <div className="p-4 rounded-full bg-slate-800 text-amber-500 mb-4 ring-4 ring-slate-800">
                        <Battery className="w-8 h-8" />
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">State of Health (SoH)</p>
                      <p className="text-4xl font-black font-mono text-white">{meta.battery.health}%</p>
                      <div className="mt-4 w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className={`h-full ${meta.battery.health > 70 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} style={{ width: `${meta.battery.health}%` }}></div>
                      </div>
                   </div>
                </div>

                <div className="mt-12 p-8 bg-slate-50 border border-slate-200 rounded-2xl relative">
                   <div className="absolute top-0 left-0 w-1 h-full bg-slate-900 rounded-l-2xl"></div>
                   <h2 className="text-xs font-black text-slate-950 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Info className="w-4 h-4 text-slate-600" /> Professional Diagnostic Summary
                   </h2>
                   <div className="space-y-4 text-sm text-slate-600 font-medium leading-relaxed">
                      <p className="flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>State of Health (SoH) is <span className="text-slate-950 font-black underline decoration-amber-300 decoration-2">{meta.battery.health}%</span>. {meta.battery.health > 80 ? 'The internal battery resistance and load capacity are within excellent parameters.' : 'Battery is starting to show signs of capacity loss.'}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>Resting Terminal Voltage measured at <span className="text-slate-950 font-black">{meta.battery.voltage}V</span>. {Number(meta.battery.voltage) > 12.6 ? 'Charged State: Full' : 'Charged State: Needs Monitoring.'}</span>
                      </p>
                      <p className="flex items-start gap-2 pt-2 border-t border-slate-200 mt-2">
                        <Calendar className="w-4 h-4 text-slate-600" />
                        <span className="font-bold">Next Proactive Health Monitoring: </span>
                        <span className="text-slate-900 font-black italic ml-1 underline tracking-widest uppercase">In {meta.battery.nextCheckDate}</span>
                      </p>
                   </div>
                </div>

                {meta.battery?.technicianNotes && (
                   <div className="mt-8 p-8 bg-slate-900 text-white rounded-2xl relative shadow-xl">
                      <div className="absolute top-0 right-0 p-2 opacity-5">
                         <PenTool className="w-16 h-16" />
                      </div>
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 italic">Official Technician Observations</p>
                      <p className="text-sm font-semibold italic text-slate-300 leading-relaxed">"{meta.battery.technicianNotes || 'Terminals cleaned and protected with petroleum jelly. Electrolyte concentration checked and balanced.'}"</p>
                   </div>
                )}
             </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
            color: black !important;
            margin: 0;
            padding: 0;
          }
          body * { visibility: hidden; }
          #print-invoice, #print-invoice * { visibility: visible; }
          #print-invoice { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none; border: none; }
          .gate-pass-page { page-break-before: always; break-before: page; margin-top: 0 !important; border: top; }
          @page { margin: 0.5cm; size: A4 portrait; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

function parseNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
}

function formatDate(dateValue: string) {
  if (!dateValue) return 'N/A';
  return new Date(dateValue).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function createDefaultDraft(job: JobCardWithMeta, serviceCenterName: string, serviceCenterPhone: string, serviceCenterEmail: string): InvoiceDraft {
  const invoiceDate = job.completed_at ? new Date(job.completed_at) : new Date(job.created_at);
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(invoiceDate.getDate() + 7);

  const totalBase = Math.max(0, Number(job.actual_cost ?? job.estimated_cost ?? 0)) || 0;
  const serviceTasks = Array.isArray(job.service_tasks) && job.service_tasks.length > 0
    ? job.service_tasks
    : ['General Service / Repair Labour'];
  const partsRequired = Array.isArray(job.parts_required) ? job.parts_required : [];
  const labourBase = partsRequired.length > 0 ? totalBase * 0.4 : totalBase;
  const partsBase = partsRequired.length > 0 ? totalBase * 0.6 : 0;
  const labourRate = serviceTasks.length > 0 ? labourBase / serviceTasks.length : labourBase;
  const partsRate = partsRequired.length > 0 ? partsBase / partsRequired.length : 0;

  return {
    invoiceNo: `INV-${job.id.slice(0, 8).toUpperCase()}`,
    invoiceDate: invoiceDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    placeOfSupply: 'India',
    paymentMode: 'Cash / UPI / Card',
    serviceCenterName,
    serviceCenterPhone,
    serviceCenterEmail,
    serviceCenterAddress: '',
    serviceCenterGstin: '',
    serviceCenterPan: '',
    billToName: job.customer_name ?? '',
    billToPhone: job.customer_phone ?? '',
    billToAddress: '',
    billToGstin: '',
    vehicleNo: job.vehicle_number ?? '',
    vehicleModel: job.vehicle_model ?? '',
    odometerKm: String(job.mileage ?? 0),
    mechanic: job.mechanic_name ?? '',
    engineNo: job.job_card_meta?.engineNumber ?? '',
    chassisNo: job.job_card_meta?.chassisNumber ?? '',
    fuelLevelIn: job.job_card_meta?.fuelLevelIn ?? '',
    complaintCategory: job.job_card_meta?.complaintCategory ?? '',
    complaint: job.job_card_meta?.customerConcerns?.length 
      ? job.job_card_meta.customerConcerns.join(', ')
      : (job.problem_description ?? ''),
    labourItems: serviceTasks.map((task: string) => ({
      description: task,
      qty: 1,
      rate: Number(labourRate.toFixed(2)),
    })),
    partsItems: (partsRequired.length > 0 ? partsRequired : [{ description: 'Parts / Materials', qty: 1, rate: Number(partsBase.toFixed(2)) }]).map((item: string | LineItem) => {
      if (typeof item === 'string') {
        return {
          description: item,
          qty: 1,
          rate: Number(partsRate.toFixed(2)),
        };
      }
      return item;
    }),
    discount: 0,
    otherCharges: 0,
    cgstRate: 9,
    sgstRate: 9,
    notes: job.notes ? job.notes.split('[JOB_CARD_META]')[0].trim() : '',
    terms:
      '1. Warranty on parts is as per manufacturer policy. Labour warranty: 30 days from date of service.\n' +
      '2. Vehicle must be collected within 7 days of completion. Storage charges may apply beyond this period.\n' +
      '3. The service center is not responsible for items left inside the vehicle during service.\n' +
      '4. Additional work will be carried out only with customer approval.\n' +
      '5. Payment is due upon delivery of vehicle.\n' +
      '6. This invoice is computer-generated and is valid without signature.\n' +
      '7. All disputes are subject to local jurisdiction.\n' +
      '8. E & O.E. (Errors and Omissions Excepted)',
    bankName: '',
    bankAccountName: '',
    bankAccountNo: '',
    bankIfsc: '',
    gatePassNo: `GP-${job.id.slice(0, 8).toUpperCase()}`,
    gatePassDate: invoiceDate.toISOString().split('T')[0],
    gateOutTime: '',
    receiverName: job.customer_name ?? '',
    receiverPhone: job.customer_phone ?? '',
    receiverIdRef: '',
    kmOut: String(job.mileage ?? 0),
    fuelLevelOut: '',
    gateRemarks: '',
  };
}

// ---- Number to words (Indian system) ----
function numberToWords(n: number): string {
  if (n === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (num: number): string => {
    if (isNaN(num)) return '';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + convert(num % 100) : '');
    if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '');
    if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '');
    // Safety break to prevent infinite recursion on very large numbers or unexpected growth
    if (num >= 10000000000) return 'Large Amount';
    return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '');
  };

  if (isNaN(n)) return 'Zero';
  return convert(n);
}

export default JobCardInvoice;
