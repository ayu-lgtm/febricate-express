// src/hooks/useAuthLogin.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserMenus } from "@/hooks/menuService";
import { buildRoutes } from "@/routes";
import { canAccessPage } from "@/utils/roles";
const API_BASE = import.meta.env.VITE_API_BASE;

export function useAuthLogin() {
  const [authData, setAuthData] = useState({ userID: null, username: null, role: null,roleId:null });
  const [attempting, setAttempting] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [redirectDone, setRedirectDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoginDetails = async () => {
      try {
        // 🔐 Fetch auth token
        // const tataRes = await fetch("https://immes.corp.tatasteel.com/api/Authentication", {
        //   method: "GET",
        //   credentials: "include",
        //   mode: "cors",
        // });
        

        
        // const data = await tataRes.json();
        // // console.log(data);
        // const auth = JSON.parse(data).auth;
        // if (!auth) throw new Error("No 'auth' token received");

        const auth ="Gv9XlKLRRDsxO2f43AVGpV2acCxWJ0kWXL2kG9kLri0=";

        // 🔐 Decrypt token at backend
        const backendRes = await fetch(`${API_BASE}/decrypt-auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authToken: auth }),
        });
        const decrypted = await backendRes.json();
        const { userID, username, role ,roleId} = decrypted?.data || {};

        //  console.log(userID);

        if (!userID || !username || !role) {
          console.error("Missing userID or role");
          navigate("/unauthorized", { replace: true });
          return;
        }

     

        // Save auth in session
        sessionStorage.setItem("userID", userID);
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("role", role);
        sessionStorage.setItem("authToken", auth);
        sessionStorage.setItem("roleId", roleId);
        setAuthData({ userID, username, role,roleId });
        

        // 🔹 Fetch menus/routes
        const menus = await fetchUserMenus();
        const builtRoutes = buildRoutes(menus, { userID, username, role });
        setRoutes(builtRoutes);

        // 🔹 Redirect to first accessible page dynamically
        if (!redirectDone) {
          const dashboardRoutes = builtRoutes.find((r) => r.layout === "dashboard");
          if (dashboardRoutes) {
            const firstPage = dashboardRoutes.pages.find((page) =>
              canAccessPage(role, page)
            );
            if (firstPage) {
              navigate(`/dashboard/${firstPage.path}`, { replace: true });
              setRedirectDone(true);
            }
          }
        }
      } catch (err) {
        console.error("❌ Auth error:", err.message);
        navigate("/unauthorized", { replace: true });
      } finally {
        setAttempting(false);
      }
    };

    fetchLoginDetails();
  }, [redirectDone, navigate]);

  return { authData, attempting, routes };
}