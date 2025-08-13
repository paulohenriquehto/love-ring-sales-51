import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FontProvider } from "./contexts/FontContext";
import { Toaster } from "./components/ui/toaster";
import AppLayout from "./components/AppLayout";
import "./index.css";

import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Settings from "./pages/Settings.tsx";
import Users from "./pages/Users.tsx";
import Reports from "./pages/Reports.tsx";
import Requests from "./pages/Requests.tsx";
import Inventory from "./pages/Inventory.tsx";
import Departments from "./pages/Departments.tsx";
import Products from "./pages/Products.tsx";
import NotFound from "./pages/NotFound.tsx";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FontProvider>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/" element={<AppLayout><Index /></AppLayout>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
          <Route path="/users" element={<AppLayout><Users /></AppLayout>} />
          <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
          <Route path="/requests" element={<AppLayout><Requests /></AppLayout>} />
          <Route path="/inventory" element={<AppLayout><Inventory /></AppLayout>} />
          <Route path="/departments" element={<AppLayout><Departments /></AppLayout>} />
          <Route path="/products" element={<AppLayout><Products /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  </FontProvider>
  </React.StrictMode>
);