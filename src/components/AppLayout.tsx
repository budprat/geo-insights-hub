import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3, Satellite, Activity, GitBranch, Calculator,
  FlaskConical, Users, Store, Radio, Orbit,
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  group: "operations" | "tools";
  exact?: boolean;
}

const navItems: NavItem[] = [
  { path: "/", label: "Portfolio", icon: BarChart3, group: "operations", exact: true },
  { path: "/monitoring", label: "Monitoring", icon: Radio, group: "operations" },
  { path: "/satellites", label: "Satellites", icon: Orbit, group: "operations" },
  { path: "/workflows", label: "Workflows", icon: GitBranch, group: "tools" },
  { path: "/roi", label: "ROI", icon: Calculator, group: "tools" },
  { path: "/scenarios", label: "Scenarios", icon: FlaskConical, group: "tools" },
  { path: "/marketplace", label: "Marketplace", icon: Store, group: "tools" },
  { path: "/community", label: "Community", icon: Users, group: "tools" },
];

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (item: NavItem) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const operations = navItems.filter((n) => n.group === "operations");
  const tools = navItems.filter((n) => n.group === "tools");

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <header className="h-12 border-b border-border bg-background flex items-center px-6 flex-shrink-0">
        <div className="flex items-center gap-2 mr-6">
          <Satellite className="w-4 h-4" />
          <span className="font-semibold text-sm tracking-tight">JonaAI</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground ml-1">Geospatial Intelligence</span>
        </div>

        {/* Operations group */}
        <nav className="flex items-center gap-0.5">
          {operations.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-2.5 py-1.5 text-xs rounded-sm transition-colors flex items-center gap-1.5 ${
                  active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="w-px h-4 bg-border mx-2" />

        {/* Tools group */}
        <nav className="flex items-center gap-0.5">
          {tools.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-2.5 py-1.5 text-xs rounded-sm transition-colors flex items-center gap-1.5 ${
                  active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Breadcrumb for detail pages */}
        {location.pathname.startsWith("/asset") && (
          <span className="ml-2 px-2.5 py-1.5 text-xs bg-accent rounded-sm flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Asset Briefing
          </span>
        )}
        {location.pathname.startsWith("/evidence") && (
          <span className="ml-2 px-2.5 py-1.5 text-xs bg-accent rounded-sm">
            Evidence Explorer
          </span>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Last sync: 12 min ago
          </span>
          <div className="w-2 h-2 rounded-full bg-status-good" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
