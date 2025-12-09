// app/(sishp)/layout.tsx
import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Content wrapper with padding for mobile button */}
        <div className="pt-20 lg:pt-0 px-4 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}