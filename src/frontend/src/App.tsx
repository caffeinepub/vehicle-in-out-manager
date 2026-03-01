import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Calendar,
  Car,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { VehicleRecord } from "./backend.d";
import {
  useAddRecord,
  useDeleteRecord,
  useGetAllRecords,
} from "./hooks/useQueries";

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

function exportCSV(records: VehicleRecord[]) {
  const sorted = [...records].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );
  const header = "#,Vehicle Number,Action,Date,Time\n";
  const rows = sorted
    .map(
      (r, i) => `${i + 1},${r.vehicleNumber},${r.action},${r.date},${r.time}`,
    )
    .join("\n");
  const csv = header + rows;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vehicle_log.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  const [now, setNow] = useState(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [customVehicle, setCustomVehicle] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [customVehicles, setCustomVehicles] =
    useState<string[]>(loadCustomVehicles);
  const [newVehicleInput, setNewVehicleInput] = useState<string>("");

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
        });
        toast.success(`Vehicle ${vehicleNum} logged ${action} at ${logTime}`);
      } catch {
        toast.error("Failed to log vehicle. Please try again.");
      }
    },
    [activeVehicleNumber, addRecord],
  );

  const handleDelete = useCallback(
    async (id: bigint) => {
      setDeletingId(id);
      try {
        await deleteRecord.mutateAsync(id);
        toast.success("Record deleted");
      } catch {
        toast.error("Failed to delete record");
      } finally {
        setDeletingId(null);
      }
    },
    [deleteRecord],
  );

  const sortedRecords = [...records].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  const totalIn = records.filter((r) => r.action === "IN").length;
  const totalOut = records.filter((r) => r.action === "OUT").length;

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
                    onClick={() => exportCSV(records)}
                    className="btn-primary-glow border-primary/40 text-primary hover:bg-primary/10 hover:text-primary gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </Button>
                )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Vehicle Number */}
                  <div className="lg:col-span-2 space-y-2">
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
                              {customVehicles.length > 0 && (
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

                {/* Action Buttons */}
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => handleAction("IN")}
                    disabled={addRecord.isPending || !activeVehicleNumber}
                    className="btn-in flex-1 h-11 font-display font-semibold text-sm gap-2 disabled:opacity-40"
                  >
                    {addRecord.isPending &&
                    addRecord.variables?.action === "IN" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="h-4 w-4" />
                    )}
                    Vehicle IN
                  </Button>
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
                      onClick={() => exportCSV(records)}
                      className="sm:w-auto border-primary/40 text-primary hover:bg-primary/10 hover:text-primary h-11 gap-2 btn-primary-glow"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
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
                            Action
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
