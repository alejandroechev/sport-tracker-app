import { Routes, Route } from 'react-router-dom';
import Layout from './ui/components/Layout';
import LivePage from './ui/pages/LivePage';
import CategoriesPage from './ui/pages/CategoriesPage';
import CompetitionPage from './ui/pages/CompetitionPage';
import SettingsPage from './ui/pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LivePage />} />
        <Route path="sports" element={<CategoriesPage />} />
        <Route path="sports/:competitionId" element={<CompetitionPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
