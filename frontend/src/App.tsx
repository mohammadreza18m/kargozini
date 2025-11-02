import { Route, Routes } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { ArchivePage } from './pages/archive';
import { DashboardPage } from './pages/dashboard';
import { DecreeEnginePage } from './pages/decrees';
import { PersonnelPage } from './pages/personnel';
import { ReportsPage } from './pages/reports';
import { RuleManagementPage } from './pages/rules';
import { AttributeManagementPage } from './pages/attributes';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/rules" element={<RuleManagementPage />} />
        <Route path="/attributes" element={<AttributeManagementPage />} />
        <Route path="/personnel" element={<PersonnelPage />} />
        <Route path="/decrees" element={<DecreeEnginePage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}
