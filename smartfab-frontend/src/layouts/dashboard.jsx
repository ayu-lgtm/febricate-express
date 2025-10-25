import { Routes, Route, Navigate } from "react-router-dom";
import { Sidenav, DashboardNavbar, Configurator, Footer } from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { canAccessPage } from "@/utils/roles";

export function Dashboard({ routes }) {
  const [controller] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const role = sessionStorage.getItem("role");

  const filteredRoutes = routes
  .filter((route) => route.layout === "dashboard")
  .map((route) => ({
    ...route,
    pages: route.pages.filter((page) => canAccessPage(role, page)),
  }));

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={filteredRoutes}
        brandImg={sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"}
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Configurator />
        <Routes>
            {filteredRoutes.flatMap(({ pages }) =>
              pages.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))
            )}
          </Routes>
        <Footer />
      </div>
    </div>
  );
}