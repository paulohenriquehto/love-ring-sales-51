import { SymbolManager } from "@/components/engraving/SymbolManager";
import { Header } from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";

export default function SymbolManagement() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header onCartClick={() => setCartOpen(true)} />
        <div className="container mx-auto px-4 py-8">
          <SymbolManager />
        </div>
      </div>
    </ProtectedRoute>
  );
}