import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Database,
  BarChart3,
  Settings,
  Menu,
  X,
  Zap,
  Activity,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../services/store';
import { useSystemHealth } from '../hooks/useApi';

const navItems = [
  { path: '/', icon: Zap, label: 'Dashboard', description: 'Overview & status' },
  { path: '/process', icon: FileText, label: 'Process', description: 'Upload documents' },
  { path: '/query', icon: Search, label: 'Query', description: 'Ask questions' },
  { path: '/collections', icon: Database, label: 'Collections', description: 'Manage data' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', description: 'Insights' },
  { path: '/settings', icon: Settings, label: 'Settings', description: 'Configuration' },
];

function StatusIndicator({ status }) {
  const statusColors = {
    healthy: 'bg-success-400 shadow-success-400/50',
    degraded: 'bg-warning-400 shadow-warning-400/50',
    error: 'bg-error-400 shadow-error-400/50',
  };
  
  return (
    <motion.div
      className={`w-2 h-2 rounded-full ${statusColors[status] || statusColors.error} shadow-lg`}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
}

function NavItem({ item, isActive, collapsed }) {
  const Icon = item.icon;
  
  return (
    <Link to={item.path}>
      <motion.div
        className={`
          relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
          ${isActive 
            ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20' 
            : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800/50'
          }
        `}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent-400' : ''}`} />
        
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
              <span className="text-xs text-dark-500 whitespace-nowrap">{item.description}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isActive && (
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent-400 rounded-r-full"
            layoutId="activeIndicator"
          />
        )}
      </motion.div>
    </Link>
  );
}

export default function Layout() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { health } = useSystemHealth();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const collapsed = isMobile ? false : !sidebarOpen;
  
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(sidebarOpen || !isMobile) && (
          <motion.aside
            initial={isMobile ? { x: -280 } : false}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed lg:sticky top-0 left-0 z-40 h-screen
              ${collapsed ? 'w-20' : 'w-72'}
              bg-dark-900/80 backdrop-blur-xl border-r border-dark-800
              flex flex-col transition-all duration-300
            `}
          >
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-cyan-300 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-dark-950" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-xl bg-accent-400/30 blur-lg"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h1 className="font-display font-bold text-lg gradient-text">IDP System</h1>
                    <p className="text-xs text-dark-500">v2.0 • Local AI</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  collapsed={collapsed}
                />
              ))}
            </nav>
            
            {/* System Status */}
            <div className="p-4 border-t border-dark-800">
              <div className={`
                flex items-center gap-3 p-3 rounded-xl bg-dark-800/50
                ${collapsed ? 'justify-center' : ''}
              `}>
                <StatusIndicator status={health?.status || 'error'} />
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-sm font-medium text-dark-200 capitalize">
                        {health?.status || 'Checking...'}
                      </p>
                      <p className="text-xs text-dark-500 truncate">
                        {health?.services?.qdrant === 'operational' ? 'All systems go' : 'Issues detected'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Collapse toggle (desktop) */}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 
                           bg-dark-800 border border-dark-700 rounded-full
                           flex items-center justify-center text-dark-400 hover:text-dark-100
                           transition-colors"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
      
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-30"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        {isMobile && (
          <header className="sticky top-0 z-20 bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-400" />
                <span className="font-display font-semibold gradient-text">IDP System</span>
              </div>
              
              <div className="w-9" /> {/* Spacer for centering */}
            </div>
          </header>
        )}
        
        {/* Page content */}
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
