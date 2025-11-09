import { Route, Routes } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import { ArchivePage } from "./pages/archive";
import { DashboardPage } from "./pages/dashboard";
import { DecreeEnginePage } from "./pages/decrees";
import { ReportsPage } from "./pages/reports";
import { RuleManagementPage } from "./pages/rules";
import { AttributeManagementPage } from "./pages/attributes";
import { EntityMembersPage } from "./pages/entity-members";
import Calculate from "./pages/Calculate";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/rules" element={<RuleManagementPage />} />
        <Route path="/attributes" element={<AttributeManagementPage />} />
        <Route path="/members" element={<EntityMembersPage />} />
        <Route path="/decrees" element={<DecreeEnginePage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/calculate" element={<Calculate />} />
      </Route>
    </Routes>
  );
}
