import { useState } from "react";
import { NavLink, useNavigate, useLocation, Outlet } from "react-router";
import { Menu, X, Bell, User, LogOut, Settings, Home, BarChart2, Users, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-46" : "w-16"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <h2 className={cn("font-semibold text-lg", !sidebarOpen && "hidden")}>Dashboard</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-sidebar-accent"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-2 space-y-1">
          <NavItem to="/dashboard" icon={<Home size={20} />} label="Dashboard" sidebarOpen={sidebarOpen} />
          <NavItem to="/analytics" icon={<BarChart2 size={20} />} label="Analytics" sidebarOpen={sidebarOpen} />
          <NavItem to="/customers" icon={<Users size={20} />} label="Customers" sidebarOpen={sidebarOpen} />
          <NavItem to="/reports" icon={<FileText size={20} />} label="Reports" sidebarOpen={sidebarOpen} />
          <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" sidebarOpen={sidebarOpen} />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <h1 className="font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-accent">
              <Bell size={20} />
            </button>
            <div className="relative group">
              <div className="flex items-center space-x-2 border-l border-border pl-4 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary-foreground flex items-center justify-center">
                  <User size={18} className="text-primary" />
                </div>
                <span className="font-medium">{user?.name || "User"}</span>
              </div>

              <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg border border-border hidden group-hover:block z-10">
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, sidebarOpen }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center space-x-3 p-3 rounded-md transition-colors",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <div>{icon}</div>
      {sidebarOpen && <span>{label}</span>}
    </NavLink>
  );
}