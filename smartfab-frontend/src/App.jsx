// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "@/layouts";
import { fetchUserMenus } from "@/hooks/menuService";
import { buildRoutes } from "@/routes";
import LoadingScreen from "@/pages/LoadingScreen";
import Unauthorized from "@/pages/Unauthorized";
import { useAuthLogin } from "@/hooks/useAuthLogin";

function App() {
  const [routes, setRoutes] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const { authData, attempting } = useAuthLogin();
  const isLoggedIn = !!authData.userID && !!authData.role;

  useEffect(() => {
    async function loadMenus() {
      if (!isLoggedIn) {
        setLoadingMenus(false);
        return;
      }
      try {
        const menus = await fetchUserMenus();
        const builtRoutes = buildRoutes(menus, authData);
        setRoutes(builtRoutes);
      } catch (err) {
        console.error("❌ Menu fetch error:", err);
      } finally {
        setLoadingMenus(false);
      }
    }
    loadMenus();
  }, [isLoggedIn, authData]);

  if (attempting || loadingMenus) return <LoadingScreen />;

  let fallbackPath = "/unauthorized";
  if (isLoggedIn && routes.length > 0) {
    const firstPage = routes[0].pages.find((page) => page.permissions?.canView);
    if (firstPage) {
      // Remove parameters from fallback path
      const cleanPath = firstPage.path.split('/:')[0];
      fallbackPath = `/dashboard/${cleanPath}`;
    }
  }

  return (
    <Routes>
      <Route
        path="/dashboard/*"
        element={isLoggedIn ? <Dashboard routes={routes} /> : <Navigate to="/unauthorized" replace />}
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        path="/"
        element={<Navigate to={fallbackPath} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={fallbackPath} replace />}
      />
    </Routes>
  );
}

export default App;