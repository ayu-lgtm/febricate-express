import React from "react";
import {
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  QrCodeIcon,
  ReceiptPercentIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

import {
  SmartInvoicing,
  TagPrintScreen,
  ProductionRecordingScreen,
  ProductionOrderForm,
  ApprovalDashboard,
  Notifications,
} from "@/pages/dashboard";

// Current user info
const currentUser = {
  userId: sessionStorage.getItem("userID") || "N/A",
  role: sessionStorage.getItem("role") || "N/A",
  username: sessionStorage.getItem("username") || "Guest",
};

// Screens mapping (key must match normalized path)
export const screens = {
  productionorderform: {
    component: ProductionOrderForm,
    icon: <AdjustmentsHorizontalIcon className="h-5 w-5" />,
  },
  approvaldashboard: {
    component: ApprovalDashboard,
    icon: <AdjustmentsHorizontalIcon className="h-5 w-5" />,
  },
  productionrecording: {
    component: ProductionRecordingScreen,
    icon: <DocumentTextIcon className="h-5 w-5" />,
  },
  tagprint: {
    component: TagPrintScreen,
    icon: <QrCodeIcon className="h-5 w-5" />,
  },
  smartinvoicing: {
    component: SmartInvoicing,
    icon: <ReceiptPercentIcon className="h-5 w-5" />,
  },
  notifications: {
    component: Notifications,
    icon: <InformationCircleIcon className="h-5 w-5" />,
  },
};

// Original menu data (all consistent now ✅)
export const menus = [
  {
    path: "productionorderform", // Base path
    name: "Production Order",
    permissions: { canView: true, canCreate: true },
  },
  {
    path: "productionorderform/:orderId", // Parameterized path
    name: "Production Order Edit",
    permissions: { canView: true, canCreate: true },
    hidden: true, // This won't show in menu
  },
  {
    path: "productionorderform/draft/:draftId", // Add this explicit draft route
    name: "Production Order Draft",
    permissions: { canView: true, canCreate: true },
    hidden: true,
  },
  {
    path: "approvaldashboard",
    name: "Approval Dashboard",
    permissions: { canView: true },
  },
  {
    path: "productionrecording",
    name: "Production Recording",
    permissions: { canView: true },
  },
  {
    path: "tagprint",
    name: "Tag Print",
    permissions: { canView: true },
  },
  {
    path: "smartinvoicing",
    name: "Smart Invoicing",
    permissions: { canView: true },
  },
  {
    path: "notifications",
    name: "Notifications",
    permissions: { canView: true },
  },
];



const normalizeKey = (path) => {
  // Remove leading slashes and convert to lowercase
  const normalized = path.replace(/^\/+/, "").toLowerCase();
  
  if (normalized.includes('/:')) {
    return normalized.split('/:')[0];
  }
  
  return normalized;
};

export const buildRoutes = (menus, currentUser) => {
  const result = [
    {
      layout: "dashboard",
      pages: menus
        .filter((m) => m.permissions?.canView)
        .map((m) => {
          const key = normalizeKey(m.path);
          const screen = screens[key];
          const element = React.createElement(
            screen?.component || (() => <div>Not Found</div>),
            { currentUser, permissions: m.permissions } 
          );
          return {
            id: `${key}-${currentUser.userID}`,
            icon: screen?.icon || <></>,
            name: m.name,
            path: key,
            element,
            permissions: m.permissions,
          };
        }),
    },
  ];
  return result;
};

export const filteredRoutes = buildRoutes(menus, currentUser);
export default filteredRoutes;