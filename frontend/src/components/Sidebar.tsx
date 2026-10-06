import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  Database,
  CheckCircle,
  AlertTriangle,
  GitCompare,
  TrendingUp,
  Cpu,
  Target,
  Bell,
  FileText,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/datasets', icon: Database, label: 'Datasets' },
  { to: '/quality', icon: CheckCircle, label: 'Data Quality' },
  { to: '/anomalies', icon: AlertTriangle, label: 'Anomalies' },
  { to: '/drift', icon: GitCompare, label: 'Drift' },
  { to: '/reliability', icon: TrendingUp, label: 'Reliability' },
  { to: '/models', icon: Cpu, label: 'Models' },
  { to: '/model-impact', icon: Target, label: 'Model Impact' },
  { to: '/decision-impact', icon: Target, label: 'Decision Impact' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

export function Sidebar() {
  return (
    <aside className="w-72 bg-background-secondary border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/30 rounded-button">
            <Shield className="w-6 h-6 text-brand-pink" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">DataSentry-AI</h1>
            <p className="text-xs text-text-muted">Trust Your Data</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="space-y-1">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-button transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-primary text-text-primary'
                    : 'text-text-secondary hover:bg-background-card hover:text-text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div
                  className="flex items-center gap-3 w-full"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-cream' : 'text-brand-muted'}`} />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-button transition-all duration-200 ${
              isActive
                ? 'bg-brand-primary text-text-primary'
                : 'text-text-secondary hover:bg-background-card hover:text-text-primary'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
