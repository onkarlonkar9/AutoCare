import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  Plus,
  MoreVertical,
  LayoutGrid,
  List,
  Archive,
  Wrench,
  Boxes,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Truck,
  QrCode,
  ClipboardList,
  Shield,
  ArrowRightLeft,
  ClipboardCheck,
  TrendingUp,
  ShoppingCart,
  CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type SupplyCategory = 'Storage' | 'Tools' | 'Equipment' | 'Consumables';
type SupplyStatus = 'Available' | 'In Use' | 'Maintenance' | 'Low Stock';
type SupplyRole = 'Owner' | 'Manager' | 'Technician' | 'Storekeeper';
type MovementType = 'IN' | 'OUT' | 'ADJUST';
type PurchaseStatus = 'Draft' | 'Ordered' | 'Partially Received' | 'Received';

interface WorkshopSupply {
  id: string;
  name: string;
  category: SupplyCategory;
  quantity: number;
  minThreshold: number;
  dailyUsage: number;
  unitCost: number;
  status: SupplyStatus;
  location: string;
  supplierName: string;
  supplierLeadDays: number;
  supplierLastPrice: number;
  bins: Array<{ bin: string; qty: number }>;
  batches: Array<{ lotNo: string; qty: number; expiry: string }>;
  lastMaintained?: string;
  nextMaintenance?: string;
  barcode?: string;
}

interface StockMovement {
  id: string;
  supplyId: string;
  supplyName: string;
  type: MovementType;
  qty: number;
  reason: string;
  user: string;
  at: string;
}

interface PurchaseRequest {
  id: string;
  supplyId: string;
  supplyName: string;
  qty: number;
  supplierName: string;
  status: PurchaseStatus;
  expectedDate: string;
}

const DEFAULT_SUPPLIES: WorkshopSupply[] = [
  {
    id: '1',
    name: 'Master Tool Cabinet',
    category: 'Storage',
    quantity: 2,
    minThreshold: 1,
    dailyUsage: 0.1,
    unitCost: 320,
    status: 'Available',
    location: 'Bay 1 & 4',
    supplierName: 'MetalPro Storage',
    supplierLeadDays: 7,
    supplierLastPrice: 299,
    bins: [
      { bin: 'Bay 1', qty: 1 },
      { bin: 'Bay 4', qty: 1 },
    ],
    batches: [],
    lastMaintained: '2026-02-12',
    nextMaintenance: '2026-05-12',
    barcode: 'SUP-1-MTC',
  },
  {
    id: '2',
    name: 'Heavy Duty Racks',
    category: 'Storage',
    quantity: 12,
    minThreshold: 3,
    dailyUsage: 0.2,
    unitCost: 110,
    status: 'Available',
    location: 'Inventory Room',
    supplierName: 'MetalPro Storage',
    supplierLeadDays: 10,
    supplierLastPrice: 98,
    bins: [
      { bin: 'Store A', qty: 8 },
      { bin: 'Store B', qty: 4 },
    ],
    batches: [],
    barcode: 'SUP-2-HDR',
  },
  {
    id: '3',
    name: 'Pneumatic Impact Wrench',
    category: 'Equipment',
    quantity: 5,
    minThreshold: 2,
    dailyUsage: 0.4,
    unitCost: 185,
    status: 'In Use',
    location: 'Bay 2',
    supplierName: 'TorqueMax Tools',
    supplierLeadDays: 6,
    supplierLastPrice: 170,
    bins: [
      { bin: 'Bay 2', qty: 3 },
      { bin: 'Tool Room', qty: 2 },
    ],
    batches: [],
    lastMaintained: '2026-02-20',
    nextMaintenance: '2026-04-20',
    barcode: 'SUP-3-PIW',
  },
  {
    id: '4',
    name: 'Hydraulic Floor Jack',
    category: 'Equipment',
    quantity: 3,
    minThreshold: 2,
    dailyUsage: 0.15,
    unitCost: 240,
    status: 'Maintenance',
    location: 'Service Area',
    supplierName: 'LiftCore Equipments',
    supplierLeadDays: 8,
    supplierLastPrice: 220,
    bins: [{ bin: 'Service Area', qty: 3 }],
    batches: [],
    lastMaintained: '2026-01-29',
    nextMaintenance: '2026-03-20',
    barcode: 'SUP-4-HFJ',
  },
  {
    id: '5',
    name: 'Engine Oil 5W30',
    category: 'Consumables',
    quantity: 26,
    minThreshold: 20,
    dailyUsage: 4,
    unitCost: 12,
    status: 'Low Stock',
    location: 'Consumables Shelf',
    supplierName: 'LubeNation',
    supplierLeadDays: 4,
    supplierLastPrice: 11,
    bins: [
      { bin: 'Shelf C1', qty: 18 },
      { bin: 'Quick Bay', qty: 8 },
    ],
    batches: [
      { lotNo: 'LOT-EO-041', qty: 10, expiry: '2026-05-02' },
      { lotNo: 'LOT-EO-039', qty: 16, expiry: '2026-11-15' },
    ],
    barcode: 'SUP-5-EO530',
  },
  {
    id: '6',
    name: 'Brake Cleaner Spray',
    category: 'Consumables',
    quantity: 9,
    minThreshold: 12,
    dailyUsage: 2,
    unitCost: 6,
    status: 'Low Stock',
    location: 'Chemical Locker',
    supplierName: 'ChemAuto Supply',
    supplierLeadDays: 3,
    supplierLastPrice: 5.5,
    bins: [{ bin: 'Locker B2', qty: 9 }],
    batches: [{ lotNo: 'LOT-BC-808', qty: 9, expiry: '2026-04-10' }],
    barcode: 'SUP-6-BCS',
  },
];

const makeId = () => Math.random().toString(36).slice(2, 10);

const nowIso = () => new Date().toISOString();

const dayDiff = (futureDate: string) => {
  const ms = new Date(futureDate).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const Supplies = () => {
  const [supplies, setSupplies] = useState<WorkshopSupply[]>(DEFAULT_SUPPLIES);
  const [currentRole, setCurrentRole] = useState<SupplyRole>('Manager');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [activeOpsTab, setActiveOpsTab] = useState('overview');

  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSupply, setNewSupply] = useState<Partial<WorkshopSupply>>({
    name: '',
    category: 'Storage',
    quantity: 1,
    minThreshold: 1,
    dailyUsage: 1,
    unitCost: 0,
    status: 'Available',
    location: '',
    supplierName: '',
    supplierLeadDays: 5,
    supplierLastPrice: 0,
    bins: [],
    batches: [],
  });

  const [jobUsage, setJobUsage] = useState({ jobCardNo: '', supplyId: '', qty: 1 });
  const [transferForm, setTransferForm] = useState({ supplyId: '', fromBin: '', toBin: '', qty: 1 });
  const [qrInput, setQrInput] = useState('');
  const [batchForm, setBatchForm] = useState({ supplyId: '', lotNo: '', qty: 1, expiry: '' });

  const canManage = currentRole === 'Owner' || currentRole === 'Manager' || currentRole === 'Storekeeper';

  const lowStockItems = useMemo(
    () => supplies.filter((item) => item.quantity <= item.minThreshold),
    [supplies]
  );

  const riskRows = useMemo(
    () =>
      supplies.map((item) => {
        const daysLeft = item.dailyUsage > 0 ? Math.floor(item.quantity / item.dailyUsage) : 999;
        const priority = daysLeft <= 3 ? 'Critical' : daysLeft <= 7 ? 'Soon' : 'Healthy';
        return { ...item, daysLeft, priority };
      }),
    [supplies]
  );

  const filteredSupplies = supplies.filter((item) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(search) || item.location.toLowerCase().includes(search);
    const matchesCategory =
      activeCategoryTab === 'all' || item.category.toLowerCase() === activeCategoryTab.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const pushMovement = (item: WorkshopSupply, type: MovementType, qty: number, reason: string) => {
    const movement: StockMovement = {
      id: makeId(),
      supplyId: item.id,
      supplyName: item.name,
      type,
      qty,
      reason,
      user: currentRole,
      at: nowIso(),
    };
    setStockMovements((prev) => [movement, ...prev].slice(0, 50));
  };

  const updateStatusFromQty = (supply: WorkshopSupply): SupplyStatus => {
    if (supply.status === 'Maintenance') return 'Maintenance';
    if (supply.quantity <= supply.minThreshold) return 'Low Stock';
    if (supply.status === 'In Use') return 'In Use';
    return 'Available';
  };

  const adjustSupplyQuantity = (supplyId: string, delta: number, reason: string, movementType: MovementType) => {
    let changed: WorkshopSupply | null = null;
    setSupplies((prev) =>
      prev.map((item) => {
        if (item.id !== supplyId) return item;
        const nextQty = Math.max(0, item.quantity + delta);
        const next = { ...item, quantity: nextQty };
        next.status = updateStatusFromQty(next);
        changed = next;
        return next;
      })
    );
    if (changed) {
      pushMovement(changed, movementType, Math.abs(delta), reason);
    }
  };

  const handleAddSupply = () => {
    if (!canManage) {
      toast.error('Your role cannot add supplies');
      return;
    }

    if (!newSupply.name || !newSupply.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const item: WorkshopSupply = {
      id: makeId(),
      name: newSupply.name,
      category: (newSupply.category as SupplyCategory) || 'Storage',
      quantity: Number(newSupply.quantity) || 1,
      minThreshold: Number(newSupply.minThreshold) || 1,
      dailyUsage: Number(newSupply.dailyUsage) || 1,
      unitCost: Number(newSupply.unitCost) || 0,
      status: (newSupply.status as SupplyStatus) || 'Available',
      location: newSupply.location,
      supplierName: newSupply.supplierName || 'Unknown Supplier',
      supplierLeadDays: Number(newSupply.supplierLeadDays) || 5,
      supplierLastPrice: Number(newSupply.supplierLastPrice) || Number(newSupply.unitCost) || 0,
      bins: [{ bin: newSupply.location, qty: Number(newSupply.quantity) || 1 }],
      batches: [],
      barcode: `SUP-${makeId().toUpperCase()}`,
    };

    setSupplies([item, ...supplies]);
    pushMovement(item, 'IN', item.quantity, 'Initial stock');
    setIsAddModalOpen(false);
    setNewSupply({
      name: '',
      category: 'Storage',
      quantity: 1,
      minThreshold: 1,
      dailyUsage: 1,
      unitCost: 0,
      status: 'Available',
      location: '',
      supplierName: '',
      supplierLeadDays: 5,
      supplierLastPrice: 0,
      bins: [],
      batches: [],
    });
    toast.success(`${item.name} added to supplies`);
  };

  const createReorder = (item: WorkshopSupply) => {
    if (!canManage) {
      toast.error('Your role cannot create purchase requests');
      return;
    }

    const req: PurchaseRequest = {
      id: makeId(),
      supplyId: item.id,
      supplyName: item.name,
      qty: Math.max(item.minThreshold * 2 - item.quantity, 1),
      supplierName: item.supplierName,
      status: 'Draft',
      expectedDate: new Date(Date.now() + item.supplierLeadDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
    };
    setPurchaseRequests((prev) => [req, ...prev]);
    toast.success(`Purchase request created for ${item.name}`);
  };

  const movePurchaseStatus = (id: string) => {
    if (!canManage) {
      toast.error('Your role cannot update purchase status');
      return;
    }

    setPurchaseRequests((prev) =>
      prev.map((pr) => {
        if (pr.id !== id) return pr;
        if (pr.status === 'Draft') return { ...pr, status: 'Ordered' };
        if (pr.status === 'Ordered') return { ...pr, status: 'Partially Received' };
        if (pr.status === 'Partially Received') return { ...pr, status: 'Received' };
        return pr;
      })
    );
  };

  const receivePurchase = (pr: PurchaseRequest) => {
    if (!canManage) {
      toast.error('Your role cannot receive stock');
      return;
    }
    adjustSupplyQuantity(pr.supplyId, pr.qty, `PO received from ${pr.supplierName}`, 'IN');
    setPurchaseRequests((prev) => prev.map((x) => (x.id === pr.id ? { ...x, status: 'Received' } : x)));
    toast.success(`Received ${pr.qty} units of ${pr.supplyName}`);
  };

  const deductFromJobCard = () => {
    if (!jobUsage.jobCardNo || !jobUsage.supplyId || jobUsage.qty <= 0) {
      toast.error('Enter job card, item and quantity');
      return;
    }
    adjustSupplyQuantity(jobUsage.supplyId, -jobUsage.qty, `Job card ${jobUsage.jobCardNo}`, 'OUT');
    toast.success('Stock deducted from job card');
    setJobUsage({ jobCardNo: '', supplyId: '', qty: 1 });
  };

  const transferBetweenBins = () => {
    if (!canManage) {
      toast.error('Your role cannot transfer bins');
      return;
    }

    const { supplyId, fromBin, toBin, qty } = transferForm;
    if (!supplyId || !fromBin || !toBin || qty <= 0 || fromBin === toBin) {
      toast.error('Provide valid transfer values');
      return;
    }

    let isValid = false;

    setSupplies((prev) =>
      prev.map((item) => {
        if (item.id !== supplyId) return item;
        const source = item.bins.find((b) => b.bin === fromBin);
        if (!source || source.qty < qty) return item;
        isValid = true;

        const updatedBins = item.bins.map((b) =>
          b.bin === fromBin ? { ...b, qty: b.qty - qty } : b
        );

        const targetIndex = updatedBins.findIndex((b) => b.bin === toBin);
        if (targetIndex >= 0) {
          updatedBins[targetIndex] = { ...updatedBins[targetIndex], qty: updatedBins[targetIndex].qty + qty };
        } else {
          updatedBins.push({ bin: toBin, qty });
        }

        return {
          ...item,
          bins: updatedBins.filter((b) => b.qty > 0),
          location: toBin,
        };
      })
    );

    if (!isValid) {
      toast.error('Not enough quantity in source bin');
      return;
    }

    const selected = supplies.find((s) => s.id === supplyId);
    if (selected) {
      pushMovement(selected, 'ADJUST', qty, `Transfer ${fromBin} -> ${toBin}`);
    }
    toast.success('Bin transfer completed');
    setTransferForm({ supplyId: '', fromBin: '', toBin: '', qty: 1 });
  };

  const markMaintenanceDone = (item: WorkshopSupply) => {
    if (!canManage) {
      toast.error('Your role cannot update maintenance');
      return;
    }
    const nextDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setSupplies((prev) =>
      prev.map((s) =>
        s.id === item.id
          ? {
              ...s,
              status: 'Available',
              lastMaintained: new Date().toISOString().slice(0, 10),
              nextMaintenance: nextDate,
            }
          : s
      )
    );
    toast.success(`Maintenance completed for ${item.name}`);
  };

  const findByQr = () => {
    const normalized = qrInput.trim().toLowerCase();
    const found = supplies.find((s) => s.barcode?.toLowerCase() === normalized || s.id === normalized);
    if (!found) {
      toast.error('No item found for this QR/barcode value');
      return;
    }
    setSearchQuery(found.name);
    toast.success(`Located ${found.name}`);
  };

  const addBatch = () => {
    if (!canManage) {
      toast.error('Your role cannot add batch details');
      return;
    }
    if (!batchForm.supplyId || !batchForm.lotNo || !batchForm.expiry || batchForm.qty <= 0) {
      toast.error('Enter all batch fields');
      return;
    }

    setSupplies((prev) =>
      prev.map((item) => {
        if (item.id !== batchForm.supplyId) return item;
        return {
          ...item,
          batches: [
            ...item.batches,
            { lotNo: batchForm.lotNo, qty: batchForm.qty, expiry: batchForm.expiry },
          ],
        };
      })
    );
    adjustSupplyQuantity(batchForm.supplyId, batchForm.qty, `Batch ${batchForm.lotNo} received`, 'IN');
    setBatchForm({ supplyId: '', lotNo: '', qty: 1, expiry: '' });
    toast.success('Batch added');
  };

  const getStatusBadge = (status: SupplyStatus) => {
    switch (status) {
      case 'Available':
        return <Badge className="bg-success/10 text-success border-success/20">Available</Badge>;
      case 'In Use':
        return <Badge className="bg-accent/10 text-accent border-accent/20">In Use</Badge>;
      case 'Maintenance':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Maintenance</Badge>;
      case 'Low Stock':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Low Stock</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: SupplyCategory) => {
    switch (category) {
      case 'Storage':
        return <Archive className="h-5 w-5" />;
      case 'Tools':
        return <Wrench className="h-5 w-5" />;
      case 'Equipment':
        return <Boxes className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const stockValue = supplies.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);
  const expiringSoon = supplies
    .flatMap((item) => item.batches.map((batch) => ({ item, batch })))
    .filter(({ batch }) => dayDiff(batch.expiry) <= 30)
    .sort((a, b) => dayDiff(a.batch.expiry) - dayDiff(b.batch.expiry));

  const topUsed = [...riskRows].sort((a, b) => b.dailyUsage - a.dailyUsage).slice(0, 4);

  const lowStockCount = lowStockItems.length;
  const criticalCount = riskRows.filter((r) => r.priority === 'Critical').length;
  const maintenanceDue = supplies.filter((s) => !!s.nextMaintenance && dayDiff(s.nextMaintenance) <= 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workshop Supplies</h1>
          <p className="text-muted-foreground">Inventory operations with stock, supplier, usage, bins, batches, and reporting.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-[170px]">
            <Select value={currentRole} onValueChange={(value) => setCurrentRole(value as SupplyRole)}>
              <SelectTrigger className="rounded-xl h-11">
                <Shield className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owner">Owner</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Storekeeper">Storekeeper</SelectItem>
                <SelectItem value="Technician">Technician</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl border border-border/40">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-9 w-9 rounded-lg"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-9 w-9 rounded-lg"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canManage} className="gradient-primary text-white rounded-xl h-11 px-6 shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50">
                <Plus className="h-5 w-5" /> Add Supply
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[32px] sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Add New Workshop Supply</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Supply Name</label>
                  <Input
                    placeholder="e.g. Tool Cabinet X-Series"
                    value={newSupply.name}
                    onChange={(e) => setNewSupply({ ...newSupply, name: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Category</label>
                    <Select
                      value={newSupply.category}
                      onValueChange={(val) => setNewSupply({ ...newSupply, category: val as SupplyCategory })}
                    >
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Storage">Storage</SelectItem>
                        <SelectItem value="Tools">Tools</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Consumables">Consumables</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Quantity</label>
                    <Input
                      type="number"
                      value={newSupply.quantity}
                      onChange={(e) => setNewSupply({ ...newSupply, quantity: Math.max(1, Number(e.target.value) || 1) })}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Min Threshold</label>
                    <Input
                      type="number"
                      value={newSupply.minThreshold}
                      onChange={(e) => setNewSupply({ ...newSupply, minThreshold: Math.max(1, Number(e.target.value) || 1) })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Daily Usage</label>
                    <Input
                      type="number"
                      value={newSupply.dailyUsage}
                      onChange={(e) => setNewSupply({ ...newSupply, dailyUsage: Math.max(0.1, Number(e.target.value) || 0.1) })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Unit Cost</label>
                    <Input
                      type="number"
                      value={newSupply.unitCost}
                      onChange={(e) => setNewSupply({ ...newSupply, unitCost: Math.max(0, Number(e.target.value) || 0) })}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Location</label>
                  <Input
                    placeholder="e.g. Bay 4 Shelving"
                    value={newSupply.location}
                    onChange={(e) => setNewSupply({ ...newSupply, location: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Supplier</label>
                    <Input
                      placeholder="Vendor name"
                      value={newSupply.supplierName}
                      onChange={(e) => setNewSupply({ ...newSupply, supplierName: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Lead Time (days)</label>
                    <Input
                      type="number"
                      value={newSupply.supplierLeadDays}
                      onChange={(e) => setNewSupply({ ...newSupply, supplierLeadDays: Math.max(1, Number(e.target.value) || 1) })}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSupply} className="w-full gradient-primary text-white rounded-xl h-12">
                  Confirm Addition
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!canManage && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Technician role has read-only access for purchase, stock adjustment, and maintenance actions.
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="glass-card rounded-2xl border border-border/40 p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Stock Value</p>
          <p className="text-2xl font-bold mt-1">${stockValue.toFixed(0)}</p>
        </div>
        <div className="glass-card rounded-2xl border border-border/40 p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Low Stock</p>
          <p className="text-2xl font-bold mt-1 text-destructive">{lowStockCount}</p>
        </div>
        <div className="glass-card rounded-2xl border border-border/40 p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Critical Days Left</p>
          <p className="text-2xl font-bold mt-1 text-warning">{criticalCount}</p>
        </div>
        <div className="glass-card rounded-2xl border border-border/40 p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Open POs</p>
          <p className="text-2xl font-bold mt-1">{purchaseRequests.filter((p) => p.status !== 'Received').length}</p>
        </div>
        <div className="glass-card rounded-2xl border border-border/40 p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Maintenance Due</p>
          <p className="text-2xl font-bold mt-1">{maintenanceDue.length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <Tabs value={activeCategoryTab} onValueChange={setActiveCategoryTab} className="w-full sm:w-auto">
          <TabsList className="bg-secondary/30 p-1 rounded-xl border border-border/40 h-11">
            <TabsTrigger value="all" className="rounded-lg px-6 data-[state=active]:bg-background shadow-sm">All</TabsTrigger>
            <TabsTrigger value="storage" className="rounded-lg px-6 data-[state=active]:bg-background shadow-sm">Storage</TabsTrigger>
            <TabsTrigger value="tools" className="rounded-lg px-6 data-[state=active]:bg-background shadow-sm">Tools</TabsTrigger>
            <TabsTrigger value="equipment" className="rounded-lg px-6 data-[state=active]:bg-background shadow-sm">Equipment</TabsTrigger>
            <TabsTrigger value="consumables" className="rounded-lg px-6 data-[state=active]:bg-background shadow-sm">Consumables</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search supplies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl h-11 border-border/40 bg-card/50"
          />
        </div>
      </div>

      <Tabs value={activeOpsTab} onValueChange={setActiveOpsTab}>
        <TabsList className="bg-secondary/30 p-1 rounded-xl border border-border/40 h-11 overflow-x-auto w-full justify-start">
          <TabsTrigger value="overview" className="rounded-lg px-4 data-[state=active]:bg-background">Overview</TabsTrigger>
          <TabsTrigger value="ledger" className="rounded-lg px-4 data-[state=active]:bg-background">Ledger</TabsTrigger>
          <TabsTrigger value="purchases" className="rounded-lg px-4 data-[state=active]:bg-background">Purchases</TabsTrigger>
          <TabsTrigger value="jobcards" className="rounded-lg px-4 data-[state=active]:bg-background">Job Cards</TabsTrigger>
          <TabsTrigger value="bins" className="rounded-lg px-4 data-[state=active]:bg-background">Bins</TabsTrigger>
          <TabsTrigger value="maintenance" className="rounded-lg px-4 data-[state=active]:bg-background">Maintenance</TabsTrigger>
          <TabsTrigger value="qr-batch" className="rounded-lg px-4 data-[state=active]:bg-background">QR + Batch</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg px-4 data-[state=active]:bg-background">Reports</TabsTrigger>
        </TabsList>
      </Tabs>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSupplies.map((item) => (
              <div
                key={item.id}
                className="group glass-card rounded-[32px] p-6 border border-border/40 hover:border-primary/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!canManage}
                      onClick={() => {
                        if (!canManage) return;
                        setSupplies((prev) => prev.filter((x) => x.id !== item.id));
                        toast.success(`${item.name} removed`);
                      }}
                      className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-destructive disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <span className="text-primary font-bold">x{item.quantity}</span>
                  </div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{item.category}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs font-medium">Location</span>
                    </div>
                    <p className="text-sm font-semibold truncate">{item.location}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs font-medium">Status</span>
                    </div>
                    <div className="flex justify-end pt-0.5">{getStatusBadge(item.status)}</div>
                  </div>
                </div>

                <Button variant="secondary" className="w-full rounded-xl bg-secondary/40 hover:bg-secondary/60 h-10 text-xs font-bold">
                  View Details
                </Button>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button
                    variant="outline"
                    disabled={!canManage}
                    onClick={() => createReorder(item)}
                    className="h-9 rounded-lg text-xs"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Reorder
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!canManage}
                    onClick={() => adjustSupplyQuantity(item.id, -1, 'Manual issue', 'OUT')}
                    className="h-9 rounded-lg text-xs"
                  >
                    -1 Issue
                  </Button>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="rounded-[32px] border border-border/40 bg-card/30 overflow-auto"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/20">
                  <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Supply Item</th>
                  <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Category</th>
                  <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Quantity</th>
                  <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Location</th>
                  <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Days Left</th>
                  <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredSupplies.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/10 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-secondary/40 flex items-center justify-center text-primary">
                          {getCategoryIcon(item.category)}
                        </div>
                        <span className="font-bold">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-6 text-sm font-medium text-muted-foreground">{item.category}</td>
                    <td className="p-6 font-bold">{item.quantity} units</td>
                    <td className="p-6 text-sm font-medium">{item.location}</td>
                    <td className="p-6">{getStatusBadge(item.status)}</td>
                    <td className="p-6 text-sm font-semibold">{Math.floor(item.quantity / Math.max(item.dailyUsage, 0.1))} d</td>
                    <td className="p-6 text-right">
                      <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {activeOpsTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-border/40 p-6 bg-card/40">
            <h3 className="font-bold flex items-center gap-2 mb-4"><TrendingUp className="h-4 w-4" /> Low Stock Intelligence</h3>
            <div className="space-y-3">
              {riskRows.slice(0, 6).map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20">
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {r.quantity} / Min {r.minThreshold} / {r.dailyUsage} per day</p>
                  </div>
                  <div className="text-right">
                    <Badge className={r.priority === 'Critical' ? 'bg-destructive/10 text-destructive' : r.priority === 'Soon' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}>
                      {r.priority}
                    </Badge>
                    <p className="text-xs mt-1">{r.daysLeft} days left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/40 p-6 bg-card/40">
            <h3 className="font-bold flex items-center gap-2 mb-4"><Truck className="h-4 w-4" /> Supplier Snapshot</h3>
            <div className="space-y-3">
              {supplies.slice(0, 6).map((s) => (
                <div key={s.id} className="p-3 rounded-xl bg-secondary/20 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.supplierName} • Lead {s.supplierLeadDays} days</p>
                  </div>
                  <p className="text-sm font-bold">${s.supplierLastPrice}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeOpsTab === 'ledger' && (
        <div className="rounded-3xl border border-border/40 bg-card/30 overflow-auto">
          <div className="p-6 border-b border-border/40 flex items-center gap-2 font-bold">
            <ClipboardList className="h-4 w-4" /> Stock Movement Ledger
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/20 text-left">
                <th className="p-4">Time</th>
                <th className="p-4">Item</th>
                <th className="p-4">Type</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Reason</th>
                <th className="p-4">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {stockMovements.length === 0 && (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={6}>No movements yet</td>
                </tr>
              )}
              {stockMovements.map((m) => (
                <tr key={m.id}>
                  <td className="p-4">{new Date(m.at).toLocaleString()}</td>
                  <td className="p-4 font-semibold">{m.supplyName}</td>
                  <td className="p-4"><Badge>{m.type}</Badge></td>
                  <td className="p-4">{m.qty}</td>
                  <td className="p-4">{m.reason}</td>
                  <td className="p-4">{m.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeOpsTab === 'purchases' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-border/40 p-6 bg-card/30">
            <h3 className="font-bold flex items-center gap-2 mb-3"><ShoppingCart className="h-4 w-4" /> Purchase Requests</h3>
            <div className="space-y-3">
              {purchaseRequests.length === 0 && <p className="text-sm text-muted-foreground">Create reorder from item cards or low-stock intelligence.</p>}
              {purchaseRequests.map((pr) => (
                <div key={pr.id} className="rounded-xl border border-border/30 p-3 flex flex-wrap gap-3 items-center justify-between">
                  <div>
                    <p className="font-semibold">{pr.supplyName} • Qty {pr.qty}</p>
                    <p className="text-xs text-muted-foreground">{pr.supplierName} • ETA {pr.expectedDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{pr.status}</Badge>
                    <Button size="sm" variant="outline" disabled={!canManage || pr.status === 'Received'} onClick={() => movePurchaseStatus(pr.id)}>
                      Next Status
                    </Button>
                    <Button size="sm" disabled={!canManage || pr.status === 'Received'} onClick={() => receivePurchase(pr)}>
                      Receive
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeOpsTab === 'jobcards' && (
        <div className="rounded-3xl border border-border/40 p-6 bg-card/30 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Job Card Stock Deduction</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <Input placeholder="Job card no" value={jobUsage.jobCardNo} onChange={(e) => setJobUsage({ ...jobUsage, jobCardNo: e.target.value })} />
            <Select value={jobUsage.supplyId} onValueChange={(v) => setJobUsage({ ...jobUsage, supplyId: v })}>
              <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
              <SelectContent>
                {supplies.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" value={jobUsage.qty} onChange={(e) => setJobUsage({ ...jobUsage, qty: Math.max(1, Number(e.target.value) || 1) })} />
            <Button onClick={deductFromJobCard}>Deduct</Button>
          </div>
        </div>
      )}

      {activeOpsTab === 'bins' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-border/40 p-6 bg-card/30">
            <h3 className="font-bold flex items-center gap-2 mb-4"><ArrowRightLeft className="h-4 w-4" /> Bin Transfer</h3>
            <div className="grid md:grid-cols-5 gap-3">
              <Select value={transferForm.supplyId} onValueChange={(v) => setTransferForm({ ...transferForm, supplyId: v })}>
                <SelectTrigger><SelectValue placeholder="Item" /></SelectTrigger>
                <SelectContent>
                  {supplies.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="From bin" value={transferForm.fromBin} onChange={(e) => setTransferForm({ ...transferForm, fromBin: e.target.value })} />
              <Input placeholder="To bin" value={transferForm.toBin} onChange={(e) => setTransferForm({ ...transferForm, toBin: e.target.value })} />
              <Input type="number" value={transferForm.qty} onChange={(e) => setTransferForm({ ...transferForm, qty: Math.max(1, Number(e.target.value) || 1) })} />
              <Button disabled={!canManage} onClick={transferBetweenBins}>Transfer</Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border/40 p-6 bg-card/30">
            <h4 className="font-bold mb-3">Location Breakdown</h4>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {supplies.map((s) => (
                <div key={s.id} className="p-3 rounded-xl bg-secondary/20">
                  <p className="font-semibold">{s.name}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    {s.bins.map((b) => (
                      <div key={`${s.id}-${b.bin}`} className="flex justify-between">
                        <span>{b.bin}</span>
                        <span className="font-bold">{b.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeOpsTab === 'maintenance' && (
        <div className="rounded-3xl border border-border/40 p-6 bg-card/30 space-y-3">
          <h3 className="font-bold flex items-center gap-2"><CalendarClock className="h-4 w-4" /> Tool Lifecycle and Maintenance</h3>
          {supplies.filter((s) => s.category === 'Equipment' || s.category === 'Tools').map((s) => (
            <div key={s.id} className="rounded-xl border border-border/30 p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground">Last {s.lastMaintained || 'N/A'} • Next {s.nextMaintenance || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2">
                {s.nextMaintenance && dayDiff(s.nextMaintenance) <= 7 ? (
                  <Badge className="bg-warning/10 text-warning"><AlertTriangle className="h-3 w-3 mr-1" /> Due Soon</Badge>
                ) : (
                  <Badge className="bg-success/10 text-success"><CheckCircle2 className="h-3 w-3 mr-1" /> Healthy</Badge>
                )}
                <Button size="sm" disabled={!canManage} onClick={() => markMaintenanceDone(s)}>Mark Done</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeOpsTab === 'qr-batch' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-border/40 p-6 bg-card/30 space-y-3">
            <h3 className="font-bold flex items-center gap-2"><QrCode className="h-4 w-4" /> QR/Barcode Lookup</h3>
            <div className="flex gap-2">
              <Input placeholder="Scan or paste code" value={qrInput} onChange={(e) => setQrInput(e.target.value)} />
              <Button onClick={findByQr}>Find</Button>
            </div>
            <p className="text-xs text-muted-foreground">Tip: use barcode like SUP-6-BCS.</p>
          </div>

          <div className="rounded-3xl border border-border/40 p-6 bg-card/30 space-y-3">
            <h3 className="font-bold flex items-center gap-2"><Package className="h-4 w-4" /> Batch + Expiry</h3>
            <div className="grid grid-cols-2 gap-3">
              <Select value={batchForm.supplyId} onValueChange={(v) => setBatchForm({ ...batchForm, supplyId: v })}>
                <SelectTrigger><SelectValue placeholder="Item" /></SelectTrigger>
                <SelectContent>
                  {supplies.filter((s) => s.category === 'Consumables').map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Lot No" value={batchForm.lotNo} onChange={(e) => setBatchForm({ ...batchForm, lotNo: e.target.value })} />
              <Input type="number" value={batchForm.qty} onChange={(e) => setBatchForm({ ...batchForm, qty: Math.max(1, Number(e.target.value) || 1) })} />
              <Input type="date" value={batchForm.expiry} onChange={(e) => setBatchForm({ ...batchForm, expiry: e.target.value })} />
            </div>
            <Button disabled={!canManage} onClick={addBatch}>Add Batch</Button>
          </div>

          <div className="rounded-3xl border border-border/40 p-6 bg-card/30 lg:col-span-2">
            <h4 className="font-bold mb-3">Expiry Alerts (30 days)</h4>
            <div className="space-y-2">
              {expiringSoon.length === 0 && <p className="text-sm text-muted-foreground">No near-expiry batches.</p>}
              {expiringSoon.map(({ item, batch }) => (
                <div key={`${item.id}-${batch.lotNo}`} className="p-3 rounded-xl bg-secondary/20 flex justify-between">
                  <div>
                    <p className="font-semibold">{item.name} • {batch.lotNo}</p>
                    <p className="text-xs text-muted-foreground">Qty {batch.qty}</p>
                  </div>
                  <Badge className="bg-warning/10 text-warning">{dayDiff(batch.expiry)} days</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeOpsTab === 'reports' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-border/40 p-6 bg-card/30 lg:col-span-2">
            <h3 className="font-bold mb-4">Fast-Moving vs Dead Stock</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {topUsed.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-secondary/20">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Usage/day {item.dailyUsage} • Qty {item.quantity}</p>
                </div>
              ))}
              {supplies
                .filter((s) => s.dailyUsage <= 0.2)
                .slice(0, 4)
                .map((item) => (
                  <div key={`dead-${item.id}`} className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Likely dead stock</p>
                  </div>
                ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border/40 p-6 bg-card/30">
            <h3 className="font-bold mb-4">Variance Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Total Items</span><span className="font-bold">{supplies.length}</span></div>
              <div className="flex justify-between"><span>Low Stock</span><span className="font-bold text-destructive">{lowStockCount}</span></div>
              <div className="flex justify-between"><span>Stock Value</span><span className="font-bold">${stockValue.toFixed(0)}</span></div>
              <div className="flex justify-between"><span>Movements Logged</span><span className="font-bold">{stockMovements.length}</span></div>
              <div className="flex justify-between"><span>Open Purchases</span><span className="font-bold">{purchaseRequests.filter((p) => p.status !== 'Received').length}</span></div>
            </div>
          </div>
        </div>
      )}

      {filteredSupplies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 glass-card rounded-[40px] border-dashed">
          <div className="h-20 w-20 rounded-full bg-secondary/30 flex items-center justify-center text-muted-foreground">
            <Search className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">No supplies found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
          <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveCategoryTab('all'); }} className="rounded-xl px-6">
            Clear All Filters
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default Supplies;
