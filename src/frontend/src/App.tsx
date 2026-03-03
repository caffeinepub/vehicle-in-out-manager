import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Car,
  ChevronRight,
  Clock,
  Download,
  FileText,
  KeyRound,
  Loader2,
  LogIn,
  LogOut,
  Package,
  Plus,
  Shield,
  Trash2,
  Truck,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { VehicleRecord } from "./backend.d";
import {
  useAddRecord,
  useDeleteRecord,
  useGetAllRecords,
} from "./hooks/useQueries";

// ─── User Management ─────────────────────────────────────────────────────────

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const MAX_USERS = 3;
const LS_USERS_KEY = "vehicle_users";

interface ManagedUser {
  username: string;
  password: string;
}

function loadManagedUsers(): ManagedUser[] {
  try {
    const stored = localStorage.getItem(LS_USERS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveManagedUsers(users: ManagedUser[]) {
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
}

function validateLogin(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) return true;
  const users = loadManagedUsers();
  return users.some((u) => u.username === username && u.password === password);
}

// ─── Manage Users Dialog ─────────────────────────────────────────────────────

function ManageUsersDialog() {
  const [users, setUsers] = useState<ManagedUser[]>(loadManagedUsers);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const handleCreate = useCallback(() => {
    const trimUser = newUsername.trim().toLowerCase();
    const trimPass = newPassword.trim();
    setError("");

    if (!trimUser || !trimPass) {
      setError("Both username and password are required.");
      return;
    }
    if (trimUser === ADMIN_USERNAME) {
      setError(`"${ADMIN_USERNAME}" is reserved and cannot be used.`);
      return;
    }
    if (users.some((u) => u.username === trimUser)) {
      setError(`Username "${trimUser}" already exists.`);
      return;
    }
    if (users.length >= MAX_USERS) {
      setError(`Maximum ${MAX_USERS} users reached.`);
      return;
    }

    const updated = [...users, { username: trimUser, password: trimPass }];
    setUsers(updated);
    saveManagedUsers(updated);
    setNewUsername("");
    setNewPassword("");
    toast.success(`User "${trimUser}" created successfully`);
  }, [newUsername, newPassword, users]);

  const handleDelete = useCallback(
    (username: string) => {
      const updated = users.filter((u) => u.username !== username);
      setUsers(updated);
      saveManagedUsers(updated);
      toast.success(`User "${username}" deleted`);
    },
    [users],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="btn-primary-glow border-primary/40 text-primary hover:bg-primary/10 hover:text-primary gap-1.5"
        >
          <Users className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Manage Users</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-base">
            <Shield className="h-4 w-4 text-primary" />
            User Management
          </DialogTitle>
        </DialogHeader>

        {/* Counter */}
        <div className="flex items-center justify-between rounded-md border border-border bg-muted px-3 py-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Users Created
          </span>
          <Badge
            variant="secondary"
            className={`font-mono text-xs ${users.length >= MAX_USERS ? "bg-destructive/20 text-destructive border-destructive/30" : "bg-primary/20 text-primary border-primary/30"}`}
          >
            {users.length} / {MAX_USERS}
          </Badge>
        </div>

        {/* Existing Users */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Current Users
          </p>
          {users.length === 0 ? (
            <div className="rounded-md border border-border border-dashed bg-muted/30 px-4 py-5 text-center">
              <UserPlus className="h-5 w-5 text-muted-foreground mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground">
                No users yet. Add up to {MAX_USERS} below.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden divide-y divide-border">
              {users.map((u) => (
                <div
                  key={u.username}
                  className="flex items-center justify-between px-3 py-2.5 bg-card hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground font-vehicle">
                      {u.username}
                    </span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(u.username)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete user</TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create New User */}
        {users.length < MAX_USERS && (
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Create New User
            </p>
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Username
                </Label>
                <Input
                  value={newUsername}
                  onChange={(e) => {
                    setNewUsername(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                  }}
                  placeholder="Enter username"
                  className="bg-muted border-input focus-visible:ring-primary h-9 text-sm"
                  maxLength={30}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Password
                </Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                  }}
                  placeholder="Enter password"
                  className="bg-muted border-input focus-visible:ring-primary h-9 text-sm"
                  maxLength={50}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    key="user-error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                  >
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handleCreate}
                disabled={!newUsername.trim() || !newPassword.trim()}
                className="w-full btn-in h-9 font-display font-semibold text-sm gap-2 disabled:opacity-40"
              >
                <UserPlus className="h-4 w-4" />
                Create User
              </Button>
            </div>
          </div>
        )}

        {users.length >= MAX_USERS && (
          <p className="text-center text-xs text-muted-foreground border border-amber-500/20 bg-amber-500/10 text-amber-400 rounded-md px-3 py-2">
            Maximum of {MAX_USERS} users reached. Delete a user to add another.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setIsLoading(true);

      // Simulate a brief auth delay for UX polish
      setTimeout(() => {
        const trimmedUser = username.trim().toLowerCase();
        if (validateLogin(trimmedUser, password)) {
          onLogin(trimmedUser);
        } else {
          setError("Invalid username or password");
          setIsLoading(false);
        }
      }, 500);
    },
    [username, password, onLogin],
  );

  return (
    <div className="relative min-h-screen panel-grid flex items-center justify-center p-4">
      {/* Ambient glow blobs */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.78 0.17 75 / 0.35) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.6 0.2 210 / 0.5) 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 border border-primary/40 mb-4 shadow-lg shadow-primary/10">
            <Truck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground tracking-tight">
            Vehicle In/Out Manager
          </h1>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">
            Fleet Time Tracking System
          </p>
        </motion.div>

        {/* Card */}
        <Card className="border-border bg-card shadow-2xl shadow-black/40">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="flex items-center gap-2 font-display text-sm text-muted-foreground font-medium tracking-wider uppercase">
              <KeyRound className="h-3.5 w-3.5 text-primary" />
              Secure Access
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="username"
                  className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
                >
                  <User className="h-3 w-3" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter username"
                  autoComplete="username"
                  autoFocus
                  className="bg-muted border-input focus-visible:ring-primary font-vehicle h-10"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
                >
                  <KeyRound className="h-3 w-3" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="bg-muted border-input focus-visible:ring-primary h-10"
                />
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    role="alert"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading || !username.trim() || !password}
                className="btn-in w-full h-11 font-display font-semibold text-sm gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isLoading ? "Authenticating…" : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Default credentials hint */}
        <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">
            Default Admin Credentials
          </p>
          <p className="text-xs font-mono text-foreground">
            Username: <span className="text-primary font-semibold">admin</span>
            &nbsp;&nbsp;|&nbsp;&nbsp; Password:{" "}
            <span className="text-primary font-semibold">admin123</span>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}

const PRESET_VEHICLES: string[] = [];

const LS_KEY = "vehicle_custom_list";

function loadCustomVehicles(): string[] {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomVehicles(vehicles: string[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(vehicles));
}

const LS_SUPPLIER_KEY = "vehicle_supplier_list";

function loadCustomSuppliers(): string[] {
  try {
    const stored = localStorage.getItem(LS_SUPPLIER_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomSuppliers(suppliers: string[]) {
  localStorage.setItem(LS_SUPPLIER_KEY, JSON.stringify(suppliers));
}

const LS_DRIVER_KEY = "vehicle_driver_list";

function loadCustomDrivers(): string[] {
  try {
    const stored = localStorage.getItem(LS_DRIVER_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomDrivers(drivers: string[]) {
  localStorage.setItem(LS_DRIVER_KEY, JSON.stringify(drivers));
}

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${min}:${ss}`;
}

function exportExcel(records: VehicleRecord[]) {
  const sorted = [...records].sort((a, b) => Number(b.id) - Number(a.id));
  const headers = [
    "#",
    "Vehicle Number",
    "Driver Name",
    "Action",
    "Supplier",
    "Units",
    "Challan No.",
    "Date",
    "Time",
  ];
  const escapeCell = (val: string | number) => {
    const s = String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const rows = sorted.map((r, i) => [
    i + 1,
    r.vehicleNumber,
    r.driverName || "",
    r.action,
    r.supplier || "",
    Number(r.units),
    r.challanNumber || "",
    r.date,
    r.time,
  ]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vehicle_log.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            {label}
          </p>
          <p className={`text-2xl font-display font-bold mt-1 ${color}`}>
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-md ${color} bg-current opacity-10`} />
        <Icon
          className={`absolute right-4 top-4 h-8 w-8 opacity-15 ${color}`}
        />
      </div>
    </motion.div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const isLoggedIn = currentUser !== null;
  const isAdmin = currentUser === ADMIN_USERNAME;
  const [now, setNow] = useState(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [customVehicle, setCustomVehicle] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [customVehicles, setCustomVehicles] =
    useState<string[]>(loadCustomVehicles);
  const [newVehicleInput, setNewVehicleInput] = useState<string>("");
  const [supplier, setSupplier] = useState<string>("");
  const [customSuppliers, setCustomSuppliers] =
    useState<string[]>(loadCustomSuppliers);
  const [newSupplierInput, setNewSupplierInput] = useState<string>("");
  const [driverName, setDriverName] = useState<string>("");
  const [customDrivers, setCustomDrivers] =
    useState<string[]>(loadCustomDrivers);
  const [newDriverInput, setNewDriverInput] = useState<string>("");
  const [units, setUnits] = useState<number>(0);
  const [challanNumber, setChallanNumber] = useState<string>("");

  const handleAddVehicle = useCallback(() => {
    const trimmed = newVehicleInput.trim().toUpperCase();
    if (!trimmed) return;
    const combined = [...PRESET_VEHICLES, ...customVehicles];
    if (combined.includes(trimmed)) {
      toast.error(`${trimmed} is already in the list`);
      return;
    }
    const updated = [...customVehicles, trimmed];
    setCustomVehicles(updated);
    saveCustomVehicles(updated);
    setNewVehicleInput("");
    setSelectedVehicle(trimmed);
    toast.success(`${trimmed} added to the list`);
  }, [newVehicleInput, customVehicles]);

  const handleRemoveCustomVehicle = useCallback(
    (vehicle: string) => {
      const updated = customVehicles.filter((v) => v !== vehicle);
      setCustomVehicles(updated);
      saveCustomVehicles(updated);
      if (selectedVehicle === vehicle) setSelectedVehicle("");
      toast.success(`${vehicle} removed from the list`);
    },
    [customVehicles, selectedVehicle],
  );

  const handleAddSupplier = useCallback(() => {
    const trimmed = newSupplierInput.trim();
    if (!trimmed) return;
    if (customSuppliers.includes(trimmed)) {
      toast.error(`"${trimmed}" is already in the supplier list`);
      return;
    }
    const updated = [...customSuppliers, trimmed];
    setCustomSuppliers(updated);
    saveCustomSuppliers(updated);
    setNewSupplierInput("");
    setSupplier(trimmed);
    toast.success(`"${trimmed}" added to suppliers`);
  }, [newSupplierInput, customSuppliers]);

  const handleRemoveCustomSupplier = useCallback(
    (s: string) => {
      const updated = customSuppliers.filter((v) => v !== s);
      setCustomSuppliers(updated);
      saveCustomSuppliers(updated);
      if (supplier === s) setSupplier("");
      toast.success(`"${s}" removed from suppliers`);
    },
    [customSuppliers, supplier],
  );

  const handleAddDriver = useCallback(() => {
    const trimmed = newDriverInput.trim();
    if (!trimmed) return;
    if (customDrivers.includes(trimmed)) {
      toast.error(`"${trimmed}" is already in the driver list`);
      return;
    }
    const updated = [...customDrivers, trimmed];
    setCustomDrivers(updated);
    saveCustomDrivers(updated);
    setNewDriverInput("");
    setDriverName(trimmed);
    toast.success(`"${trimmed}" added to drivers`);
  }, [newDriverInput, customDrivers]);

  const handleRemoveCustomDriver = useCallback(
    (d: string) => {
      const updated = customDrivers.filter((v) => v !== d);
      setCustomDrivers(updated);
      saveCustomDrivers(updated);
      if (driverName === d) setDriverName("");
      toast.success(`"${d}" removed from drivers`);
    },
    [customDrivers, driverName],
  );

  const { data: records = [], isLoading } = useGetAllRecords();
  const addRecord = useAddRecord();
  const deleteRecord = useDeleteRecord();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentDate = formatDate(now);
  const currentTime = formatTime(now);

  const activeVehicleNumber = useCustom
    ? customVehicle.trim().toUpperCase()
    : selectedVehicle;

  const handleAction = useCallback(
    async (action: "IN" | "OUT") => {
      const vehicleNum = activeVehicleNumber;
      if (!vehicleNum) {
        toast.error("Please select or enter a vehicle number");
        return;
      }
      const logTime = formatTime(new Date());
      const logDate = formatDate(new Date());
      try {
        await addRecord.mutateAsync({
          vehicleNumber: vehicleNum,
          action,
          date: logDate,
          time: logTime,
          supplier: supplier.trim(),
          units: BigInt(units),
          driverName: driverName.trim(),
          challanNumber: challanNumber.trim(),
        });
        toast.success(`Vehicle ${vehicleNum} logged ${action} at ${logTime}`);
        setSupplier("");
        setNewSupplierInput("");
        setDriverName("");
        setNewDriverInput("");
        setUnits(0);
        setChallanNumber("");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes("Actor not initialized") ||
          msg.includes("not initialized")
        ) {
          toast.error(
            "System is still loading. Please wait a moment and try again.",
          );
        } else {
          toast.error(`Failed to log vehicle: ${msg}`);
        }
      }
    },
    [
      activeVehicleNumber,
      addRecord,
      supplier,
      units,
      driverName,
      challanNumber,
    ],
  );

  const handleDelete = useCallback(
    async (id: bigint) => {
      setDeletingId(id);
      try {
        await deleteRecord.mutateAsync(id);
        toast.success("Record deleted");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Failed to delete record: ${msg}`);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteRecord],
  );

  const sortedRecords = [...records].sort(
    (a, b) => Number(b.id) - Number(a.id),
  );

  const totalIn = records.filter((r) => r.action === "IN").length;
  const totalOut = records.filter((r) => r.action === "OUT").length;

  // ── One-vehicle-at-a-time rule ────────────────────────────────────────────
  // Find the vehicle whose most recent record is "IN" (it hasn't exited yet).
  const currentlyInsideVehicle: string | null = (() => {
    // Group records by vehicle number, keep only the latest per vehicle.
    const latestByVehicle = new Map<string, { id: bigint; action: string }>();
    for (const r of records) {
      const existing = latestByVehicle.get(r.vehicleNumber);
      if (!existing || r.id > existing.id) {
        latestByVehicle.set(r.vehicleNumber, { id: r.id, action: r.action });
      }
    }
    for (const [vehicleNumber, latest] of latestByVehicle.entries()) {
      if (latest.action === "IN") return vehicleNumber;
    }
    return null;
  })();

  // When a vehicle is currently inside, auto-select it in the dropdown so the
  // operator can quickly log it OUT.
  // We use a ref-guard to avoid overriding explicit user selections.
  const prevInsideRef = useRef<string | null>(null);
  if (
    currentlyInsideVehicle !== null &&
    currentlyInsideVehicle !== prevInsideRef.current
  ) {
    // Auto-select: only switch to the inside vehicle if the user hasn't
    // already selected it and we are using the dropdown (not custom input).
    if (!useCustom && selectedVehicle !== currentlyInsideVehicle) {
      // Schedule the state update outside the render phase.
      setTimeout(() => setSelectedVehicle(currentlyInsideVehicle), 0);
    }
    prevInsideRef.current = currentlyInsideVehicle;
  }
  if (currentlyInsideVehicle === null && prevInsideRef.current !== null) {
    prevInsideRef.current = null;
  }

  // Block logging IN when another vehicle is already inside.
  const isInBlocked =
    currentlyInsideVehicle !== null &&
    currentlyInsideVehicle !== activeVehicleNumber;

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLogin={(username) => setCurrentUser(username)} />
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "oklch(0.22 0.02 240)",
              border: "1px solid oklch(0.32 0.025 240)",
              color: "oklch(0.94 0.01 240)",
            },
          }}
        />
      </>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative min-h-screen panel-grid">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/20 border border-primary/30">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-base sm:text-lg leading-none text-foreground">
                    Vehicle In/Out Manager
                  </h1>
                  <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                    Fleet Time Tracking System
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <div className="hidden sm:flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 border border-border">
                  <Activity className="h-3 w-3 text-success" />
                  <span className="text-xs font-mono text-muted-foreground">
                    {currentTime}
                  </span>
                </div>
                {records.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportExcel(records)}
                    className="btn-primary-glow border-primary/40 text-primary hover:bg-primary/10 hover:text-primary gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export Excel</span>
                  </Button>
                )}
                {/* Show logged-in user chip */}
                <div className="hidden sm:flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 border border-border">
                  {isAdmin ? (
                    <Shield className="h-3 w-3 text-primary" />
                  ) : (
                    <User className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className="text-xs font-mono text-muted-foreground capitalize">
                    {currentUser}
                  </span>
                </div>
                {/* Manage Users — admin only */}
                {isAdmin && <ManageUsersDialog />}
                {/* Logout */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentUser(null)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Logout</TooltipContent>
                </Tooltip>
              </motion.div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <StatCard
              label="Total Records"
              value={records.length}
              icon={Car}
              color="text-primary"
            />
            <StatCard
              label="Vehicle IN"
              value={totalIn}
              icon={LogIn}
              color="text-success"
            />
            <StatCard
              label="Vehicle OUT"
              value={totalOut}
              icon={LogOut}
              color="text-destructive"
            />
            <StatCard
              label="Today's Date"
              value={currentDate}
              icon={Calendar}
              color="text-primary"
            />
          </motion.div>

          {/* Entry Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border bg-card overflow-hidden">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  Log Vehicle Entry / Exit
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {/* Vehicle Number */}
                  <div className="sm:col-span-2 xl:col-span-2 space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Vehicle Number
                    </Label>
                    <div className="space-y-2">
                      {!useCustom ? (
                        <>
                          <Select
                            value={selectedVehicle}
                            onValueChange={setSelectedVehicle}
                          >
                            <SelectTrigger className="font-vehicle bg-muted border-input focus:ring-primary">
                              <SelectValue placeholder="Select a vehicle…" />
                            </SelectTrigger>
                            <SelectContent>
                              {customVehicles.length === 0 ? (
                                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                  No vehicles yet. Add one below.
                                </div>
                              ) : (
                                <>
                                  <div className="px-2 py-1">
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                                      My Vehicles
                                    </span>
                                  </div>
                                  {customVehicles.map((v) => (
                                    <div
                                      key={v}
                                      className="flex items-center justify-between pr-1"
                                    >
                                      <SelectItem
                                        value={v}
                                        className="font-vehicle flex-1"
                                      >
                                        {v}
                                      </SelectItem>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveCustomVehicle(v);
                                        }}
                                        className="ml-1 p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                                        title={`Remove ${v}`}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          {/* Add new vehicle to list */}
                          <div className="flex gap-1.5">
                            <Input
                              value={newVehicleInput}
                              onChange={(e) =>
                                setNewVehicleInput(e.target.value.toUpperCase())
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddVehicle();
                              }}
                              placeholder="Add vehicle number…"
                              className="font-vehicle bg-muted border-input focus-visible:ring-primary uppercase h-8 text-xs flex-1"
                              maxLength={15}
                            />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={handleAddVehicle}
                                  disabled={!newVehicleInput.trim()}
                                  className="h-8 w-8 flex-shrink-0 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-40"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Add to list</TooltipContent>
                            </Tooltip>
                          </div>
                        </>
                      ) : (
                        <Input
                          value={customVehicle}
                          onChange={(e) =>
                            setCustomVehicle(e.target.value.toUpperCase())
                          }
                          placeholder="e.g. MH01AB1234"
                          className="font-vehicle bg-muted border-input focus-visible:ring-primary uppercase"
                          maxLength={15}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setUseCustom(!useCustom);
                          setCustomVehicle("");
                          setSelectedVehicle("");
                        }}
                        className="text-xs text-primary hover:underline underline-offset-2 transition-colors"
                      >
                        {useCustom
                          ? "← Choose from list"
                          : "Type custom number →"}
                      </button>
                    </div>
                  </div>

                  {/* Supplier */}
                  <div className="xl:col-span-2 space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Package className="h-3 w-3" /> Supplier
                    </Label>
                    <div className="space-y-2">
                      <Select value={supplier} onValueChange={setSupplier}>
                        <SelectTrigger className="bg-muted border-input focus:ring-primary">
                          <SelectValue placeholder="Select a supplier…" />
                        </SelectTrigger>
                        <SelectContent>
                          {customSuppliers.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                              No suppliers yet. Add one below.
                            </div>
                          ) : (
                            <>
                              <div className="px-2 py-1">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                                  My Suppliers
                                </span>
                              </div>
                              {customSuppliers.map((s) => (
                                <div
                                  key={s}
                                  className="flex items-center justify-between pr-1"
                                >
                                  <SelectItem value={s} className="flex-1">
                                    {s}
                                  </SelectItem>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveCustomSupplier(s);
                                    }}
                                    className="ml-1 p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                                    title={`Remove ${s}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      {/* Add new supplier to list */}
                      <div className="flex gap-1.5">
                        <Input
                          value={newSupplierInput}
                          onChange={(e) => setNewSupplierInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddSupplier();
                          }}
                          placeholder="Add supplier name…"
                          className="bg-muted border-input focus-visible:ring-primary h-8 text-xs flex-1"
                          maxLength={80}
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={handleAddSupplier}
                              disabled={!newSupplierInput.trim()}
                              className="h-8 w-8 flex-shrink-0 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-40"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Add to list</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  {/* Driver Name */}
                  <div className="xl:col-span-2 space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" /> Driver Name
                    </Label>
                    <div className="space-y-2">
                      <Select value={driverName} onValueChange={setDriverName}>
                        <SelectTrigger className="bg-muted border-input focus:ring-primary">
                          <SelectValue placeholder="Select a driver…" />
                        </SelectTrigger>
                        <SelectContent>
                          {customDrivers.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                              No drivers yet. Add one below.
                            </div>
                          ) : (
                            <>
                              <div className="px-2 py-1">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                                  My Drivers
                                </span>
                              </div>
                              {customDrivers.map((d) => (
                                <div
                                  key={d}
                                  className="flex items-center justify-between pr-1"
                                >
                                  <SelectItem value={d} className="flex-1">
                                    {d}
                                  </SelectItem>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveCustomDriver(d);
                                    }}
                                    className="ml-1 p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                                    title={`Remove ${d}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      {/* Add new driver to list */}
                      <div className="flex gap-1.5">
                        <Input
                          value={newDriverInput}
                          onChange={(e) => setNewDriverInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddDriver();
                          }}
                          placeholder="Add driver name…"
                          className="bg-muted border-input focus-visible:ring-primary h-8 text-xs flex-1"
                          maxLength={80}
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={handleAddDriver}
                              disabled={!newDriverInput.trim()}
                              className="h-8 w-8 flex-shrink-0 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-40"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Add to list</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  {/* Units */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      Units
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={units}
                      onChange={(e) =>
                        setUnits(
                          Math.max(0, Number.parseInt(e.target.value) || 0),
                        )
                      }
                      placeholder="0"
                      className="bg-muted border-input focus-visible:ring-primary h-9 text-sm font-vehicle"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Quantity
                    </p>
                  </div>

                  {/* Delivery Challan Number */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3 text-primary" />
                      <span>Delivery Challan No.</span>
                    </Label>
                    <Input
                      type="text"
                      value={challanNumber}
                      onChange={(e) => setChallanNumber(e.target.value)}
                      placeholder="e.g. DC-2024-001"
                      className="bg-muted border-input focus-visible:ring-primary h-9 text-sm font-vehicle"
                      maxLength={50}
                    />
                    <p className="text-[10px] text-muted-foreground font-medium text-primary/70">
                      ★ Required
                    </p>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Date
                    </Label>
                    <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 font-vehicle text-sm text-foreground">
                      {currentDate}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Auto-filled
                    </p>
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Time
                    </Label>
                    <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 font-vehicle text-sm text-foreground">
                      <motion.span
                        key={currentTime}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {currentTime}
                      </motion.span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Live updating
                    </p>
                  </div>
                </div>

                {/* One-vehicle-at-a-time notice */}
                <AnimatePresence>
                  {currentlyInsideVehicle && (
                    <motion.div
                      key="inside-notice"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="flex items-start gap-2.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-400" />
                        <p>
                          <span className="font-semibold font-vehicle text-amber-300">
                            {currentlyInsideVehicle}
                          </span>{" "}
                          is currently inside. Log it{" "}
                          <span className="font-semibold">OUT</span> before
                          logging a new vehicle IN.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                {!activeVehicleNumber && !currentlyInsideVehicle && (
                  <p className="mt-4 text-xs text-amber-500 font-medium">
                    Please select or add a vehicle number above before logging
                    IN or OUT.
                  </p>
                )}
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex-1">
                        <Button
                          onClick={() => handleAction("IN")}
                          disabled={
                            addRecord.isPending ||
                            !activeVehicleNumber ||
                            isInBlocked
                          }
                          className="btn-in w-full h-11 font-display font-semibold text-sm gap-2 disabled:opacity-40"
                        >
                          {addRecord.isPending &&
                          addRecord.variables?.action === "IN" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LogIn className="h-4 w-4" />
                          )}
                          Vehicle IN
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {isInBlocked && (
                      <TooltipContent>
                        Log out {currentlyInsideVehicle} first before logging
                        another vehicle IN
                      </TooltipContent>
                    )}
                  </Tooltip>
                  <Button
                    onClick={() => handleAction("OUT")}
                    disabled={addRecord.isPending || !activeVehicleNumber}
                    className="btn-out flex-1 h-11 font-display font-semibold text-sm gap-2 disabled:opacity-40"
                  >
                    {addRecord.isPending &&
                    addRecord.variables?.action === "OUT" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    Vehicle OUT
                  </Button>
                  {records.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => exportExcel(records)}
                      className="sm:w-auto border-primary/40 text-primary hover:bg-primary/10 hover:text-primary h-11 gap-2 btn-primary-glow"
                    >
                      <Download className="h-4 w-4" />
                      Export Excel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Records Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border bg-card overflow-hidden">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-display text-base">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    Vehicle Log
                    {records.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 text-xs font-mono"
                      >
                        {records.length}
                      </Badge>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-3">
                    {["sk1", "sk2", "sk3", "sk4"].map((sk) => (
                      <Skeleton key={sk} className="h-10 w-full rounded-md" />
                    ))}
                  </div>
                ) : sortedRecords.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 px-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-4">
                      <Truck className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="font-display font-semibold text-foreground">
                      No vehicles logged yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select a vehicle and click IN or OUT to start tracking
                    </p>
                  </motion.div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="w-12 text-xs uppercase tracking-wider text-muted-foreground font-medium pl-6">
                            #
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                            Vehicle Number
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                            Driver Name
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                            Action
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                            Supplier
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                            Units
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                            Challan No.
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                            Date
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                            Time
                          </TableHead>
                          <TableHead className="w-12 text-xs uppercase tracking-wider text-muted-foreground font-medium pr-6 text-right">
                            Del
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {sortedRecords.map((record, index) => (
                            <motion.tr
                              key={record.id.toString()}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ delay: index * 0.03 }}
                              className="border-border hover:bg-muted/40 transition-colors"
                            >
                              <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <span className="font-vehicle text-sm font-medium text-foreground">
                                  {record.vehicleNumber}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">
                                {record.driverName || "-"}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono ${
                                    record.action === "IN"
                                      ? "badge-in"
                                      : "badge-out"
                                  }`}
                                >
                                  {record.action === "IN" ? (
                                    <LogIn className="h-2.5 w-2.5" />
                                  ) : (
                                    <LogOut className="h-2.5 w-2.5" />
                                  )}
                                  {record.action}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">
                                {record.supplier || "-"}
                              </TableCell>
                              <TableCell className="font-vehicle text-sm text-muted-foreground">
                                {record.units.toString()}
                              </TableCell>
                              <TableCell className="text-sm font-medium text-foreground/80 max-w-[120px] truncate">
                                {record.challanNumber || "-"}
                              </TableCell>
                              <TableCell className="font-vehicle text-sm text-muted-foreground">
                                {record.date}
                              </TableCell>
                              <TableCell className="font-vehicle text-sm text-muted-foreground">
                                {record.time}
                              </TableCell>
                              <TableCell className="pr-6 text-right">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDelete(record.id)}
                                      disabled={deletingId === record.id}
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                      {deletingId === record.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete record</TooltipContent>
                                </Tooltip>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-8 border-t border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()}.{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Built with ♥ using caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      </div>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.22 0.02 240)",
            border: "1px solid oklch(0.32 0.025 240)",
            color: "oklch(0.94 0.01 240)",
          },
        }}
      />
    </TooltipProvider>
  );
}
