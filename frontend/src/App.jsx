import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';

import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import ProductsPage from './pages/public/ProductsPage';
import ReservationPage from './pages/public/ReservationPage';
import GalleryPage from './pages/public/GalleryPage';
import PromotionsPage from './pages/public/PromotionsPage';

import LoginPage from './pages/admin/LoginPage';
import ServicesAdminPage from './pages/admin/ServicesAdminPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import ProductCategoriesAdminPage from './pages/admin/ProductCategoriesAdminPage';
import CategoriesAdminPage from './pages/admin/CategoriesAdminPage';
import SectionsAdminPage from './pages/admin/SectionsAdminPage';
import ChiSiamoAdminPage from './pages/admin/ChiSiamoAdminPage';
import SchedulePage from './pages/admin/SchedulePage';
import SettingsPage from './pages/admin/SettingsPage';
import AdminsPage from './pages/admin/AdminsPage';
import PromotionsAdminPage from './pages/admin/PromotionsAdminPage';
import OwnerRoute from './components/OwnerRoute';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/servizi" element={<ServicesPage />} />
        <Route path="/prodotti" element={<ProductsPage />} />
        <Route path="/promozioni" element={<PromotionsPage />} />
        <Route path="/prenota" element={<ReservationPage />} />
        <Route path="/chi-siamo" element={<GalleryPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<ServicesAdminPage />} />
        <Route path="servizi" element={<ServicesAdminPage />} />
        <Route path="prodotti" element={<ProductsAdminPage />} />
        <Route path="categorie-prodotti" element={<ProductCategoriesAdminPage />} />
        <Route path="categorie" element={<CategoriesAdminPage />} />
        <Route path="sezioni" element={<SectionsAdminPage />} />
        <Route path="chi-siamo-admin" element={<ChiSiamoAdminPage />} />
        <Route path="amministratori" element={<OwnerRoute><AdminsPage /></OwnerRoute>} />
        <Route path="orari" element={<SchedulePage />} />
        <Route path="promozioni" element={<PromotionsAdminPage />} />
        <Route path="impostazioni" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
