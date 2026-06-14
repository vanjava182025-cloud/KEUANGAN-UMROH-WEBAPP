import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  PlaneTakeoff,
  Users,
  Wallet,
  Receipt,
  FileText,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  User,
  Sparkles
} from 'lucide-react';

export default function AppLayout({ children }) {
  const { user, logout, canAccessPath } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Menu items list with icons, paths and titles
  const allMenuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Grup Keberangkatan', path: '/grup', icon: PlaneTakeoff },
    { title: 'Pengeluaran', path: '/pengeluaran', icon: Receipt },
    { title: 'Kas Besar', path: '/kas-besar', icon: Wallet },
    { title: 'Laporan Keuangan', path: '/laporan', icon: FileText },
    { title: 'Laporan Harian', path: '/laporan-harian', icon: FileText },
    { title: 'Audit Log', path: '/audit-log', icon: History },
    { title: 'Pengaturan', path: '/pengaturan', icon: Settings },
  ];

  // Filter menu items by RBAC permissions
  const menuItems = allMenuItems.filter(item => canAccessPath(item.path));

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-slate-100 transition-all duration-300 relative z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold font-serif text-sm">
                EH
              </div>
              <div>
                <span className="font-bold tracking-tight text-slate-800 text-sm block">ELHAKIM UMROH HAJI</span>
                <span className="text-[9px] text-primary uppercase font-bold tracking-wider block -mt-0.5">Finance System</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold font-serif text-sm mx-auto">
              EH
            </div>
          )}
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User Quick Info */}
        <div className={`p-4 border-b border-slate-100/60 ${collapsed ? 'text-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold border border-slate-200 shrink-0">
              {user?.name?.charAt(0) || <User size={18} />}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                <div className="inline-flex items-center gap-1 bg-red-50 text-primary border border-red-100 px-1.5 py-0.5 rounded-full text-[9px] font-bold mt-0.5">
                  <Sparkles size={8} className="fill-primary" />
                  <span>{user?.role}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white font-medium shadow-md shadow-primary/20 hover:bg-primary-hover'
                    : 'text-slate-600 hover:text-primary hover:bg-red-50/40'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-all ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* 2. Mobile Drawer Navigation */}
      <div className={`md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
        mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`} onClick={() => setMobileOpen(false)}>
        <aside
          className={`w-64 max-w-xs h-full bg-white flex flex-col shadow-2xl transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold font-serif text-sm">
                EH
              </div>
              <span className="font-bold tracking-tight text-slate-800 text-sm">ELHAKIM UMROH HAJI</span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="text-slate-400 p-1 hover:bg-slate-50 rounded-md">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 border-b border-slate-100/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold border border-slate-200">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <span className="inline-block bg-red-50 text-primary border border-red-100 px-2 py-0.5 rounded-full text-[9px] font-bold mt-0.5">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" onClick={() => setMobileOpen(false)}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white font-medium shadow-md shadow-primary/20'
                      : 'text-slate-600 hover:text-primary hover:bg-red-50/40'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </div>
        </aside>
      </div>

      {/* 3. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-50"
            >
              <Menu size={20} />
            </button>
            
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Sistem Keuangan</span>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-xs font-semibold text-slate-700 capitalize">
                {location.pathname.split('/')[1]?.replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Logo image if present */}
            <img
              src="/logo lanscape copy.png"
              alt="Logo Elhakim"
              className="h-8 max-w-[150px] object-contain"
              onError={(e) => {
                e.target.style.display = 'none'; // hide if file load fails
              }}
            />
            
            <div className="border-l border-slate-200 pl-3 hidden sm:block">
              <span className="text-xs text-slate-500 font-medium">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
