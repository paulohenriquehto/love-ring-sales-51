import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { FontProvider } from "./contexts/FontContext";
import { CartProvider } from "./contexts/CartContext";
import { Toaster } from "./components/ui/toaster";
import AppLayout from "./components/AppLayout";
import "./index.css";

import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import DashboardFallback from "./pages/DashboardFallback.tsx";
import Settings from "./pages/Settings.tsx";
import Users from "./pages/Users.tsx";
import Reports from "./pages/Reports.tsx";
import Requests from "./pages/Requests.tsx";
import Inventory from "./pages/Inventory.tsx";
import Departments from "./pages/Departments.tsx";
import Products from "./pages/Products.tsx";
import Checkout from "./pages/Checkout.tsx";
import OrderConfirmation from "./pages/OrderConfirmation.tsx";
import ImportProducts from "./pages/ImportProducts.tsx";
import ImportDashboard from "./pages/ImportDashboard.tsx";
import Analytics from "./pages/Analytics.tsx";
import AuditLogs from "./pages/AuditLogs.tsx";
import Workflows from "./pages/Workflows.tsx";
import APIManagement from "./pages/APIManagement.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <FontProvider>
            <CartProvider>
              <Routes>
                <Route path="/" element={<AppLayout><Index /></AppLayout>} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<AppLayout><DashboardFallback /></AppLayout>} />
                <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
                <Route path="/users" element={<AppLayout><Users /></AppLayout>} />
                <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
                <Route path="/requests" element={<AppLayout><Requests /></AppLayout>} />
              <Route path="/inventory" element={<AppLayout><Inventory /></AppLayout>} />
              <Route path="/departments" element={<AppLayout><Departments /></AppLayout>} />
              <Route path="/products" element={<AppLayout><Products /></AppLayout>} />
              <Route path="/import-products" element={<AppLayout><ImportProducts /></AppLayout>} />
              <Route path="/import-dashboard" element={<AppLayout><ImportDashboard /></AppLayout>} />
              <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
              <Route path="/audit-logs" element={<AppLayout><AuditLogs /></AppLayout>} />
              <Route path="/workflows" element={<AppLayout><Workflows /></AppLayout>} />
              <Route path="/api-management" element={<AppLayout><APIManagement /></AppLayout>} />
              <Route path="/checkout" element={<AppLayout><Checkout /></AppLayout>} />
              <Route path="/order-confirmation/:orderId" element={<AppLayout><OrderConfirmation /></AppLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
              <Toaster />
            </CartProvider>
          </FontProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>
);