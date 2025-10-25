import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE = import.meta.env.VITE_API_BASE;
import {
  Card,
  CardBody,
  Input,
  Select,
  Option,
  Button,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Chip,
  IconButton,
  Textarea,
  Tooltip,
  Switch,
  Spinner,
  Radio,
  Tabs,
  TabsHeader,
  Tab,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Alert
} from "@material-tailwind/react";
import {
  ClipboardDocumentListIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

const statusColor = {
  "Pending with SPC Manager": "bg-[#5B8DEF]",
  "Rejected by SPC Manager": "bg-[#D64545]",
  "Approved by SPC Manager": "bg-[#2D9D78]",
  "Pending with SPC Production": "bg-[#4A77D4]",
  "Rejected by SPC Production": "bg-[#D64545]",
  "Approved by SPC Production": "bg-[#2D9D78]",
  "Approved": "bg-[#1E6F5C]",
  "Rejected": "bg-[#B22222]",
  "Deleted": "bg-[#6C757D]",
  "Pending": "bg-[#F4A300]",
  "Returned to Sales": "bg-[#E67E22]",
  "Returned to SPC Manager": "bg-[#E67E22]"
};

const statusOptions = [
  "All", "Pending with SPC Manager", "Rejected by SPC Manager", "Approved by SPC Manager",
  "Pending with SPC Production", "Rejected by SPC Production", "Approved by SPC Production",
  "Approved", "Rejected", "Deleted", "Pending", "Returned to Sales", "Returned to SPC Manager"
];

// File handling utilities
const getCleanFileName = (filePath) => {
  if (!filePath) return '';
  return filePath.split(/[\\/]/).pop();
};

const handleViewFile = async (filePath, id, fileName) => {
  try {
    const cleanFileName = getCleanFileName(filePath);
    
    if (!cleanFileName) {
      alert("Invalid file path");
      return;
    }

    // const API_BASE = "http://localhost:5000/api";
    const token = sessionStorage.getItem("authToken");
    
    const url = `${API_BASE}/files/view/order/${id}/${cleanFileName}`;
    window.open(url, "_blank");
    
  } catch (error) {
    console.error("❌ Error viewing file:", error);
    alert("Failed to open file. Please check if it exists.");
  }
};

const handleDownloadFile = async (filePath, id, originalFileName) => {
  try {
    const cleanFileName = getCleanFileName(filePath);
    const downloadFileName = originalFileName || cleanFileName;
    
    if (!cleanFileName) {
      alert("Invalid file path");
      return;
    }

    // const API_BASE = "http://localhost:5000/api";
    const token = sessionStorage.getItem("authToken");
    
    const url = `${API_BASE}/files/download/order/${id}/${cleanFileName}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    
  } catch (error) {
    console.error("❌ Error downloading file:", error);
    alert("Failed to download file. Please check if it exists.");
  }
};

// Enhanced Excel Export Component with attachments
const ExcelExport = ({ data, filename, buttonText = "Export to Excel", variant = "gradient", includeAttachments = false, onExportComplete }) => {
  const downloadFileToBlob = async (filePath, orderId) => {
    try {
      const fileNameFromPath = getCleanFileName(filePath);
      
      const token = localStorage.getItem('authToken');
      // const API_BASE = "http://localhost:5000/api";
      
      const response = await fetch(`${API_BASE}/files/download/order/${orderId}/${fileNameFromPath}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  };

  const exportToExcel = async () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      
      if (includeAttachments && data.length === 1) {
        const order = data[0];
        const zip = new JSZip();
        
        const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        zip.file(`${filename}.xlsx`, excelBuffer);
        
        const attachmentPromises = [];
        
        if (order.drawingAttachmentPath) {
          attachmentPromises.push(
            downloadFileToBlob(order.drawingAttachmentPath, order.orderId)
              .then(blob => {
                if (blob) zip.file(`Drawing_${order.orderId}.pdf`, blob);
              })
          );
        }
        
        if (order.poAttachmentPath) {
          attachmentPromises.push(
            downloadFileToBlob(order.poAttachmentPath, order.orderId)
              .then(blob => {
                if (blob) zip.file(`PO_${order.orderId}.pdf`, blob);
              })
          );
        }
        
        await Promise.all(attachmentPromises);
        
        zip.generateAsync({ type: 'blob' }).then(content => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = `${filename}_with_attachments.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      }
      
      if (onExportComplete) onExportComplete();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <Button variant={variant} color="green" onClick={exportToExcel} className="flex items-center gap-2">
      <DocumentArrowDownIcon className="h-4 w-4" />
      {buttonText}
    </Button>
  );
};

// Custom date formatting function
const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  const datePart = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
  
  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
  
  return (
    <div className="flex flex-col">
      <span>{datePart}</span>
      <span className="text-xs text-gray-500">{timePart}</span>
    </div>
  );
};

// Custom badge component for status
const StatusBadge = ({ status }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusColor[status] || "bg-gray-600"}`}>
      {status}
    </span>
  );
};

// Enhanced Action Confirmation Dialog Component
const ActionConfirmationDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  confirmColor = "blue",
  isLoading = false,
  children 
}) => {
  return (
    <Dialog open={open} handler={onClose} size="sm">
      <DialogHeader className="flex items-center gap-2 py-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
        {title}
      </DialogHeader>
      <DialogBody className="py-4">
        <Typography variant="paragraph" className="mb-4">
          {message}
        </Typography>
        {children}
      </DialogBody>
      <DialogFooter className="py-3">
        <Button 
          variant="text" 
          color="blue-gray" 
          onClick={onClose} 
          className="mr-2"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          color={confirmColor} 
          onClick={onConfirm}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <CheckCircleIcon className="h-4 w-4" />
          )}
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

// Enhanced Remarks Dialog Component
const RemarksDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmColor = "blue",
  isLoading = false,
  remarks,
  setRemarks,
  isRemarksMandatory = true,
  children // YEH ADD KARNA HAI
}) => {
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (isRemarksMandatory && !remarks.trim()) {
      setError("Remarks are mandatory for this action");
      return;
    }
    setError("");
    onConfirm();
  };

  return (
    <Dialog open={open} handler={onClose} size="md">
      <DialogHeader className="flex items-center gap-2 py-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
        {title}
      </DialogHeader>
      <DialogBody className="py-4">
        <Typography variant="paragraph" className="mb-4">
          {message}
        </Typography>
        
        {/* CHILDREN RENDER KARNA HAI YAHAN */}
        {children}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold">
              Remarks {isRemarksMandatory && <span className="text-red-500">*</span>}
            </Typography>
            {isRemarksMandatory && (
              <Typography variant="small" className="text-gray-500">
                {remarks.length}/500
              </Typography>
            )}
          </div>
          
          <Textarea
            label="Enter your remarks..."
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              if (error) setError("");
            }}
            error={!!error}
            rows={4}
            maxLength={500}
            className="min-h-[100px]"
          />
          
          {error && (
            <Alert color="red" className="py-2 text-sm">
              {error}
            </Alert>
          )}
        </div>
      </DialogBody>
      <DialogFooter className="py-3">
        <Button 
          variant="text" 
          color="blue-gray" 
          onClick={onClose} 
          className="mr-2"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          color={confirmColor} 
          onClick={handleConfirm}
          disabled={isLoading || (isRemarksMandatory && !remarks.trim())}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <CheckCircleIcon className="h-4 w-4" />
          )}
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export function ApprovalDashboard({ currentUser, permissions }) {
  const navigate = useNavigate();
  const user = currentUser || { userID: "SYSTEM", username: "SYSTEM", role: "admin" };
  const userPermissions = permissions || { canView: true, canCreate: true, canEdit: true, canDelete: false };
  
  // State variables
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [openRemarkDialog, setOpenRemarkDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSPC, setSelectedSPC] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [returnTarget, setReturnTarget] = useState("sales");
  const [activeTab, setActiveTab] = useState("all");

  // Filter states
  const [selectedCustomer, setSelectedCustomer] = useState("All");
  const [selectedOrderType, setSelectedOrderType] = useState("All");
  const [selectedVehicleType, setSelectedVehicleType] = useState("All");
  const [selectedMeshType, setSelectedMeshType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("All");

  // const API_BASE = "http://localhost:5000/api";

  // Fetch username from API
  const fetchUserName = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "User not found");
      return data.data.USER_USERNAME;
    } catch (err) {
      console.error("Error fetching username:", err);
      return userId;
    }
  };

  // Simplified file download function
  const downloadFile = async (filePath, filename, orderId) => {
    try {
      const fileNameFromPath = getCleanFileName(filePath);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/files/download/order/${orderId}/${fileNameFromPath}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file: ' + error.message);
    }
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/orders/all?page=1&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error("Non-JSON response received:", textResponse.substring(0, 200));
        throw new Error("Server returned non-JJSON response");
      }
      
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch orders");
      
      // Transform orders with user names
      const transformedOrders = await Promise.all(
        data.data.data.map(async (order) => {
          const userName = await fetchUserName(order.PRODUCTION_ORDER_REQUESTOR_ID);
          const createdByName = await fetchUserName(order.PRODUCTION_ORDER_CREATED_BY);
          const modifiedByName = await fetchUserName(order.PRODUCTION_ORDER_MODIFIED_BY);
          
          return {
            orderId: order.PRODUCTION_ORDER_ID,
            requestorId: order.PRODUCTION_ORDER_REQUESTOR_ID,
            userName,
            customerName: order.PRODUCTION_ORDER_CUSTOMER_NAME,
            spcName: order.PRODUCTION_ORDER_SPC_NAME,
            application: order.PRODUCTION_ORDER_APPLICATION,
            cityCode: order.PRODUCTION_ORDER_CITY_CODE,
            vehicleType: order.PRODUCTION_ORDER_VEHICLE_TYPE,
            meshType: order.PRODUCTION_ORDER_MESH_TYPE,
            weldmeshQty: order.PRODUCTION_ORDER_WELDMESH_QTY,
            unit: order.PRODUCTION_ORDER_UNIT,
            weldmeshDetails: order.PRODUCTION_ORDER_WELDMESH_DETAILS,
            dispatchLocation: order.PRODUCTION_ORDER_DISPATCH_LOCATION,
            orderType: order.PRODUCTION_ORDER_ORDER_TYPE,
            rmMaterialNo: order.PRODUCTION_ORDER_RM_MATERIAL_NO,
            rmType: order.PRODUCTION_ORDER_RM_TYPE,
            rmMaterialDescription: order.PRODUCTION_ORDER_RM_MATERIAL_DESCRIPTION,
            fgMaterialDescription: order.PRODUCTION_ORDER_FG_MATERIAL_DESCRIPTION,
            fgMaterialNumber: order.PRODUCTION_ORDER_FG_MATERIAL_NUMBER,
            freightMaintained: order.PRODUCTION_ORDER_FREIGHT_MAINTAINED === "Yes" ? 1 : 0,
            freightPONumber: order.PRODUCTION_ORDER_FREIGHT_PO_NUMBER || null,
            freightStdRate: order.PRODUCTION_ORDER_FREIGHT_STD_RATE || null,
            remarks: order.PRODUCTION_ORDER_REMARKS,
            deliveryDate: order.PRODUCTION_ORDER_DELIVERY_DATE,
            drawingAttachmentPath: order.PRODUCTION_ORDER_DRAWING_ATTACHMENT_PATH,
            poAttachmentPath: order.PRODUCTION_ORDER_PO_ATTACHMENT_PATH,
            status: order.PRODUCTION_ORDER_STATUS,
            currentApprovalLevel: order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL,
            finalStatus: order.PRODUCTION_ORDER_FINAL_STATUS,
            isActive: order.PRODUCTION_ORDER_IS_ACTIVE,
            createdBy: order.PRODUCTION_ORDER_CREATED_BY,
            createdByName: createdByName || order.PRODUCTION_ORDER_CREATED_BY,
            createdDate: order.PRODUCTION_ORDER_CREATED_ON,
            modifiedBy: order.PRODUCTION_ORDER_MODIFIED_BY,
            modifiedByName: modifiedByName || order.PRODUCTION_ORDER_MODIFIED_BY,
            modifiedOn: order.PRODUCTION_ORDER_MODIFIED_ON,
            submittedAt: order.PRODUCTION_ORDER_CREATED_ON?.split("T")[0],
            approver: order.approverName || ""
          };
        })
      );
      
      setOrders(transformedOrders);
      setFilteredOrders(transformedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Error fetching orders: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order history
  const fetchOrderHistory = async (orderId) => {
    try {
      setHistoryLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE}/workflows/status/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const workflowData = data.status.workflow || [];
      
      // Sort by date (newest first)
      const sortedData = workflowData.sort(
        (a, b) => new Date(b.actionDate) - new Date(a.actionDate)
      );
      
      // Transform history data
      const transformedHistory = await Promise.all(
        sortedData.map(async (item) => {
          let actorName = "";
          let roleName = "";
          
          // Fetch username if available
          if (item.userId) {
            actorName = await fetchUserName(item.userId);
          }
          
          // Fetch role name
          try {
            const roleRes = await fetch(`${API_BASE}/users/roles/${item.roleId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (roleRes.ok) {
              const roleData = await roleRes.json();
              roleName = roleData.data?.ROLE_ROLE_NAME || `Role ID: ${item.roleId}`;
            } else {
              roleName = `Role ID: ${item.roleId}`;
            }
          } catch (err) {
            console.error("Error fetching role:", err);
            roleName = `Role ID: ${item.roleId}`;
          }
          
          return {
            action: `${item.status} (Level ${item.level})`,
            userName: actorName || roleName,
            roleName: roleName,
            remarks: item.remarks || "No remarks",
            timestamp: item.actionDate || new Date().toISOString(),
            createdBy: item.createdBy || "System",
            modifiedBy: item.modifiedBy || "Not modified",
          };
        })
      );
      
      setOrderHistory(transformedHistory);
      setOpenHistoryDialog(true);
    } catch (err) {
      console.error("Error fetching order history:", err);
      setError("Error fetching order history: " + err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle approval workflow action
  const handleWorkflowAction = async (orderId, action, remarks = "", targetLevel = null, adminOverride = false) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Admin override for role ID 1
      if (user.roleId == 1) {
        adminOverride = true;
      }
      
      const payload = {
        orderId,
        roleId: user.roleId,
        action,
        remarks,
        userId: user.userID
      };
      
      // Add targetLevel for return actions
      if (action === "RETURN" && targetLevel !== null) {
        payload.targetLevel = targetLevel;
      }
      
      // Add admin override if applicable
      if (adminOverride) payload.adminOverride = true;
      
      const response = await fetch(`${API_BASE}/workflows/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.order) {
        await fetchOrders();
        return true;
      } else {
        throw new Error(data.message || "Failed to update workflow");
      }
    } catch (err) {
      console.error("Error updating workflow:", err);
      setError("Error updating workflow: " + err.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/workflows/delete/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': user.userID
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.message) {
        await fetchOrders();
        return true;
      } else {
        throw new Error(data.message || "Failed to delete order");
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      setError("Error deleting order: " + err.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Initialize with API data
  useEffect(() => { fetchOrders(); }, []);

  // Apply filters whenever dependencies change
  useEffect(() => { applyFilters(); }, [
    orders, searchTerm, selectedSPC, selectedStatus, selectedCustomer, selectedOrderType,
    selectedVehicleType, selectedMeshType, startDate, endDate, user.userID, user.role,
    showAllUsers, selectedUserId, activeTab
  ]);

  // Main filter function
  const applyFilters = () => {
    let result = [...orders];
    
    // Tab-based filtering
    if (activeTab !== "all") {
      if (activeTab === "pending") {
        result = result.filter(order => order.status.includes("Pending"));
      } else if (activeTab === "approved") {
        result = result.filter(order => order.status.includes("Approved"));
      } else if (activeTab === "rejected") {
        result = result.filter(order => order.status.includes("Rejected"));
      } else if(activeTab === "deleted") {
        result = result.filter(order => order.status.includes("Deleted"));
      }
    }
    
    // Role-based filtering
    if (!showAllUsers) {
      if (user.role === "spc_production") {
        result = result.filter(order =>
          order.status.includes("SPC Production") || order.status.includes("Pending with SPC Production")
        );
      } else if (user.role === "spc_manager") {
        result = result.filter(order =>
          order.status.includes("SPC Manager") || order.status.includes("Pending with SPC Manager")
        );
      } else if (!userPermissions.canViewAll) {
        result = result.filter(order => order.requestorId === user.userID);
      }
    }
    
    // User filter
    if (selectedUserId !== "All") {
      result = result.filter(order => order.requestorId === selectedUserId);
    }
    
    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order =>
        (order.orderId || "").toLowerCase().includes(term) ||
        (order.userName || "").toLowerCase().includes(term) ||
        (order.customerName || "").toLowerCase().includes(term) ||
        (order.spcName || "").toLowerCase().includes(term) ||
        (order.dispatchLocation || "").toLowerCase().includes(term)
      );
    }
    
    // Dropdown filters
    if (selectedSPC !== "All") result = result.filter(order => order.spcName === selectedSPC);
    if (selectedStatus !== "All") result = result.filter(order => order.status === selectedStatus);
    if (selectedCustomer !== "All") result = result.filter(order => order.customerName === selectedCustomer);
    if (selectedOrderType !== "All") result = result.filter(order => order.orderType === selectedOrderType);
    if (selectedVehicleType !== "All") result = result.filter(order => order.vehicleType === selectedVehicleType);
    if (selectedMeshType !== "All") result = result.filter(order => order.meshType === selectedMeshType);
    
    // Date filters
    if (startDate) result = result.filter(order => new Date(order.createdDate) >= new Date(startDate));
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter(order => new Date(order.createdDate) <= endOfDay);
    }
    
    setFilteredOrders(result);
  };

  // Get dropdown options for filters
  const getDropdownOptions = (property, includeAll = true) => {
    const values = [...new Set(orders.map(order => order[property]).filter(Boolean))];
    return includeAll ? ["All", ...values] : values;
  };

  // Get unique users with ID and name
  const getUserOptions = () => {
    const userMap = new Map();
    orders.forEach(order => {
      if (order.requestorId && order.userName) userMap.set(order.requestorId, order.userName);
    });
    
    const options = [];
    userMap.forEach((name, id) => options.push({ id, name }));
    return options;
  };

  // Confirm return action
  const confirmReturn = async () => {
    if (!selectedOrder) return;
    
    // Determine target level based on selection
    let targetLevel = 0; // Default to sales
    if (returnTarget === "manager" && selectedOrder.currentApprovalLevel > 1) {
      targetLevel = 1; // Return to manager
    }
    
    const success = await handleWorkflowAction(selectedOrder.orderId, "RETURN", remarks, targetLevel);
    if (success) {
      setOpenReturnDialog(false);
      setRemarks("");
      setReturnTarget("sales");
    }
  };

  // Confirm approve action
  const confirmApprove = async () => {
    if (!selectedOrder) return;
    const success = await handleWorkflowAction(selectedOrder.orderId, "APPROVE", remarks);
    if (success) { 
      setOpenApproveDialog(false); 
      setRemarks(""); 
    }
  };

  // Confirm reject action
  const confirmReject = async () => {
    if (!selectedOrder) return;
    const success = await handleWorkflowAction(selectedOrder.orderId, "REJECT", remarks);
    if (success) { 
      setOpenRejectDialog(false); 
      setRemarks(""); 
    }
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!selectedOrder) return;
    const success = await deleteOrder(selectedOrder.orderId);
    if (success) setOpenDeleteDialog(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm(""); 
    setSelectedSPC("All"); 
    setSelectedStatus("All");
    setSelectedCustomer("All"); 
    setSelectedOrderType("All"); 
    setSelectedVehicleType("All");
    setSelectedMeshType("All"); 
    setStartDate(""); 
    setEndDate(""); 
    setSelectedUserId("All");
    setIsFilterOpen(false);
    setActiveTab("all");
  };

  // Track order by ID
  const trackOrder = () => {
    if (!searchTerm) return;
    const foundOrder = orders.find((order) => order.orderId.toLowerCase() === searchTerm.toLowerCase());
    setTrackingResult(foundOrder || null);
  };

  // Handle action button clicks with enhanced confirmation flow
  const handleAction = async (orderId, action) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;
    
    setSelectedOrder(order);
    setRemarks("");

    if (action === "Return") {
      setOpenReturnDialog(true);
    } else if (action === "Approve") {
      setOpenApproveDialog(true);
    } else if (action === "Reject") {
      setOpenRejectDialog(true);
    } else if (action === "Delete") {
      setOpenDeleteDialog(true);
    } else if (action === "History") {
      fetchOrderHistory(orderId);
    } else if (action === "Edit") {
      navigate(`/dashboard/productionorderform?orderId=${orderId}`);
    }
  };

  // Clear remarks when dialogs are closed
  const handleDialogClose = (setDialog) => {
    setRemarks("");
    setDialog(false);
  };

  // Permission checks based on role
  const canApprove = (order, user) => {
    if (user.role === "admin") return order.status.includes("Pending");
    if (!order.status.includes("Pending")) return false;
    if (user.role === "spc_manager") return order.status === "Pending with SPC Manager";
    if (user.role === "spc_production") return order.status === "Pending with SPC Production";
    return false;
  };

  const canReturn = (order, user) => {
    // Admin can always return
    if (user.role === "admin") return order.status.includes("Pending");
    
    // Check if order is in pending status
    if (!order.status.includes("Pending")) return false;
    
    // Sales can only return orders that are returned to them
    if (user.role === "sales") {
      return order.status === "Returned to Sales" || 
            order.status.includes("Pending with Sales");
    }
    
    // SPC Manager can return orders pending at their level
    if (user.role === "spc_manager") {
      return order.status === "Pending with SPC Manager";
    }
    
    // SPC Production can return orders pending at their level
    if (user.role === "spc_production") {
      return order.status === "Pending with SPC Production";
    }
    
    return false;
  };

  // Update the canEdit function with proper return logic
  const canEdit = (order, user) => {
    // Sales can edit orders returned to them
    if (user.role === "sales" && order.status === "Returned to Sales") {
      return true;
    }
    if (user.role === "admin" && order.status === "Returned to Sales" || order.status === "Returned to SPC Manager") {
      return true;
    }
    
    // SPC Manager can edit orders returned to them
    if (user.role === "spc_manager" && order.status === "Returned to SPC Manager") {
      return true;
    }
    
    return false;
  };

  const canDelete = (order) => userPermissions.canDelete;

  // Attachments section render function
  const renderAttachmentsSection = () => (
    <div>
      <Typography variant="h6" color="blue-gray" className="font-bold mb-2 pb-1 border-b">
        Attachments
      </Typography>
      <div className="space-y-2">
        {selectedOrder.drawingAttachmentPath && (
          <div className="flex gap-2">
            <Button 
              variant="outlined" 
              color="blue" 
              className="flex items-center gap-2 flex-1 text-sm py-2"
              onClick={() => handleViewFile(
                selectedOrder.drawingAttachmentPath,
                selectedOrder.orderId,
                getCleanFileName(selectedOrder.drawingAttachmentPath)
              )}
            >
              <EyeIcon className="h-4 w-4" /> 
              View Drawing
            </Button>
            <Button 
              variant="outlined" 
              color="green" 
              className="flex items-center gap-2 text-sm py-2"
              onClick={() => handleDownloadFile(
                selectedOrder.drawingAttachmentPath,
                selectedOrder.orderId,
                getCleanFileName(selectedOrder.drawingAttachmentPath)
              )}
            >
              <DocumentArrowDownIcon className="h-4 w-4" /> 
            </Button>
          </div>
        )}

        {selectedOrder.poAttachmentPath && (
          <div className="flex gap-2">
            <Button 
              variant="outlined" 
              color="blue" 
              className="flex items-center gap-2 flex-1 text-sm py-2"
              onClick={() => handleViewFile(
                selectedOrder.poAttachmentPath,
                selectedOrder.orderId,
                getCleanFileName(selectedOrder.poAttachmentPath)
              )}
            >
              <EyeIcon className="h-4 w-4" /> 
              View PO Copy
            </Button>
            <Button 
              variant="outlined" 
              color="green" 
              className="flex items-center gap-2 text-sm py-2"
              onClick={() => handleDownloadFile(
                selectedOrder.poAttachmentPath,
                selectedOrder.orderId,
                getCleanFileName(selectedOrder.poAttachmentPath)
              )}
            >
              <DocumentArrowDownIcon className="h-4 w-4" /> 
            </Button>
          </div>
        )}
        
        {!selectedOrder.drawingAttachmentPath && !selectedOrder.poAttachmentPath && (
          <Typography className="text-gray-500 text-sm">No attachments available</Typography>
        )}
      </div>
    </div>
  );

  // Render the component
  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4">
      <Card className="shadow-lg rounded-lg border border-gray-200 max-w-7xl mx-auto bg-white">
        <CardBody className="p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <Typography variant="h4" color="blue-gray" className="font-bold mb-1">
                Approval Dashboard
              </Typography>
              <Typography
                  as="div"
                  color="gray"
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span className="font-medium">Logged in as:</span>
                  <Chip
                    value={user.role}
                    className="rounded-full px-3 py-0.5 text-xs font-semibold bg-blue-600 text-white shadow-sm"
                  />
                  {/* Username with tooltip on right side */}
                  <div className="relative group">
                    <span className="font-medium text-gray-800 cursor-pointer hover:underline">
                      {user.username}
                    </span>
                    {/* Tooltip - right side */}
                    <div className="absolute top-1/2 left-full ml-2 -translate-y-1/2 
                                    hidden group-hover:flex items-center
                                    bg-gray-900 text-white text-xs rounded-md px-3 py-1
                                    shadow-lg z-50 whitespace-nowrap">
                      ID: {user.userID}
                      {/* Arrow pointing left */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 
                                      w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                </Typography>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Input 
                  label="Track Order ID" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<MagnifyingGlassIcon className="h-4 w-4" />} 
                  color="blue" 
                  className="min-w-[200px]"
                />
                <IconButton size="sm" color="blue" className="!absolute right-1 top-1 rounded" onClick={trackOrder}>
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </IconButton>
              </div>
              <Button variant="outlined" color="blue" className="flex items-center gap-1" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                <FunnelIcon className="h-4 w-4" /> 
                {isFilterOpen ? "Hide" : "Filters"}
              </Button>
              <ExcelExport data={filteredOrders} filename="orders_export" buttonText="Export" variant="gradient" />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mb-4">
            <Tabs value={activeTab} className="overflow-x-auto">
              <TabsHeader className="bg-gray-100 p-1 w-full md:w-auto">
                <Tab value="all" onClick={() => setActiveTab("all")} className="text-xs sm:text-sm">
                  All ({orders.length})
                </Tab>
                <Tab value="pending" onClick={() => setActiveTab("pending")} className="text-xs sm:text-sm">
                  Pending ({orders.filter(o => o.status.includes("Pending")).length})
                </Tab>
                <Tab value="approved" onClick={() => setActiveTab("approved")} className="text-xs sm:text-sm">
                  Approved ({orders.filter(o => o.status.includes("Approved")).length})
                </Tab>
                <Tab value="rejected" onClick={() => setActiveTab("rejected")} className="text-xs sm:text-sm">
                  Rejected ({orders.filter(o => o.status.includes("Rejected")).length})
                </Tab>
                <Tab value="deleted" onClick={() => setActiveTab("deleted")} className="text-xs sm:text-sm">
                  Deleted ({orders.filter(o => o.status.includes("Deleted")).length})
                </Tab>
              </TabsHeader>
            </Tabs>
          </div>

          {/* Loading and Error States */}
          {loading && (
            <div className="text-center py-8">
              <ArrowPathIcon className="mx-auto h-10 w-10 text-blue-600 animate-spin" />
              <Typography variant="h6" color="blue-gray" className="mt-2">Loading orders...</Typography>
            </div>
          )}
          
          {error && (
            <div className="text-center py-4 bg-red-50 rounded-lg mb-4">
              <Typography variant="h6" color="red" className="mb-2">Error Loading Data</Typography>
              <Typography color="red" className="mb-3 text-sm">{error}</Typography>
              <Button color="blue" size="sm" onClick={fetchOrders}>Retry</Button>
            </div>
          )}

          {/* User Visibility Toggle */}
          {!loading && !error && userPermissions.canView && !userPermissions.canViewAll && (
            <div className="mb-3 flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <UserGroupIcon className="h-4 w-4 text-blue-600" />
              <Typography variant="small" className="mr-2">Show all orders</Typography>
              <Switch checked={showAllUsers} onChange={() => setShowAllUsers(!showAllUsers)} color="blue" />
            </div>
          )}

          {/* Order Tracking Result */}
          {!loading && !error && trackingResult && (
            <Card className="mb-4 border-l-4 border-blue-600">
              <CardBody className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Typography variant="h6" color="blue-gray">Order Tracking Result</Typography>
                    <Typography variant="small" className="mt-1">Order ID: {trackingResult.orderId}</Typography>
                    <div className="flex items-center gap-2 mt-2">
                      <span>Status:</span>
                      <StatusBadge status={trackingResult.status} />
                    </div>
                    <div className="mt-2 text-xs">
                      <div>SPC: {trackingResult.spcName}</div>
                      <div>Approver: {trackingResult.approver || "-"}</div>
                      <div>Date: {trackingResult.submittedAt || "-"}</div>
                    </div>
                  </div>
                  <IconButton variant="text" size="sm" onClick={() => setTrackingResult(null)}>
                    <XMarkIcon className="h-4 w-4" />
                  </IconButton>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Filters Panel */}
          {!loading && !error && isFilterOpen && (
            <Card className="mb-6 border border-blue-200 bg-blue-gray-50">
              <CardBody className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h5" color="blue-gray">Advanced Filters</Typography>
                  <div className="flex gap-2">
                    <Button variant="text" size="sm" color="blue-gray" className="flex items-center gap-1" onClick={resetFilters}>
                      <ArrowPathIcon className="h-4 w-4" /> Reset All
                    </Button>
                    <IconButton variant="text" size="sm" color="blue-gray" onClick={() => setIsFilterOpen(false)}>
                      <XMarkIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </div>
                                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-4">
                    <Input label="Search Orders" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      icon={<MagnifyingGlassIcon className="h-4 w-4" />} color="blue" containerProps={{ className: "w-full max-w-full" }} />
                    <Select label="Filter by SPC" value={selectedSPC} onChange={(val) => setSelectedSPC(val)} color="blue">
                      {getDropdownOptions("spcName").map((spc) => (<Option key={spc} value={spc}>{spc}</Option>))}
                    </Select>
                    <Select label="Filter by Customer" value={selectedCustomer} onChange={(val) => setSelectedCustomer(val)} color="blue">
                      {getDropdownOptions("customerName").map((customer) => (<Option key={customer} value={customer}>{customer}</Option>))}
                    </Select>
                  </div>
                                    
                  <div className="space-y-4">
                    <Select label="Filter by Status" value={selectedStatus} onChange={(val) => setSelectedStatus(val)} color="blue">
                      {statusOptions.map((status) => (<Option key={status} value={status}>{status}</Option>))}
                    </Select>
                    <Select label="Filter by Order Type" value={selectedOrderType} onChange={(val) => setSelectedOrderType(val)} color="blue">
                      {getDropdownOptions("orderType").map((type) => (<Option key={type} value={type}>{type}</Option>))}
                    </Select>
                    <Select label="Filter by Vehicle Type" value={selectedVehicleType} onChange={(val) => setSelectedVehicleType(val)} color="blue">
                      {getDropdownOptions("vehicleType").map((vehicle) => (<Option key={vehicle} value={vehicle}>{vehicle}</Option>))}
                    </Select>
                  </div>
                                    
                  <div className="space-y-4">
                    <Select label="Filter by Mesh Type" value={selectedMeshType} onChange={(val) => setSelectedMeshType(val)} color="blue">
                      {getDropdownOptions("meshType").map((mesh) => (<Option key={mesh} value={mesh}>{mesh}</Option>))}
                    </Select>
                    <Select label="Filter by User" value={selectedUserId} onChange={(val) => setSelectedUserId(val)} color="blue">
                      <Option value="All">All Users</Option>
                      {getUserOptions().map((user) => (<Option key={user.id} value={user.id}>{user.name} ({user.id})</Option>))}
                    </Select>
                                        
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 block">Created Date Range</Typography>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label htmlFor="startDate" className="text-xs font-medium text-blue-gray-700 mb-1">Start Date</label>
                          <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-blue-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="endDate" className="text-xs font-medium text-blue-gray-700 mb-1">End Date</label>
                          <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-blue-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Active Filters */}
          {!loading && !error && (searchTerm || selectedSPC !== "All" || selectedStatus !== "All" ||
            selectedCustomer !== "All" || selectedOrderType !== "All" || selectedVehicleType !== "All" ||
            selectedMeshType !== "All" || startDate || endDate || selectedUserId !== "All") && (
            <div className="mb-3 flex flex-wrap gap-1">
              {searchTerm && (<Chip value={`Search: ${searchTerm}`} onClose={() => setSearchTerm("")} className="rounded-full bg-blue-100 text-blue-800 text-xs" />)}
              {selectedSPC !== "All" && (<Chip value={`SPC: ${selectedSPC}`} onClose={() => setSelectedSPC("All")} className="rounded-full bg-green-100 text-green-800 text-xs" />)}
              {selectedStatus !== "All" && (<Chip value={`Status: ${selectedStatus}`} onClose={() => setSelectedStatus("All")} className="rounded-full bg-purple-100 text-purple-800 text-xs" />)}
              {selectedCustomer !== "All" && (<Chip value={`Customer: ${selectedCustomer}`} onClose={() => setSelectedCustomer("All")} className="rounded-full bg-amber-100 text-amber-800 text-xs" />)}
              {selectedOrderType !== "All" && (<Chip value={`Order Type: ${selectedOrderType}`} onClose={() => setSelectedOrderType("All")} className="rounded-full bg-teal-100 text-teal-800 text-xs" />)}
              {selectedVehicleType !== "All" && (<Chip value={`Vehicle: ${selectedVehicleType}`} onClose={() => setSelectedVehicleType("All")} className="rounded-full bg-indigo-100 text-indigo-800 text-xs" />)}
              {selectedMeshType !== "All" && (<Chip value={`Mesh: ${selectedMeshType}`} onClose={() => setSelectedMeshType("All")} className="rounded-full bg-pink-100 text-pink-800 text-xs" />)}
              {selectedUserId !== "All" && (<Chip value={`User: ${selectedUserId}`} onClose={() => setSelectedUserId("All")} className="rounded-full bg-cyan-100 text-cyan-800 text-xs" />)}
              {startDate && (<Chip value={`From: ${new Date(startDate).toLocaleDateString()}`} onClose={() => setStartDate("")} className="rounded-full bg-gray-200 text-gray-800 text-xs" />)}
              {endDate && (<Chip value={`To: ${new Date(endDate).toLocaleDateString()}`} onClose={() => setEndDate("")} className="rounded-full bg-gray-200 text-gray-800 text-xs" />)}
            </div>
          )}

          {/* Orders Table */}
          {!loading && !error && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <Typography variant="h5" color="blue-gray" className="mt-2">No orders found</Typography>
                  <Typography color="gray" className="mt-1 text-sm">Try adjusting your filters or search terms</Typography>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Order ID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Requestor</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Customer</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">SPC</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Modified Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className="text-blue-600 font-medium cursor-pointer hover:underline text-sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setOpenDetailDialog(true);
                            }}
                          >
                            {order.orderId}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">{order.dispatchLocation}</div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="font-medium text-sm">{order.userName}</div>
                          <div className="text-xs text-gray-500">ID: {order.requestorId}</div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="font-medium text-sm">{order.customerName}</div>
                          <div className="text-xs text-gray-500">{order.orderType}</div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{order.spcName}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={order.status} />
                          </div>
                          {order.status.includes("Rejected") && order.remarks && (
                            <div onClick={() => { setRemarks(order.remarks); setOpenRemarkDialog(true); }}
                              className="text-xs text-red-600 mt-1 underline cursor-pointer">View Remarks</div>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatDateTime(order.createdDate)}
                          <div className="text-xs text-gray-500">by {order.createdByName}</div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatDateTime(order.modifiedOn)}
                          <div className="text-xs text-gray-500">by {order.modifiedByName}</div>
                        </td>
                        
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex gap-1">
                            {/* View button */}
                            <Tooltip content="View Details">
                              <IconButton size="sm" color="blue" onClick={() => { setSelectedOrder(order); setOpenDetailDialog(true); }}>
                                <EyeIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
                            
                            {/* Action menu */}
                            <Menu placement="left-start">
                              <MenuHandler>
                                <IconButton size="sm" color="gray" variant="outlined">
                                  <EllipsisVerticalIcon className="h-4 w-4" />
                                </IconButton>
                              </MenuHandler>
                              <MenuList className="p-1 min-w-[120px]">
                                {/* History button */}
                                <MenuItem 
                                  className="flex items-center gap-2 p-2"
                                  onClick={() => handleAction(order.orderId, "History")}
                                  disabled={historyLoading}
                                >
                                  {historyLoading ? (
                                    <Spinner className="h-4 w-4" />
                                  ) : (
                                    <ClipboardDocumentListIcon className="h-4 w-4" />
                                  )}
                                  <span>History</span>
                                </MenuItem>
                                
                                {/* Action buttons */}
                                {!order.status.includes("Approved") && !order.status.includes("Rejected") && (
                                  <>
                                    {canApprove(order, user) && (
                                      <MenuItem 
                                        className="flex items-center gap-2 p-2 text-green-700 hover:bg-green-50"
                                        onClick={() => handleAction(order.orderId, "Approve")}
                                        disabled={actionLoading}
                                      >
                                        {actionLoading ? (
                                          <Spinner className="h-4 w-4" />
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                          </svg>
                                        )}
                                        <span>Approve</span>
                                      </MenuItem>
                                    )}
                                    
                                    {canReturn(order, user) && (
                                      <MenuItem 
                                        className="flex items-center gap-2 p-2 text-orange-700 hover:bg-orange-50"
                                        onClick={() => handleAction(order.orderId, "Return")}
                                        disabled={actionLoading}
                                      >
                                        {actionLoading ? (
                                          <Spinner className="h-4 w-4" />
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                                          </svg>
                                        )}
                                        <span>Return</span>
                                      </MenuItem>
                                    )}
                                    
                                    {canReturn(order, user) && (
                                      <MenuItem 
                                        className="flex items-center gap-2 p-2 text-red-700 hover:bg-red-50"
                                        onClick={() => handleAction(order.orderId, "Reject")}
                                        disabled={actionLoading}
                                      >
                                        {actionLoading ? (
                                          <Spinner className="h-4 w-4" />
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                          </svg>
                                        )}
                                        <span>Reject</span>
                                      </MenuItem>
                                    )}
                                  </>
                                )}
                                
                                {/* Delete button */}
                                {canDelete(order) && (
                                  <MenuItem 
                                    className="flex items-center gap-2 p-2 text-red-700 hover:bg-red-50"
                                    onClick={() => handleAction(order.orderId, "Delete")}
                                    disabled={actionLoading}
                                  >
                                    {actionLoading ? (
                                      <Spinner className="h-4 w-4" />
                                    ) : (
                                      <TrashIcon className="h-4 w-4" />
                                    )}
                                    <span>Delete</span>
                                  </MenuItem>
                                )}
                                {canEdit(order, user) && (
                                  <MenuItem 
                                    className="flex items-center gap-2 p-2 text-blue-700 hover:bg-blue-50"
                                    onClick={() => handleAction(order.orderId, "Edit")}
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                    <span>Edit</span>
                                  </MenuItem>
                                )}
                              </MenuList>
                            </Menu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={openDetailDialog} handler={() => handleDialogClose(setOpenDetailDialog)} size="xl">
        <DialogHeader className="bg-blue-50 flex justify-between items-center py-3">
          <div>
            <Typography variant="h5">Order Details</Typography>
            <Typography variant="small" color="blue-gray">Order ID: {selectedOrder?.orderId}</Typography>
          </div>
          <StatusBadge status={selectedOrder?.status} />
        </DialogHeader>
        <DialogBody className="space-y-4 max-h-[70vh] overflow-y-auto py-4">
          {selectedOrder ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Typography variant="h6" color="blue-gray" className="font-bold mb-2 pb-1 border-b">Order Information</Typography>
                  <div className="space-y-2">
                    {[
                      ["Order ID:", selectedOrder.orderId],
                      ["Requestor:", `${selectedOrder.userName} (${selectedOrder.requestorId})`],
                      ["Customer:", selectedOrder.customerName],
                      ["SPC:", selectedOrder.spcName],
                      ["Application Name:", selectedOrder.application],
                      ["Order Type:", selectedOrder.orderType],
                      ["Delivery Date:", selectedOrder.deliveryDate]
                    ].map(([label, value], idx) => (
                      <div key={idx} className="flex flex-wrap text-sm">
                        <span className="w-32 flex-shrink-0 font-semibold text-gray-700">{label}</span>
                        <span className="font-medium text-gray-900 break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Typography variant="h6" color="blue-gray" className="font-bold mb-2 pb-1 border-b">Material Details</Typography>
                  <div className="space-y-2">
                    {[
                      ["Weldmesh Qty:", `${selectedOrder.weldmeshQty} ${selectedOrder.unit}`],
                      ["Weldmesh Details:", selectedOrder.weldmeshDetails],
                      ["RM Material:", selectedOrder.rmMaterialDescription],
                      ["FG Material:", selectedOrder.fgMaterialDescription]
                    ].map(([label, value], idx) => (
                      <div key={idx} className="flex flex-wrap text-sm">
                        <span className="w-32 flex-shrink-0 font-semibold text-gray-700">{label}</span>
                        <span className="font-medium text-gray-900 break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Typography variant="h6" color="blue-gray" className="font-bold mb-2 pb-1 border-b">Logistics Information</Typography>
                  <div className="space-y-2">
                    {[
                      ["Dispatch Location:", selectedOrder.dispatchLocation],
                      ["City Code:", selectedOrder.cityCode],
                      ["Vehicle Type:", selectedOrder.vehicleType],
                      [
                        "Freight Maintained:",
                        selectedOrder.freightMaintained ? "Yes" : "No"
                      ],
                      ...(selectedOrder.freightMaintained
                        ? [
                            ["Freight PO Number:", selectedOrder.freightPONumber],
                            ["Freight Std Rate:", selectedOrder.freightStdRate]
                          ]
                        : [])
                    ].map(([label, value], idx) => (
                      <div key={idx} className="flex flex-wrap text-sm">
                        <span className="w-32 flex-shrink-0 font-semibold text-gray-700">
                          {label}
                        </span>
                        <span className="font-medium text-gray-900 break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Typography variant="h6" color="blue-gray" className="font-bold mb-2 pb-1 border-b">Approval Information</Typography>
                  <div className="space-y-2">
                    {[
                      ["Approver Level:", selectedOrder.currentApprovalLevel],
                      ["Final Status:", selectedOrder?.status],
                      ["Created By:", `${selectedOrder.createdByName} (${selectedOrder.createdBy})`],
                      ["Created Date:", formatDateTime(selectedOrder.createdDate)],
                      ["Modified By:", selectedOrder.modifiedByName ? `${selectedOrder.modifiedByName} (${selectedOrder.modifiedBy})` : "-"],
                      ["Modified Date:", selectedOrder.modifiedOn ? formatDateTime(selectedOrder.modifiedOn) : "-"]
                    ].map(([label, value], idx) => (
                      <div key={idx} className="flex flex-wrap text-sm">
                        <span className="w-32 flex-shrink-0 font-semibold text-gray-700">{label}</span>
                        <span className="font-medium text-gray-900 break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Fixed Attachments Section */}
                {renderAttachmentsSection()}
                
                {selectedOrder.remarks && (
                  <div>
                    <Typography variant="h6" color="blue-gray" className="font-bold mb-2 pb-1 border-b">Remarks</Typography>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Typography className="whitespace-pre-wrap text-sm">{selectedOrder.remarks}</Typography>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (<div>No order selected</div>)}
        </DialogBody>
        <DialogFooter className="flex gap-2 py-3">
          <ExcelExport 
            data={[selectedOrder]} 
            filename={`order_${selectedOrder?.orderId}`} 
            buttonText="Export Order" 
            variant="gradient" 
            includeAttachments={true}
            onExportComplete={() => setOpenDetailDialog(false)}
          />
          <Button color="blue" onClick={() => handleDialogClose(setOpenDetailDialog)}>Close</Button>
        </DialogFooter>
      </Dialog>

      {/* Order History Dialog */}
      <Dialog open={openHistoryDialog} handler={() => handleDialogClose(setOpenHistoryDialog)} size="xl">
        <DialogHeader className="bg-blue-50 py-3">
          Order History - {selectedOrder?.orderId}
        </DialogHeader>
        <DialogBody className="max-h-[60vh] overflow-y-auto py-4">
          {historyLoading ? (
            <div className="text-center py-6">
              <Spinner className="h-8 w-8 mx-auto" />
              <Typography variant="small" className="mt-2">Loading history...</Typography>
            </div>
          ) : orderHistory.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Typography variant="h6">Workflow Timeline</Typography>
                <ExcelExport
                  data={orderHistory}
                  filename={`order_history_${selectedOrder?.orderId}`}
                  buttonText="Export History"
                  variant="outlined"
                />
              </div>
              
              <div className="relative border-l-2 border-blue-200 pl-4">
                {orderHistory.map((history, index) => {
                  let statusColor =
                    history.action.includes("APPROVED")
                      ? "bg-green-100 text-green-800"
                      : history.action.includes("RETURN")
                      ? "bg-yellow-100 text-yellow-800"
                      : history.action.includes("DELETED")
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800";
                  
                  return (
                    <div key={index} className="mb-4 relative">
                      <span className="absolute -left-2 top-1 w-3 h-3 rounded-full bg-blue-400 border-2 border-white"></span>
                      
                      <div className="p-3 bg-white shadow-sm rounded-lg border">
                        <div className="flex justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                            {history.action}
                          </span>
                          <Typography variant="small" className="text-gray-500">
                            {formatDateTime(history.timestamp)}
                          </Typography>
                        </div>
                        
                        <Typography variant="small" className="text-gray-700 mt-1">
                          By:{" "}
                          {history.userName && history.userName !== history.roleName
                            ? `${history.userName} (${history.roleName})`
                            : history.roleName}
                        </Typography>
                        
                        <Typography variant="small" className="text-gray-500 mt-1 italic">
                          Created By: {history.createdBy} | Modified By: {history.modifiedBy}
                        </Typography>
                        
                        {history.remarks && history.remarks !== "No remarks" && (
                          <div className="mt-2 p-2 bg-gray-50 rounded border">
                            <Typography variant="small" className="font-semibold">
                              Remarks:
                            </Typography>
                            <Typography variant="small" className="whitespace-pre-wrap text-gray-700">
                              {history.remarks}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <ClipboardDocumentListIcon className="h-10 w-10 text-gray-400 mx-auto" />
              <Typography variant="h6" className="mt-2">No history found</Typography>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="py-3">
          <Button color="blue" onClick={() => handleDialogClose(setOpenHistoryDialog)}>Close</Button>
        </DialogFooter>
      </Dialog>

      {/* Enhanced Return Order Dialog */}
      <RemarksDialog
        open={openReturnDialog}
        onClose={() => handleDialogClose(setOpenReturnDialog)}
        onConfirm={confirmReturn}
        title="Return Order"
        message={`Return order ${selectedOrder?.orderId}?`}
        confirmText="Confirm Return"
        confirmColor="orange"
        isLoading={actionLoading}
        remarks={remarks}
        setRemarks={setRemarks}
        isRemarksMandatory={true}
      >
        <div className="mb-4">
          <Typography variant="small" className="font-semibold mb-2">Return to:</Typography>
          <div className="flex gap-4">
            <Radio
              name="returnTarget"
              label="Sales"
              checked={returnTarget === "sales"}
              onChange={() => setReturnTarget("sales")}
            />
            {selectedOrder?.currentApprovalLevel > 1 && (
              <Radio
                name="returnTarget"
                label="SPC Manager"
                checked={returnTarget === "manager"}
                onChange={() => setReturnTarget("manager")}
              />
            )}
          </div>
        </div>
      </RemarksDialog>

      {/* Enhanced Approve Order Dialog */}
      <RemarksDialog
        open={openApproveDialog}
        onClose={() => handleDialogClose(setOpenApproveDialog)}
        onConfirm={confirmApprove}
        title="Approve Order"
        message={`Approve order ${selectedOrder?.orderId}?`}
        confirmText="Confirm Approval"
        confirmColor="green"
        isLoading={actionLoading}
        remarks={remarks}
        setRemarks={setRemarks}
        isRemarksMandatory={false}
      />

      {/* Enhanced Reject Order Dialog */}
      <RemarksDialog
        open={openRejectDialog}
        onClose={() => handleDialogClose(setOpenRejectDialog)}
        onConfirm={confirmReject}
        title="Reject Order"
        message={`Reject order ${selectedOrder?.orderId}?`}
        confirmText="Confirm Rejection"
        confirmColor="red"
        isLoading={actionLoading}
        remarks={remarks}
        setRemarks={setRemarks}
        isRemarksMandatory={true}
      />

      {/* Enhanced Delete Confirmation Dialog */}
      <ActionConfirmationDialog
        open={openDeleteDialog}
        onClose={() => handleDialogClose(setOpenDeleteDialog)}
        onConfirm={confirmDelete}
        title="Delete Order"
        message={`Permanently delete order ${selectedOrder?.orderId}? This action cannot be undone.`}
        confirmText="Delete Permanently"
        confirmColor="red"
        isLoading={actionLoading}
      >
        <Alert color="red" className="mt-3">
          <ExclamationTriangleIcon className="h-4 w-4" />
          Warning: This action is irreversible. All order data and history will be permanently removed.
        </Alert>
      </ActionConfirmationDialog>

      {/* View Remarks Dialog */}
      <Dialog open={openRemarkDialog} handler={() => handleDialogClose(setOpenRemarkDialog)} size="sm">
        <DialogHeader className="py-3">Return Remarks</DialogHeader>
        <DialogBody className="py-2">
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="whitespace-pre-wrap text-sm">{remarks}</Typography>
          </div>
        </DialogBody>
        <DialogFooter className="py-3">
          <Button color="blue" onClick={() => handleDialogClose(setOpenRemarkDialog)}>Close</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}