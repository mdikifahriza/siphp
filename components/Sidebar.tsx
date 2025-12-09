"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type SidebarUser = { nama: string; role: string };

export default function Sidebar() {
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/sidebar")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.nama && data.role) {
          setUser(data);
        } else {
          setUser({ nama: "GUEST", role: "USER" });
        }
      })
      .catch(() => setUser({ nama: "GUEST", role: "USER" }));
  }, []);

  if (!user) {
    return (
      <aside className="hidden lg:flex lg:w-72 bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <div className="w-full p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-blue-700 rounded-lg"></div>
            <div className="h-8 bg-blue-700 rounded-lg"></div>
            <div className="h-8 bg-blue-700 rounded-lg"></div>
          </div>
        </div>
      </aside>
    );
  }

  const role = user.role ? user.role.toUpperCase() : "USER";
  const nama = user.nama || "GUEST";

  const adminMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/sarpras", label: "Barang", icon: "📦" },
    { href: "/berita_acara", label: "Berita Acara", icon: "📄" },
    { href: "/ttd", label: "Tanda Tangan", icon: "✍️" },
    { href: "/alasan", label: "Alasan", icon: "📝" },
    { href: "/users", label: "Users", icon: "👥" },
  ];

  const operatorMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/barang", label: "Barang", icon: "📦" },
    { href: "/berita_acara", label: "Berita Acara", icon: "📄" },
  ];

  const menuItems = role === "ADMIN" ? adminMenuItems : operatorMenuItems;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-blue-900 text-white rounded-lg shadow-lg hover:bg-blue-800 transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-gradient-to-b from-blue-900 to-blue-800 text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
              {nama.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg truncate">{nama}</p>
              <span className="inline-block px-3 py-1 bg-blue-700 rounded-full text-xs font-semibold mt-1">
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-white text-blue-900 shadow-lg scale-105"
                      : "hover:bg-blue-700 hover:translate-x-1"
                  }
                `}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700">
<button
  onClick={async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // redirect ke login
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout gagal", err);
    }
  }}
  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg
    bg-red-600 hover:bg-red-700 transition-all duration-200
    hover:scale-105 shadow-lg"
>
  <span className="text-2xl">🚪</span>
  <span className="font-medium">Logout</span>
</button>
        </div>
      </aside>
    </>
  );
}