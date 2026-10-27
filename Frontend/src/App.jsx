import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminClientDetail from "./pages/admin/AdminClientDetail";
import AdminLivreurs from "./pages/admin/AdminLivreurs";
import AdminLivreurForm from "./pages/admin/AdminLivreurForm";
import AdminLivreurDetail from "./pages/admin/AdminLivreurDetail";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCategoryForm from "./pages/admin/AdminCategoryForm";
import AdminCategoryDetail from "./pages/admin/AdminCategoryDetail";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminProfile from "./pages/admin/AdminProfile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ClientSpace from "./pages/client/ClientSpace";
import LivreurSpace from "./pages/livreur/LivreurSpace";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminClients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients/:id"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminClientDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/livreurs"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminLivreurs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/livreurs/nouveau"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminLivreurForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/livreurs/:id"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminLivreurDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories/nouveau"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminCategoryForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories/:id"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminCategoryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/nouveau"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/:id"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client"
          element={
            <ProtectedRoute role="CLIENT">
              <ClientSpace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/livreur"
          element={
            <ProtectedRoute role="LIVREUR">
              <LivreurSpace />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;