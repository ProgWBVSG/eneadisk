import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EntryLayout } from './layouts/EntryLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingSplit } from './pages/entry/LandingSplit';
import { CompanyLogin } from './pages/auth/company/CompanyLogin';
import { CompanySignup } from './pages/auth/company/CompanySignup';
import { EmployeeLogin } from './pages/auth/employee/EmployeeLogin';
import { EmployeeSignup } from './pages/auth/employee/EmployeeSignup';
import { QuestionnaireFlow } from './pages/QuestionnaireFlow';
import { EmployeeProfile } from './pages/employee/EmployeeProfile';
import { CompanyPanel } from './pages/company/CompanyPanel';
import { EnneagramLibrary } from './pages/company/EnneagramLibrary';
import { TeamManagement } from './pages/company/TeamManagement';
import { EmployeeTeam } from './pages/employee/EmployeeTeam';
import { EmployeeTasks } from './pages/employee/EmployeeTasks';
import { CompanyAnalytics } from './pages/company/CompanyAnalytics';
import { AIAssistant } from './pages/company/AIAssistant';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Placeholder components for other pages
const EmployeeProgress = () => <div className="p-8"><h1 className="text-2xl font-bold">Mi Progreso</h1><p className="text-slate-600 mt-2">Próximamente - Estadísticas de tu progreso</p></div>;
const EmployeeAssistant = () => <div className="p-8"><h1 className="text-2xl font-bold">Mi Asistente Personal</h1><p className="text-slate-600 mt-2">Próximamente - Chat con recomendaciones</p></div>;
const EmployeeCheckins = () => <div className="p-8"><h1 className="text-2xl font-bold">Check-ins</h1><p className="text-slate-600 mt-2">Próximamente - Registro emocional</p></div>;
const Tracking = () => <div className="p-8"><h1 className="text-2xl font-bold">Seguimiento</h1><p className="text-slate-600 mt-2">Próximamente - Evolución del equipo</p></div>;
const Subscription = () => <div className="p-8"><h1 className="text-2xl font-bold">Suscripción</h1><p className="text-slate-600 mt-2">Próximamente - Gestión de planes</p></div>;

function AppRoutes() {
  return (
    <Routes>
      {/* Entry Routes */}
      <Route element={<EntryLayout />}>
        <Route path="/" element={<LandingSplit />} />
        <Route path="/auth/company/login" element={<CompanyLogin />} />
        <Route path="/auth/company/signup" element={<CompanySignup />} />
        <Route path="/auth/employee/login" element={<EmployeeLogin />} />
        <Route path="/auth/employee/signup" element={<EmployeeSignup />} />
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
        <Route path="seguimiento" element={<Tracking />} />
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
