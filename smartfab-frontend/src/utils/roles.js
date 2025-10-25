export const Roles = {
    ADMIN: "admin",
    SALES: "sales",
    SPC_MANAGER: "spc_manager",
    SPC_PRODUCTION: "spc_production",
  };
  
  export const getRoleBasedPath = (role) => {
    switch (role) {
      case Roles.ADMIN:
        return "/dashboard/notifications";
      case Roles.SALES:
        return "/dashboard/notifications";
      case Roles.SPC_MANAGER:
        return "/dashboard/notifications";
      case Roles.SPC_PRODUCTION:
        return "/dashboard/notifications";
      default:
        return "/unauthorized";
    }
  };
  
  // ✅ Better logic: match role against route.roles array
  export const canAccessPage = (userRole, page) => {
  if (!page.roles || page.roles.length === 0) return true; // no restriction
  return page.roles.includes(userRole);
};