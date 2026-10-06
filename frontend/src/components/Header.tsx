import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, X, CheckCheck } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-status-critical border-status-critical/30 bg-status-critical/10';
      case 'warning':
        return 'text-status-warning border-status-warning/30 bg-status-warning/10';
      case 'success':
        return 'text-status-healthy border-status-healthy/30 bg-status-healthy/10';
      default:
        return 'text-brand-pink border-brand-primary/30 bg-brand-primary/10';
    }
  };

  return (
    <header className="h-16 bg-background-secondary border-b border-border px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search datasets, alerts..."
            className="w-full pl-11 pr-4 py-2 bg-background rounded-button border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-background-card rounded-button transition-colors"
          >
            <Bell className="w-5 h-5 text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-status-critical rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-96 bg-background-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-background-secondary">
                  <div>
                    <h3 className="font-semibold text-text-primary">Notifications</h3>
                    <p className="text-xs text-text-muted">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </p>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-brand-pink hover:text-brand-cream transition-colors flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-text-muted">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No notifications yet</p>
                      <p className="text-xs mt-1">You'll be notified about important updates</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-border hover:bg-background-secondary/50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-brand-primary/5' : ''
                        }`}
                        onClick={() => {
                          markAsRead(notification.id);
                          if (notification.link) {
                            navigate(notification.link);
                            setShowNotifications(false);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className={`w-2 h-2 rounded-full ${getNotificationColor(notification.type)}`}
                              />
                              <h4 className="font-medium text-sm text-text-primary">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-brand-pink rounded-full" />
                              )}
                            </div>
                            <p className="text-xs text-text-muted line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="p-1 hover:bg-background rounded-button text-text-muted hover:text-text-primary transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-3 py-2 bg-background-card rounded-button">
            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-brand-cream" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-text-primary">{user?.name}</div>
              <div className="text-xs text-text-muted">{user?.role}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-background-card rounded-button transition-colors text-text-secondary hover:text-status-critical"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
