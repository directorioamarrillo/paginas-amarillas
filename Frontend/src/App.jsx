import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AppShell } from "./layouts/AppShell";
import { PublicShell } from "./layouts/PublicShell";
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import { ToastViewport } from "./components/common/ToastViewport";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { EmpresasPage } from "./pages/EmpresasPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { FavoritosPage } from "./pages/FavoritosPage";
import { BusquedaPage } from "./pages/BusquedaPage";
import { MensajesPage } from "./pages/MensajesPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { ComprobantesPage } from "./pages/ComprobantesPage";
import { ReportesPage } from "./pages/ReportesPage";
import { PublicidadesPage } from "./pages/PublicidadesPage";
import { NotificacionesPage } from "./pages/NotificacionesPage";
import { PerfilPage } from "./pages/PerfilPage";
import { PermissionGate } from "./components/common/PermissionGate";
import { AdminLivePage } from "./pages/AdminLivePage";
import { AdminCategoriasPage } from "./pages/AdminCategoriasPage";
import { AdminRolesPage } from "./pages/AdminRolesPage";
import { AdminPermisosPage } from "./pages/AdminPermisosPage";
import { AdminUsuariosPage } from "./pages/AdminUsuariosPage";
import { AdminAuditoriaPage } from "./pages/AdminAuditoriaPage";
import { HomePage } from "./pages/HomePage";
import { PublicMarketplacePage } from "./pages/PublicMarketplacePage";
import { PublicEmpresaPage } from "./pages/PublicEmpresaPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { FavoritosPage as PublicFavoritosPage } from "./pages/PublicFavoritosPage";
import { PublicPerfilPage } from "./pages/PublicPerfilPage";
import { ChatRoomsPage } from "./pages/ChatRoomsPage";
import { ChatRoomDetailPage } from "./pages/ChatRoomDetailPage";
import { UserChatPage } from "./pages/UserChatPage";
import { EmpresaShell } from "./layouts/EmpresaShell";
import { EmpresaDashboardPage } from "./pages/EmpresaDashboardPage";
import { MiEmpresaPage } from "./pages/MiEmpresaPage";
import { EquipoPage } from "./pages/EquipoPage";
import { EmpresaMarketplacePage } from "./pages/EmpresaMarketplacePage";
import { EmpresaPublicidadesPage } from "./pages/EmpresaPublicidadesPage";
import { EmpresaChatsPage } from "./pages/EmpresaChatsPage";
import { AdminTicketsPage } from "./pages/AdminTicketsPage";
import { MisTicketsPage } from "./pages/MisTicketsPage";
import { TicketDetallePage } from "./pages/TicketDetallePage";
import { Backups } from "./pages/admin/Backups";
import { ArchiveRegistrosPage } from "./pages/ArchiveRegistrosPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { useAuth } from "./context/AuthContext";
import { useLocation } from "react-router-dom";

function VerificationBanner() {
  const { user } = useAuth();
  const location = useLocation();

  if (user && !user.is_verified && location.pathname !== '/verificar-correo') {
    return (
      <div className="bg-amber-500 text-white text-center py-2.5 px-4 z-[100] relative font-medium text-sm">
        Tu cuenta no está verificada. Para usar todas las funciones del directorio, por favor{" "}
        <a href="/verificar-correo" className="underline font-bold hover:text-amber-100 ml-1">
          verifica tu correo aquí
        </a>.
      </div>
    );
  }
  return null;
}

function App() {
  return (
    <>
      <VerificationBanner />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verificar-correo" element={<VerifyEmailPage />} />
        
        {/* Public Pages - Mercado Libre Style */}
        <Route element={<PublicShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/empresas" element={<EmpresasPage readOnly />} />
          <Route path="/empresa/:empresaId" element={<PublicEmpresaPage />} />
          <Route path="/marketplace" element={<PublicMarketplacePage />} />
          <Route path="/producto/:productId" element={<ProductDetailPage />} />
          <Route path="/favoritos" element={<PublicFavoritosPage />} />
          <Route path="/mi-perfil" element={<PublicPerfilPage />} />
          <Route
            path="/mis-tickets"
            element={
              <ProtectedRoute>
                <MisTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <TicketDetallePage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <PermissionGate adminOnly fallback={<Navigate to="/" replace />}>
                <AppShell />
              </PermissionGate>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="empresas" element={<EmpresasPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="favoritos" element={<FavoritosPage />} />
          <Route path="busqueda" element={<BusquedaPage />} />
          <Route path="mensajes" element={<MensajesPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="comprobantes" element={<ComprobantesPage />} />
          <Route
            path="reportes"
            element={
              <PermissionGate
                allOf={["ver_reportes"]}
                fallback={<Navigate to="/admin" replace />}
              >
                <ReportesPage />
              </PermissionGate>
            }
          />
          <Route path="publicidades" element={<PublicidadesPage />} />
          <Route path="admin-live" element={<AdminLivePage />} />
          <Route path="categorias" element={<AdminCategoriasPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
          <Route path="permisos" element={<AdminPermisosPage />} />
          <Route path="usuarios" element={<AdminUsuariosPage />} />
          <Route path="registro-actividad" element={<AdminAuditoriaPage />} />
          <Route path="notificaciones" element={<NotificacionesPage />} />
          <Route path="chat" element={<ChatRoomsPage />} />
          <Route path="chat/:marketplaceId" element={<ChatRoomDetailPage />} />
          <Route path="tickets" element={<AdminTicketsPage />} />
          <Route path="backups" element={<Backups />} />
          <Route path="papelera" element={<ArchiveRegistrosPage />} />
          <Route path="perfil" element={<PerfilPage />} />
        </Route>
        <Route path="mis-chats" element={<UserChatPage />} />

        {/* Panel Empresa - For business owners */}
        <Route
          path="/empresas-panel"
          element={
            <ProtectedRoute>
              <EmpresaShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmpresaDashboardPage />} />
          <Route path="mi-empresa" element={<MiEmpresaPage />} />
          <Route path="equipo" element={<EquipoPage />} />
          <Route path="marketplace" element={<EmpresaMarketplacePage />} />
          <Route path="publicidades" element={<EmpresaPublicidadesPage />} />
          <Route path="chats" element={<EmpresaChatsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
