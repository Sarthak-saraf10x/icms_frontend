import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Basic mock data. Real implementation would fetch this from context/auth state
  const user = {
    name: 'Sarah Jenkins',
    role: 'Policy Holder',
    avatar: 'SJ'
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Policies', path: '/policies', icon: ShieldCheck },
    { name: 'Claims', path: '/claims', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f8faf3] text-[#191c18] font-sans selection:bg-[#d9e7cd] selection:text-[#131e0e]">
      
      {/* Mobile Navigation Bar */}
      <div className="lg:hidden flex items-center justify-between bg-[#f2f4ed] p-4 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-[#55624d]">
          <ShieldCheck className="h-6 w-6" />
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>VEHICO</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="text-[#444841] hover:text-[#191c18] transition-colors p-2"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#f2f4ed] transform transition-transform duration-400 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Mobile close button */}
        <div className="lg:hidden absolute top-4 right-4">
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-[#444841] hover:text-[#191c18]">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 text-[#55624d] mb-12">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#ffffff] shadow-[0_4px_20px_rgba(85,98,77,0.06)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>VEHICO</span>
          </Link>

          <nav className="space-y-4">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-[#ffffff] text-[#55624d] shadow-[0_8px_30px_rgba(85,98,77,0.08)]' 
                      : 'text-[#444841] hover:bg-[#ecefe8] hover:text-[#191c18]'
                    }
                  `}
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[#55624d]' : 'text-[#757870]'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8">
          <div className="bg-[#ffffff] rounded-xl p-4 shadow-[0_4px_20px_rgba(85,98,77,0.05)] mb-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#d9e7cd] text-[#131e0e] flex items-center justify-center font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {user.avatar}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-[#191c18] truncate" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{user.name}</p>
              <p className="text-xs text-[#757870] truncate">{user.role}</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-[#755754] hover:bg-[#fed7d2] hover:text-[#2b1614] transition-all duration-300 font-medium"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="hidden lg:flex items-center justify-between px-10 py-6 bg-[#f8faf3]">
          <div>
            <h1 className="text-3xl font-bold text-[#191c18]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Welcome back
            </h1>
            <p className="text-[#444841] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Here's what's happening with your policies today.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-[#444841] hover:text-[#191c18] transition-colors rounded-xl hover:bg-[#f2f4ed]">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#fed7d2] border-2 border-[#f8faf3] rounded-full"></span>
            </button>
            <Link to="/settings" className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-[#d9e7cd] text-[#131e0e] flex items-center justify-center font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>
                SJ
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 lg:py-4">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#191c18] bg-opacity-20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default MainLayout;
