import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Satellite, Activity } from "lucide-react";

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <header className="h-12 border-b border-border bg-background flex items-center px-6 flex-shrink-0">
        <div className="flex items-center gap-2 mr-8">
          <Satellite className="w-4 h-4" />
          <span className="font-semibold text-sm tracking-tight">JonaAI</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground ml-1">Geospatial Intelligence</span>
        </div>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => navigate("/")}
            className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
              location.pathname === "/" ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
            Portfolio
          </button>
          {location.pathname.startsWith("/asset") && (
            <span className="px-3 py-1.5 text-sm bg-accent rounded-sm">
              <Activity className="w-3.5 h-3.5 inline mr-1.5" />
              Asset Briefing
            </span>
          )}
          {location.pathname.startsWith("/evidence") && (
            <span className="px-3 py-1.5 text-sm bg-accent rounded-sm">
              Evidence Explorer
            </span>
          )}
        </nav>
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
