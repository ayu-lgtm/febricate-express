// components/ProductionOrderForm.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
const API_BASE = import.meta.env.VITE_API_BASE;
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel,
  Card,
  CardBody,
  Input,
  Textarea,
  Button,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  Stepper,
  Step,
} from "@material-tailwind/react";
import {
  PaperClipIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  CheckCircleIcon,
  TruckIcon,
  CurrencyRupeeIcon,
  CalculatorIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import Select from "react-select";
import { 
  buildOrderPayload, 
  buildDraftPayload, 
  validateOrderPayload, 
  transformPayloadForAPI 
} from "@/utils/orderPayloadBuilder";

// 👉 Custom Dialog Component with Auto Hide
const CustomDialog = ({ 
  open, 
  onClose, 
  title, 
  message, 
  type = "info",
  autoHide = false,
  duration = 4000 
}) => {
  useEffect(() => {
    if (open && autoHide) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, autoHide, duration, onClose]);

  if (!open) return null;

  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return { icon: "✅", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
      case "error":
        return { icon: "❌", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
      case "warning":
        return { icon: "⚠️", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
      default:
        return { icon: "ℹ️", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
    }
  };

  const { icon, color, bg, border } = getIconAndColor();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className={`relative w-full max-w-md mx-4 ${bg} ${border} border-2 rounded-lg shadow-xl transform transition-all duration-300 scale-100 opacity-100`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <span className={`text-xl ${color} mt-0.5`}>{icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-lg ${color} mb-1`}>{title}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          {autoHide && (
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300 ease-linear"
                style={{ 
                  width: open ? '100%' : '0%',
                  transitionDuration: `${duration}ms`
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 👉 Styling for react-select with error states
const getReactSelectStyle = (hasError) => ({
  control: (base, state) => ({
    ...base,
    borderRadius: "0.375rem",
    borderColor: hasError ? "#ef4444" : state.isFocused ? "#2563eb" : "#d1d5db",
    borderWidth: hasError ? "2px" : "1px",
    padding: "1px 4px",
    minHeight: "38px",
    fontSize: "14px",
    boxShadow: state.isFocused && !hasError ? "0 0 0 2px rgba(37, 99, 235, 0.1)" : "none",
    "&:hover": {
      borderColor: hasError ? "#ef4444" : "#2563eb",
    },
  }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#f3f4f6" : "#fff",
    color: "#374151",
    fontSize: "14px",
  }),
});

// Compact Field Group Component
const FieldGroup = ({ title, children, className = "", tooltip }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-3 ${className}`}>
    <Typography variant="h6" className="text-gray-800 mb-3 text-sm font-semibold flex items-center gap-2">
      <div className="w-1.5 h-4 bg-blue-500 rounded"></div>
      {title}
      {tooltip && (
        <Tooltip content={tooltip}>
          <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
        </Tooltip>
      )}
    </Typography>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

// Compact Form Row Component
const FormRow = ({ children, className = "" }) => (
  <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${className}`}>
    {children}
  </div>
);

// Stable Input Component
const StableInput = React.memo(({ label, error, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
    <Input
      {...props}
      error={!!error}
      className={`text-sm ${error ? "border-red-500" : ""} ${props.readOnly ? "bg-gray-50 text-gray-500" : ""}`}
      containerProps={{ className: "min-w-0" }}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));

// Stable Select Component
const StableSelect = React.memo(({ label, error, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
    <Select
      {...props}
      styles={getReactSelectStyle(!!error)}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));

// File handling utilities
const fetchFileBlob = async (filePath, id, isDraft = false) => {
  try {
    const fileName = filePath.split('\\').pop().split('/').pop();
    // const API_BASE = "http://localhost:5000/api";
    const token = sessionStorage.getItem("authToken");
    
    const url = `${API_BASE}/files/download/${isDraft ? 'draft' : 'order'}/${id}/${fileName}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`File not found: ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error("❌ Error fetching file:", error);
    return null;
  }
};

const handleDownloadFile = async (filePath, id, isDraftMode, originalFileName) => {
  try {
    const fileName = filePath.split('\\').pop().split('/').pop();
    const downloadFileName = originalFileName || fileName;
    
    const blob = await fetchFileBlob(filePath, id, isDraftMode);
    
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      alert("Failed to download file. Please check if it exists.");
    }
  } catch (error) {
    console.error("❌ Error downloading file:", error);
    alert("Failed to download file.");
  }
};

const handleViewFile = async (filePath, id, isEditMode, isDraftMode, fileName) => {
  try {
    if (!isEditMode && !isDraftMode) {
      alert("Viewing files is allowed only in edit mode or draft mode.");
      return;
    }
    
    const cleanFileName = filePath.split('\\').pop().split('/').pop();
    // const API_BASE = "http://localhost:5000/api";
    const token = sessionStorage.getItem("authToken");
    
    const url = `${API_BASE}/files/view/${isDraftMode ? 'draft' : 'order'}/${id}/${cleanFileName}`;
    window.open(url, "_blank");
    
  } catch (error) {
    console.error("❌ Error viewing file:", error);
    alert("Failed to open file. Please check if it exists.");
  }
};

// Helper functions
const trimLeadingZeros = (str = "") => String(str).replace(/^0+/, "");

const getOptionsRm = (data = [], useDescription = false) => {
  if (!Array.isArray(data)) return [];
  return data.map((d) =>
    useDescription
      ? {
          value: d.description || "",
          label: d.description || "",
        }
      : {
          value: d.MATNR || "",
          label: trimLeadingZeros(d.MATNR || ""),
        }
  );
};

const getOptionsFg = (data = [], useDescription = false) => {
  if (!Array.isArray(data)) return [];
  return data.map((d) =>
    useDescription
      ? {
          value: d.MAKTX || "",
          label: d.MAKTX || "",
        }
      : {
          value: d.MATNR || "",
          label: trimLeadingZeros(d.MATNR || ""),
        }
  );
};

// Role-based access control
const canEditOrder = (userRole) => {
  const allowedRoles = ["sales", "admin"];
  return allowedRoles.includes(userRole?.toLowerCase());
};

// File validation
const validateFile = (file, isExistingFile = false) => {
  if (isExistingFile) {
    return { isValid: true, error: "" };
  }
  
  if (!file) return { isValid: false, error: "File is required" };
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
  const maxSize = 5 * 1024 * 1024;
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: "File type not allowed. Use PDF, JPG, or PNG" };
  }
  if (file.size > maxSize) {
    return { isValid: false, error: "File size exceeds 5MB limit" };
  }
  return { isValid: true, error: "" };
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ open, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>{title}</DialogHeader>
      <DialogBody>
        <Typography variant="paragraph" className="text-gray-700">
          {message}
        </Typography>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={onClose} className="mr-2">
          {cancelText}
        </Button>
        <Button color="blue" onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

// Compact Draft Card Component
const DraftCard = ({ draft, onEdit, onDelete, onViewDetails, onViewFile }) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300">
      <CardBody className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Typography variant="h6" className="text-gray-900 truncate text-sm">
                {draft.DRAFT_ORDER_ID || "Unnamed Draft"}
              </Typography>
              <Badge color={draft.completionPercentage >= 80 ? "green" : draft.completionPercentage >= 50 ? "amber" : "red"} className="text-xs">
                {draft.completionPercentage}%
              </Badge>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1">
                <BuildingStorefrontIcon className="h-3 w-3 text-blue-500" />
                <span className="text-gray-600 truncate">{draft.DRAFT_ORDER_SPC_NAME}</span>
              </div>
              <div className="flex items-center gap-1">
                <CubeIcon className="h-3 w-3 text-green-500" />
                <span className="text-gray-600">{draft.DRAFT_ORDER_WELDMESH_QTY} {draft.DRAFT_ORDER_UNIT}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3 text-purple-500" />
                <span className="text-gray-600">
                  {draft.DRAFT_ORDER_DELIVERY_DATE ? new Date(draft.DRAFT_ORDER_DELIVERY_DATE).toLocaleDateString() : "No date"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-2 space-y-1">
          {draft.DRAFT_ORDER_DRAWING_ATTACHMENT_PATH && (
            <div className="flex items-center gap-1 p-1 bg-blue-50 rounded text-xs">
              <PaperClipIcon className="h-3 w-3 text-blue-500" />
              <span className="text-gray-700 truncate flex-1">Drawing</span>
              <Tooltip content="View Drawing">
                <IconButton
                  size="sm"
                  color="blue"
                  variant="text"
                  className="h-4 w-4"
                  onClick={() => onViewFile(
                    draft.DRAFT_ORDER_DRAWING_ATTACHMENT_PATH, 
                    draft.DRAFT_ORDER_ID, 
                    true, 
                    true,
                    draft.DRAFT_ORDER_DRAWING_ATTACHMENT_PATH
                  )}
                >
                  <EyeIcon className="h-3 w-3" />
                </IconButton> 
              </Tooltip>
            </div>
          )}
          {draft.DRAFT_ORDER_PO_ATTACHMENT_PATH && (
            <div className="flex items-center gap-1 p-1 bg-green-50 rounded text-xs">
              <PaperClipIcon className="h-3 w-3 text-green-500" />
              <span className="text-gray-700 truncate flex-1">PO Copy</span>
              <Tooltip content="View PO Copy">
                <IconButton
                  size="sm"
                  color="green"
                  variant="text"
                  className="h-4 w-4"
                  onClick={() => onViewFile(
                    draft.DRAFT_ORDER_PO_ATTACHMENT_PATH, 
                    draft.DRAFT_ORDER_ID, 
                    true, 
                    true,
                    draft.DRAFT_ORDER_PO_ATTACHMENT_PATH
                  )}
                >
                  <EyeIcon className="h-3 w-3" />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <div className="flex-1">
            <Typography variant="small" className="text-gray-500 text-xs">
              ID: {draft.DRAFT_ORDER_ID}
            </Typography>
            <Typography variant="small" className="text-gray-500 text-xs">
              {new Date(draft.DRAFT_ORDER_LAST_ACTIVITY).toLocaleDateString()}
            </Typography>
          </div>
          <div className="flex gap-1">
            <Tooltip content="View Details">
              <IconButton
                size="sm"
                color="blue"
                variant="text"
                className="h-5 w-5"
                onClick={() => onViewDetails(draft)}
              >
                <InformationCircleIcon className="h-3 w-3" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Edit Draft">
              <IconButton
                size="sm"
                color="green"
                className="h-5 w-5"
                onClick={() => onEdit(draft)}
              >
                <PencilIcon className="h-3 w-3" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Delete Draft">
              <IconButton
                size="sm"
                color="red"
                className="h-5 w-5"
                onClick={() => onDelete(draft)}
              >
                <TrashIcon className="h-3 w-3" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Main Production Order Form Component
export function ProductionOrderForm({ currentUser, permissions, ...restProps }) {
  const [searchParams] = useSearchParams();

  const draftId = searchParams.get('draftId');
  const orderId = searchParams.get('orderId');
  const draftMode = searchParams.get('draftMode');
  const navigate = useNavigate();

  // State management
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [originalOrder, setOriginalOrder] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [freightChecked, setFreightChecked] = useState(false);
  const [canCheckFreight, setCanCheckFreight] = useState(false);
  
  // Data states
  const [rmMaterials, setRmMaterials] = useState([]);
  const [fgMaterials, setFgMaterials] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [spcPlants, setSpcPlants] = useState([]);

  const [costCalculation, setCostCalculation] = useState({
    loading: false,
    data: null,
    error: null,
    showResults: false,
    showDialog: false
  });

  const [costParams, setCostParams] = useState({
    materialCode: "",
    plantCode: "",
    orderMonth: "",
    fgDispatchCost: 0
  });

  // Get current month for default value
  const getCurrentMonth = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    return `${months[now.getMonth()]}-${now.getFullYear().toString().slice(-2)}`;
  };
  
  // Loading states
  const [loading, setLoading] = useState({
    spcPlants: true,
    rmMaterials: true,
    fgMaterials: true,
    cityCodes: true,
    orderData: false,
  });
  const [freightLoading, setFreightLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Draft management
  const [drafts, setDrafts] = useState([]);
  const [saveDraftLoading, setSaveDraftLoading] = useState(false);
  const [loadDraftLoading, setLoadDraftLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [activeTab, setActiveTab] = useState("create");
  
  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, draft: null });
  const [detailsModal, setDetailsModal] = useState({ open: false, draft: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Confirmation dialogs
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showDraftSaveConfirm, setShowDraftSaveConfirm] = useState(false);
  const [showFreightConfirm, setShowFreightConfirm] = useState(false);
  const [showCostDialog, setShowCostDialog] = useState(false);

  // Custom Dialog State
  const [customDialog, setCustomDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    autoHide: false
  });

  // const API_BASE = "http://localhost:5000/api";
  const requiredFields = [
    "spcName", "customerName", "application", "meshType", "quantity", 
    "unit", "details", "location", "orderType", "rmMaterial", "rmType", 
    "deliveryDate", "city", "freight", "fgMaterial", "vehicleType"
  ];

  // Memoized options for stable selects
  const rmOptions = useMemo(() => getOptionsRm(rmMaterials, true), [rmMaterials]);
  const fgOptions = useMemo(() => getOptionsFg(fgMaterials, true), [fgMaterials]);
  const spcOptions = useMemo(() => spcPlants, [spcPlants]);
  const cityOptionsMemo = useMemo(() => cityOptions, [cityOptions]);

  // Show custom dialog
  const showCustomDialog = useCallback((title, message, type = "info", autoHide = false) => {
    setCustomDialog({
      open: true,
      title,
      message,
      type,
      autoHide
    });
  }, []);

  // Auto-update cost parameters and dispatch cost when form changes
  useEffect(() => {
    if (form.fgMaterialDescription && form.spcName && form.deliveryDate) {
      const deliveryDate = new Date(form.deliveryDate);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const orderMonth = `${months[deliveryDate.getMonth()]}-${deliveryDate.getFullYear().toString().slice(-2)}`;
      
      // Auto-set dispatch cost based on freight status
      const dispatchCost = form.freight === "Yes" && form.freightStdRate 
        ? parseFloat(form.freightStdRate) || 0 
        : 0;

      setCostParams(prev => ({
        ...prev,
        materialCode: form.fgMaterialDescription,
        plantCode: form.spcName,
        orderMonth: orderMonth,
        fgDispatchCost: dispatchCost
      }));
    }
  }, [form.fgMaterialDescription, form.spcName, form.deliveryDate, form.freight, form.freightStdRate]);

  // Initialize component based on URL parameters
  useEffect(() => {
    const initializeComponent = async () => {
      const userCanEdit = canEditOrder(currentUser?.role);
      setHasEditPermission(userCanEdit);
      
      if ((draftId && draftId !== 'undefined') || draftMode === 'true') {
        setIsDraftMode(true);
        setIsEditMode(false);
        setActiveTab("create");
        
        if (draftId && draftId !== 'undefined') {
          await loadDraftData(draftId);
        } else {
          setIsDraftMode(true);
          setIsEditMode(false);
          setForm({});
        }
      } else if (orderId && orderId !== 'undefined' && orderId !== 'new') {
        await checkEditPermission(orderId);
      } else {
        setIsEditMode(false);
        setIsDraftMode(false);
        setForm({});
        setActiveTab("create");
      }
    };

    initializeComponent();
  }, [searchParams, currentUser?.role]);

  // Cost Calculation Card Component
  const CostCalculationCard = () => (
    <Card className="mt-4 border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
      <CardBody className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalculatorIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <Typography variant="h5" className="text-blue-900 text-lg font-semibold">
                Cost Calculator
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Real-time production cost estimation
              </Typography>
            </div>
          </div>
          <Badge color={costCalculation.showResults ? "green" : "blue"} variant="filled" className="text-xs">
            {costCalculation.showResults ? "Calculated" : "Ready"}
          </Badge>
        </div>

        {/* Cost Parameters Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
            <Typography variant="small" className="text-blue-700 font-medium flex items-center gap-1">
              <CubeIcon className="h-3 w-3" />
              Material
            </Typography>
            <Typography variant="paragraph" className="text-blue-900 truncate font-semibold">
              {costParams.materialCode || "Not selected"}
            </Typography>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
            <Typography variant="small" className="text-green-700 font-medium flex items-center gap-1">
              <BuildingStorefrontIcon className="h-3 w-3" />
              Plant
            </Typography>
            <Typography variant="paragraph" className="text-green-900 font-semibold">
              {costParams.plantCode || "Not selected"}
            </Typography>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
            <Typography variant="small" className="text-purple-700 font-medium flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              Month
            </Typography>
            <Typography variant="paragraph" className="text-purple-900 font-semibold">
              {costParams.orderMonth || "Not selected"}
            </Typography>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-200">
            <Typography variant="small" className="text-amber-700 font-medium flex items-center gap-1">
              <TruckIcon className="h-3 w-3" />
              Dispatch Cost
            </Typography>
            <Typography variant="paragraph" className="text-amber-900 font-semibold">
              ₹{costParams.fgDispatchCost}
              {form.freight === "Yes" && (
                <span className="text-green-600 text-xs ml-1">✓ Included</span>
              )}
            </Typography>
          </div>
        </div>

        {/* Calculate Button */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Tooltip content="Calculate production cost based on current selections">
              <div>
                <Button
                  onClick={() => calculateCost(costParams)}
                  color="blue"
                  disabled={!costParams.materialCode || !costParams.plantCode || !costParams.orderMonth || costCalculation.loading}
                  className="flex items-center gap-2 px-6"
                >
                  {costCalculation.loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <CalculatorIcon className="h-4 w-4" />
                      Calculate Cost
                    </>
                  )}
                </Button>
              </div>
            </Tooltip>
            
            <Tooltip content="View detailed cost breakdown">
              <IconButton
                color="blue"
                variant="outlined"
                onClick={() => setShowCostDialog(true)}
                disabled={!costCalculation.showResults}
              >
                <ChartBarIcon className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          </div>
          
          {costCalculation.showResults && (
            <Button
              variant="outlined"
              color="red"
              size="sm"
              onClick={() => setCostCalculation(prev => ({ ...prev, showResults: false }))}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Quick Status */}
        {costCalculation.showResults && costCalculation.data && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center">
              <Typography variant="small" className="text-green-800 font-medium">
                Estimated Total Cost:
              </Typography>
              <Typography variant="h6" className="text-green-900 font-bold">
                ₹{costCalculation.data.totalCost?.toFixed(2)}
              </Typography>
            </div>
          </div>
        )}

        {/* Error Display */}
        {costCalculation.error && (
          <Alert color="red" className="mt-3">
            <Typography variant="small" className="font-medium">
              Calculation Error: {costCalculation.error}
            </Typography>
          </Alert>
        )}
      </CardBody>
    </Card>
  );

  // Cost Results Display Component
  const CostResultsDisplay = () => {
    if (!costCalculation.showResults || !costCalculation.data) return null;

    const { materialDetails, detailedBreakdown, totalCost } = costCalculation.data;

    return (
      <Card className="mt-4 border-l-4 border-l-green-500 animate-fade-in">
        <CardBody className="p-4">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h5" className="text-green-900 font-semibold flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              Cost Calculation Results
            </Typography>
            <Badge color="green" className="text-xs">
              Final Estimate
            </Badge>
          </div>

          {/* Material Details */}
          <div className="mb-6">
            <Typography variant="h6" className="text-gray-700 mb-3 text-sm font-semibold">
              Material Analysis
            </Typography>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3 rounded border">
                <Typography variant="small" className="text-gray-600">Type</Typography>
                <Typography variant="paragraph" className="font-medium text-gray-900">{materialDetails.materialType}</Typography>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <Typography variant="small" className="text-gray-600">Wire Type</Typography>
                <Typography variant="paragraph" className="font-medium text-gray-900">{materialDetails.wireType}</Typography>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <Typography variant="small" className="text-gray-600">Dimension</Typography>
                <Typography variant="paragraph" className="font-medium text-gray-900">{materialDetails.dimension}mm</Typography>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <Typography variant="small" className="text-gray-600">Section</Typography>
                <Typography variant="paragraph" className="font-medium text-gray-900">{materialDetails.section}</Typography>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="mb-4">
            <Typography variant="h6" className="text-gray-700 mb-3 text-sm font-semibold">
              Cost Breakdown
            </Typography>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b">
                <Typography variant="small" className="text-gray-600">Transfer Price</Typography>
                <Typography variant="paragraph" className="font-medium text-blue-600">
                  ₹{detailedBreakdown.transferPrice?.toFixed(2)}
                </Typography>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <Typography variant="small" className="text-gray-600">Freight Charges</Typography>
                <Typography variant="paragraph" className="font-medium text-green-600">
                  ₹{detailedBreakdown.freight?.total?.toFixed(2)}
                </Typography>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <Typography variant="small" className="text-gray-600">Conversion Charge</Typography>
                <Typography variant="paragraph" className="font-medium text-purple-600">
                  ₹{detailedBreakdown.conversionCharge?.toFixed(2)}
                </Typography>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <Typography variant="small" className="text-gray-600">FG Dispatch Cost</Typography>
                <Typography variant="paragraph" className="font-medium text-amber-600">
                  ₹{detailedBreakdown.fgDispatchCost?.toFixed(2)}
                </Typography>
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <Typography variant="h5" className="text-green-900 font-bold">
                Total Production Cost
              </Typography>
              <Typography variant="h4" className="text-green-900 font-bold">
                ₹{totalCost?.toFixed(2)}
              </Typography>
            </div>
            <Typography variant="small" className="text-green-700 mt-1">
              Per unit cost for {materialDetails.materialType} material
            </Typography>
          </div>
        </CardBody>
      </Card>
    );
  };

  // Cost Dialog Component
  const CostDialog = () => (
    <Dialog open={showCostDialog} handler={() => setShowCostDialog(false)} size="lg">
      <DialogHeader className="flex items-center gap-2">
        <CalculatorIcon className="h-5 w-5 text-blue-600" />
        Detailed Cost Breakdown
      </DialogHeader>
      <DialogBody>
        {costCalculation.data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <Typography variant="small" className="text-blue-700">Material Type</Typography>
                <Typography variant="paragraph" className="font-semibold">{costCalculation.data.materialDetails.materialType}</Typography>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <Typography variant="small" className="text-green-700">Total Cost</Typography>
                <Typography variant="h6" className="font-bold text-green-800">₹{costCalculation.data.totalCost?.toFixed(2)}</Typography>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>Transfer Price</span>
                <span className="font-semibold">₹{costCalculation.data.detailedBreakdown.transferPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>Freight Charges</span>
                <span className="font-semibold">₹{costCalculation.data.detailedBreakdown.freight?.total?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>Conversion Charge</span>
                <span className="font-semibold">₹{costCalculation.data.detailedBreakdown.conversionCharge?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>FG Dispatch Cost</span>
                <span className="font-semibold">₹{costCalculation.data.detailedBreakdown.fgDispatchCost?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <Typography>No cost data available</Typography>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={() => setShowCostDialog(false)} className="mr-2">
          Close
        </Button>
        <Button color="blue" onClick={() => setShowCostDialog(false)}>
          OK
        </Button>
      </DialogFooter>
    </Dialog>
  );

  // Cost calculation API calls
  const calculateCost = async (params) => {
    try {
      setCostCalculation(prev => ({ ...prev, loading: true, error: null }));
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/cost/calculate-cost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`Calculation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setCostCalculation({
          loading: false,
          data: result.data,
          error: null,
          showResults: true,
          showDialog: false
        });
        showCustomDialog("Cost Calculation Complete", "Production cost calculated successfully!", "success", true);
      } else {
        throw new Error(result.error || 'Calculation failed');
      }
    } catch (error) {
      console.error("Cost calculation error:", error);
      setCostCalculation({
        loading: false,
        data: null,
        error: error.message,
        showResults: false,
        showDialog: false
      });
      showCustomDialog("Calculation Error", error.message, "error", true);
    }
  };

  // Check edit permission for orders
  const checkEditPermission = async (id) => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/orders/can-edit/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.data.canEdit) {
          setIsEditMode(true);
          setIsDraftMode(false);
          setActiveTab("create");
          await fetchOrderForEdit(id);
        } else {
          showCustomDialog("Access Denied", "You don't have permission to edit this order", "error", true);
          setTimeout(() => navigate("/approvaldashboard"), 2000);
        }
      }
    } catch (err) {
      console.error("Error checking edit permission:", err);
      showCustomDialog("Error", "Failed to check edit permission", "error", true);
      setTimeout(() => navigate("/approvaldashboard"), 2000);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch SPC Plants
        const spcResponse = await fetch(`${API_BASE}/orders/spc-plants`);
        const spcData = await spcResponse.json();
        if (Array.isArray(spcData)) {
          const formatted = spcData.map((plant) => ({
            value: plant.SPC_PLANTS_ID,
            label: `${plant.SPC_PLANTS_ID} - ${plant.SPC_PLANTS_NAME}`,
            code: plant.SPC_PLANTS_ID,
            name: plant.SPC_PLANTS_NAME,
          }));
          setSpcPlants(formatted);
        }

        // Fetch Raw Materials
        const rmResponse = await fetch(`${API_BASE}/bq/raw-materials`);
        const rmData = await rmResponse.json();
        setRmMaterials(Array.isArray(rmData) ? rmData : rmData?.data || []);

        // Fetch FG Materials
        const fgResponse = await fetch(`${API_BASE}/bq/fg-materials`);
        const fgData = await fgResponse.json();
        setFgMaterials(Array.isArray(fgData) ? fgData : fgData?.data || []);

        // Fetch City Codes
        const cityResponse = await fetch(`${API_BASE}/bq/city-codes`);
        const cityData = await cityResponse.json();
        const cities = Array.isArray(cityData) ? cityData : cityData?.data || [];
        const formattedCities = cities.map((c) => ({
          value: `${c.CITYC}-${c.CITY_NAME}-${c.REGIO}`,
          label: `${c.CITYC}-${c.CITY_NAME}-${c.REGIO}`,
          cityCode: c.CITYC,
          cityName: c.CITY_NAME,
          region: c.REGIO,
        }));
        setCityOptions(formattedCities);

      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        showCustomDialog("Error", "Failed to load required data", "error", true);
      } finally {
        setLoading({
          spcPlants: false,
          rmMaterials: false,
          fgMaterials: false,
          cityCodes: false,
          orderData: false,
        });
      }
    };

    fetchInitialData();
  }, []);

  // Enable freight check when required fields are filled
  useEffect(() => {
    const { spcName, city, vehicleType } = form;
    setCanCheckFreight(!!spcName && !!city && !!vehicleType);
  }, [form.spcName, form.city, form.vehicleType]);

  // Fetch user drafts when drafts tab is active
  useEffect(() => {
    if (activeTab === "drafts") {
      fetchUserDrafts();
    }
  }, [activeTab]);

  // Fetch order for editing
  const fetchOrderForEdit = async (id) => {
    try {
      if (id === 'new' || !id) {
        setIsEditMode(false);
        return;
      }
      setLoading(prev => ({ ...prev, orderData: true }));
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/orders/details/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          showCustomDialog("Error", errorData.error || "Order cannot be edited", "error", true);
          setTimeout(() => navigate("/approvaldashboard"), 2000);
          return;
        }
        throw new Error("Failed to fetch order");
      }
      
      const data = await response.json();
      if (data.success) {
        setOriginalOrder(data.data);
        prefillForm(data.data);
      }
    } catch (err) {
      console.error("Error fetching order for edit:", err);
      showCustomDialog("Error", "Failed to load order data: " + err.message, "error", true);
      setTimeout(() => navigate("/approvaldashboard"), 2000);
    } finally {
      setLoading(prev => ({ ...prev, orderData: false }));
    }
  };

  // Pre-fill form with order data
  const prefillForm = (orderData) => {
    const getFileNameFromPath = (filePath) => {
      if (!filePath) return "";
      return filePath.split(/[\\/]/).pop();
    };

    setForm({
      spcName: orderData.PRODUCTION_ORDER_SPC_NAME,
      customerName: orderData.PRODUCTION_ORDER_CUSTOMER_NAME,
      application: orderData.PRODUCTION_ORDER_APPLICATION || "",
      meshType: orderData.PRODUCTION_ORDER_MESH_TYPE,
      quantity: orderData.PRODUCTION_ORDER_WELDMESH_QTY,
      unit: orderData.PRODUCTION_ORDER_UNIT,
      details: orderData.PRODUCTION_ORDER_WELDMESH_DETAILS,
      location: orderData.PRODUCTION_ORDER_DISPATCH_LOCATION,
      orderType: orderData.PRODUCTION_ORDER_ORDER_TYPE,
      rmMaterial: orderData.PRODUCTION_ORDER_RM_MATERIAL_NO,
      rmType: orderData.PRODUCTION_ORDER_RM_TYPE,
      rmMaterialDescription: orderData.PRODUCTION_ORDER_RM_MATERIAL_DESCRIPTION,
      fgMaterial: orderData.PRODUCTION_ORDER_FG_MATERIAL_NUMBER,
      fgMaterialDescription: orderData.PRODUCTION_ORDER_FG_MATERIAL_DESCRIPTION,
      freight: orderData.PRODUCTION_ORDER_FREIGHT_MAINTAINED,
      freightPoNumber: orderData.PRODUCTION_ORDER_FREIGHT_PO_NUMBER || "",
      freightStdRate: orderData.PRODUCTION_ORDER_FREIGHT_STD_RATE || "",
      remarks: orderData.PRODUCTION_ORDER_REMARKS,
      deliveryDate: orderData.PRODUCTION_ORDER_DELIVERY_DATE?.split('T')[0],
      city: orderData.PRODUCTION_ORDER_CITY_CODE,
      vehicleType: orderData.PRODUCTION_ORDER_VEHICLE_TYPE,
      drawing: getFileNameFromPath(orderData.PRODUCTION_ORDER_DRAWING_ATTACHMENT_PATH),
      poCopy: getFileNameFromPath(orderData.PRODUCTION_ORDER_PO_ATTACHMENT_PATH),
    });
    
    if (orderData.PRODUCTION_ORDER_FREIGHT_MAINTAINED === "Yes") {
      setFreightChecked(true);
    }
  };

  // Handle form submission with enhanced validation
  const handleSubmit = async () => {
    // Enhanced validation checks
    if (!freightChecked) {
      setErrors((prev) => ({ ...prev, freight: "Please check freight status before submitting" }));
      showCustomDialog("Freight Check Required", "You must check freight status before submitting the order.", "warning", true);
      return;
    }

    if (form.freight === "No") {
      const proceed = window.confirm("Freight is not maintained for this route. This may affect delivery costs. Do you want to proceed?");
      if (!proceed) return;
    }
    
    if (!validateForm()) {
      showCustomDialog("Validation Error", "Please fill all required fields correctly before submitting.", "error", true);
      return;
    }
    
    setSubmitLoading(true);
    try {
      const payload = buildOrderPayload(form, isEditMode, isDraftMode);
      
      const validation = validateOrderPayload(payload, isDraftMode);
      if (!validation.isValid) {
        showCustomDialog("Validation Failed", validation.errors.join(", "), "error", true);
        return;
      }
      
      const apiPayload = transformPayloadForAPI(payload, isEditMode ? 'update' : 'create');
      const formData = new FormData();
      
      Object.entries(apiPayload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      // Handle file uploads
      if (form.drawingFile) {
        const fileValidation = validateFile(form.drawingFile);
        if (!fileValidation.isValid) {
          setErrors(prev => ({ ...prev, drawingFile: fileValidation.error }));
          return;
        }
        formData.append("drawing", form.drawingFile);
      } else if (isDraftMode && form.drawing) {
        formData.append("existingDrawing", form.drawing);
      }
      
      if (form.poCopyFile) {
        const fileValidation = validateFile(form.poCopyFile);
        if (!fileValidation.isValid) {
          setErrors(prev => ({ ...prev, poCopyFile: fileValidation.error }));
          return;
        }
        formData.append("poCopy", form.poCopyFile);
      } else if (isDraftMode && form.poCopy) {
        formData.append("existingPoCopy", form.poCopy);
      }
      
      const authToken = sessionStorage.getItem('authToken');
      const url = isEditMode
        ? `${API_BASE}/orders/update/${orderId}`
        : `${API_BASE}/orders/create`;

      const method = isEditMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        body: formData,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      const result = await res.json();
      
      if (res.ok) {
        showCustomDialog(
          "Success", 
          isEditMode ? "Order updated successfully!" : "Order submitted successfully!", 
          "success", 
          true
        );
        setTimeout(() => navigate("/approvaldashboard"), 2000);
      } else {
        showCustomDialog("Error", "Operation failed: " + result.error, "error", true);
      }
    } catch (err) {
      showCustomDialog("Network Error", "Network error: " + err.message, "error", true);
    } finally {
      setSubmitLoading(false);
      setShowSubmitConfirm(false);
    }
  };

  // Convert draft to production order
  const handleConvertToOrder = async () => {
    if (!currentDraftId) {
      showCustomDialog("Error", "No draft found to convert", "error", true);
      return;
    }
    
    if (!validateForm()) {
      showCustomDialog("Validation Error", "Please complete all required fields before submitting", "error", true);
      return;
    }
    
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      
      if (form.drawingFile) {
        formData.append("drawing", form.drawingFile);
      } else if (form.drawing) {
        formData.append("existingDrawing", form.drawing);
      }
      
      if (form.poCopyFile) {
        formData.append("poCopy", form.poCopyFile);
      } else if (form.poCopy) {
        formData.append("existingPoCopy", form.poCopy);
      }
      
      const authToken = sessionStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/drafts/${currentDraftId}/convert-to-order`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });
      
      const result = await res.json();
      
      if (res.ok) {
        showCustomDialog("Success", "Order submitted successfully from draft!", "success", true);
        setTimeout(() => navigate("/approvaldashboard"), 2000);
      } else {
        showCustomDialog("Error", "Failed to convert draft to order: " + result.error, "error", true);
      }
    } catch (err) {
      showCustomDialog("Network Error", "Network error: " + err.message, "error", true);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Fetch user drafts
  const fetchUserDrafts = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/drafts/user-drafts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
        
      if (response.ok) {
        const result = await response.json();
        setDrafts(result.data.drafts || []);
      }
    } catch (err) {
      console.error("Error fetching drafts:", err);
      showCustomDialog("Error", "Failed to fetch drafts", "error", true);
    }
  };

  // Load draft into form
  const handleLoadDraft = (draft, e) => {
    e?.preventDefault();
    
    setErrors({});
    
    if (draft.DRAFT_ORDER_FREIGHT_MAINTAINED) {
      setFreightChecked(true);
    }

    setCurrentDraftId(draft.DRAFT_ORDER_ID);
    setIsDraftMode(true);
    setIsEditMode(false);
    setActiveTab("create");

    navigate(`/dashboard/productionorderform?draftId=${draft.DRAFT_ORDER_ID}&draftMode=true`);
    loadDraftData(draft.DRAFT_ORDER_ID);
  };

  // Load draft data
  const loadDraftData = async (id) => {
    try {
      if (id === 'new' || !id) {
        setIsDraftMode(false);
        return;
      }
      
      setLoadDraftLoading(true);
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/drafts/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          showCustomDialog("Error", errorData.error || "Draft cannot be loaded", "error", true);
          setTimeout(() => navigate("/approvaldashboard"), 2000);
          return;
        }
        throw new Error("Failed to fetch draft");
      }
      
      const data = await response.json();
      if (data.success) {
        setOriginalOrder(data.data);
        prefillFormForDraft(data.data);
      }
    } catch (err) {
      console.error("Error fetching draft for edit:", err);
      showCustomDialog("Error", "Failed to load draft data: " + err.message, "error", true);
      setTimeout(() => navigate("/approvaldashboard"), 2000);
    } finally {
      setLoadDraftLoading(false);
    }
  };

  // Pre-fill form for draft
  const prefillFormForDraft = (draftData) => {
    const getFileNameFromPath = (filePath) => {
      if (!filePath) return "";
      return filePath.split(/[\\/]/).pop();
    };

    setForm({
      spcName: draftData.DRAFT_ORDER_SPC_NAME || "",
      customerName: draftData.DRAFT_ORDER_CUSTOMER_NAME || "",
      application: draftData.DRAFT_ORDER_APPLICATION || "",
      meshType: draftData.DRAFT_ORDER_MESH_TYPE || "",
      quantity: draftData.DRAFT_ORDER_WELDMESH_QTY || "",
      unit: draftData.DRAFT_ORDER_UNIT || "",
      details: draftData.DRAFT_ORDER_WELDMESH_DETAILS || "",
      location: draftData.DRAFT_ORDER_DISPATCH_LOCATION || "",
      orderType: draftData.DRAFT_ORDER_ORDER_TYPE || "",
      rmMaterial: draftData.DRAFT_ORDER_RM_MATERIAL_NO || "",
      rmType: draftData.DRAFT_ORDER_RM_TYPE || "",
      rmMaterialDescription: draftData.DRAFT_ORDER_RM_MATERIAL_DESCRIPTION || "",
      fgMaterial: draftData.DRAFT_ORDER_FG_MATERIAL_NUMBER || "",
      fgMaterialDescription: draftData.DRAFT_ORDER_FG_MATERIAL_DESCRIPTION || "",
      freight: draftData.DRAFT_ORDER_FREIGHT_MAINTAINED || "",
      freightPoNumber: draftData.DRAFT_ORDER_FREIGHT_PO_NUMBER || "",
      freightStdRate: draftData.DRAFT_ORDER_FREIGHT_STD_RATE || "",
      remarks: draftData.DRAFT_ORDER_REMARKS || "",
      deliveryDate: draftData.DRAFT_ORDER_DELIVERY_DATE 
        ? draftData.DRAFT_ORDER_DELIVERY_DATE.split('T')[0] 
        : "",
      city: draftData.DRAFT_ORDER_CITY_CODE || "",
      vehicleType: draftData.DRAFT_ORDER_VEHICLE_TYPE || "",
      drawing: getFileNameFromPath(draftData.DRAFT_ORDER_DRAWING_ATTACHMENT_PATH),
      poCopy: getFileNameFromPath(draftData.DRAFT_ORDER_PO_ATTACHMENT_PATH),
    });

    if (draftData.DRAFT_ORDER_FREIGHT_MAINTAINED) {
      setFreightChecked(true);
    }
    
    setCurrentDraftId(draftData.DRAFT_ORDER_ID);
  };

  // Save as Draft
  const handleSaveAsDraft = async () => {
    if (isEditMode && originalOrder?.PRODUCTION_ORDER_STATUS === "Returned to Sales") {
      showCustomDialog("Warning", "Save as Draft is disabled for returned orders in edit mode. Please submit the order directly.", "warning", true);
      return;
    }

    setSaveDraftLoading(true);
    try {
      const draftPayload = buildDraftPayload(form);
      const formDataObj = new FormData();
      
      Object.entries(draftPayload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataObj.append(key, value);
        }
      });
      
      if (form.drawingFile) {
        formDataObj.append("drawing", form.drawingFile);
      }
      
      if (form.poCopyFile) {
        formDataObj.append("poCopy", form.poCopyFile);
      }
      
      if (currentDraftId) {
        formDataObj.append("draftId", currentDraftId);
      }
      
      const authToken = sessionStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/drafts/save-draft`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formDataObj,
      });
      
      const result = await res.json();
      
      if (res.ok) {
        if (!currentDraftId) {
          setCurrentDraftId(result.data.DRAFT_ORDER_ID);
        }
        showCustomDialog("Success", "Draft saved successfully!", "success", true);
        setIsDraftMode(true);
        fetchUserDrafts();
      } else {
        showCustomDialog("Error", "Failed to save draft: " + result.error, "error", true);
      }
    } catch (err) {
      showCustomDialog("Network Error", "Network error: " + err.message, "error", true);
    } finally {
      setSaveDraftLoading(false);
      setShowDraftSaveConfirm(false);
    }
  };

  // Delete draft
  const handleDeleteDraft = async (draftId) => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/drafts/${draftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        showCustomDialog("Success", "Draft deleted successfully!", "success", true);
        fetchUserDrafts();
      } else {
        const result = await response.json();
        showCustomDialog("Error", "Failed to delete draft: " + result.error, "error", true);
      }
    } catch (err) {
      showCustomDialog("Network Error", "Network error: " + err.message, "error", true);
    } finally {
      setDeleteDialog({ open: false, draft: null });
    }
  };

  // View draft details
    const handleViewDetails = (draft) => {
      setDetailsModal({ 
        open: true, 
        draft: draft 
      });
      console.log("Opening details for:", draft.DRAFT_ORDER_ID); // Debug log
    };

  // Handle input changes with stable function
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const { name, files } = e.target;
    if (files?.length > 0) {
      const file = files[0];
      const validation = validateFile(file);
      
      if (validation.isValid) {
        setForm((prev) => ({
          ...prev,
          [`${name}File`]: file,
          [name]: file.name,
        }));
        
        if (errors[`${name}File`]) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`${name}File`];
            return newErrors;
          });
        }
      } else {
        setErrors((prev) => ({ ...prev, [`${name}File`]: validation.error }));
      }
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${name}File`];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    requiredFields.forEach((field) => {
      if (field.endsWith("File") && isDraftMode && form[field.replace('File', '')]) {
        return;
      }
      
      if (
        !form[field] ||
        (typeof form[field] === "string" && form[field].trim() === "") ||
        (field.endsWith("File") && !form[field] && !isEditMode && !isDraftMode)
      ) {
        newErrors[field] = "This field is required";
      }
    });
    
    if (form.quantity && isNaN(parseFloat(form.quantity))) {
      newErrors.quantity = "Quantity must be a valid number";
    }
    
    if (form.quantity && parseFloat(form.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }
    
    if (form.customerName && !/^[A-Za-z\s&]+$/.test(form.customerName)) {
      newErrors.customerName = "Only letters, spaces, & allowed";
    }
    
    if (form.application && !/^[A-Za-z0-9\s/-]+$/.test(form.application)) {
      newErrors.application = "Only letters, numbers, spaces, / and - allowed";
    }
    
    if (form.deliveryDate) {
      const deliveryDate = new Date(form.deliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deliveryDate < today) {
        newErrors.deliveryDate = "Delivery date cannot be in the past";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle freight check with enhanced functionality
  const handleFreightCheck = async () => {
    const { spcName, city, vehicleType } = form;
    
    if (!spcName || !city || !vehicleType) {
      setErrors((prev) => ({ ...prev, freight: "Please select all required fields first" }));
      showCustomDialog("Incomplete Information", "Please select SPC Name, City, and Vehicle Type to check freight.", "warning", true);
      return;
    }
    
    setFreightLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/bq/check-freight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spcName, city, vehicleType }),
      });
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const result = await response.json();
      const freightMaintained = result.data.freightMaintained;
      const freightPoNumber = result.data.freightPoNumber;
      const freightStdRate = result.data.freightStdRate;
      
      setForm((prev) => ({
        ...prev,
        freight: freightMaintained,
        freightPoNumber: freightPoNumber || "",
        freightStdRate: freightStdRate || ""
      }));
      
      setFreightChecked(true);
      setErrors((prev) => ({ ...prev, freight: null }));
      
      // Auto-update dispatch cost in cost params
      const dispatchCost = freightMaintained === "Yes" && freightStdRate 
        ? parseFloat(freightStdRate) || 0 
        : 0;
      
      setCostParams(prev => ({
        ...prev,
        fgDispatchCost: dispatchCost
      }));
      
      showCustomDialog(
        "Freight Check Complete", 
        `Freight Status: ${freightMaintained}${freightPoNumber ? ` | PO: ${freightPoNumber}` : ''}${freightStdRate ? ` | Standard Rate: ₹${freightStdRate}` : ''}`,
        freightMaintained === "Yes" ? "success" : "warning",
        true
      );
    } catch (error) {
      console.error("Freight check failed:", error);
      setErrors((prev) => ({ ...prev, freight: "Failed to check freight status" }));
      showCustomDialog("Freight Check Failed", "Failed to check freight status. Please try again.", "error", true);
    } finally {
      setFreightLoading(false);
      setShowFreightConfirm(false);
    }
  };

  // Filter drafts
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = 
      draft.DRAFT_ORDER_CUSTOMER_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.DRAFT_ORDER_ID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.DRAFT_ORDER_SPC_NAME?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
      (filterStatus === "complete" && draft.completionPercentage >= 80) ||
      (filterStatus === "incomplete" && draft.completionPercentage < 80);
    
    return matchesSearch && matchesFilter;
  });

  const isSaveDraftDisabled = isEditMode && originalOrder?.PRODUCTION_ORDER_STATUS === "Returned to Sales";

  // Enhanced submit button validation
  const getSubmitButtonStatus = () => {
    if (!freightChecked) {
      return {
        disabled: true,
        tooltip: "Please check freight status before submitting",
        color: "gray",
        text: "Check Freight First"
      };
    }
    
    if (form.freight === "No") {
      return {
        disabled: false,
        tooltip: "Freight not maintained - proceed with caution",
        color: "amber",
        text: "Submit (No Freight)"
      };
    }
    
    return {
      disabled: false,
      tooltip: "All validations passed - ready to submit",
      color: "blue",
      text: isDraftMode ? "Submit Order" : "Submit Order"
    };
  };

  const submitButtonStatus = getSubmitButtonStatus();

  // Loading state
  if (Object.values(loading).some((status) => status) || loadDraftLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h5" className="text-blue-900 font-bold mb-4">
            {loadDraftLoading ? "Loading draft data..." : "Loading data..."}
          </Typography>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3">
      <Card className="max-w-7xl mx-auto shadow-lg border-0">
        <CardBody className="p-4">
          {/* Header - Compact */}
          <div className="mb-6">
            <Typography variant="h4" className="text-blue-900 font-bold text-xl">
              {isEditMode ? "Edit Production Order" :
              isDraftMode ? "Edit Draft Order" :
              "Sm@rtFAB Production Order"}
            </Typography>
            {isEditMode && originalOrder && (
              <Typography variant="small" className="text-gray-600 text-sm mt-1">
                Editing Order: {originalOrder.PRODUCTION_ORDER_ID} | Status: {originalOrder.PRODUCTION_ORDER_STATUS}
              </Typography>
            )}
            {isDraftMode && currentDraftId && (
              <Typography variant="small" className="text-gray-600 text-sm mt-1">
                Editing Draft: {currentDraftId}
              </Typography>
            )}
          </div>

          {/* Progress Stepper */}
          <Card className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <Stepper activeStep={freightChecked ? 2 : 1}>
              <Step className="h-4 w-4 bg-blue-500 text-white">
                <div className="absolute -bottom-6 w-max text-center">
                  <Typography variant="small" color="blue" className="font-normal">
                    Basic Info
                  </Typography>
                </div>
              </Step>
              <Step className="h-4 w-4 bg-blue-500 text-white">
                <div className="absolute -bottom-6 w-max text-center">
                  <Typography variant="small" color={freightChecked ? "blue" : "gray"} className="font-normal">
                    Freight Check
                  </Typography>
                </div>
              </Step>
              <Step className="h-4 w-4 bg-gray-300 text-white">
                <div className="absolute -bottom-6 w-max text-center">
                  <Typography variant="small" color="gray" className="font-normal">
                    Submit Order
                  </Typography>
                </div>
              </Step>
            </Stepper>
          </Card>

          {/* Tabs - Compact */}
          <Tabs value={activeTab} className="overflow-visible">
            <TabsHeader className="bg-transparent p-0 mb-6 border-b border-gray-200" indicatorProps={{ className: "bg-blue-500 shadow-none rounded-t" }}>
              <Tab value="create" onClick={() => setActiveTab("create")} className="py-3 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Create Order
                </div>
              </Tab>
              <Tab value="drafts" onClick={() => setActiveTab("drafts")} className="py-3 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  My Drafts ({drafts.length})
                </div>
              </Tab>
            </TabsHeader>

            <TabsBody className="overflow-visible">
              {/* Create/Edit Order Tab */}
              <TabPanel value="create" className="p-0 overflow-visible">
                {/* Mode Indicators - Compact */}
                {isDraftMode && (
                  <Alert color="amber" className="mb-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <Typography variant="small" className="font-semibold">
                        Draft Mode - Editing: {currentDraftId}
                      </Typography>
                    </div>
                  </Alert>
                )}

                {isEditMode && originalOrder && (
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 mb-4">
                    <div className="flex items-center gap-2">
                      <InformationCircleIcon className="h-4 w-4 text-orange-600" />
                      <Typography variant="small" className="font-semibold text-orange-800">
                        Editing Order: {originalOrder.PRODUCTION_ORDER_ID} | Status: {originalOrder.PRODUCTION_ORDER_STATUS}
                      </Typography>
                    </div>
                  </div>
                )}

                {/* Compact Form Layout */}
                <div className="space-y-4">
                  {/* Basic Information Group */}
                  <FieldGroup title="Basic Information" tooltip="Enter basic order details including customer and application information">
                    <FormRow>
                      <StableSelect 
                        label="SPC Name *"
                        options={spcOptions}
                        value={spcOptions.find((p) => p.value === form.spcName) || null}
                        onChange={(o) => setForm((p) => ({ ...p, spcName: o?.value || "" }))}
                        error={errors.spcName}
                        placeholder="Select SPC"
                        isDisabled={isEditMode && !hasEditPermission}
                      />
                      <StableInput
                        label="Customer Name *"
                        name="customerName"
                        value={form.customerName || ""}
                        onChange={handleChange}
                        error={errors.customerName}
                        placeholder="Enter customer name"
                        disabled={isEditMode && !hasEditPermission}
                      />
                      <StableInput
                        label="Application *"
                        name="application"
                        value={form.application || ""}
                        onChange={handleChange}
                        error={errors.application}
                        placeholder="Enter application"
                        disabled={isEditMode && !hasEditPermission}
                      />
                    </FormRow>
                  </FieldGroup>

                  {/* Product Details Group */}
                  <FieldGroup title="Product Details" tooltip="Specify product specifications including mesh type, quantity, and details">
                    <FormRow>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Mesh Type *</label>
                        <div className="flex gap-4 mt-2">
                          {["ribbed", "non-ribbed"].map((val) => (
                            <label key={val} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="meshType"
                                value={val}
                                checked={form.meshType === val}
                                onChange={handleChange}
                                className="text-blue-600 focus:ring-blue-500"
                                disabled={isEditMode && !hasEditPermission}
                              />
                              <span className="text-sm text-gray-700 capitalize">{val}</span>
                            </label>
                          ))}
                        </div>
                        {errors.meshType && <p className="mt-1 text-xs text-red-600">{errors.meshType}</p>}
                      </div>
                      <StableInput
                        label="Quantity *"
                        name="quantity"
                        type="number"
                        step="any"
                        value={form.quantity || ""}
                        onChange={handleChange}
                        error={errors.quantity}
                        placeholder="Enter quantity"
                        disabled={isEditMode && !hasEditPermission}
                      />
                      <StableSelect
                        label="Unit *"
                        options={[
                          { value: "MT", label: "MT" },
                          { value: "SqM", label: "SqM" },
                        ]}
                        value={form.unit ? { value: form.unit, label: form.unit } : null}
                        onChange={(o) => setForm((p) => ({ ...p, unit: o?.value || "" }))}
                        error={errors.unit}
                        placeholder="Select unit"
                        isDisabled={isEditMode && !hasEditPermission}
                      />
                    </FormRow>
                    <div className="mt-2">
                      <StableInput
                        label="Weldmesh Details *"
                        name="details"
                        value={form.details || ""}
                        onChange={handleChange}
                        error={errors.details}
                        placeholder="Enter weldmesh details"
                        disabled={isEditMode && !hasEditPermission}
                      />
                    </div>
                  </FieldGroup>

                  {/* Logistics Group */}
                  <FieldGroup title="Logistics & Delivery" tooltip="Configure delivery location, vehicle type, and delivery schedule">
                    <FormRow>
                      <StableSelect
                        label="City *"
                        options={cityOptionsMemo}
                        value={cityOptionsMemo.find((c) => c.value === form.city) || null}
                        onChange={(o) =>
                          setForm((prev) => ({
                            ...prev,
                            city: o?.value || "",
                            location: o?.cityName || "",
                            region: o?.region || "",
                          }))
                        }
                        error={errors.city}
                        placeholder="Select city"
                        isDisabled={isEditMode && !hasEditPermission}
                      />
                      <StableInput
                        label="Dispatch Location"
                        name="location"
                        value={form.location || ""}
                        error={errors.location}
                        placeholder="Auto-filled"
                        readOnly
                      />
                      <StableSelect
                        label="Vehicle Type *"
                        options={[
                          { value: "CATA", label: "Truck" },
                          { value: "CATB", label: "Trailer" },
                        ]}
                        value={
                          form.vehicleType
                            ? { value: form.vehicleType, label: form.vehicleType === "CATA" ? "Truck" : "Trailer" }
                            : null
                        }
                        onChange={(o) => setForm((p) => ({ ...p, vehicleType: o?.value || "" }))}
                        error={errors.vehicleType}
                        placeholder="Select vehicle type"
                        isDisabled={isEditMode && !hasEditPermission}
                      />
                    </FormRow>
                    <FormRow className="mt-2">
                      <StableInput
                        label="Delivery Date *"
                        name="deliveryDate"
                        type="date"
                        value={form.deliveryDate || ""}
                        onChange={handleChange}
                        error={errors.deliveryDate}
                        disabled={isEditMode && !hasEditPermission}
                      />
                      <StableSelect
                        label="Order Type *"
                        options={[
                          { value: "Pre Pay", label: "Pre Pay" },
                          { value: "To Pay", label: "To Pay" },
                        ]}
                        value={form.orderType ? { value: form.orderType, label: form.orderType } : null}
                        onChange={(option) => setForm((prev) => ({ ...prev, orderType: option ? option.value : "" }))}
                        error={errors.orderType}
                        placeholder="Select order type"
                        isDisabled={isEditMode && !hasEditPermission}
                      />
                      <div className="flex items-end">
                        <Tooltip content={canCheckFreight ? "Check freight availability for selected route" : "Select SPC, City, and Vehicle Type first"}>
                          <div className="w-full">
                            <Button
                              onClick={() => setShowFreightConfirm(true)}
                              color="green"
                              disabled={!canCheckFreight || freightLoading}
                              className="flex items-center gap-2 w-full text-sm py-2.5"
                            >
                              {freightLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Checking...
                                </>
                              ) : (
                                <>
                                  <TruckIcon className="h-4 w-4" />
                                  Check Freight
                                </>
                              )}
                            </Button>
                          </div>
                        </Tooltip>
                      </div>
                    </FormRow>
                  </FieldGroup>

                  {/* Freight Status Group */}
                  <FieldGroup title="Freight Information" tooltip="Freight status and charges for the selected route">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Freight Status</label>
                        <div className={`p-3 rounded-lg border ${form.freight === "Yes" 
                          ? "bg-green-50 border-green-300 text-green-800" 
                          : form.freight === "No"
                          ? "bg-red-50 border-red-300 text-red-800"
                          : "bg-gray-50 border-gray-300 text-gray-500"
                        } flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            {form.freight === "Yes" ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : form.freight === "No" ? (
                              <XMarkIcon className="h-5 w-5 text-red-500" />
                            ) : (
                              <TruckIcon className="h-5 w-5 text-gray-400" />
                            )}
                            <span className="font-medium text-sm">
                              {form.freight || "Not Checked"}
                            </span>
                          </div>
                          {form.freight && (
                            <Chip
                              value={form.freight === "Yes" ? "Available" : "Not Available"}
                              color={form.freight === "Yes" ? "green" : "red"}
                              size="sm"
                              className="text-xs"
                            />
                          )}
                        </div>
                        {errors.freight && <p className="mt-1 text-xs text-red-600">{errors.freight}</p>}
                      </div>
                      
                      {form.freightPoNumber && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">PO Number</label>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <DocumentTextIcon className="h-4 w-4 text-blue-500" />
                              <span className="font-mono text-blue-700 text-sm truncate">
                                {form.freightPoNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {form.freightStdRate && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Standard Rate</label>
                          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CurrencyRupeeIcon className="h-4 w-4 text-purple-500" />
                              <span className="font-semibold text-purple-700 text-sm">
                                ₹{form.freightStdRate}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </FieldGroup>

                  {/* Materials Group */}
                  <FieldGroup title="Materials" tooltip="Select finished goods and raw materials for production">
                    <FormRow>
                      <StableSelect
                        label="FG Material Description *"
                        options={fgOptions}
                        value={
                          form.fgMaterialDescription
                            ? { value: form.fgMaterialDescription, label: form.fgMaterialDescription }
                            : null
                        }
                        onChange={(o) => {
                          const selected = fgMaterials.find(
                            (f) =>
                              (f.MAKTX && f.MAKTX === o?.value) ||
                              (f.description && f.description === o?.value)
                          );
                          setForm((p) => ({
                            ...p,
                            fgMaterialDescription: o?.value || "",
                            fgMaterial: selected?.MATNR ? trimLeadingZeros(selected.MATNR) : "",
                          }));
                          if (errors.fgMaterial) {
                            setErrors((prev) => {
                              const n = { ...prev };
                              delete n.fgMaterial;
                              return n;
                            });
                          }
                        }}
                        error={errors.fgMaterial}
                        placeholder="Select FG material"
                        isDisabled={isEditMode && !hasEditPermission}
                      />
                      <StableInput
                        label="FG Material No"
                        name="fgMaterial"
                        value={form.fgMaterial || ""}
                        error={errors.fgMaterial}
                        placeholder="Auto-filled"
                        readOnly
                      />
                      <StableSelect
                         label="RM Type *"
                        options={[
                          { value: "MSWR (TSL)", label: "MSWR (TSL)" },
                          { value: "AC (TSL)", label: "AC (TSL)" },
                          { value: "TMT (TSL)", label: "TMT (TSL)" },
                          { value: "MSWR (Secondary)", label: "MSWR (Secondary)" },
                        ]}
                        value={form.rmType ? { value: form.rmType, label: form.rmType } : null}
                        onChange={(o) => setForm((p) => ({ ...p, rmType: o?.value || "" }))}
                        error={errors.rmType}
                        placeholder="Select RM type"
                        isDisabled={isEditMode && !hasEditPermission}
                      />
                    </FormRow>
                    <FormRow className="mt-2">
                      <StableSelect
                        label="RM Material Description *"
                        options={rmOptions}
                        value={
                          form.rmMaterialDescription
                            ? { value: form.rmMaterialDescription, label: form.rmMaterialDescription }
                            : null
                        }
                        onChange={(o) => {
                          const selected = rmMaterials.find(
                            (r) => (r.MAKTX && r.MAKTX === o?.value) || (r.description && r.description === o?.value)
                          );
                          setForm((p) => ({
                            ...p,
                            rmMaterialDescription: o?.value || "",
                            rmMaterial: selected?.MATNR ? trimLeadingZeros(selected.MATNR) : "",
                          }));
                          if (errors.rmMaterial) {
                            setErrors((prev) => {
                              const n = { ...prev };
                              delete n.rmMaterial;
                              return n;
                            });
                          }
                        }}
                        error={errors.rmMaterial}
                        placeholder="Select RM material"
                        isDisabled={isEditMode && !hasEditPermission}
                      />
                      <StableInput
                        label="RM Material No"
                        name="rmMaterial"
                        value={form.rmMaterial || ""}
                        error={errors.rmMaterial}
                        placeholder="Auto-filled"
                        readOnly
                      />
                    </FormRow>
                  </FieldGroup>

                  {/* Cost Calculation Section */}
                  <FieldGroup title="Cost Estimation" tooltip="Real-time production cost calculation based on material and logistics">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <CalculatorIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <Typography variant="h6" className="text-blue-900 font-semibold mb-1">
                              Smart Cost Calculator
                            </Typography>
                            <Typography variant="small" className="text-blue-700">
                              Get instant production cost estimates based on your material selections, plant, and delivery details. 
                              The system automatically includes freight charges when available.
                            </Typography>
                          </div>
                        </div>
                      </div>
                      
                      <CostCalculationCard />
                      {/* <CostResultsDisplay /> */}
                    </div>
                  </FieldGroup>

                  {/* Documents Group */}
                  <FieldGroup title="Documents" tooltip="Upload required drawings and purchase order copies">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["drawing", "poCopy"].map((name) => {
                        const fileLabel = name === "drawing" ? "Drawing" : "PO Copy";
                        const existingFile = form[name];
                        const isExistingDraftFile = isDraftMode && existingFile;
                        
                        return (
                          <div key={name} className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-700 text-sm">{fileLabel}</span>
                              <label className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors text-white ${
                                isEditMode ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"
                              }`}>
                                {existingFile ? "Replace" : "Upload"}
                                <input
                                  type="file"
                                  name={name}
                                  className="hidden"
                                  onChange={handleFileUpload}
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                  disabled={isEditMode && !hasEditPermission}
                                />
                              </label>
                            </div>
                            {existingFile && (
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border text-sm">
                                <PaperClipIcon className="h-4 w-4 text-blue-500" />
                                <span className="text-gray-700 truncate flex-1">
                                  {existingFile}
                                </span>
                                <div className="flex gap-1">
                                  <Tooltip content="View File">
                                    <IconButton
                                      size="sm"
                                      color="blue"
                                      variant="text"
                                      className="h-5 w-5"
                                      onClick={() => handleViewFile(
                                        existingFile, 
                                        isDraftMode ? currentDraftId : searchParams.get('orderId'), 
                                        isEditMode, 
                                        isDraftMode,
                                        existingFile
                                      )}
                                    >
                                      <EyeIcon className="h-3 w-3" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip content="Download File">
                                    <IconButton
                                      size="sm"
                                      color="green"
                                      variant="text"
                                      className="h-5 w-5"
                                      onClick={() => handleDownloadFile(
                                        existingFile, 
                                        isDraftMode ? currentDraftId : searchParams.get('orderId'), 
                                        isDraftMode,
                                        existingFile
                                      )}
                                    >
                                      <DocumentArrowDownIcon className="h-3 w-3" />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              </div>
                            )}
                            {errors[`${name}File`] && !isExistingDraftFile && (
                              <p className="text-xs text-red-600 mt-1">{errors[`${name}File`]}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              PDF, JPG, PNG | Max 5MB
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </FieldGroup>

                  {/* Remarks */}
                  <FieldGroup title="Additional Information" tooltip="Add any additional remarks or special instructions">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                      <Textarea
                        name="remarks"
                        value={form.remarks || ""}
                        onChange={handleChange}
                        disabled={isEditMode && !hasEditPermission}
                        placeholder="Enter any additional remarks or special instructions..."
                        rows={3}
                        className="text-sm"
                      />
                    </div>
                  </FieldGroup>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <InformationCircleIcon className="h-4 w-4" />
                      <span>
                        {!freightChecked && "Check freight status to enable submission"}
                        {freightChecked && form.freight === "No" && "Freight not maintained - review before submission"}
                        {freightChecked && form.freight === "Yes" && "All checks completed - ready to submit"}
                      </span>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowDraftSaveConfirm(true)}
                        color="gray"
                        variant="outlined"
                        disabled={saveDraftLoading || isSaveDraftDisabled}
                        className="flex items-center gap-2 text-sm py-2.5 px-4"
                      >
                        {saveDraftLoading ? "Saving..." :
                        currentDraftId ? "Update Draft" : "Save as Draft"}
                      </Button>
                      
                      <Tooltip content={submitButtonStatus.tooltip}>
                        <div>
                          <Button
                            onClick={() => setShowSubmitConfirm(true)}
                            color={submitButtonStatus.color}
                            disabled={submitButtonStatus.disabled || submitLoading}
                            className="flex items-center gap-2 text-sm py-2.5 px-4"
                          >
                            {submitLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon className="h-4 w-4" />
                                {submitButtonStatus.text}
                              </>
                            )}
                          </Button>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* My Drafts Tab */}
              <TabPanel value="drafts" className="p-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Typography variant="h5" className="text-blue-900 text-lg">
                      My Draft Orders ({filteredDrafts.length})
                    </Typography>
                  </div>

                  <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        label="Search drafts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<MagnifyingGlassIcon className="h-4 w-4" />}
                        className="text-sm"
                      />
                      <Select
                        options={[
                          { value: "all", label: "All Drafts" },
                          { value: "complete", label: "Complete (80%+)" },
                          { value: "incomplete", label: "Incomplete" },
                        ]}
                        value={{
                          value: filterStatus,
                          label: filterStatus === "all" ? "All Drafts" : 
                                filterStatus === "complete" ? "Complete (80%+)" : "Incomplete"
                        }}
                        onChange={(o) => setFilterStatus(o.value)}
                        styles={getReactSelectStyle(false)}
                        placeholder="Filter by status"
                      />
                    </div>
                  </Card>

                  {filteredDrafts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {filteredDrafts.map((draft) => (
                        <DraftCard
                          key={draft.DRAFT_ORDER_ID}
                          draft={draft}
                          onEdit={handleLoadDraft}
                          onDelete={(draft) => setDeleteDialog({ open: true, draft })}
                          onViewDetails={handleViewDetails}
                          onViewFile={handleViewFile}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <Typography variant="h6" className="text-gray-600 mb-2">
                        No drafts found
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        {searchTerm || filterStatus !== "all" 
                          ? "Try adjusting your search or filter criteria"
                          : "Start creating your first draft in the Create Order tab"
                        }
                      </Typography>
                    </Card>
                  )}
                </div>
              </TabPanel>
            </TabsBody>
          </Tabs>
        </CardBody>
      </Card>

      {/* Dialogs */}
      <Dialog open={deleteDialog.open} handler={() => setDeleteDialog({ open: false, draft: null })}>
        <DialogHeader>Delete Draft</DialogHeader>
        <DialogBody>
          <Typography variant="paragraph" className="text-gray-700">
            Are you sure you want to delete draft "{deleteDialog.draft?.DRAFT_ORDER_ID || 'Unnamed Draft'}"?
            This action cannot be undone.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setDeleteDialog({ open: false, draft: null })} className="mr-2">
            Cancel
          </Button>
          <Button color="blue" onClick={() => handleDeleteDraft(deleteDialog.draft?.DRAFT_ORDER_ID)}>
            Delete Draft
          </Button>
        </DialogFooter>
      </Dialog>

  
{/* Draft Details Dialog */}
<Dialog open={detailsModal.open} handler={() => setDetailsModal({ open: false, draft: null })} size="lg">
  <DialogHeader>Draft Order Details</DialogHeader>
  <DialogBody>
    {detailsModal.draft ? (
      <div className="space-y-4">
        {/* Basic Information */}
        <div>
          <Typography variant="h6" color="blue-gray" className="mb-2">Basic Information</Typography>
          <div className="grid grid-cols-2 gap-2">
            <Typography variant="small" className="font-semibold">Draft ID:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_ID}</Typography>
            
            <Typography variant="small" className="font-semibold">Customer Name:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_CUSTOMER_NAME}</Typography>
            
            <Typography variant="small" className="font-semibold">SPC Name:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_SPC_NAME}</Typography>
            
            <Typography variant="small" className="font-semibold">Application:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_APPLICATION || 'Not provided'}</Typography>
          </div>
        </div>

        {/* Product Details */}
        <div>
          <Typography variant="h6" color="blue-gray" className="mb-2">Product Details</Typography>
          <div className="grid grid-cols-2 gap-2">
            <Typography variant="small" className="font-semibold">Mesh Type:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_MESH_TYPE}</Typography>
            
            <Typography variant="small" className="font-semibold">Weldmesh Quantity:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_WELDMESH_QTY} {detailsModal.draft.DRAFT_ORDER_UNIT}</Typography>
            
            <Typography variant="small" className="font-semibold">Weldmesh Details:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_WELDMESH_DETAILS}</Typography>
          </div>
        </div>

        {/* Logistics Information */}
        <div>
          <Typography variant="h6" color="blue-gray" className="mb-2">Logistics Information</Typography>
          <div className="grid grid-cols-2 gap-2">
            <Typography variant="small" className="font-semibold">Dispatch Location:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_DISPATCH_LOCATION}</Typography>
            
            <Typography variant="small" className="font-semibold">City Code:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_CITY_CODE}</Typography>
            
            <Typography variant="small" className="font-semibold">Vehicle Type:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_VEHICLE_TYPE}</Typography>
            
            <Typography variant="small" className="font-semibold">Order Type:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_ORDER_TYPE}</Typography>
            
            <Typography variant="small" className="font-semibold">Delivery Date:</Typography>
            <Typography variant="small">
              {detailsModal.draft.DRAFT_ORDER_DELIVERY_DATE ? 
                new Date(detailsModal.draft.DRAFT_ORDER_DELIVERY_DATE).toLocaleDateString() : 
                'Not specified'}
            </Typography>
          </div>
        </div>

        {/* Material Information */}
        <div>
          <Typography variant="h6" color="blue-gray" className="mb-2">Material Information</Typography>
          <div className="grid grid-cols-2 gap-2">
            <Typography variant="small" className="font-semibold">RM Material No:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_RM_MATERIAL_NO}</Typography>
            
            <Typography variant="small" className="font-semibold">RM Type:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_RM_TYPE}</Typography>
            
            <Typography variant="small" className="font-semibold">RM Material Description:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_RM_MATERIAL_DESCRIPTION}</Typography>
            
            <Typography variant="small" className="font-semibold">FG Material Number:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_FG_MATERIAL_NUMBER}</Typography>
            
            <Typography variant="small" className="font-semibold">FG Material Description:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_FG_MATERIAL_DESCRIPTION}</Typography>
          </div>
        </div>

        {/* Freight Information */}
        <div>
          <Typography variant="h6" color="blue-gray" className="mb-2">Freight Information</Typography>
          <div className="grid grid-cols-2 gap-2">
            <Typography variant="small" className="font-semibold">Freight Maintained:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_FREIGHT_MAINTAINED || 'Not checked'}</Typography>
            
            <Typography variant="small" className="font-semibold">Freight PO Number:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_FREIGHT_PO_NUMBER || 'Not provided'}</Typography>
            
            <Typography variant="small" className="font-semibold">Freight Standard Rate:</Typography>
            <Typography variant="small">{detailsModal.draft.DRAFT_ORDER_FREIGHT_STD_RATE || 'Not provided'}</Typography>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <Typography variant="h6" color="blue-gray" className="mb-2">Additional Information</Typography>
          <div className="grid grid-cols-1 gap-2">
            <Typography variant="small" className="font-semibold">Remarks:</Typography>
            <Typography variant="small" className="bg-gray-50 p-2 rounded">
              {detailsModal.draft.DRAFT_ORDER_REMARKS || 'No remarks provided'}
            </Typography>
            
            <Typography variant="small" className="font-semibold">Completion Status:</Typography>
            <Typography variant="small">
              <Chip 
                value={`${detailsModal.draft.completionPercentage}% Complete`} 
                color={
                  detailsModal.draft.completionPercentage >= 80 ? "green" : 
                  detailsModal.draft.completionPercentage >= 50 ? "amber" : "red"
                } 
                size="sm" 
              />
            </Typography>
            
            <Typography variant="small" className="font-semibold">Last Activity:</Typography>
            <Typography variant="small">
              {new Date(detailsModal.draft.DRAFT_ORDER_LAST_ACTIVITY).toLocaleString()}
            </Typography>
          </div>
        </div>

        {/* File Attachments */}
        <div>
          <Typography variant="h6" color="blue-gray" className="mb-2">File Attachments</Typography>
          <div className="space-y-2">
            {detailsModal.draft.DRAFT_ORDER_DRAWING_ATTACHMENT_PATH && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <PaperClipIcon className="h-4 w-4 text-blue-500" />
                <Typography variant="small" className="flex-1">Drawing: {detailsModal.draft.DRAFT_ORDER_DRAWING_ATTACHMENT_PATH}</Typography>
                <Button size="sm" color="blue" variant="text" onClick={() => 
                  handleViewFile(
                    detailsModal.draft.DRAFT_ORDER_DRAWING_ATTACHMENT_PATH,
                    detailsModal.draft.DRAFT_ORDER_ID,
                    true,
                    true,
                    detailsModal.draft.DRAFT_ORDER_DRAWING_ATTACHMENT_PATH
                  )
                }>
                  View
                </Button>
              </div>
            )}
            {detailsModal.draft.DRAFT_ORDER_PO_ATTACHMENT_PATH && (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <PaperClipIcon className="h-4 w-4 text-green-500" />
                <Typography variant="small" className="flex-1">PO Copy: {detailsModal.draft.DRAFT_ORDER_PO_ATTACHMENT_PATH}</Typography>
                <Button size="sm" color="green" variant="text" onClick={() => 
                  handleViewFile(
                    detailsModal.draft.DRAFT_ORDER_PO_ATTACHMENT_PATH,
                    detailsModal.draft.DRAFT_ORDER_ID,
                    true,
                    true,
                    detailsModal.draft.DRAFT_ORDER_PO_ATTACHMENT_PATH
                  )
                }>
                  View
                </Button>
              </div>
            )}
            {!detailsModal.draft.DRAFT_ORDER_DRAWING_ATTACHMENT_PATH && 
             !detailsModal.draft.DRAFT_ORDER_PO_ATTACHMENT_PATH && (
              <Typography variant="small" className="text-gray-500">No attachments available</Typography>
            )}
          </div>
        </div>
      </div>
    ) : (
      <Typography>No draft data available</Typography>
    )}
  </DialogBody>
  <DialogFooter>
    <Button color="blue" onClick={() => setDetailsModal({ open: false, draft: null })}>
      Close
    </Button>
  </DialogFooter>
</Dialog>

      <ConfirmationDialog
        open={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={isDraftMode ? handleConvertToOrder : handleSubmit}
        title={isDraftMode ? "Convert Draft to Order" : isEditMode ? "Update Order" : "Submit Order"}
        message={
          isDraftMode
            ? "Are you sure you want to convert this draft to a production order? This action cannot be undone."
            : isEditMode
            ? "Are you sure you want to update this production order? Changes will be saved immediately."
            : `Are you sure you want to submit this production order? ${form.freight === "No" ? "NOTE: Freight is not maintained for this route." : ""}`
        }
        confirmText={submitLoading ? "Processing..." : "Confirm"}
        cancelText="Cancel"
      />

      <ConfirmationDialog
        open={showDraftSaveConfirm}
        onClose={() => setShowDraftSaveConfirm(false)}
        onConfirm={handleSaveAsDraft}
        title={currentDraftId ? "Update Draft" : "Save as Draft"}
        message={
          currentDraftId
            ? "Are you sure you want to update this draft? Previous draft data will be overwritten."
            : "Are you sure you want to save this as a draft? You can continue editing later."
        }
        confirmText={saveDraftLoading ? "Saving..." : "Confirm"}
        cancelText="Cancel"
      />

      <ConfirmationDialog
        open={showFreightConfirm}
        onClose={() => setShowFreightConfirm(false)}
        onConfirm={handleFreightCheck}
        title="Check Freight Status"
        message="Are you sure you want to check freight status? This will verify freight availability for the selected SPC, City, and Vehicle Type."
        confirmText={freightLoading ? "Checking..." : "Check Freight"}
        cancelText="Cancel"
      />

      {/* Cost Dialog */}
      <CostDialog />

      <CustomDialog
        open={customDialog.open}
        onClose={() => setCustomDialog(prev => ({ ...prev, open: false }))}
        title={customDialog.title}
        message={customDialog.message}
        type={customDialog.type}
        autoHide={customDialog.autoHide}
      />
    </div>
  );
}