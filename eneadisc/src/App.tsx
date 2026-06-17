import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EntryLayout } from './layouts/EntryLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingSplit } from './pages/entry/LandingSplit';
import { HomeLanding } from './pages/entry/HomeLanding';
import { CompanyLogin } from './pages/auth/company/CompanyLogin';
import { CompanySignup } from './pages/auth/company/CompanySignup';
import { EmployeeLogin } from './pages/auth/employee/EmployeeLogin';
import { EmployeeSignup } from './pages/auth/employee/EmployeeSignup';
import { QuestionnaireFlow } from './pages/QuestionnaireFlow';
import { EmployeeProfile } from './pages/employee/EmployeeProfile';
import { JoinRequest } from './pages/auth/employee/JoinRequest';
import { ResetPassword } from './pages/auth/ResetPassword';
import { OAuthCallback } from './pages/auth/OAuthCallback';
import { CompanyPanel } from './pages/company/CompanyPanel';
import { EnneagramLibrary } from './pages/company/EnneagramLibrary';
import { TeamManagement } from './pages/company/TeamManagement';
import { EmployeeTeam } from './pages/employee/EmployeeTeam';
import { EmployeeTasks } from './pages/employee/EmployeeTasks';
import { EmployeeProgress } from './pages/employee/EmployeeProgress';
import { EmployeeAssistant } from './pages/employee/EmployeeAssistant';
import { EmployeeCheckins } from './pages/employee/EmployeeCheckins';
import { CompanyAnalytics } from './pages/company/CompanyAnalytics';
import { CompanyTracking } from './pages/company/CompanyTracking';
import { AIAssistant } from './pages/company/AIAssistant';
import { Subscription } from './pages/company/Subscription';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, session, isLoading } = useAuth();

  // Si hay una sesión activa pero el usuario todavía se está construyendo
  // (o la auth aún está cargando), mostramos un loader en vez de rebotar
  // al inicio. Sin esto, hay un race donde el login navega antes de que
  // el user exista y el guardia patea a "/".
  if (isLoading || (session && !isAuthenticated)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};


function AppRoutes() {
  return (
    <Routes>
      {/* Entry Routes */}
      <Route element={<EntryLayout />}>
        <Route path="/" element={<HomeLanding />} />
        <Route path="/auth/portal" element={<LandingSplit />} />
        <Route path="/auth/company/login" element={<CompanyLogin />} />
        <Route path="/auth/company/signup" element={<CompanySignup />} />
        <Route path="/auth/employee/login" element={<EmployeeLogin />} />
        <Route path="/auth/employee/signup" element={<EmployeeSignup />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/join" element={<JoinRequest />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
      </Route>

      {/* Questionnaire (fullscreen, no sidebar) */}
      <Route path="/questionnaire" element={
        <ProtectedRoute>
          <QuestionnaireFlow />
        </ProtectedRoute>
      } />

      {/* Employee Dashboard */}
      <Route path="/dashboard/employee" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<EmployeeProfile />} />
        <Route path="progreso" element={<EmployeeProgress />} />
        <Route path="asistente" element={<EmployeeAssistant />} />
        <Route path="tareas" element={<EmployeeTasks />} />
        <Route path="equipo" element={<EmployeeTeam />} />
        <Route path="checkins" element={<EmployeeCheckins />} />
      </Route>

      {/* Company Dashboard */}
      <Route path="/dashboard/company" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CompanyPanel />} />
        <Route path="equipos" element={<TeamManagement />} />
        <Route path="analisis" element={<CompanyAnalytics />} />
        <Route path="asistente" element={<AIAssistant />} />
        <Route path="biblioteca" element={<EnneagramLibrary />} />
        <Route path="seguimiento" element={<CompanyTracking />} />
        <Route path="suscripcion" element={<Subscription />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
