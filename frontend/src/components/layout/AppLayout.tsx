import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const AppLayout: React.FC = () => {
  const [mobileMenuAberto, setMobileMenuAberto] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={mobileMenuAberto}
        onClose={() => setMobileMenuAberto(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          onToggleMobileMenu={() => setMobileMenuAberto((prev) => !prev)}
        />
        <main className="flex-1 overflow-auto bg-(--bg)">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
