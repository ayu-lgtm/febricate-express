import React, { useState, useEffect } from "react"; 
const API_BASE = import.meta.env.VITE_API_BASE;
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Input, 
  Textarea, 
  Button, 
  Select, 
  Option, 
  Typography, 
  Chip, 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  IconButton, 
  Tooltip, 
  Alert, 
  Spinner, 
  Badge,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel
} from "@material-tailwind/react"; 
import { 
  CheckCircleIcon, 
  CalendarDaysIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  MagnifyingGlassIcon, 
  InformationCircleIcon, 
  FunnelIcon, 
  XMarkIcon, 
  CogIcon, 
  CubeIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline"; 

// Add missing icons as components
function ChartBarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function ArrowTrendingUpIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
      />
    </svg>
  );
}

function Squares2X2Icon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

function TableCellsIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2zm0 4h16M9 7v10"
      />
    </svg>
  );
}

// Stable Input Component
const StableInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  placeholder, 
  disabled = false,
  type = "text",
  ...props 
}) => {
  return (
    <div className="w-full">
      <Input
        label={label}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        type={type}
        error={!!error}
        className="bg-white"
        {...props}
      />
      {error && (
        <Typography variant="small" color="red" className="mt-1 text-xs">
          {error}
        </Typography>
      )}
    </div>
  );
};

// Stable Select Component
// Fixed Stable Select Component
// Fixed Stable Select Component
const StableSelect = ({ 
  label, 
  options, 
  value, 
  onChange, 
  error, 
  placeholder, 
  isDisabled = false,
  ...props 
}) => {
  const [selectedValue, setSelectedValue] = useState(value?.value || "");

  // Update internal state when value prop changes
  useEffect(() => {
    setSelectedValue(value?.value || "");
  }, [value]);

  const handleChange = (val) => {
    setSelectedValue(val);
    const selectedOption = options.find(opt => opt.value === val);
    onChange(selectedOption);
  };

  return (
    <div className="w-full">
      <Select
        label={label}
        value={selectedValue}
        onChange={handleChange}
        disabled={isDisabled}
        error={!!error}
        className="bg-white"
        {...props}
      >
        {options.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
      {error && (
        <Typography variant="small" color="red" className="mt-1 text-xs">
          {error}
        </Typography>
      )}
    </div>
  );
};

// Form Row Component
const FormRow = ({ children, className = "" }) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${className}`}>
      {children}
    </div>
  );
};

export function ProductionRecordingScreen({ currentUser, permissions }) {
  // State variables
  const [form, setForm] = useState({
    orderId: "",
    productionDate: new Date().toISOString().split("T")[0],
    notes: "",
    quantity: "",
    unit: "MT"
  });
  const [machineNumbers, setMachineNumbers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [approvedOrders, setApprovedOrders] = useState([]);
  const [productionHistory, setProductionHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editingRecording, setEditingRecording] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, recording: null });
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [activeTab, setActiveTab] = useState("entry");
  const [submitDialog, setSubmitDialog] = useState({ open: false, data: null });
  const [selectedOrderLabel, setSelectedOrderLabel] = useState("Select Approved Order");
  
  // Calendar filters state
  const [calendarFilters, setCalendarFilters] = useState({
    machines: [],
    orderIds: [],
    minQuantity: "",
    maxQuantity: "",
    dateRange: {
      start: "",
      end: ""
    }
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("calendar");
  const [expandedDate, setExpandedDate] = useState(null);
  const [quickStats, setQuickStats] = useState({
    todayProduction: 0,
    weekProduction: 0,
    monthProduction: 0
  });

  // const API_BASE = "http://localhost:5000/api";

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Enhanced numeric input handler
  const handleNumericInput = (value, fieldName) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 3 decimal places
    if (parts[1] && parts[1].length > 3) {
      return;
    }
    
    setForm(prev => ({ ...prev, [fieldName]: numericValue }));
  };

  // Format number with proper decimal places
  const formatQuantity = (value) => {
    if (!value && value !== 0) return "0.000";
    const num = parseFloat(value);
    return isNaN(num) ? "0.000" : num.toFixed(3);
  };

  // Fetch approved orders
  const fetchApprovedOrders = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/production-recording/approved-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch approved orders');
      
      const data = await response.json();
      if (data.success) {
        setApprovedOrders(data.data);
      }
    } catch (err) {
      setError('Failed to load approved orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch production history
  const fetchProductionHistory = async (orderId = null) => {
    try {
      if (orderId) {
        const token = sessionStorage.getItem('authToken');
        const response = await fetch(`${API_BASE}/production-recording/history/${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch production history');
        
        const data = await response.json();
        if (data.success) {
          setProductionHistory(data.data);
        }
      } else {
        setProductionHistory([]);
      }
    } catch (err) {
      console.error('Error fetching production history:', err);
    }
  };

  // Fetch monthly summary
  const fetchMonthlySummary = async (month, year) => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/production-recording/monthly-summary/${month}/${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMonthlySummary(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching monthly summary:', err);
    }
  };

  // Fetch quick stats
  const fetchQuickStats = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/production-recording/quick-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setQuickStats(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching quick stats:', err);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchApprovedOrders();
    fetchMonthlySummary(selectedMonth, selectedYear);
    fetchQuickStats();
  }, []);

  // Auto-set unit when order is selected
  useEffect(() => {
    if (form.orderId) {
      const selectedOrder = approvedOrders.find(order => order.PRODUCTION_ORDER_ID === form.orderId);
      if (selectedOrder) {
        setForm(prev => ({ ...prev, unit: selectedOrder.PRODUCTION_ORDER_UNIT }));
        fetchProductionHistory(form.orderId);
      }
    } else {
      setProductionHistory([]);
    }
  }, [form.orderId, approvedOrders]);

  // Fetch monthly summary when month/year changes
  useEffect(() => {
    fetchMonthlySummary(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const handleMachineSelection = (machine) => {
    setMachineNumbers(prev =>
      prev.includes(machine)
        ? prev.filter(m => m !== machine)
        : [...prev, machine]
    );
  };

  // Calculate remaining quantity correctly
  const getRemainingQuantity = () => {
    if (!form.orderId) return 0;
    
    const order = approvedOrders.find(o => o.PRODUCTION_ORDER_ID === form.orderId);
    if (!order) return 0;
    
    const totalOrdered = parseFloat(order.PRODUCTION_ORDER_WELDMESH_QTY) || 0;
    const totalProduced = parseFloat(order.totalProduced) || 0;
    
    if (editMode && editingRecording) {
      const currentEditQuantity = parseFloat(form.quantity) || 0;
      const originalQuantity = parseFloat(editingRecording.PRODUCTION_RECORDING_QUANTITY) || 0;
      // Calculate remaining: totalOrdered - (current total produced - original quantity + new quantity)
      return totalOrdered - (totalProduced - originalQuantity + currentEditQuantity);
    }
    
    return totalOrdered - totalProduced;
  };

  // Calculate total produced quantity correctly
  const getTotalProducedQuantity = () => {
    if (!form.orderId) return 0;
    
    const order = approvedOrders.find(o => o.PRODUCTION_ORDER_ID === form.orderId);
    if (!order) return 0;
    
    if (editMode && editingRecording) {
      const currentEditQuantity = parseFloat(form.quantity) || 0;
      const originalQuantity = parseFloat(editingRecording.PRODUCTION_RECORDING_QUANTITY) || 0;
      const baseProduced = parseFloat(order.totalProduced) || 0;
      return baseProduced - originalQuantity + currentEditQuantity;
    }
    
    return parseFloat(order.totalProduced) || 0;
  };

  // Validate form
  const validateForm = () => {
    if (!form.orderId || !form.productionDate || !form.quantity || !form.unit || machineNumbers.length === 0) {
      setError("Please fill in all required fields and select at least one machine.");
      return false;
    }
    
    const quantityValue = parseFloat(form.quantity);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      setError("Please enter a valid quantity greater than 0.");
      return false;
    }
    
    // For edit mode, we need different validation
    if (editMode && editingRecording) {
      const order = approvedOrders.find(o => o.PRODUCTION_ORDER_ID === form.orderId);
      if (!order) {
        setError("Order not found.");
        return false;
      }
      
      const totalOrdered = parseFloat(order.PRODUCTION_ORDER_WELDMESH_QTY) || 0;
      const totalProduced = parseFloat(order.totalProduced) || 0;
      const originalQuantity = parseFloat(editingRecording.PRODUCTION_RECORDING_QUANTITY) || 0;
      const newQuantity = quantityValue;
      
      // Calculate the new total produced if we update this recording
      const newTotalProduced = totalProduced - originalQuantity + newQuantity;
      
      // Check if the new total produced exceeds the total ordered
      if (newTotalProduced > totalOrdered) {
        const remainingAfterEdit = totalOrdered - (totalProduced - originalQuantity);
        setError(`Production quantity exceeds remaining quantity. You can enter up to: ${formatQuantity(remainingAfterEdit)} ${form.unit}`);
        return false;
      }
    } else {
      // For new entries, use the original validation
      const remaining = getRemainingQuantity();
      if (quantityValue > remaining) {
        setError(`Production quantity exceeds remaining quantity. Remaining: ${formatQuantity(remaining)} ${form.unit}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const selectedOrder = approvedOrders.find(order => order.PRODUCTION_ORDER_ID === form.orderId);
    
    setSubmitDialog({
      open: true,
      data: {
        orderId: form.orderId,
        productionDate: form.productionDate,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        machineNumbers,
        notes: form.notes,
        orderDetails: selectedOrder
      }
    });
  };

  const handleConfirmSubmit = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('authToken');
      const payload = {
        PRODUCTION_RECORDING_ORDER_ID: submitDialog.data.orderId,
        PRODUCTION_RECORDING_DATE: submitDialog.data.productionDate,
        PRODUCTION_RECORDING_QUANTITY: submitDialog.data.quantity,
        PRODUCTION_RECORDING_UNIT: submitDialog.data.unit,
        PRODUCTION_RECORDING_MACHINE_NUMBERS: submitDialog.data.machineNumbers.join(','),
        PRODUCTION_RECORDING_NOTES: submitDialog.data.notes
      };
      
      const url = editMode
        ? `${API_BASE}/production-recording/update/${editingRecording.PRODUCTION_RECORDING_ID}`
        : `${API_BASE}/production-recording/create`;
      
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit production recording');
      }
      
      const result = await response.json();
      setSuccess(editMode ? "Production recording updated successfully!" : "Production recording submitted successfully!");
      setSubmitted(true);
      
      // Reset form
      if (!editMode) {
        setForm({
          orderId: "",
          productionDate: new Date().toISOString().split("T")[0],
          notes: "",
          quantity: "",
          unit: "MT"
        });
        setMachineNumbers([]);
      }
      
      setEditMode(false);
      setEditingRecording(null);
      setSubmitDialog({ open: false, data: null });
      
      // Refresh data
      fetchApprovedOrders();
      fetchMonthlySummary(selectedMonth, selectedYear);
      fetchQuickStats();
      
      if (form.orderId) {
        fetchProductionHistory(form.orderId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (recording) => {
    setEditMode(true);
    setEditingRecording(recording);
    setForm({
      orderId: recording.PRODUCTION_RECORDING_ORDER_ID,
      productionDate: recording.PRODUCTION_RECORDING_DATE.split('T')[0],
      quantity: recording.PRODUCTION_RECORDING_QUANTITY.toString(),
      unit: recording.PRODUCTION_RECORDING_UNIT,
      notes: recording.PRODUCTION_RECORDING_NOTES || ""
    });
    
    // Set the display label
    const order = approvedOrders.find(o => o.PRODUCTION_ORDER_ID === recording.PRODUCTION_RECORDING_ORDER_ID);
    if (order) {
      setSelectedOrderLabel(`${order.PRODUCTION_ORDER_ID} - ${formatQuantity(order.remainingQuantity)} left`);
    }
    
    setMachineNumbers(recording.PRODUCTION_RECORDING_MACHINE_NUMBERS.split(','));
    setError("");
    setSuccess("");
    setActiveTab("entry");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (recordingId) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/production-recording/delete/${recordingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete production recording');
      }
      
      setSuccess('Production recording deleted successfully');
      fetchApprovedOrders();
      fetchMonthlySummary(selectedMonth, selectedYear);
      fetchQuickStats();
      
      if (form.orderId) {
        fetchProductionHistory(form.orderId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, recording: null });
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingRecording(null);
    setForm({
      orderId: "",
      productionDate: new Date().toISOString().split("T")[0],
      notes: "",
      quantity: "",
      unit: "MT"
    });
    setMachineNumbers([]);
    setError("");
    setSuccess("");
  };

  const availableMachines = [1, 2, 3, 4];

  // Calendar functions
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  // Helper functions for calendar
  const getProductionForDate = (date) => {
    return monthlySummary?.dailyProduction?.find(d => d.date === date)?.productions || [];
  };

  const getTotalProductionForDate = (date) => {
    return monthlySummary?.dailyProduction?.find(d => d.date === date)?.totalQuantity || 0;
  };

  // Generate calendar data
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate calendar days array
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDayOfMonth = getFirstDayOfMonth(selectedMonth, selectedYear);
    const calendarDays = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayProductions = monthlySummary?.dailyProduction?.find(d => d.date === dateString) || { productions: [], totalQuantity: 0 };
      
      calendarDays.push({
        day,
        date: dateString,
        productions: dayProductions.productions,
        totalQuantity: dayProductions.totalQuantity
      });
    }
    
    return calendarDays;
  };

  // Filter functions
  const getFilteredProductionsForDate = (date) => {
    const productions = getProductionForDate(date);
    
    return productions.filter(prod => {
      // Machine filter
      if (calendarFilters.machines.length > 0) {
        const prodMachines = prod.PRODUCTION_RECORDING_MACHINE_NUMBERS.split(',');
        const hasMatchingMachine = calendarFilters.machines.some(machine =>
          prodMachines.includes(machine.toString())
        );
        if (!hasMatchingMachine) return false;
      }
      
      // Order ID filter
      if (calendarFilters.orderIds.length > 0 &&
          !calendarFilters.orderIds.includes(prod.PRODUCTION_RECORDING_ORDER_ID)) {
        return false;
      }
      
      // Quantity filters
      if (calendarFilters.minQuantity && prod.PRODUCTION_RECORDING_QUANTITY < parseFloat(calendarFilters.minQuantity)) {
        return false;
      }
      if (calendarFilters.maxQuantity && prod.PRODUCTION_RECORDING_QUANTITY > parseFloat(calendarFilters.maxQuantity)) {
        return false;
      }
      
      // Date range filter
      if (calendarFilters.dateRange.start && calendarFilters.dateRange.end) {
        const prodDate = new Date(prod.PRODUCTION_RECORDING_DATE);
        const startDate = new Date(calendarFilters.dateRange.start);
        const endDate = new Date(calendarFilters.dateRange.end);
        if (prodDate < startDate || prodDate > endDate) return false;
      }
      
      return true;
    });
  };

  const clearFilters = () => {
    setCalendarFilters({
      machines: [],
      orderIds: [],
      minQuantity: "",
      maxQuantity: "",
      dateRange: {
        start: "",
        end: ""
      }
    });
  };

  const hasActiveFilters =
    calendarFilters.machines.length > 0 ||
    calendarFilters.orderIds.length > 0 ||
    calendarFilters.minQuantity !== "" ||
    calendarFilters.maxQuantity !== "" ||
    calendarFilters.dateRange.start !== "" ||
    calendarFilters.dateRange.end !== "";

  // Get unique order IDs for filter
  const uniqueOrderIds = [...new Set(monthlySummary?.dailyProduction?.flatMap(day =>
    day.productions.map(prod => prod.PRODUCTION_RECORDING_ORDER_ID)
  ) || [])];

  // Enhanced calendar layout - Week View
  const getWeeksInMonth = () => {
    const calendarDays = generateCalendarDays();
    const weeks = [];
    let currentWeek = [];
    
    calendarDays.forEach((day, index) => {
      if (index % 7 === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const weeks = getWeeksInMonth();

  // List view data
  const getAllProductions = () => {
    if (!monthlySummary?.dailyProduction) return [];
    
    return monthlySummary.dailyProduction.flatMap(day =>
      day.productions.map(prod => ({
        ...prod,
        date: day.date
      }))
    ).filter(prod => {
      const filtered = getFilteredProductionsForDate(prod.date);
      return filtered.some(f => f.PRODUCTION_RECORDING_ID === prod.PRODUCTION_RECORDING_ID);
    });
  };

  // Production statistics
  const getProductionStats = () => {
    const allProductions = getAllProductions();
    const totalQuantity = allProductions.reduce((sum, prod) => sum + prod.PRODUCTION_RECORDING_QUANTITY, 0);
    const machineCount = new Set(allProductions.flatMap(prod =>
      prod.PRODUCTION_RECORDING_MACHINE_NUMBERS.split(',')
    )).size;
    const orderCount = new Set(allProductions.map(prod => prod.PRODUCTION_RECORDING_ORDER_ID)).size;
    
    return {
      totalProductions: allProductions.length,
      totalQuantity,
      machineCount,
      orderCount,
      averagePerDay: allProductions.length > 0 ? totalQuantity / allProductions.length : 0
    };
  };

  const stats = getProductionStats();

  // Quick Actions
  const quickActions = [
    {
      label: "Today's Production",
      value: `${quickStats.todayProduction.toFixed(2)} MT`,
      color: "blue",
      icon: CalendarDaysIcon
    },
    {
      label: "This Week",
      value: `${quickStats.weekProduction.toFixed(2)} MT`,
      color: "green",
      icon: ArrowTrendingUpIcon
    },
    {
      label: "This Month",
      value: `${quickStats.monthProduction.toFixed(2)} MT`,
      color: "purple",
      icon: ChartBarIcon
    }
  ];

  // Prepare order options for StableSelect
  const orderOptions = approvedOrders.map(order => ({
    value: order.PRODUCTION_ORDER_ID,
    label: `${order.PRODUCTION_ORDER_ID} • ${formatQuantity(order.remainingQuantity)} left`
  }));

  const handleOrderChange = (selectedOption) => {
    if (selectedOption) {
      setForm(prev => ({ ...prev, orderId: selectedOption.value }));
      setSelectedOrderLabel(selectedOption.label);
    } else {
      setForm(prev => ({ ...prev, orderId: "" }));
      setSelectedOrderLabel("Select Approved Order");
    }
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto space-y-4">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <CardBody className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h6" className="text-gray-600 font-medium text-sm sm:text-base">
                      {action.label}
                    </Typography>
                    <Typography variant="h4" className={`text-${action.color}-600 font-bold mt-1 sm:mt-2 text-lg sm:text-xl`}>
                      {action.value}
                    </Typography>
                  </div>
                  <div className={`p-2 sm:p-3 bg-${action.color}-100 rounded-full`}>
                    <action.icon className={`h-4 w-4 sm:h-6 sm:w-6 text-${action.color}-600`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Main Content with Tabs */}
        <Card className="w-full shadow-lg border border-gray-200">
          <Tabs value={activeTab} className="min-h-[500px]">
            <TabsHeader 
              className="rounded-none border-b border-blue-gray-50 bg-white p-0 sticky top-0 z-10"
              indicatorProps={{ 
                className: "bg-blue-500 shadow-none rounded-none",
              }}
            >
              <Tab 
                value="entry" 
                onClick={() => setActiveTab("entry")}
                className={`py-3 sm:py-4 font-semibold text-xs sm:text-sm ${activeTab === "entry" ? "text-white" : "text-gray-700"}`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Production Entry</span>
                  <span className="sm:hidden">Entry</span>
                  {editMode && <Badge color="amber" className="ml-1 text-xs">Editing</Badge>}
                </div>
              </Tab>
              <Tab 
                value="overview" 
                onClick={() => setActiveTab("overview")}
                className={`py-3 sm:py-4 font-semibold text-xs sm:text-sm ${activeTab === "overview" ? "text-white" : "text-gray-700"}`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <CalendarDaysIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Production Overview</span>
                  <span className="sm:hidden">Overview</span>
                </div>
              </Tab>
            </TabsHeader>

            <TabsBody className="p-0">
              {/* Production Entry Tab */}
              <TabPanel value="entry" className="p-4 sm:p-6">
                {error && (
                  <Alert color="red" className="mb-4 sm:mb-6 border-l-4 border-red-500 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <Typography variant="small" className="font-medium">
                        {error}
                      </Typography>
                    </div>
                  </Alert>
                )}
                {success && (
                  <Alert color="green" className="mb-4 sm:mb-6 border-l-4 border-green-500 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <Typography variant="small" className="font-medium">
                        {success}
                      </Typography>
                    </div>
                  </Alert>
                )}

                <form onSubmit={handleSubmitClick} className="space-y-4 sm:space-y-6">
                  <FormRow>
                    {/* Order Selection */}
                    <StableSelect
                      label="Order Selection *"
                      options={orderOptions}
                      value={orderOptions.find((p) => p.value === form.orderId) || null}
                      onChange={handleOrderChange}
                      error={!form.orderId && submitted ? "Order selection is required" : ""}
                      placeholder="Select Approved Order"
                      isDisabled={editMode}
                    />

                    {/* Production Date */}
                    <StableInput
                      label="Production Date *"
                      name="productionDate"
                      type="date"
                      value={form.productionDate || ""}
                      onChange={handleChange}
                      error={!form.productionDate && submitted ? "Production date is required" : ""}
                      placeholder="Select production date"
                    />

                    {/* Unit */}
                    <StableInput
                      label="Unit"
                      name="unit"
                      value={form.unit || ""}
                      onChange={handleChange}
                      disabled={true}
                      placeholder="Unit"
                    />
                  </FormRow>

                  {/* Machine Selection */}
                  <div>
                    <Typography variant="h6" className="mb-2 sm:mb-3 text-gray-700 font-semibold flex items-center gap-2 text-sm sm:text-base">
                      <CogIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      Machine Numbers
                      <span className="text-red-500">*</span>
                    </Typography>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {availableMachines.map(machine => (
                        <Chip
                          key={machine}
                          variant={machineNumbers.includes(machine) ? "filled" : "outlined"}
                          color="blue"
                          value={`M${machine}`}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md px-3 py-1 text-xs sm:text-sm font-medium ${
                            machineNumbers.includes(machine) 
                              ? 'bg-blue-600 text-white' 
                              : 'text-blue-600 border-blue-600'
                          }`}
                          onClick={() => handleMachineSelection(machine)}
                        />
                      ))}
                    </div>
                    <Typography variant="small" className="text-gray-500 mt-1 sm:mt-2 text-xs">
                      Select one or multiple machines used for production
                    </Typography>
                  </div>

                  <FormRow>
                    {/* Quantity Information */}
                    <div className="lg:col-span-2">
                      <Typography variant="h6" className="mb-2 sm:mb-3 text-gray-700 font-semibold flex items-center gap-2 text-sm sm:text-base">
                        <ArrowTrendingUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        Quantity Information
                        <span className="text-red-500">*</span>
                      </Typography>
                      <StableInput
                        label="Quantity Produced *"
                        name="quantity"
                        value={form.quantity || ""}
                        onChange={(e) => handleNumericInput(e.target.value, 'quantity')}
                        error={!form.quantity && submitted ? "Quantity is required" : ""}
                        placeholder="0.000"
                        className="text-right font-mono"
                        dir="rtl"
                      />
                      <Typography variant="small" className="text-gray-500 mt-1 text-xs">
                        Enter quantity in {form.unit} (up to 3 decimal places)
                      </Typography>
                    </div>

                    {/* Quantity Summary */}
                    {form.orderId && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-5 rounded-xl border border-blue-200">
                        <Typography variant="h6" className="text-blue-800 mb-2 sm:mb-3 flex items-center gap-2 font-semibold text-sm sm:text-base">
                          <InformationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          Quantity Summary {editMode && <Badge color="amber" className="text-xs">Editing Mode</Badge>}
                        </Typography>
                        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                          <div className="flex justify-between items-center py-1 sm:py-2 border-b border-blue-200">
                            <span className="text-blue-700 font-medium">Total Ordered:</span>
                            <span className="font-bold text-blue-900">
                              {approvedOrders.find(o => o.PRODUCTION_ORDER_ID === form.orderId)?.PRODUCTION_ORDER_WELDMESH_QTY} {form.unit}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 sm:py-2 border-b border-blue-200">
                            <span className="text-blue-700 font-medium">
                              {editMode ? "Currently Produced (before edit):" : "Already Produced:"}
                            </span>
                            <span className="font-bold text-blue-900">
                              {editMode ? 
                                formatQuantity(parseFloat(approvedOrders.find(o => o.PRODUCTION_ORDER_ID === form.orderId)?.totalProduced || 0)) :
                                formatQuantity(getTotalProducedQuantity())
                              } {form.unit}
                            </span>
                          </div>
                          {editMode && (
                            <>
                              <div className="flex justify-between items-center py-1 sm:py-2 border-b border-blue-200">
                                <span className="text-blue-700 font-medium">Original Recording Quantity:</span>
                                <span className="font-bold text-blue-900">
                                  {formatQuantity(editingRecording?.PRODUCTION_RECORDING_QUANTITY)} {form.unit}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1 sm:py-2 border-b border-blue-200">
                                <span className="text-blue-700 font-medium">New Recording Quantity:</span>
                                <span className="font-bold text-blue-900">
                                  {formatQuantity(form.quantity)} {form.unit}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between items-center py-1 sm:py-2 bg-blue-100 rounded-lg px-2 sm:px-3">
                            <span className="text-blue-800 font-bold">
                              {editMode ? "Remaining After Update:" : "Remaining:"}
                            </span>
                            <span className="font-bold text-blue-900 text-sm sm:text-base">
                              {formatQuantity(getRemainingQuantity())} {form.unit}
                            </span>
                          </div>
                          {editMode && (
                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                              <strong>Note:</strong> In editing mode, the remaining quantity calculation accounts for the difference between your new quantity and the original recorded quantity.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </FormRow>

                  {/* Notes */}
                  <div>
                    <Typography variant="h6" className="mb-2 sm:mb-3 text-gray-700 font-semibold flex items-center gap-2 text-sm sm:text-base">
                      <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      Production Notes
                    </Typography>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="bg-white text-sm sm:text-base"
                      label="Additional details or remarks (optional)"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                      {editMode && (
                        <Button
                          variant="outlined"
                          color="red"
                          onClick={cancelEdit}
                          disabled={loading}
                          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 text-xs sm:text-sm w-full sm:w-auto"
                        >
                          <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          Cancel Edit
                        </Button>
                      )}
                      <Button
                        type="submit"
                        color={editMode ? "amber" : "blue"}
                        disabled={loading}
                        className="flex items-center gap-1 sm:gap-2 px-4 sm:px-8 shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm w-full sm:w-auto"
                        size="md"
                      >
                        {loading ? (
                          <Spinner className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : editMode ? (
                          <>
                            <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            Update Production
                          </>
                        ) : (
                          <>
                            <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            Submit Production
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <Button 
                      disabled 
                      variant="outlined" 
                      color="gray" 
                      className="flex items-center gap-1 sm:gap-2 opacity-50 text-xs sm:text-sm w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      <CogIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      Post to SAP (Coming Soon)
                    </Button>
                  </div>
                </form>

                {/* Production History */}
                {form.orderId && productionHistory.length > 0 && (
                  <div className="mt-8 sm:mt-12">
                    <Typography variant="h4" className="mb-4 sm:mb-6 text-gray-800 flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                      <EyeIcon className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                      Production History for Selected Order
                    </Typography>
                    <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
                      {productionHistory.map((recording) => (
                        <Card key={recording.PRODUCTION_RECORDING_ID} className="border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                          <CardBody className="p-3 sm:p-5">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                                  <div className="bg-blue-100 px-2 sm:px-3 py-1 rounded-full">
                                    <Typography variant="h5" className="text-blue-900 font-bold text-sm sm:text-base">
                                      {formatQuantity(recording.PRODUCTION_RECORDING_QUANTITY)} {recording.PRODUCTION_RECORDING_UNIT}
                                    </Typography>
                                  </div>
                                  <Chip
                                    value={`Machines: ${recording.PRODUCTION_RECORDING_MACHINE_NUMBERS}`}
                                    color="blue"
                                    variant="outlined"
                                    className="font-medium text-xs sm:text-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                                  <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                                    <CalendarDaysIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                    <span className="font-medium">Date: {new Date(recording.PRODUCTION_RECORDING_DATE).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                                    <CubeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                    <span className="font-medium">Order: {recording.PRODUCTION_RECORDING_ORDER_ID}</span>
                                  </div>
                                  <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                                    <CogIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                    <span className="font-medium">Recorded by: {recording.PRODUCTION_RECORDING_RECORDED_BY || 'System'}</span>
                                  </div>
                                </div>
                                {recording.PRODUCTION_RECORDING_NOTES && (
                                  <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <Typography variant="small" className="text-gray-700 font-medium text-xs sm:text-sm">
                                      Notes: {recording.PRODUCTION_RECORDING_NOTES}
                                    </Typography>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1 sm:gap-2 justify-end sm:justify-start">
                                <Tooltip content="Edit Recording" placement="top">
                                  <IconButton
                                    color="blue"
                                    variant="gradient"
                                    onClick={() => handleEdit(recording)}
                                    className="hover:shadow-md transition-all h-8 w-8 sm:h-10 sm:w-10"
                                  >
                                    <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip content="Delete Recording" placement="top">
                                  <IconButton
                                    color="red"
                                    variant="gradient"
                                    onClick={() => setDeleteDialog({ open: true, recording })}
                                    className="hover:shadow-md transition-all h-8 w-8 sm:h-10 sm:w-10"
                                  >
                                    <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </IconButton>
                                </Tooltip>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabPanel>

              {/* Production Overview Tab */}
              <TabPanel value="overview" className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Calendar Controls */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Typography variant="h3" className="text-gray-800 font-bold text-lg sm:text-xl md:text-2xl">
                        {monthNames[selectedMonth - 1]} {selectedYear}
                      </Typography>
                      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                        <IconButton
                          variant="text"
                          size="sm"
                          onClick={() => navigateMonth('prev')}
                          className="hover:bg-white hover:shadow-sm h-8 w-8"
                        >
                          <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </IconButton>
                        <IconButton
                          variant="text"
                          size="sm"
                          onClick={() => navigateMonth('next')}
                          className="hover:bg-white hover:shadow-sm h-8 w-8"
                        >
                          <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </IconButton>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto mt-3 lg:mt-0">
                      {/* View Mode Toggle */}
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <Button
                          variant={viewMode === "calendar" ? "filled" : "text"}
                          size="sm"
                          className={`flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm ${
                            viewMode === "calendar" ? "bg-blue-500 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => setViewMode("calendar")}
                        >
                          <Squares2X2Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                          Calendar
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "filled" : "text"}
                          size="sm"
                          className={`flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm ${
                            viewMode === "list" ? "bg-blue-500 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => setViewMode("list")}
                        >
                          <TableCellsIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          List View
                        </Button>
                      </div>

                      <Button
                        variant="outlined"
                        size="sm"
                        className="flex items-center gap-1 sm:gap-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-medium text-xs sm:text-sm"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <FunnelIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        Filters
                        {hasActiveFilters && (
                          <Badge color="red" className="h-2 w-2 p-0 min-w-0" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Enhanced Filters Panel */}
                  {showFilters && (
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                        <Typography variant="h5" className="text-gray-800 flex items-center gap-2 font-bold text-sm sm:text-base">
                          <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          Advanced Filters
                        </Typography>
                        <div className="flex gap-2">
                          {hasActiveFilters && (
                            <Button
                              variant="outlined"
                              size="sm"
                              onClick={clearFilters}
                              className="text-gray-700 border-gray-300 flex items-center gap-1 hover:bg-gray-50 text-xs"
                            >
                              <XMarkIcon className="h-3 w-3" />
                              Clear All
                            </Button>
                          )}
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => setShowFilters(false)}
                            className="text-gray-700 hover:bg-gray-100 text-xs"
                          >
                            Close
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                        {/* Machine Filter */}
                        <div className="space-y-2 sm:space-y-3">
                          <Typography variant="h6" className="text-gray-700 font-semibold text-sm sm:text-base">
                            Machines
                          </Typography>
                          <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4].map(machine => (
                              <Chip
                                key={machine}
                                variant={calendarFilters.machines.includes(machine.toString()) ? "filled" : "outlined"}
                                color="blue"
                                value={`M${machine}`}
                                className="cursor-pointer transition-all font-medium text-xs"
                                onClick={() => {
                                  setCalendarFilters(prev => ({
                                    ...prev,
                                    machines: prev.machines.includes(machine.toString())
                                      ? prev.machines.filter(m => m !== machine.toString())
                                      : [...prev.machines, machine.toString()]
                                  }))
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Order ID Filter */}
                        <div className="space-y-2 sm:space-y-3">
                          <Typography variant="h6" className="text-gray-700 font-semibold text-sm sm:text-base">
                            Order IDs
                          </Typography>
                          <div className="flex flex-wrap gap-2 max-h-24 sm:max-h-32 overflow-y-auto p-1">
                            {uniqueOrderIds.slice(0, 10).map(orderId => (
                              <Chip
                                key={orderId}
                                variant={calendarFilters.orderIds.includes(orderId) ? "filled" : "outlined"}
                                color="green"
                                value={orderId}
                                className="cursor-pointer text-xs font-medium"
                                onClick={() => {
                                  setCalendarFilters(prev => ({
                                    ...prev,
                                    orderIds: prev.orderIds.includes(orderId)
                                      ? prev.orderIds.filter(id => id !== orderId)
                                      : [...prev.orderIds, orderId]
                                  }))
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Quantity Range */}
                        <div className="space-y-2 sm:space-y-3">
                          <Typography variant="h6" className="text-gray-700 font-semibold text-sm sm:text-base">
                            Quantity Range (MT)
                          </Typography>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={calendarFilters.minQuantity}
                              onChange={(e) => setCalendarFilters(prev => ({ ...prev, minQuantity: e.target.value }))}
                              label="Minimum"
                              step="0.001"
                              size="sm"
                              className="text-xs sm:text-sm"
                            />
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <Input
                              type="number"
                              placeholder="Max"
                              value={calendarFilters.maxQuantity}
                              onChange={(e) => setCalendarFilters(prev => ({ ...prev, maxQuantity: e.target.value }))}
                              label="Maximum"
                              step="0.001"
                              size="sm"
                              className="text-xs sm:text-sm"
                            />
                          </div>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2 sm:space-y-3 lg:col-span-2 xl:col-span-1">
                          <Typography variant="h6" className="text-gray-700 font-semibold text-sm sm:text-base">
                            Date Range
                          </Typography>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <Input
                              type="date"
                              value={calendarFilters.dateRange.start}
                              onChange={(e) => setCalendarFilters(prev => ({
                                ...prev,
                                dateRange: { ...prev.dateRange, start: e.target.value }
                              }))}
                              label="From"
                              size="sm"
                              className="text-xs sm:text-sm"
                            />
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <Input
                              type="date"
                              value={calendarFilters.dateRange.end}
                              onChange={(e) => setCalendarFilters(prev => ({
                                ...prev,
                                dateRange: { ...prev.dateRange, end: e.target.value }
                              }))}
                              label="To"
                              size="sm"
                              className="text-xs sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Active Filters Display */}
                      {hasActiveFilters && (
                        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <Typography variant="small" className="font-semibold text-blue-800 mb-2 text-xs sm:text-sm">
                            Active Filters:
                          </Typography>
                          <div className="flex flex-wrap gap-2">
                            {calendarFilters.machines.map(machine => (
                              <Chip
                                key={machine}
                                value={`Machine ${machine}`}
                                color="blue"
                                variant="filled"
                                size="sm"
                                onClose={() => setCalendarFilters(prev => ({
                                  ...prev,
                                  machines: prev.machines.filter(m => m !== machine)
                                }))}
                                className="text-xs"
                              />
                            ))}
                            {calendarFilters.orderIds.map(orderId => (
                              <Chip
                                key={orderId}
                                value={orderId}
                                color="green"
                                variant="filled"
                                size="sm"
                                onClose={() => setCalendarFilters(prev => ({
                                  ...prev,
                                  orderIds: prev.orderIds.filter(id => id !== orderId)
                                }))}
                                className="text-xs"
                              />
                            ))}
                            {(calendarFilters.minQuantity || calendarFilters.maxQuantity) && (
                              <Chip
                                value={`Qty: ${calendarFilters.minQuantity || '0'}-${calendarFilters.maxQuantity || '∞'} MT`}
                                color="amber"
                                variant="filled"
                                size="sm"
                                onClose={() => setCalendarFilters(prev => ({
                                  ...prev,
                                  minQuantity: "",
                                  maxQuantity: ""
                                }))}
                                className="text-xs"
                              />
                            )}
                            {(calendarFilters.dateRange.start || calendarFilters.dateRange.end) && (
                              <Chip
                                value={`Dates: ${calendarFilters.dateRange.start || 'Start'} to ${calendarFilters.dateRange.end || 'End'}`}
                                color="purple"
                                variant="filled"
                                size="sm"
                                onClose={() => setCalendarFilters(prev => ({
                                  ...prev,
                                  dateRange: { start: "", end: "" }
                                }))}
                                className="text-xs"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CubeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div>
                          <Typography variant="small" className="text-gray-600 font-semibold text-xs sm:text-sm">
                            Total Productions
                          </Typography>
                          <Typography variant="h4" className="text-blue-600 font-bold text-sm sm:text-base">
                            {stats.totalProductions}
                          </Typography>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <ArrowTrendingUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        </div>
                        <div>
                          <Typography variant="small" className="text-gray-600 font-semibold text-xs sm:text-sm">
                            Total Quantity
                          </Typography>
                          <Typography variant="h4" className="text-green-600 font-bold text-sm sm:text-base">
                            {stats.totalQuantity.toFixed(2)} MT
                          </Typography>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <CogIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                        </div>
                        <div>
                          <Typography variant="small" className="text-gray-600 font-semibold text-xs sm:text-sm">
                            Machines Used
                          </Typography>
                          <Typography variant="h4" className="text-orange-600 font-bold text-sm sm:text-base">
                            {stats.machineCount}
                          </Typography>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                        </div>
                        <div>
                          <Typography variant="small" className="text-gray-600 font-semibold text-xs sm:text-sm">
                            Avg/Production
                          </Typography>
                          <Typography variant="h4" className="text-purple-600 font-bold text-sm sm:text-base">
                            {stats.averagePerDay.toFixed(2)} MT
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* View Content */}
                  {viewMode === "calendar" ? (
                    /* Enhanced Calendar View */
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      {/* Day Headers */}
                      <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        {daysOfWeek.map(day => (
                          <div key={day} className="p-2 sm:p-4 text-center font-bold text-gray-700 border-r border-gray-200 last:border-r-0 text-xs sm:text-sm">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* Weeks */}
                      {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
                          {week.map((dayData, dayIndex) => {
                            const filteredProductions = dayData ? getFilteredProductionsForDate(dayData.date) : [];
                            const isToday = dayData?.date === new Date().toISOString().split('T')[0];
                            const isExpanded = expandedDate === dayData?.date;
                            
                            return (
                              <div
                                key={dayIndex}
                                className={`min-h-[80px] sm:min-h-[100px] border-r border-gray-200 last:border-r-0 p-1 sm:p-2 transition-all cursor-pointer ${
                                  !dayData ? 'bg-gray-50' :
                                  isToday ? 'bg-blue-50 border-blue-200' :
                                  'bg-white hover:bg-gray-50'
                                } ${isExpanded ? 'col-span-7 bg-blue-25' : ''}`}
                                onClick={() => dayData && setExpandedDate(isExpanded ? null : dayData.date)}
                              >
                                {dayData && (
                                  <div className="h-full flex flex-col">
                                    {/* Date Header */}
                                    <div className="flex justify-between items-center mb-1">
                                      <span className={`font-semibold text-xs sm:text-sm ${
                                        isToday ? 'text-blue-600' : 'text-gray-700'
                                      }`}>
                                        {dayData.day}
                                      </span>
                                      {filteredProductions.length > 0 && (
                                        <Badge color="green" className="text-xs">
                                          {filteredProductions.length}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {/* Productions */}
                                    <div className="flex-1 space-y-1">
                                      {filteredProductions.slice(0, isExpanded ? 10 : 2).map((prod, prodIndex) => (
                                        <div
                                          key={prodIndex}
                                          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded p-1 hover:shadow-sm transition-shadow"
                                        >
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <div className="font-bold text-green-800 text-xs">
                                                {formatQuantity(prod.PRODUCTION_RECORDING_QUANTITY)} {prod.PRODUCTION_RECORDING_UNIT}
                                              </div>
                                              <div className="text-green-600 text-xs truncate">
                                                {prod.Order?.PRODUCTION_ORDER_ID}
                                              </div>
                                            </div>
                                            <Chip
                                              value={prod.PRODUCTION_RECORDING_MACHINE_NUMBERS}
                                              color="green"
                                              size="sm"
                                              variant="filled"
                                              className="text-xs"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                      
                                      {filteredProductions.length > 2 && !isExpanded && (
                                        <div className="text-center">
                                          <Typography variant="small" className="text-gray-500 text-xs">
                                            +{filteredProductions.length - 2} more
                                          </Typography>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Total */}
                                    {filteredProductions.length > 0 && (
                                      <div className="mt-1 pt-1 border-t border-gray-100">
                                        <div className="text-xs font-bold text-gray-700 text-center bg-green-50 rounded px-1 py-0.5">
                                          Total: {filteredProductions.reduce((sum, prod) => sum + prod.PRODUCTION_RECORDING_QUANTITY, 0).toFixed(2)} MT
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* List View */
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <Typography variant="h5" className="text-gray-800 font-bold text-sm sm:text-base">
                          All Productions ({stats.totalProductions})
                        </Typography>
                      </div>
                      <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                        {getAllProductions().length > 0 ? (
                          getAllProductions().map((prod, index) => (
                            <div
                              key={prod.PRODUCTION_RECORDING_ID}
                              className="border-b border-gray-200 last:border-b-0 p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-3">
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                    <Typography variant="h6" className="text-blue-900 font-bold text-sm sm:text-base">
                                      {formatQuantity(prod.PRODUCTION_RECORDING_QUANTITY)} {prod.PRODUCTION_RECORDING_UNIT}
                                    </Typography>
                                    <Chip
                                      value={prod.PRODUCTION_RECORDING_MACHINE_NUMBERS}
                                      color="blue"
                                      size="sm"
                                      variant="outlined"
                                      className="font-medium text-xs sm:text-sm"
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <CalendarDaysIcon className="h-3 w-3" />
                                      {new Date(prod.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <CubeIcon className="h-3 w-3" />
                                      Order: {prod.PRODUCTION_RECORDING_ORDER_ID}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <CogIcon className="h-3 w-3" />
                                      Recorded by: {prod.PRODUCTION_RECORDING_RECORDED_BY || 'System'}
                                    </div>
                                  </div>
                                  {prod.PRODUCTION_RECORDING_NOTES && (
                                    <Typography variant="small" className="text-gray-600 mt-2 bg-gray-50 p-2 rounded text-xs">
                                      {prod.PRODUCTION_RECORDING_NOTES}
                                    </Typography>
                                  )}
                                </div>
                                <div className="flex gap-1 sm:gap-2 justify-end lg:justify-start mt-2 lg:mt-0">
                                  <Tooltip content="Edit Recording">
                                    <IconButton
                                      color="blue"
                                      variant="text"
                                      onClick={() => handleEdit(prod)}
                                      className="hover:bg-blue-50 h-7 w-7 sm:h-8 sm:w-8"
                                    >
                                      <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip content="Delete Recording">
                                    <IconButton
                                      color="red"
                                      variant="text"
                                      onClick={() => setDeleteDialog({ open: true, recording: prod })}
                                      className="hover:bg-red-50 h-7 w-7 sm:h-8 sm:w-8"
                                    >
                                      <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 sm:p-8 text-center text-gray-500">
                            <CubeIcon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                            <Typography variant="h6" className="text-gray-400 font-medium text-sm sm:text-base">
                              No productions found
                            </Typography>
                            <Typography variant="small" className="text-xs sm:text-sm">
                              {hasActiveFilters ? "Try adjusting your filters" : "No productions recorded for this period"}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabPanel>
            </TabsBody>
          </Tabs>
        </Card>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog 
        open={submitDialog.open} 
        handler={() => setSubmitDialog({ open: false, data: null })}
        size="sm"
      >
        <DialogHeader className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
          <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-sm sm:text-base">{editMode ? "Confirm Update" : "Confirm Production Submission"}</span>
        </DialogHeader>
        <DialogBody className="p-4 sm:p-6">
          <Typography variant="h6" className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">
            Please review the production details:
          </Typography>
          
          {submitDialog.data && (
            <div className="space-y-2 sm:space-y-3 bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <Typography variant="small" className="text-gray-700 font-semibold">Order ID:</Typography>
                <Typography variant="small" className="text-gray-900">{submitDialog.data.orderId}</Typography>
                
                <Typography variant="small" className="text-gray-700 font-semibold">Production Date:</Typography>
                <Typography variant="small" className="text-gray-900">
                  {new Date(submitDialog.data.productionDate).toLocaleDateString()}
                </Typography>
                
                <Typography variant="small" className="text-gray-700 font-semibold">Quantity:</Typography>
                <Typography variant="small" className="text-gray-900 font-bold">
                  {formatQuantity(submitDialog.data.quantity)} {submitDialog.data.unit}
                </Typography>
                
                <Typography variant="small" className="text-gray-700 font-semibold">Machines:</Typography>
                <Typography variant="small" className="text-gray-900">
                  {submitDialog.data.machineNumbers.join(', ')}
                </Typography>
              </div>
              
              {submitDialog.data.notes && (
                <>
                  <Typography variant="small" className="text-gray-700 font-semibold mt-2 text-xs sm:text-sm">Notes:</Typography>
                  <Typography variant="small" className="text-gray-900 bg-white p-2 rounded border text-xs sm:text-sm">
                    {submitDialog.data.notes}
                  </Typography>
                </>
              )}
            </div>
          )}
          
          <Typography variant="small" className="text-gray-600 mt-3 sm:mt-4 text-xs sm:text-sm">
            {editMode 
              ? "Are you sure you want to update this production recording?" 
              : "Are you sure you want to submit this production recording?"
            }
          </Typography>
        </DialogBody>
        <DialogFooter className="p-4 sm:p-6 border-t border-gray-200">
          <Button
            variant="text"
            color="gray"
            onClick={() => setSubmitDialog({ open: false, data: null })}
            className="mr-2 text-xs sm:text-sm"
          >
            Cancel
          </Button>
          <Button
            color={editMode ? "amber" : "blue"}
            onClick={handleConfirmSubmit}
            disabled={loading}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            {loading ? (
              <Spinner className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : editMode ? (
              <>
                <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                Update Recording
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                Confirm Submission
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        handler={() => setDeleteDialog({ open: false, recording: null })}
        size="sm"
      >
        <DialogHeader className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white p-4 sm:p-6">
          <TrashIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-sm sm:text-base">Delete Production Recording</span>
        </DialogHeader>
        <DialogBody className="p-4 sm:p-6">
          <Typography variant="paragraph" className="text-gray-700 mb-3 sm:mb-4 text-xs sm:text-sm">
            Are you sure you want to delete this production recording? This action cannot be undone.
          </Typography>
          {deleteDialog.recording && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
              <Typography variant="small" className="font-semibold text-red-800 mb-2 text-xs sm:text-sm">
                Recording Details:
              </Typography>
              <div className="space-y-1 text-xs text-red-700">
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-bold">{formatQuantity(deleteDialog.recording.PRODUCTION_RECORDING_QUANTITY)} {deleteDialog.recording.PRODUCTION_RECORDING_UNIT}</span>
                </div>
                <div className="flex justify-between">
                  <span>Machines:</span>
                  <span className="font-bold">{deleteDialog.recording.PRODUCTION_RECORDING_MACHINE_NUMBERS}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-bold">{new Date(deleteDialog.recording.PRODUCTION_RECORDING_DATE).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="p-4 sm:p-6 border-t border-gray-200">
          <Button
            variant="text"
            color="gray"
            onClick={() => setDeleteDialog({ open: false, recording: null })}
            className="mr-2 text-xs sm:text-sm"
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => handleDelete(deleteDialog.recording.PRODUCTION_RECORDING_ID)}
            disabled={loading}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            {loading ? <Spinner className="h-3 w-3 sm:h-4 sm:w-4" /> : <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />}
            Delete Recording
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}