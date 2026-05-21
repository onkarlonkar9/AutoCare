import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAddCustomer, useAddMechanic, useCustomers, useJobCards, useMechanics } from '@/hooks/useData';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { PlanManagementPortal } from '@/components/subscription/PlanManagementPortal';
import { 
  Building2, 
  ReceiptIndianRupee, 
  Settings2, 
  Users2, 
  UserPlus, 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Bell, 
  ShieldCheck, 
  Smartphone, 
  MapPin, 
  CreditCard,
  Briefcase,
  Sparkles,
  ChevronRight,
  Info,
  Save,
  RotateCcw,
  Activity,
  Server,
  Zap,
  Megaphone,
  Globe,
  CheckCircle,
  AlertTriangle,
  History as HistoryIcon,
  type LucideIcon
} from 'lucide-react';
import { toast } from 'sonner';

const WORKSHOP_SETTINGS_KEY = 'sc-workshop-settings-v1';

type ShiftSettings = {
  dayShiftStart: string;
  dayShiftEnd: string;
  nightShiftEnabled: boolean;
  nightShiftStart: string;
  nightShiftEnd: string;
  breakMinutes: number;
  autoAssignByShift: boolean;
  allowOvertimeJobs: boolean;
  workingDays: Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', boolean>;
};

const DEFAULT_SHIFT_SETTINGS: ShiftSettings = {
  dayShiftStart: '09:00',
  dayShiftEnd: '18:00',
  nightShiftEnabled: false,
  nightShiftStart: '19:00',
  nightShiftEnd: '23:00',
  breakMinutes: 45,
  autoAssignByShift: true,
  allowOvertimeJobs: false,
  workingDays: {
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: true,
    sun: false,
  },
};

const DAY_OPTIONS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
] as const;

type MechanicShiftProfile = {
  name: string;
  shiftLabel: string;
  start: string;
  end: string;
};

type CustomerProfileEntry = {
  name: string;
  phone: string;
  email: string;
  vehicleNumber: string;
};

type WorkshopSettingsData = {
  workshopName: string;
  workshopPhone: string;
  workshopEmail: string;
  workshopAddress: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  panNumber: string;
  serviceLicenseNo: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  gatePassPrefix: string;
  nextGatePassNumber: number;
  defaultCurrency: string;
  defaultTaxPercent: number;
  defaultLaborRate: number;
  defaultDiscountPercent: number;
  paymentTermsDays: number;
  warrantyDaysDefault: number;
  requireEstimateApproval: boolean;
  requireChecklistCompletion: boolean;
  requireFinalQC: boolean;
  sendDeliverySMS: boolean;
  sendServiceReminder: boolean;
  serviceReminderDays: number;
  lowStockAlertEnabled: boolean;
  lowStockThreshold: number;
  whatsappNotifications: boolean;
  invoiceBlockOnMissingCritical: boolean;
  permissions: Record<RoleKey, PermissionSet>;
  billingRules: BillingRuleEngine;
  approvalWorkflow: ApprovalWorkflow;
  notificationCenter: NotificationCenter;
  slaControls: SlaControls;
  staffCapacity: StaffCapacity;
  backupPolicy: BackupPolicy;
  branchGovernance: BranchGovernance;
};

type SubscriptionStatus = {
  plan: string;
  renewalDate: string;
  billingCycle: string;
  paymentMethod: string;
  isActive: boolean;
  storageUsed: number;
  storageLimit: number;
  teamLimit: number;
};

type RoleKey = 'owner' | 'manager' | 'service_advisor' | 'technician' | 'storekeeper';

type PermissionSet = {
  canChangeJobStatus: boolean;
  canAdjustStock: boolean;
  canApplyDiscount: boolean;
  canEditInvoice: boolean;
  canApproveDelivery: boolean;
};

type BillingRuleEngine = {
  laborTaxable: boolean;
  partsTaxable: boolean;
  cgstPercent: number;
  sgstPercent: number;
  roundOffEnabled: boolean;
  stateTemplate: string;
  customerGstOverrideAllowed: boolean;
};

type ApprovalWorkflow = {
  discountApprovalEnabled: boolean;
  discountApprovalThresholdPercent: number;
  finalDeliveryNeedsQc: boolean;
  finalDeliveryNeedsPayment: boolean;
};

type NotificationCenter = {
  jobCreated: boolean;
  delayedJob: boolean;
  lowStock: boolean;
  deliveryReady: boolean;
  paymentDue: boolean;
  viaSms: boolean;
  viaWhatsapp: boolean;
  viaEmail: boolean;
  viaInApp: boolean;
};

type SlaControls = {
  minorServiceTargetHours: number;
  repairTargetHours: number;
  diagnosticsTargetHours: number;
  escalationAfterHours: number;
};

type StaffCapacity = {
  defaultBayCapacity: number;
  maxJobsPerTechnician: number;
  leaveCalendarEnabled: boolean;
};

type BackupPolicy = {
  autoBackupFrequency: 'daily' | 'weekly' | 'monthly';
  exportSchedule: 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  restorePointLabel: string;
};

type BranchGovernance = {
  inheritanceMode: 'central-default' | 'branch-override';
  complianceFieldsLocked: boolean;
  activeBranchCount: number;
};

type SettingsAuditEntry = {
  id: string;
  at: string;
  action: string;
  section: string;
  detail: string;
};

const SETTINGS_AUDIT_KEY = 'sc-settings-audit-v1';
const INVOICE_GUARD_KEY = 'sc-invoice-guard-v1';

const DEFAULT_PERMISSION_MATRIX: Record<RoleKey, PermissionSet> = {
  owner: {
    canChangeJobStatus: true,
    canAdjustStock: true,
    canApplyDiscount: true,
    canEditInvoice: true,
    canApproveDelivery: true,
  },
  manager: {
    canChangeJobStatus: true,
    canAdjustStock: true,
    canApplyDiscount: true,
    canEditInvoice: true,
    canApproveDelivery: true,
  },
  service_advisor: {
    canChangeJobStatus: true,
    canAdjustStock: false,
    canApplyDiscount: true,
    canEditInvoice: true,
    canApproveDelivery: false,
  },
  technician: {
    canChangeJobStatus: true,
    canAdjustStock: false,
    canApplyDiscount: false,
    canEditInvoice: false,
    canApproveDelivery: false,
  },
  storekeeper: {
    canChangeJobStatus: false,
    canAdjustStock: true,
    canApplyDiscount: false,
    canEditInvoice: false,
    canApproveDelivery: false,
  },
};

const DEFAULT_BILLING_RULES: BillingRuleEngine = {
  laborTaxable: true,
  partsTaxable: true,
  cgstPercent: 9,
  sgstPercent: 9,
  roundOffEnabled: true,
  stateTemplate: 'Maharashtra',
  customerGstOverrideAllowed: true,
};

const DEFAULT_APPROVAL_WORKFLOW: ApprovalWorkflow = {
  discountApprovalEnabled: true,
  discountApprovalThresholdPercent: 10,
  finalDeliveryNeedsQc: true,
  finalDeliveryNeedsPayment: true,
};

const DEFAULT_NOTIFICATION_CENTER: NotificationCenter = {
  jobCreated: true,
  delayedJob: true,
  lowStock: true,
  deliveryReady: true,
  paymentDue: true,
  viaSms: true,
  viaWhatsapp: false,
  viaEmail: true,
  viaInApp: true,
};

const DEFAULT_SLA_CONTROLS: SlaControls = {
  minorServiceTargetHours: 6,
  repairTargetHours: 24,
  diagnosticsTargetHours: 4,
  escalationAfterHours: 2,
};

const DEFAULT_STAFF_CAPACITY: StaffCapacity = {
  defaultBayCapacity: 2,
  maxJobsPerTechnician: 5,
  leaveCalendarEnabled: true,
};

const DEFAULT_BACKUP_POLICY: BackupPolicy = {
  autoBackupFrequency: 'daily',
  exportSchedule: 'weekly',
  retentionDays: 180,
  restorePointLabel: 'stable-baseline',
};

const DEFAULT_BRANCH_GOVERNANCE: BranchGovernance = {
  inheritanceMode: 'central-default',
  complianceFieldsLocked: true,
  activeBranchCount: 1,
};

const DEFAULT_WORKSHOP_SETTINGS: WorkshopSettingsData = {
  workshopName: '',
  workshopPhone: '',
  workshopEmail: '',
  workshopAddress: '',
  city: '',
  state: '',
  pincode: '',
  gstNumber: '',
  panNumber: '',
  serviceLicenseNo: '',
  invoicePrefix: 'INV',
  nextInvoiceNumber: 1001,
  gatePassPrefix: 'GP',
  nextGatePassNumber: 301,
  defaultCurrency: 'INR',
  defaultTaxPercent: 18,
  defaultLaborRate: 900,
  defaultDiscountPercent: 0,
  paymentTermsDays: 7,
  warrantyDaysDefault: 30,
  requireEstimateApproval: true,
  requireChecklistCompletion: true,
  requireFinalQC: true,
  sendDeliverySMS: true,
  sendServiceReminder: true,
  serviceReminderDays: 30,
  lowStockAlertEnabled: true,
  lowStockThreshold: 5,
  whatsappNotifications: false,
  invoiceBlockOnMissingCritical: true,
  permissions: DEFAULT_PERMISSION_MATRIX,
  billingRules: DEFAULT_BILLING_RULES,
  approvalWorkflow: DEFAULT_APPROVAL_WORKFLOW,
  notificationCenter: DEFAULT_NOTIFICATION_CENTER,
  slaControls: DEFAULT_SLA_CONTROLS,
  staffCapacity: DEFAULT_STAFF_CAPACITY,
  backupPolicy: DEFAULT_BACKUP_POLICY,
  branchGovernance: DEFAULT_BRANCH_GOVERNANCE,
};

type SettingsTabKey = 'business' | 'billing' | 'operations' | 'controls' | 'staff' | 'customers' | 'governance' | 'subscription' | 'system';

const SETTINGS_TABS: Array<{
  key: SettingsTabKey;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  { key: 'business', label: 'Business', description: 'Brand, address, and business identity.', icon: Building2 },
  { key: 'billing', label: 'Billing', description: 'Invoice standards, tax defaults, and pricing.', icon: ReceiptIndianRupee },
  { key: 'operations', label: 'Operations', description: 'Approvals, QC, reminders, and workflow defaults.', icon: Settings2 },
  { key: 'controls', label: 'Controls', description: 'Permissions, notifications, and SLA escalation.', icon: ShieldCheck },
  { key: 'staff', label: 'Staff & Shifts', description: 'Roster setup, shift windows, and capacity rules.', icon: Users2 },
  { key: 'customers', label: 'Quick Add', description: 'Fast customer and vehicle onboarding tools.', icon: UserPlus },
  { key: 'governance', label: 'Governance', description: 'Backups, branch inheritance, and audit trail.', icon: HistoryIcon },
  { key: 'subscription', label: 'Subscription', description: 'Plan status, billing history, and limits.', icon: ShieldCheck },
  { key: 'system', label: 'System Status', description: 'Theme, connectivity, and workspace health.', icon: Activity },
];

const SCSettings = () => {
  const { profile, role } = useAuth();
  const { theme } = useTheme();
  const { data: mechanics = [] } = useMechanics();
  const { data: customers = [] } = useCustomers();
  const { data: jobCards = [] } = useJobCards();
  const addMechanic = useAddMechanic();
  const addCustomer = useAddCustomer();
  const [shiftSettings, setShiftSettings] = useState<ShiftSettings>(DEFAULT_SHIFT_SETTINGS);
  const [mechanicName, setMechanicName] = useState('');
  const [mechanicPhone, setMechanicPhone] = useState('');
  const [mechanicSpecialization, setMechanicSpecialization] = useState('');
  const [profileShiftLabel, setProfileShiftLabel] = useState('Day Shift');
  const [profileShiftStart, setProfileShiftStart] = useState('09:00');
  const [profileShiftEnd, setProfileShiftEnd] = useState('18:00');
  const [mechanicShiftProfiles, setMechanicShiftProfiles] = useState<MechanicShiftProfile[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerVehicleNumber, setCustomerVehicleNumber] = useState('');
  const [recentCustomerProfiles, setRecentCustomerProfiles] = useState<CustomerProfileEntry[]>([]);
  const [activeTab, setActiveTab] = useState<SettingsTabKey>('business');
  const [workshopSettings, setWorkshopSettings] = useState<WorkshopSettingsData>(DEFAULT_WORKSHOP_SETTINGS);

  // Subscription State
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    plan: 'Workshop Pro Expansion',
    renewalDate: 'April 15, 2026',
    billingCycle: 'Yearly (Save 20%)',
    paymentMethod: 'Card ending in 8829',
    isActive: true,
    storageUsed: 2.4, // GB
    storageLimit: 10,  // GB
    teamLimit: 20,
  });

  const [showPlanPortal, setShowPlanPortal] = useState(false);
  const [settingsAudit, setSettingsAudit] = useState<SettingsAuditEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('sc-shift-settings');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as ShiftSettings;
      setShiftSettings({
        ...DEFAULT_SHIFT_SETTINGS,
        ...parsed,
        workingDays: { ...DEFAULT_SHIFT_SETTINGS.workingDays, ...(parsed.workingDays || {}) },
      });
    } catch {
      localStorage.removeItem('sc-shift-settings');
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(WORKSHOP_SETTINGS_KEY);
    if (!saved) {
      setWorkshopSettings((prev) => ({
        ...prev,
        workshopName: profile?.name || prev.workshopName,
        workshopEmail: profile?.email || prev.workshopEmail,
        workshopPhone: profile?.phone || prev.workshopPhone,
      }));
      return;
    }
    try {
      const parsed = JSON.parse(saved) as Partial<WorkshopSettingsData>;
      setWorkshopSettings({
        ...DEFAULT_WORKSHOP_SETTINGS,
        ...parsed,
        permissions: {
          ...DEFAULT_WORKSHOP_SETTINGS.permissions,
          ...(parsed.permissions || {}),
        },
        billingRules: {
          ...DEFAULT_WORKSHOP_SETTINGS.billingRules,
          ...(parsed.billingRules || {}),
        },
        approvalWorkflow: {
          ...DEFAULT_WORKSHOP_SETTINGS.approvalWorkflow,
          ...(parsed.approvalWorkflow || {}),
        },
        notificationCenter: {
          ...DEFAULT_WORKSHOP_SETTINGS.notificationCenter,
          ...(parsed.notificationCenter || {}),
        },
        slaControls: {
          ...DEFAULT_WORKSHOP_SETTINGS.slaControls,
          ...(parsed.slaControls || {}),
        },
        staffCapacity: {
          ...DEFAULT_WORKSHOP_SETTINGS.staffCapacity,
          ...(parsed.staffCapacity || {}),
        },
        backupPolicy: {
          ...DEFAULT_WORKSHOP_SETTINGS.backupPolicy,
          ...(parsed.backupPolicy || {}),
        },
        branchGovernance: {
          ...DEFAULT_WORKSHOP_SETTINGS.branchGovernance,
          ...(parsed.branchGovernance || {}),
        },
        workshopName: parsed.workshopName || profile?.name || '',
        workshopEmail: parsed.workshopEmail || profile?.email || '',
        workshopPhone: parsed.workshopPhone || profile?.phone || '',
      });
    } catch {
      localStorage.removeItem(WORKSHOP_SETTINGS_KEY);
      setWorkshopSettings((prev) => ({
        ...prev,
        workshopName: profile?.name || prev.workshopName,
        workshopEmail: profile?.email || prev.workshopEmail,
        workshopPhone: profile?.phone || prev.workshopPhone,
      }));
    }
  }, [profile?.name, profile?.email, profile?.phone]);

  useEffect(() => {
    const savedSub = localStorage.getItem('sc-subscription-status');
    if (savedSub) {
      try {
        setSubscriptionStatus(JSON.parse(savedSub) as SubscriptionStatus);
      } catch (e) {
        console.error('Failed to parse subscription status', e);
      }
    }
  }, []);

  useEffect(() => {
    const savedAudit = localStorage.getItem(SETTINGS_AUDIT_KEY);
    if (!savedAudit) return;
    try {
      const parsed = JSON.parse(savedAudit) as SettingsAuditEntry[];
      if (Array.isArray(parsed)) setSettingsAudit(parsed);
    } catch {
      localStorage.removeItem(SETTINGS_AUDIT_KEY);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('sc-mechanic-shift-profiles');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as MechanicShiftProfile[];
      if (Array.isArray(parsed)) setMechanicShiftProfiles(parsed);
    } catch {
      localStorage.removeItem('sc-mechanic-shift-profiles');
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('sc-recent-customer-profiles');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as CustomerProfileEntry[];
      if (Array.isArray(parsed)) setRecentCustomerProfiles(parsed);
    } catch {
      localStorage.removeItem('sc-recent-customer-profiles');
    }
  }, []);

  const setField = <K extends keyof ShiftSettings>(key: K, value: ShiftSettings[K]) => {
    setShiftSettings((prev) => ({ ...prev, [key]: value }));
  };

  const appendAudit = (action: string, section: string, detail: string) => {
    const entry: SettingsAuditEntry = {
      id: Math.random().toString(36).slice(2, 10),
      at: new Date().toISOString(),
      action,
      section,
      detail,
    };
    setSettingsAudit((prev) => {
      const next = [entry, ...prev].slice(0, 60);
      localStorage.setItem(SETTINGS_AUDIT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleDay = (key: keyof ShiftSettings['workingDays']) => {
    setShiftSettings((prev) => ({
      ...prev,
      workingDays: { ...prev.workingDays, [key]: !prev.workingDays[key] },
    }));
  };

  const updateWorkshopField = <K extends keyof WorkshopSettingsData>(key: K, value: WorkshopSettingsData[K]) => {
    setWorkshopSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveShiftSettings = () => {
    localStorage.setItem('sc-shift-settings', JSON.stringify(shiftSettings));
    appendAudit('save', 'staff', 'Updated shift infrastructure and scheduling defaults');
    toast.success('Mechanics shift settings saved');
  };

  const handleSaveWorkshopSettings = () => {
    if (!workshopSettings.workshopName.trim()) {
      toast.error('Workshop name is required');
      return;
    }
    localStorage.setItem(WORKSHOP_SETTINGS_KEY, JSON.stringify(workshopSettings));
    appendAudit('save', 'workshop', 'Saved workshop settings profile and defaults');
    toast.success('Workshop settings saved');
  };

  const handleResetWorkshopSettings = () => {
    const resetValues: WorkshopSettingsData = {
      ...DEFAULT_WORKSHOP_SETTINGS,
      workshopName: profile?.name || '',
      workshopEmail: profile?.email || '',
      workshopPhone: profile?.phone || '',
    };
    setWorkshopSettings(resetValues);
    localStorage.setItem(WORKSHOP_SETTINGS_KEY, JSON.stringify(resetValues));
    appendAudit('reset', 'workshop', 'Reset workshop settings to defaults');
    toast.success('Workshop settings reset to defaults');
  };

  const handleSaveAll = () => {
    handleSaveWorkshopSettings();
    localStorage.setItem('sc-shift-settings', JSON.stringify(shiftSettings));
    appendAudit('save-all', 'settings', 'Saved all workshop settings sections');
    toast.success('All settings saved');
  };

  const handleCreateMechanicProfile = async () => {
    if (!mechanicName.trim()) {
      toast.error('Mechanic name is required');
      return;
    }

    try {
      await addMechanic.mutateAsync({
        name: mechanicName.trim(),
        phone: mechanicPhone.trim() || undefined,
        specialization: mechanicSpecialization.trim() || undefined,
      });
    } catch {
      return;
    }

    const newProfile: MechanicShiftProfile = {
      name: mechanicName.trim(),
      shiftLabel: profileShiftLabel.trim() || 'Day Shift',
      start: profileShiftStart,
      end: profileShiftEnd,
    };

    const updatedProfiles = [newProfile, ...mechanicShiftProfiles.filter((p) => p.name !== newProfile.name)].slice(0, 10);
    setMechanicShiftProfiles(updatedProfiles);
    localStorage.setItem('sc-mechanic-shift-profiles', JSON.stringify(updatedProfiles));

    setMechanicName('');
    setMechanicPhone('');
    setMechanicSpecialization('');
    setProfileShiftLabel('Day Shift');
    setProfileShiftStart('09:00');
    setProfileShiftEnd('18:00');

    appendAudit('create', 'staff', `Created mechanic profile for ${newProfile.name}`);
    toast.success('Mechanic profile created with shift details');
  };

  const handleCreateCustomerProfile = async () => {
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Customer phone is required');
      return;
    }

    const vehicleNumbers = customerVehicleNumber
      .split(',')
      .map((v) => v.trim().toUpperCase())
      .filter(Boolean);

    try {
      await addCustomer.mutateAsync({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim() || undefined,
        vehicle_numbers: vehicleNumbers,
        total_visits: 1,
        total_spend: 0,
        last_visit: new Date().toISOString().split('T')[0],
      });
    } catch {
      return;
    }

    const entry: CustomerProfileEntry = {
      name: customerName.trim(),
      phone: customerPhone.trim(),
      email: customerEmail.trim(),
      vehicleNumber: vehicleNumbers[0] || '',
    };
    const updated = [entry, ...recentCustomerProfiles.filter((item) => !(item.name === entry.name && item.phone === entry.phone))].slice(0, 10);
    setRecentCustomerProfiles(updated);
    localStorage.setItem('sc-recent-customer-profiles', JSON.stringify(updated));

    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerVehicleNumber('');

    appendAudit('create', 'customers', `Created customer profile for ${entry.name}`);
    toast.success('Customer profile created. It now appears in Customers list.');
  };

  const handleManagePlan = () => {
    setShowPlanPortal(true);
  };

  const handlePlanChange = (newPlan: Partial<SubscriptionStatus>) => {
    setSubscriptionStatus(prev => ({
      ...prev,
      ...newPlan
    }));
    // Save to localStorage so it persists
    localStorage.setItem('sc-subscription-status', JSON.stringify({
      ...subscriptionStatus,
      ...newPlan
    }));
    appendAudit('update', 'subscription', `Updated subscription plan to ${newPlan.plan || subscriptionStatus.plan}`);
  };

  const handleViewInvoices = () => {
    toast.info('Fetching your billing history...');
  };

  const handleCancelSubscription = () => {
    const confirmed = window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of the billing period.');
    if (confirmed) {
      toast.success('Subscription cancellation scheduled.');
    }
  };

  const setupSteps = [
    { label: 'Business Details', done: !!workshopSettings.workshopName && !!workshopSettings.workshopPhone },
    { label: 'Billing Info', done: !!workshopSettings.gstNumber && !!workshopSettings.invoicePrefix },
    { label: 'Operational Defaults', done: workshopSettings.defaultLaborRate > 0 },
    { label: 'Staff Configuration', done: mechanics.length > 0 },
    { label: 'Customer Base', done: customers.length > 0 },
  ];

  const businessFields = [
    { label: 'Workshop Name', done: !!workshopSettings.workshopName.trim() },
    { label: 'Phone', done: !!workshopSettings.workshopPhone.trim() },
    { label: 'Email', done: !!workshopSettings.workshopEmail.trim() },
    { label: 'Address', done: !!workshopSettings.workshopAddress.trim() },
    { label: 'City', done: !!workshopSettings.city.trim() },
    { label: 'State', done: !!workshopSettings.state.trim() },
    { label: 'GST Number', done: !!workshopSettings.gstNumber.trim() },
    { label: 'Invoice Prefix', done: !!workshopSettings.invoicePrefix.trim() },
    { label: 'PAN Number', done: !!workshopSettings.panNumber.trim() },
  ];

  const criticalBusinessMissing = businessFields
    .filter((item) => ['Workshop Name', 'Phone', 'GST Number', 'Invoice Prefix', 'Address'].includes(item.label) && !item.done)
    .map((item) => item.label);

  const businessCompletionPercent = Math.round(
    (businessFields.filter((item) => item.done).length / businessFields.length) * 100
  );

  const invoiceGenerationBlocked =
    workshopSettings.invoiceBlockOnMissingCritical && criticalBusinessMissing.length > 0;

  useEffect(() => {
    localStorage.setItem(
      INVOICE_GUARD_KEY,
      JSON.stringify({
        blocked: invoiceGenerationBlocked,
        missingFields: criticalBusinessMissing,
        updatedAt: new Date().toISOString(),
      })
    );
  }, [invoiceGenerationBlocked, criticalBusinessMissing]);

  const completionPercent = Math.round((setupSteps.filter(s => s.done).length / setupSteps.length) * 100);
  const activeTabMeta = SETTINGS_TABS.find((tab) => tab.key === activeTab) || SETTINGS_TABS[0];
  const openJobsCount = jobCards.filter((job) => job.status !== 'delivered').length;
  const automationScore = [
    workshopSettings.requireEstimateApproval,
    workshopSettings.requireChecklistCompletion,
    workshopSettings.requireFinalQC,
    workshopSettings.sendDeliverySMS,
    workshopSettings.sendServiceReminder,
    workshopSettings.lowStockAlertEnabled,
  ].filter(Boolean).length;
  const automationPercent = Math.round((automationScore / 6) * 100);
  const storagePercent = Math.min(100, Math.round((subscriptionStatus.storageUsed / subscriptionStatus.storageLimit) * 100));
  const completedSteps = setupSteps.filter((step) => step.done).length;
  const ActiveTabIcon = activeTabMeta.icon;
  const overviewCards = [
    {
      label: 'Setup Completion',
      value: `${completionPercent}%`,
      detail: `${setupSteps.filter((step) => step.done).length}/${setupSteps.length} essentials ready`,
      icon: CheckCircle2,
      tone: 'from-blue-500/14 via-indigo-500/8 to-transparent',
      iconTone: 'bg-blue-500/12 text-blue-500',
    },
    {
      label: 'Live Workload',
      value: openJobsCount.toString(),
      detail: `${mechanics.length} mechanics on roster`,
      icon: Briefcase,
      tone: 'from-cyan-500/12 via-blue-500/8 to-transparent',
      iconTone: 'bg-cyan-500/12 text-cyan-500',
    },
    {
      label: 'Automation Readiness',
      value: `${automationPercent}%`,
      detail: `${automationScore} smart defaults enabled`,
      icon: Zap,
      tone: 'from-violet-500/12 via-fuchsia-500/8 to-transparent',
      iconTone: 'bg-violet-500/12 text-violet-500',
    },
    {
      label: 'Cloud Storage',
      value: `${storagePercent}%`,
      detail: `${subscriptionStatus.storageUsed.toFixed(1)} GB of ${subscriptionStatus.storageLimit} GB used`,
      icon: Server,
      tone: 'from-emerald-500/12 via-teal-500/8 to-transparent',
      iconTone: 'bg-emerald-500/12 text-emerald-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative max-w-7xl pb-20"
    >
      <Tabs value={activeTab} className="w-full space-y-6" onValueChange={(value) => setActiveTab(value as SettingsTabKey)}>
        <section className="mb-6 flex flex-col gap-4 border-b border-border/50 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workshop settings</p>
            <h1 className="text-3xl font-display font-semibold tracking-tight">Settings</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Keep your workshop profile, billing rules, staff defaults, and system preferences organized in one clean workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetWorkshopSettings}
              className="h-10 rounded-xl border-border/50 bg-background px-4"
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAll}
              className="h-10 rounded-xl bg-foreground px-4 text-background hover:bg-foreground/90"
            >
              <Save className="mr-2 h-3.5 w-3.5" /> Save changes
            </Button>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[280px,minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-20 self-start">
            <div className="rounded-3xl border border-border/50 bg-card/70 p-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold">{workshopSettings.workshopName || profile?.name || 'Workshop profile'}</p>
                  <p className="text-sm text-muted-foreground">
                    {workshopSettings.workshopEmail || profile?.email || 'Add your business email and contact details'}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <span>Setup progress</span>
                    <span>{completionPercent}%</span>
                  </div>
                  <Progress value={completionPercent} className="mt-3 h-2" />
                  <p className="mt-3 text-xs text-muted-foreground">
                    {completedSteps} of {setupSteps.length} core setup steps are complete.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border/40 bg-background/80 p-3">
                    <p className="text-[11px] font-medium text-muted-foreground">Plan</p>
                    <p className="mt-1 text-sm font-semibold">{subscriptionStatus.plan}</p>
                  </div>
                  <div className="rounded-2xl border border-border/40 bg-background/80 p-3">
                    <p className="text-[11px] font-medium text-muted-foreground">Team</p>
                    <p className="mt-1 text-sm font-semibold">{mechanics.length} / {subscriptionStatus.teamLimit}</p>
                  </div>
                  <div className="rounded-2xl border border-border/40 bg-background/80 p-3">
                    <p className="text-[11px] font-medium text-muted-foreground">Open jobs</p>
                    <p className="mt-1 text-sm font-semibold">{openJobsCount}</p>
                  </div>
                  <div className="rounded-2xl border border-border/40 bg-background/80 p-3">
                    <p className="text-[11px] font-medium text-muted-foreground">Storage</p>
                    <p className="mt-1 text-sm font-semibold">{storagePercent}% used</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/50 bg-card/70 p-3">
              <div className="px-2 pb-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sections</p>
                <p className="mt-1 text-xs text-muted-foreground">Choose an area to review or update.</p>
              </div>
              <TabsList className="flex h-auto flex-col gap-1 bg-transparent p-0">
                {SETTINGS_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="h-auto w-full items-start justify-start rounded-2xl border border-transparent px-3 py-3 text-left data-[state=active]:border-border/60 data-[state=active]:bg-muted/40 data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    <div className="flex w-full items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-background text-primary">
                        <tab.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{tab.label}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{tab.description}</p>
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/40 bg-background text-primary">
                    <ActiveTabIcon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Current section</p>
                    <h2 className="text-xl font-display font-semibold">{activeTabMeta.label}</h2>
                    <p className="max-w-2xl text-sm text-muted-foreground">{activeTabMeta.description}</p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="w-fit rounded-full border-border/50 bg-background/80 px-3 py-1 text-[11px] font-medium text-foreground"
                >
                  {subscriptionStatus.isActive ? 'Plan active' : 'Needs review'}
                </Badge>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {overviewCards.map((card, index) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.03 }}
                    className="rounded-2xl border border-border/40 bg-background/80 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-muted/20 text-primary">
                        <card.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{card.label}</p>
                        <p className="mt-1 text-lg font-semibold tracking-tight">{card.value}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{card.detail}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
            <TabsContent value="business" className="space-y-6 mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <div className="glass-card rounded-3xl p-8 border border-border/40 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                      <Building2 className="h-40 w-40" />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Business Profile</h2>
                        <p className="text-sm text-muted-foreground">General information about your workshop</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/40 bg-muted/20 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">Business Profile Completeness</p>
                          <p className="text-xs text-muted-foreground">Critical fields are used for invoice and compliance workflows.</p>
                        </div>
                        <Badge variant="outline" className="font-semibold">{businessCompletionPercent}%</Badge>
                      </div>
                      <Progress value={businessCompletionPercent} className="h-2" />
                      <div className="flex items-center justify-between p-3 rounded-xl bg-background ring-1 ring-border/20">
                        <div>
                          <p className="text-sm font-semibold">Block Invoices If Critical Fields Missing</p>
                          <p className="text-xs text-muted-foreground">
                            {invoiceGenerationBlocked
                              ? `Blocked now: ${criticalBusinessMissing.join(', ')}`
                              : 'Invoice generation allowed'}
                          </p>
                        </div>
                        <Switch
                          checked={workshopSettings.invoiceBlockOnMissingCritical}
                          onCheckedChange={(checked) => {
                            updateWorkshopField('invoiceBlockOnMissingCritical', checked);
                            appendAudit('update', 'business', `Invoice block policy ${checked ? 'enabled' : 'disabled'}`);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Workshop Name</label>
                        <Input 
                          value={workshopSettings.workshopName} 
                          onChange={(e) => updateWorkshopField('workshopName', e.target.value)} 
                          placeholder="Your Premium Workshop" 
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Support Phone</label>
                        <Input 
                          value={workshopSettings.workshopPhone} 
                          onChange={(e) => updateWorkshopField('workshopPhone', e.target.value)} 
                          placeholder="+91 00000 00000"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Email Address</label>
                        <Input 
                          value={workshopSettings.workshopEmail} 
                          onChange={(e) => updateWorkshopField('workshopEmail', e.target.value)} 
                          placeholder="contact@workshop.com"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Complete Address</label>
                        <Input 
                          value={workshopSettings.workshopAddress} 
                          onChange={(e) => updateWorkshopField('workshopAddress', e.target.value)} 
                          placeholder="Street, Locality, Area"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">City</label>
                        <Input 
                          value={workshopSettings.city} 
                          onChange={(e) => updateWorkshopField('city', e.target.value)} 
                          placeholder="Mumbai"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">State</label>
                        <Input 
                          value={workshopSettings.state} 
                          onChange={(e) => updateWorkshopField('state', e.target.value)} 
                          placeholder="Maharashtra"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Pincode</label>
                        <Input 
                          value={workshopSettings.pincode} 
                          onChange={(e) => updateWorkshopField('pincode', e.target.value)} 
                          placeholder="400001"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6 pt-4 border-t border-border/40">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">GST Number</label>
                        <Input 
                          value={workshopSettings.gstNumber} 
                          onChange={(e) => updateWorkshopField('gstNumber', e.target.value.toUpperCase())} 
                          placeholder="27AAAAA0000A1Z5"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">PAN Number</label>
                        <Input 
                          value={workshopSettings.panNumber} 
                          onChange={(e) => updateWorkshopField('panNumber', e.target.value.toUpperCase())} 
                          placeholder="ABCDE1234F"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Service License</label>
                        <Input 
                          value={workshopSettings.serviceLicenseNo} 
                          onChange={(e) => updateWorkshopField('serviceLicenseNo', e.target.value)} 
                          placeholder="LIC-000-XX"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="glass-card rounded-3xl p-6 border border-border/40 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                      </div>
                      <h3 className="font-bold">Appearance</h3>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 ring-1 ring-border/20">
                      <div>
                        <p className="text-sm font-medium">Visual Theme</p>
                        <p className="text-xs text-muted-foreground capitalized">{theme} Mode Active</p>
                      </div>
                      <ThemeToggle />
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-6 border border-border/40 bg-primary/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Info className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-primary">Status</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Account Role</span>
                        <Badge variant="outline" className="bg-background/50 border-primary/20 text-primary capitalize">{role?.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="font-medium">Just now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6 mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card rounded-3xl p-8 border border-border/40 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                        <ReceiptIndianRupee className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Billing Architecture</h2>
                        <p className="text-sm text-muted-foreground">Configure invoice numbering and tax structures</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Invoice Prefix</label>
                        <Input 
                          value={workshopSettings.invoicePrefix} 
                          onChange={(e) => updateWorkshopField('invoicePrefix', e.target.value.toUpperCase())} 
                          placeholder="INV"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Next Number</label>
                        <Input 
                          type="number" 
                          value={workshopSettings.nextInvoiceNumber} 
                          onChange={(e) => updateWorkshopField('nextInvoiceNumber', Math.max(1, Number(e.target.value) || 1))}
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Currency Code</label>
                        <Input 
                          value={workshopSettings.defaultCurrency} 
                          onChange={(e) => updateWorkshopField('defaultCurrency', e.target.value.toUpperCase())} 
                          placeholder="INR"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border/40">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Gate Pass Prefix</label>
                        <Input 
                          value={workshopSettings.gatePassPrefix} 
                          onChange={(e) => updateWorkshopField('gatePassPrefix', e.target.value.toUpperCase())} 
                          placeholder="GP"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Next GP Number</label>
                        <Input 
                          type="number" 
                          value={workshopSettings.nextGatePassNumber} 
                          onChange={(e) => updateWorkshopField('nextGatePassNumber', Math.max(1, Number(e.target.value) || 1))}
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-card rounded-3xl p-6 border border-border/40 space-y-6 bg-secondary/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-bold">Tax & Labor</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          <span>Default Tax %</span>
                        </div>
                        <Input 
                          type="number" 
                          value={workshopSettings.defaultTaxPercent} 
                          onChange={(e) => updateWorkshopField('defaultTaxPercent', Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                          className="h-11 rounded-xl bg-background border-none ring-1 ring-border/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          <span>Hourly Labor Rate (Base)</span>
                        </div>
                        <Input 
                          type="number" 
                          value={workshopSettings.defaultLaborRate} 
                          onChange={(e) => updateWorkshopField('defaultLaborRate', Math.max(0, Number(e.target.value) || 0))}
                          className="h-11 rounded-xl bg-background border-none ring-1 ring-border/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          <span>Payment Terms (Days)</span>
                        </div>
                        <Input 
                          type="number" 
                          value={workshopSettings.paymentTermsDays} 
                          onChange={(e) => updateWorkshopField('paymentTermsDays', Math.min(180, Math.max(0, Number(e.target.value) || 0)))}
                          className="h-11 rounded-xl bg-background border-none ring-1 ring-border/40"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6 mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Health Section */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card rounded-3xl p-8 border border-border/40 space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center">
                          <Server className="h-6 w-6 text-success" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">System Health</h2>
                          <p className="text-sm text-muted-foreground">Real-time status of AutoCare Pro infrastructure</p>
                        </div>
                      </div>
                      
                      {/* Main Traffic Light Signal */}
                      <div className="flex items-center gap-4 bg-black/20 p-3.5 rounded-2xl border border-white/5 shadow-inner">
                        <div className="flex flex-col gap-2 items-center px-1">
                          <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-tighter leading-none">Status</span>
                          <div className="flex gap-2.5 p-2 bg-black/40 rounded-full border border-white/5">
                            <div className="h-3.5 w-3.5 rounded-full bg-destructive/10 border border-destructive/20 opacity-30 saturate-0" title="System Down" />
                            <div className="h-3.5 w-3.5 rounded-full bg-warning/10 border border-warning/20 opacity-30 saturate-0" title="Degraded Performance" />
                            <div className="h-3.5 w-3.5 rounded-full bg-success border border-success/40 shadow-[0_0_15px_rgba(34,197,94,0.7)] animate-pulse" title="All Systems Normal" />
                          </div>
                        </div>
                        <div className="h-10 w-px bg-white/10 hidden sm:block" />
                        <div className="flex flex-col items-start pr-1">
                           <span className="text-[9px] font-bold text-success/80 uppercase">All Channels</span>
                           <Badge className="bg-success/20 text-success border-success/30 whitespace-nowrap px-2 py-0 h-5 text-[10px]">
                            Operational
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      {[
                        { label: 'API Services', status: 'Optimal', uptime: '99.98%', icon: Zap, color: 'text-yellow-500', signalColor: 'bg-success' },
                        { label: 'Database Engine', status: 'Healthy', uptime: '100%', icon: Activity, color: 'text-blue-500', signalColor: 'bg-success' },
                        { label: 'Asset Storage', status: 'Optimal', uptime: '99.95%', icon: Globe, color: 'text-indigo-500', signalColor: 'bg-success' },
                      ].map((service) => (
                        <div key={service.label} className="p-6 rounded-2xl bg-muted/20 border border-border/20 space-y-4 relative overflow-hidden group hover:bg-muted/30 transition-all duration-300">
                          <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-lg bg-background/40 border border-white/5 group-hover:scale-110 transition-transform`}>
                              <service.icon className={`h-5 w-5 ${service.color}`} />
                            </div>
                            <Badge variant="outline" className="text-[9px] bg-background/50 border-border/40 text-muted-foreground uppercase py-0 px-1.5 h-5">{service.status}</Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                                <p className="text-sm font-bold tracking-tight">{service.label}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Uptime: {service.uptime}</p>
                            </div>
                            
                            {/* Repositioned Sub-signal LED below */}
                            <div className="flex items-center gap-2 pt-2 border-t border-border/10">
                              <div className={`h-2.5 w-2.5 rounded-full ${service.signalColor} animate-pulse blink-fast shadow-[0_0_8px_rgba(34,197,94,0.5)]`} />
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Active Link</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/40">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Maintenance Schedule</h3>
                      <div className="space-y-3">
                        {[
                          { date: 'March 20, 2026', time: '02:00 AM - 04:00 AM IST', type: 'Core Engine Update', status: 'Scheduled' },
                          { date: 'April 05, 2026', time: '01:00 AM - 01:30 AM IST', type: 'Security Patching', status: 'Planned' },
                        ].map((window, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 ring-1 ring-border/10">
                            <div className="flex items-center gap-4">
                              <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center border border-border/40">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{window.type}</p>
                                <p className="text-[11px] text-muted-foreground">{window.date} • {window.time}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">{window.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* News & Updates Section */}
                <div className="space-y-6">
                  <div className="glass-card rounded-3xl p-6 border border-border/40 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Megaphone className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-bold">Latest Updates</h3>
                    </div>

                    <div className="space-y-5">
                      {[
                        { title: 'Multi-Branch Support Live!', date: 'Today', desc: 'Manage all your workshop locations from a single dashboard.', tag: 'New Feature' },
                        { title: 'Improved Analytics Export', date: '2 days ago', desc: 'Enhanced CSV/Excel formatting for better reporting.', tag: 'Update' },
                        { title: 'v2.4 Security Protocols', date: '1 week ago', desc: 'Implementing advanced end-to-end encryption.', tag: 'Security' },
                      ].map((news, i) => (
                        <div key={i} className="space-y-2 group cursor-pointer">
                          <div className="flex justify-between items-start">
                            <Badge className="bg-primary/10 text-primary text-[9px] h-4 uppercase font-bold border-none">{news.tag}</Badge>
                            <span className="text-[10px] text-muted-foreground">{news.date}</span>
                          </div>
                          <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{news.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{news.desc}</p>
                        </div>
                      ))}
                    </div>

                    <Button variant="ghost" className="w-full rounded-xl text-xs font-semibold py-6 border border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all">
                      View Platform Changelog
                    </Button>
                  </div>

                  <div className="glass-card rounded-3xl p-6 border border-border/40 bg-card/60 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Info className="h-5 w-5 text-orange-500" />
                      </div>
                      <h3 className="font-bold">Need Help?</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Our support team is available 24/7 for critical system issues. 
                    </p>
                    <Button variant="outline" className="w-full rounded-xl text-xs h-10 border-none ring-1 ring-border/40">
                      Contact Infrastructure Support
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="operations" className="space-y-6 mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <div className="glass-card rounded-3xl p-8 border border-border/40 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Job Card Controls</h2>
                        <p className="text-sm text-muted-foreground">Compliance and quality control standards</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 ring-1 ring-border/10">
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold">Estimate Approval</p>
                            <p className="text-xs text-muted-foreground">Require customer sign-off</p>
                          </div>
                          <Switch checked={workshopSettings.requireEstimateApproval} onCheckedChange={(checked) => updateWorkshopField('requireEstimateApproval', checked)} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 ring-1 ring-border/10">
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold">Checklist Completion</p>
                            <p className="text-xs text-muted-foreground">Mandatory inspection list</p>
                          </div>
                          <Switch checked={workshopSettings.requireChecklistCompletion} onCheckedChange={(checked) => updateWorkshopField('requireChecklistCompletion', checked)} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 ring-1 ring-border/10">
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold">Quality Check (QC)</p>
                            <p className="text-xs text-muted-foreground">Final manager approval</p>
                          </div>
                          <Switch checked={workshopSettings.requireFinalQC} onCheckedChange={(checked) => updateWorkshopField('requireFinalQC', checked)} />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold ml-1">Default Warranty (Days)</label>
                          <div className="relative">
                            <Input 
                              type="number" 
                              value={workshopSettings.warrantyDaysDefault} 
                              onChange={(e) => updateWorkshopField('warrantyDaysDefault', Math.min(365, Math.max(0, Number(e.target.value) || 0)))}
                              className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 pl-10"
                            />
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold ml-1">Service Reminder (Days)</label>
                          <div className="relative">
                            <Input 
                              type="number" 
                              value={workshopSettings.serviceReminderDays} 
                              onChange={(e) => updateWorkshopField('serviceReminderDays', Math.min(365, Math.max(0, Number(e.target.value) || 0)))}
                              className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 pl-10"
                            />
                            <Bell className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-8 border border-border/40 bg-secondary/10 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-amber-500" />
                      </div>
                      <h3 className="font-bold">Inventory & Stock</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-background ring-1 ring-border/20">
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold">Low Stock Notifications</p>
                          <p className="text-xs text-muted-foreground">Alert when parts run low</p>
                        </div>
                        <Switch checked={workshopSettings.lowStockAlertEnabled} onCheckedChange={(checked) => updateWorkshopField('lowStockAlertEnabled', checked)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Threshold Quantity</label>
                        <Input 
                          type="number" 
                          value={workshopSettings.lowStockThreshold} 
                          onChange={(e) => updateWorkshopField('lowStockThreshold', Math.min(1000, Math.max(1, Number(e.target.value) || 1)))}
                          className="h-11 rounded-xl bg-background border-none ring-1 ring-border/40"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="glass-card rounded-3xl p-6 border border-border/40 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-green-500" />
                      </div>
                      <h3 className="font-bold">Notifications</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
                        <p className="text-sm font-medium">Delivery SMS</p>
                        <Switch checked={workshopSettings.sendDeliverySMS} onCheckedChange={(checked) => updateWorkshopField('sendDeliverySMS', checked)} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
                        <p className="text-sm font-medium">Reminder Alerts</p>
                        <Switch checked={workshopSettings.sendServiceReminder} onCheckedChange={(checked) => updateWorkshopField('sendServiceReminder', checked)} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
                        <p className="text-sm font-medium">WhatsApp Sync</p>
                        <Switch checked={workshopSettings.whatsappNotifications} onCheckedChange={(checked) => updateWorkshopField('whatsappNotifications', checked)} />
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-6 border border-primary/20 bg-primary/5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary/70">Operation Summary</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>{workshopSettings.requireFinalQC ? 'Active QC Protocol' : 'Standard Delivery'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>{workshopSettings.sendDeliverySMS ? 'Automated SMS On' : 'Manual SMS'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="controls" className="space-y-6 mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <div className="glass-card rounded-3xl p-8 border border-border/40 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-bold">Role Permission Matrix</h3>
                    </div>

                    <div className="space-y-3">
                      {(Object.keys(workshopSettings.permissions) as RoleKey[]).map((roleKey) => (
                        <div key={roleKey} className="rounded-2xl border border-border/40 p-4 bg-muted/20">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold capitalize">{roleKey.replace('_', ' ')}</p>
                            <Badge variant="secondary" className="text-[10px]">Access controls</Badge>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {(
                              [
                                ['canChangeJobStatus', 'Change Job Status'],
                                ['canAdjustStock', 'Adjust Stock'],
                                ['canApplyDiscount', 'Apply Discount'],
                                ['canEditInvoice', 'Edit Invoice'],
                                ['canApproveDelivery', 'Approve Delivery'],
                              ] as Array<[keyof PermissionSet, string]>
                            ).map(([permKey, label]) => (
                              <div key={permKey} className="flex items-center justify-between p-3 rounded-xl bg-background ring-1 ring-border/20">
                                <p className="text-xs font-medium">{label}</p>
                                <Switch
                                  checked={workshopSettings.permissions[roleKey][permKey]}
                                  onCheckedChange={(checked) => {
                                    setWorkshopSettings((prev) => ({
                                      ...prev,
                                      permissions: {
                                        ...prev.permissions,
                                        [roleKey]: {
                                          ...prev.permissions[roleKey],
                                          [permKey]: checked,
                                        },
                                      },
                                    }));
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-8 border border-border/40 space-y-6">
                    <h3 className="font-bold">Billing & Tax Rule Engine</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                        <p className="text-sm">Labor Taxable</p>
                        <Switch checked={workshopSettings.billingRules.laborTaxable} onCheckedChange={(checked) => setWorkshopSettings((prev) => ({ ...prev, billingRules: { ...prev.billingRules, laborTaxable: checked } }))} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                        <p className="text-sm">Parts Taxable</p>
                        <Switch checked={workshopSettings.billingRules.partsTaxable} onCheckedChange={(checked) => setWorkshopSettings((prev) => ({ ...prev, billingRules: { ...prev.billingRules, partsTaxable: checked } }))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">CGST %</label>
                        <Input type="number" value={workshopSettings.billingRules.cgstPercent} onChange={(e) => setWorkshopSettings((prev) => ({ ...prev, billingRules: { ...prev.billingRules, cgstPercent: Math.max(0, Number(e.target.value) || 0) } }))} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">SGST %</label>
                        <Input type="number" value={workshopSettings.billingRules.sgstPercent} onChange={(e) => setWorkshopSettings((prev) => ({ ...prev, billingRules: { ...prev.billingRules, sgstPercent: Math.max(0, Number(e.target.value) || 0) } }))} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">State Template</label>
                        <Input value={workshopSettings.billingRules.stateTemplate} onChange={(e) => setWorkshopSettings((prev) => ({ ...prev, billingRules: { ...prev.billingRules, stateTemplate: e.target.value } }))} className="h-11 rounded-xl" />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                        <p className="text-sm">Allow Customer GST Override</p>
                        <Switch checked={workshopSettings.billingRules.customerGstOverrideAllowed} onCheckedChange={(checked) => setWorkshopSettings((prev) => ({ ...prev, billingRules: { ...prev.billingRules, customerGstOverrideAllowed: checked } }))} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="glass-card rounded-3xl p-6 border border-border/40 space-y-4">
                    <h3 className="font-bold">Approval Workflow</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                        <p className="text-sm">Discount Approval Rule</p>
                        <Switch checked={workshopSettings.approvalWorkflow.discountApprovalEnabled} onCheckedChange={(checked) => setWorkshopSettings((prev) => ({ ...prev, approvalWorkflow: { ...prev.approvalWorkflow, discountApprovalEnabled: checked } }))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Discount Threshold %</label>
                        <Input type="number" value={workshopSettings.approvalWorkflow.discountApprovalThresholdPercent} onChange={(e) => setWorkshopSettings((prev) => ({ ...prev, approvalWorkflow: { ...prev.approvalWorkflow, discountApprovalThresholdPercent: Math.max(0, Number(e.target.value) || 0) } }))} className="h-11 rounded-xl" />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                        <p className="text-sm">Final Delivery Needs QC</p>
                        <Switch checked={workshopSettings.approvalWorkflow.finalDeliveryNeedsQc} onCheckedChange={(checked) => setWorkshopSettings((prev) => ({ ...prev, approvalWorkflow: { ...prev.approvalWorkflow, finalDeliveryNeedsQc: checked } }))} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                        <p className="text-sm">Final Delivery Needs Payment</p>
                        <Switch checked={workshopSettings.approvalWorkflow.finalDeliveryNeedsPayment} onCheckedChange={(checked) => setWorkshopSettings((prev) => ({ ...prev, approvalWorkflow: { ...prev.approvalWorkflow, finalDeliveryNeedsPayment: checked } }))} />
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-6 border border-border/40 space-y-4">
                    <h3 className="font-bold">Notification Center</h3>
                    <div className="space-y-2">
                      {(
                        [
                          ['jobCreated', 'Job Created'],
                          ['delayedJob', 'Delayed Job'],
                          ['lowStock', 'Low Stock'],
                          ['deliveryReady', 'Delivery Ready'],
                          ['paymentDue', 'Payment Due'],
                        ] as Array<[keyof NotificationCenter, string]>
                      ).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                          <p className="text-sm">{label}</p>
                          <Switch checked={workshopSettings.notificationCenter[key] as boolean} onCheckedChange={(checked) => setWorkshopSettings((prev) => ({ ...prev, notificationCenter: { ...prev.notificationCenter, [key]: checked } }))} />
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-border/30 grid grid-cols-2 gap-2 text-xs">
                      {(
                        [
                          ['viaSms', 'SMS'],
                          ['viaWhatsapp', 'WhatsApp'],
                          ['viaEmail', 'Email'],
                          ['viaInApp', 'In-App'],
                        ] as Array<[keyof NotificationCenter, string]>
                      ).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                          <span>{label}</span>
                          <Switch checked={workshopSettings.notificationCenter[key] as boolean} onCheckedChange={(checked) => setWorkshopSettings((prev) => ({ ...prev, notificationCenter: { ...prev.notificationCenter, [key]: checked } }))} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-6 border border-border/40 space-y-4">
                    <h3 className="font-bold">SLA Controls</h3>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase text-muted-foreground">Minor Service Target (hrs)</label>
                      <Input type="number" value={workshopSettings.slaControls.minorServiceTargetHours} onChange={(e) => setWorkshopSettings((prev) => ({ ...prev, slaControls: { ...prev.slaControls, minorServiceTargetHours: Math.max(1, Number(e.target.value) || 1) } }))} />
                      <label className="text-xs font-semibold uppercase text-muted-foreground">Repair Target (hrs)</label>
                      <Input type="number" value={workshopSettings.slaControls.repairTargetHours} onChange={(e) => setWorkshopSettings((prev) => ({ ...prev, slaControls: { ...prev.slaControls, repairTargetHours: Math.max(1, Number(e.target.value) || 1) } }))} />
                      <label className="text-xs font-semibold uppercase text-muted-foreground">Diagnostics Target (hrs)</label>
                      <Input type="number" value={workshopSettings.slaControls.diagnosticsTargetHours} onChange={(e) => setWorkshopSettings((prev) => ({ ...prev, slaControls: { ...prev.slaControls, diagnosticsTargetHours: Math.max(1, Number(e.target.value) || 1) } }))} />
                      <label className="text-xs font-semibold uppercase text-muted-foreground">Escalation Delay (hrs)</label>
                      <Input type="number" value={workshopSettings.slaControls.escalationAfterHours} onChange={(e) => setWorkshopSettings((prev) => ({ ...prev, slaControls: { ...prev.slaControls, escalationAfterHours: Math.max(1, Number(e.target.value) || 1) } }))} />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="staff" className="space-y-6 mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  {/* Mechanic Creation Card */}
                  <div className="glass-card rounded-3xl p-8 border border-border/40 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                      <Users2 className="h-40 w-40" />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Onboard Mechanic</h2>
                        <p className="text-sm text-muted-foreground">Add new staff to your workshop directory</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Full Name</label>
                        <Input 
                          value={mechanicName} 
                          onChange={(e) => setMechanicName(e.target.value)} 
                          placeholder="John Doe" 
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Phone Number</label>
                        <Input 
                          value={mechanicPhone} 
                          onChange={(e) => setMechanicPhone(e.target.value)} 
                          placeholder="+91 XXXXX XXXXX"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Specialization</label>
                        <Input 
                          value={mechanicSpecialization} 
                          onChange={(e) => setMechanicSpecialization(e.target.value)} 
                          placeholder="Engine Expert"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Initial Shift</label>
                        <Input 
                          value={profileShiftLabel} 
                          onChange={(e) => setProfileShiftLabel(e.target.value)} 
                          placeholder="Morning Shift"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Daily Schedule</label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="time" 
                            value={profileShiftStart} 
                            onChange={(e) => setProfileShiftStart(e.target.value)}
                            className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 p-2 text-xs"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input 
                            type="time" 
                            value={profileShiftEnd} 
                            onChange={(e) => setProfileShiftEnd(e.target.value)}
                            className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 p-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <p className="text-xs text-muted-foreground italic">New accounts are automatically enabled for job assignment.</p>
                      <Button onClick={handleCreateMechanicProfile} disabled={addMechanic.isPending} className="rounded-xl h-12 px-8 bg-primary shadow-lg shadow-primary/15">
                        {addMechanic.isPending ? 'Syncing...' : 'Create Profile'}
                      </Button>
                    </div>
                  </div>

                  {/* Shift Options Card */}
                  <div className="glass-card rounded-3xl p-8 border border-border/40 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Shift Infrastructure</h2>
                        <p className="text-sm text-muted-foreground">Global standards for workshop working hours</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-muted/20 ring-1 ring-border/10 space-y-4">
                          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-orange-400" /> Day Shift Range
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Start</span>
                              <Input type="time" value={shiftSettings.dayShiftStart} onChange={(e) => setField('dayShiftStart', e.target.value)} className="bg-background rounded-xl border-none ring-1 ring-border/20" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase ml-1">End</span>
                              <Input type="time" value={shiftSettings.dayShiftEnd} onChange={(e) => setField('dayShiftEnd', e.target.value)} className="bg-background rounded-xl border-none ring-1 ring-border/20" />
                            </div>
                          </div>
                        </div>

                        <div className={`p-6 rounded-2xl transition-all ${shiftSettings.nightShiftEnabled ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-muted/10 opacity-60 ring-1 ring-border/5'} space-y-4`}>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-blue-400" /> Night Shift
                            </p>
                            <Switch checked={shiftSettings.nightShiftEnabled} onCheckedChange={(checked) => setField('nightShiftEnabled', checked)} />
                          </div>
                          {shiftSettings.nightShiftEnabled && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Start</span>
                                <Input type="time" value={shiftSettings.nightShiftStart} onChange={(e) => setField('nightShiftStart', e.target.value)} className="bg-background rounded-xl border-none ring-1 ring-border/20" />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase ml-1">End</span>
                                <Input type="time" value={shiftSettings.nightShiftEnd} onChange={(e) => setField('nightShiftEnd', e.target.value)} className="bg-background rounded-xl border-none ring-1 ring-border/20" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Working Days</label>
                          <div className="flex flex-wrap gap-2">
                            {DAY_OPTIONS.map((day) => {
                              const active = shiftSettings.workingDays[day.key];
                              return (
                                <button
                                  key={day.key}
                                  type="button"
                                  onClick={() => toggleDay(day.key)}
                                  className={`h-11 px-4 rounded-xl border transition-all text-sm font-medium ${
                                    active
                                      ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105'
                                      : 'bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/50'
                                  }`}
                                >
                                  {day.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-4 space-y-4 border-t border-border/40">
                          <div className="flex items-center justify-between p-2">
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold">Auto-Assignment</p>
                              <p className="text-xs text-muted-foreground">Smart dispatch filter</p>
                            </div>
                            <Switch checked={shiftSettings.autoAssignByShift} onCheckedChange={(checked) => setField('autoAssignByShift', checked)} />
                          </div>
                          <div className="flex items-center justify-between p-2">
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold">Overtime Allowance</p>
                              <p className="text-xs text-muted-foreground">Permit late assignments</p>
                            </div>
                            <Switch checked={shiftSettings.allowOvertimeJobs} onCheckedChange={(checked) => setField('allowOvertimeJobs', checked)} />
                          </div>

                          <div className="pt-3 border-t border-border/30 space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capacity Planning</p>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-muted-foreground">Default Bay Capacity</label>
                              <Input
                                type="number"
                                value={workshopSettings.staffCapacity.defaultBayCapacity}
                                onChange={(e) =>
                                  setWorkshopSettings((prev) => ({
                                    ...prev,
                                    staffCapacity: {
                                      ...prev.staffCapacity,
                                      defaultBayCapacity: Math.max(1, Number(e.target.value) || 1),
                                    },
                                  }))
                                }
                                className="h-10 rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-muted-foreground">Max Jobs per Technician</label>
                              <Input
                                type="number"
                                value={workshopSettings.staffCapacity.maxJobsPerTechnician}
                                onChange={(e) =>
                                  setWorkshopSettings((prev) => ({
                                    ...prev,
                                    staffCapacity: {
                                      ...prev.staffCapacity,
                                      maxJobsPerTechnician: Math.max(1, Number(e.target.value) || 1),
                                    },
                                  }))
                                }
                                className="h-10 rounded-xl"
                              />
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                              <p className="text-sm">Enable Leave Calendar</p>
                              <Switch
                                checked={workshopSettings.staffCapacity.leaveCalendarEnabled}
                                onCheckedChange={(checked) =>
                                  setWorkshopSettings((prev) => ({
                                    ...prev,
                                    staffCapacity: {
                                      ...prev.staffCapacity,
                                      leaveCalendarEnabled: checked,
                                    },
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button onClick={handleSaveShiftSettings} className="rounded-xl h-11 px-10 border-none ring-1 ring-border/50 hover:bg-secondary/20 bg-transparent text-foreground">
                        Save Infrastructure
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="glass-card rounded-3xl border border-border/40 overflow-hidden">
                    <div className="p-6 bg-muted/30 border-b border-border/40 flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <HistoryIcon className="h-4 w-4 text-muted-foreground" />
                        Recent Onboards
                      </h3>
                      <Badge variant="secondary" className="rounded-full">{mechanicShiftProfiles.length}</Badge>
                    </div>
                    <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {mechanicShiftProfiles.length > 0 ? (
                        mechanicShiftProfiles.map((m, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-background ring-1 ring-border/10 hover:ring-primary/30 transition-all group">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm truncate">{m.name}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{m.shiftLabel}</span>
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <Clock className="h-3 w-3" /> {m.start} - {m.end}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 space-y-2 opacity-40">
                          <Users2 className="h-10 w-10 mx-auto" />
                          <p className="text-xs">No recent mechanics</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-muted/10 border-t border-border/40">
                      <Button asChild variant="ghost" className="w-full text-xs text-primary hover:bg-primary/5 rounded-xl">
                        <Link to="/service-center/mechanics">Manage Full Roster <ChevronRight className="h-3 w-3 ml-1" /></Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="customers" className="space-y-6 mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <div className="glass-card rounded-3xl p-8 border border-border/40 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                      <UserPlus className="h-40 w-40" />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">New Customer Profile</h2>
                        <p className="text-sm text-muted-foreground">Register a new client and their vehicles</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Customer Name</label>
                        <Input 
                          value={customerName} 
                          onChange={(e) => setCustomerName(e.target.value)} 
                          placeholder="Jane Smith" 
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Phone Number</label>
                        <Input 
                          value={customerPhone} 
                          onChange={(e) => setCustomerPhone(e.target.value)} 
                          placeholder="+91 XXXXX XXXXX"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Email (Optional)</label>
                        <Input 
                          value={customerEmail} 
                          onChange={(e) => setCustomerEmail(e.target.value)} 
                          placeholder="jane@example.com"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Vehicle License Plate(s)</label>
                        <Input 
                          value={customerVehicleNumber} 
                          onChange={(e) => setCustomerVehicleNumber(e.target.value)} 
                          placeholder="ABC-1234, XYZ-5678"
                          className="h-12 rounded-xl bg-muted/30 border-none ring-1 ring-border/40 focus-visible:ring-primary/50 transition-all font-medium"
                        />
                        <p className="text-[10px] text-muted-foreground ml-1">Comma separated for multiple vehicles.</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full px-3">{customers.length} Global Customers</Badge>
                      </div>
                      <Button onClick={handleCreateCustomerProfile} disabled={addCustomer.isPending} className="rounded-xl h-12 px-8 bg-primary shadow-lg shadow-primary/15">
                        {addCustomer.isPending ? 'Processing...' : 'Register Customer'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="glass-card rounded-3xl border border-border/40 overflow-hidden">
                    <div className="p-6 bg-muted/30 border-b border-border/40 flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <HistoryIcon className="h-4 w-4 text-muted-foreground" />
                        Recent Adds
                      </h3>
                    </div>
                    <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {recentCustomerProfiles.length > 0 ? (
                        recentCustomerProfiles.map((c, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-background ring-1 ring-border/10">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm truncate">{c.name}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                                  <Smartphone className="h-3 w-3" /> {c.phone}
                                </p>
                                {c.vehicleNumber && (
                                  <p className="text-[11px] text-primary flex items-center gap-2 font-medium">
                                    <CheckCircle2 className="h-3 w-3" /> {c.vehicleNumber}
                                  </p>
                                )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 space-y-2 opacity-40">
                          <UserPlus className="h-10 w-10 mx-auto" />
                          <p className="text-xs">No recent customers</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-muted/10 border-t border-border/40">
                      <Button asChild variant="ghost" className="w-full text-xs text-primary hover:bg-primary/5 rounded-xl">
                        <Link to="/service-center/customers">View Full Database <ChevronRight className="h-3 w-3 ml-1" /></Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="governance" className="space-y-6 mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <div className="glass-card rounded-3xl p-8 border border-border/40 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Server className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-bold">Data Retention & Backup Policy</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Auto Backup Frequency</label>
                        <Input
                          value={workshopSettings.backupPolicy.autoBackupFrequency}
                          onChange={(e) =>
                            setWorkshopSettings((prev) => ({
                              ...prev,
                              backupPolicy: {
                                ...prev.backupPolicy,
                                autoBackupFrequency: (e.target.value || 'daily') as BackupPolicy['autoBackupFrequency'],
                              },
                            }))
                          }
                          placeholder="daily / weekly / monthly"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Export Schedule</label>
                        <Input
                          value={workshopSettings.backupPolicy.exportSchedule}
                          onChange={(e) =>
                            setWorkshopSettings((prev) => ({
                              ...prev,
                              backupPolicy: {
                                ...prev.backupPolicy,
                                exportSchedule: (e.target.value || 'weekly') as BackupPolicy['exportSchedule'],
                              },
                            }))
                          }
                          placeholder="daily / weekly / monthly"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Retention Days</label>
                        <Input
                          type="number"
                          value={workshopSettings.backupPolicy.retentionDays}
                          onChange={(e) =>
                            setWorkshopSettings((prev) => ({
                              ...prev,
                              backupPolicy: {
                                ...prev.backupPolicy,
                                retentionDays: Math.max(30, Number(e.target.value) || 30),
                              },
                            }))
                          }
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Restore Point Label</label>
                        <Input
                          value={workshopSettings.backupPolicy.restorePointLabel}
                          onChange={(e) =>
                            setWorkshopSettings((prev) => ({
                              ...prev,
                              backupPolicy: {
                                ...prev.backupPolicy,
                                restorePointLabel: e.target.value,
                              },
                            }))
                          }
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        appendAudit('restore-point', 'governance', `Created restore point ${workshopSettings.backupPolicy.restorePointLabel}`);
                        toast.success('Restore point tagged');
                      }}
                    >
                      Save Restore Point
                    </Button>
                  </div>

                  <div className="glass-card rounded-3xl p-8 border border-border/40 space-y-6">
                    <h3 className="font-bold">Multi-Branch Governance</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Inheritance Mode</label>
                        <Input
                          value={workshopSettings.branchGovernance.inheritanceMode}
                          onChange={(e) =>
                            setWorkshopSettings((prev) => ({
                              ...prev,
                              branchGovernance: {
                                ...prev.branchGovernance,
                                inheritanceMode: (e.target.value || 'central-default') as BranchGovernance['inheritanceMode'],
                              },
                            }))
                          }
                          placeholder="central-default / branch-override"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Active Branches</label>
                        <Input
                          type="number"
                          value={workshopSettings.branchGovernance.activeBranchCount}
                          onChange={(e) =>
                            setWorkshopSettings((prev) => ({
                              ...prev,
                              branchGovernance: {
                                ...prev.branchGovernance,
                                activeBranchCount: Math.max(1, Number(e.target.value) || 1),
                              },
                            }))
                          }
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                      <p className="text-sm font-medium">Lock Compliance Fields (central admin)</p>
                      <Switch
                        checked={workshopSettings.branchGovernance.complianceFieldsLocked}
                        onCheckedChange={(checked) =>
                          setWorkshopSettings((prev) => ({
                            ...prev,
                            branchGovernance: {
                              ...prev.branchGovernance,
                              complianceFieldsLocked: checked,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="glass-card rounded-3xl p-6 border border-border/40 space-y-4">
                    <h3 className="font-bold">Audit Timeline</h3>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {settingsAudit.length === 0 && (
                        <p className="text-xs text-muted-foreground">No setting changes logged yet.</p>
                      )}
                      {settingsAudit.map((entry) => (
                        <div key={entry.id} className="rounded-xl p-3 bg-muted/20 border border-border/30">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="outline" className="text-[10px] uppercase">{entry.action}</Badge>
                            <span className="text-[10px] text-muted-foreground">{new Date(entry.at).toLocaleString()}</span>
                          </div>
                          <p className="text-xs font-semibold mt-2 capitalize">{entry.section}</p>
                          <p className="text-xs text-muted-foreground mt-1">{entry.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <div className="glass-card rounded-3xl p-8 border border-border/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                      <ShieldCheck className="h-40 w-40" />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Active Subscription</h2>
                        <p className="text-sm text-muted-foreground">Manage your workshop's premium access and features.</p>
                      </div>
                      <Badge className="ml-auto bg-success/10 text-success border-success/20 px-3 py-1">Active</Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Plan</p>
                          <p className="text-2xl font-bold text-primary">{subscriptionStatus.plan}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Renewal Date</p>
                          <p className="text-lg font-semibold">{subscriptionStatus.renewalDate}</p>
                          <p className="text-xs text-muted-foreground">Auto-renewal is enabled</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Billing Cycle</p>
                          <p className="text-lg font-semibold">{subscriptionStatus.billingCycle}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment Method</p>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <p className="text-lg font-semibold">{subscriptionStatus.paymentMethod}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-border/40 flex flex-wrap gap-4">
                      <Button 
                        onClick={handleManagePlan}
                        className="rounded-xl h-11 px-6 bg-foreground text-background hover:bg-foreground/90"
                      >
                        Manage Plan
                      </Button>
                      <Button 
                        onClick={handleViewInvoices}
                        variant="outline" 
                        className="rounded-xl h-11 px-6 border-border/40"
                      >
                        View Invoices
                      </Button>
                      <Button 
                        onClick={handleCancelSubscription}
                        variant="ghost" 
                        className="rounded-xl h-11 px-6 text-destructive hover:bg-destructive/10 ml-auto"
                      >
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="glass-card rounded-2xl p-5 border border-border/40 bg-secondary/20">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Job Cards</p>
                      <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold">{jobCards.length}</p>
                        <Badge variant="outline" className="bg-success/5 text-success border-success/20">Master</Badge>
                      </div>
                    </div>
                    <div className="glass-card rounded-2xl p-5 border border-border/40 bg-secondary/20">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Team Members</p>
                      <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold">{mechanics.length} / {subscriptionStatus.teamLimit}</p>
                        <div className="w-16">
                          <Progress value={(mechanics.length / subscriptionStatus.teamLimit) * 100} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                    <div className="glass-card rounded-2xl p-5 border border-border/40 bg-secondary/20">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Cloud Storage</p>
                      <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold">{subscriptionStatus.storageUsed.toFixed(1)} GB</p>
                        <p className="text-[10px] text-muted-foreground mb-1">of {subscriptionStatus.storageLimit} GB</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="glass-card rounded-3xl p-6 border border-border/40 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <HistoryIcon className="h-5 w-5 text-orange-500" />
                      </div>
                      <h3 className="font-bold">Recent Billing</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { date: '15 Mar 2026', amount: 'Rs.12,499', desc: 'Yearly Subscription' },
                        { date: '15 Mar 2025', amount: 'Rs.12,499', desc: 'Yearly Subscription' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                          <div>
                            <p className="text-xs font-semibold">{item.desc}</p>
                            <p className="text-[10px] text-muted-foreground">{item.date}</p>
                          </div>
                          <p className="text-xs font-bold">{item.amount}</p>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full text-xs h-8 text-primary hover:bg-primary/5 rounded-lg">
                      View All History <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>

                  <div className="glass-card rounded-3xl p-6 border border-border/40 bg-indigo-500/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-indigo-500" />
                      </div>
                      <h3 className="font-bold text-indigo-600 dark:text-indigo-400">Mobile App Access</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your current plan includes full access to the <span className="font-semibold text-foreground">AutoCare Pro Mobile</span> app for your mechanics and service advisors.
                    </p>
                    <div className="flex gap-2">
                       <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white text-[10px] font-bold">App</div>
                       <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white text-[10px] font-bold">Play</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Tabs>

      <AnimatePresence>
        {showPlanPortal && (
          <PlanManagementPortal 
            currentPlan={subscriptionStatus.plan}
            onClose={() => setShowPlanPortal(false)}
            onPlanChange={handlePlanChange}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SCSettings;

