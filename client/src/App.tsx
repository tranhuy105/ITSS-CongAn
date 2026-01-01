import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './i18n/config';
import { DishDetailPage } from './pages/DishDetailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage';
import { RestaurantListPage } from './pages/RestaurantListPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminDishList } from './pages/admin/AdminDishList';
import { AdminRestaurantList } from './pages/admin/AdminRestaurantList';
import { AdminUserList } from './pages/admin/AdminUserList';
import { AdminDishForm } from './pages/admin/AdminDishForm';
import { AdminRestaurantForm } from './pages/admin/AdminRestaurantForm';
import { AdminUserForm } from './pages/admin/AdminUserForm';
import { DishListPage } from './pages/DishListPage';
import { ProfilePage } from './pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* PUBLIC/GUEST ROUTES */}
            <Route path="/" element={<HomePage />} />
            <Route path="/dishes" element={<DishListPage />} />
            <Route path="/dishes/:id" element={<DishDetailPage />} />
            <Route path="/restaurants" element={<RestaurantListPage />} />
            <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />

            {/* AUTH ROUTES (Redirect Admin Panel) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* PROTECTED USER ROUTES */}
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* ADMIN ROUTES */}
            <Route path="/admin" element={<AdminRoute />}>
              {/* /admin */}
              <Route index element={<AdminDashboard />} />
              {/* /admin/dishes */}
              <Route path="dishes" element={<AdminDishList />} />
              <Route path="dishes/new" element={<AdminDishForm />} />
              <Route path="dishes/edit/:id" element={<AdminDishForm />} />
              {/* /admin/restaurants */}
              <Route path="restaurants" element={<AdminRestaurantList />} />
              <Route path="restaurants/new" element={<AdminRestaurantForm />} />
              <Route path="restaurants/edit/:id" element={<AdminRestaurantForm />} />
              {/* /admin/users */}
              <Route path="users" element={<AdminUserList />} />
              <Route path="users/new" element={<AdminUserForm />} />
              <Route path="users/edit/:id" element={<AdminUserForm />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
