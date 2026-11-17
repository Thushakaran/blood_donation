import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import coordinatorAvatar from '../assets/images/medical_coordinator_avatar_1794828548734.jpg';
import {
  ActivityIcon,
  AlertTriangleIcon,
  BellIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  DropletFillIcon,
  InboxIcon,
  LayoutGridIcon,
  LogOutIcon,
  MenuIcon,
  UserCheckIcon,
  UserClockIcon,
  UserIcon,
  XIcon,
} from './Icons';

const navSections = [
  {
    label: 'Clinical Operations',
    items: [
      { to: '/dashboard', label: 'Overview', icon: LayoutGridIcon, end: true },
      { to: '/dashboard/requests', label: 'Blood Requests', icon: ClipboardListIcon },
      { to: '/dashboard/stock', label: 'Blood Inventory', icon: ActivityIcon },
      { to: '/dashboard/hospitals', label: 'Hospital Details', icon: ActivityIcon },
      { to: '/dashboard/admins', label: 'Manage Admins', icon: UserIcon, superAdminOnly: true },
    ],
  },
  {
    label: 'Donor Registry',
    items: [
      { to: '/dashboard/active-donors', label: 'Active Donors', icon: UserCheckIcon, superAdminOnly: true },
      { to: '/dashboard/inactive-donors', label: 'Pending Donors', icon: UserClockIcon, superAdminOnly: true },
      { to: '/dashboard/add-donor', label: 'Add Donor', icon: UserCheckIcon, superAdminOnly: true },
    ],
  },
  {
    label: 'Communications & Account',
    items: [
      { to: '/dashboard/inbox', label: 'Inbox', icon: InboxIcon, superAdminOnly: true },
      { to: '/dashboard/profile', label: 'Profile & Settings', icon: UserIcon },
    ],
  },
];

const PAGE_TITLES = {
  '/dashboard': 'Operations Overview',
  '/dashboard/active-donors': 'Active Donors',
  '/dashboard/inactive-donors': 'Pending Donors',
  '/dashboard/requests': 'Blood Requests',
  '/dashboard/stock': 'Blood Inventory',
  '/dashboard/inbox': 'Hospital & Donor Inbox',
  '/dashboard/profile': 'Coordinator Profile',
  '/dashboard/admins': 'Hospital Admins',
  '/dashboard/hospitals': 'Hospital Management',
  '/dashboard/add-donor': 'Add Donor',
};

export default function DashboardLayout() {
  const { isAdmin, isSuperAdmin, role, hospitalName, user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    api
      .analytics()
      .then((data) => {
        if (active && Array.isArray(data?.notifications)) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isAdmin, location.pathname]);

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const pageTitle = location.pathname.startsWith('/dashboard/requests/')
    ? 'Request Details'
    : PAGE_TITLES[location.pathname] || 'Dashboard';

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.superAdminOnly) return isSuperAdmin;
        if (item.adminOnly) return role === 'ADMIN';
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white">
      <div>
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link to="/" className="flex items-center gap-2.5 text-base font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
              <DropletFillIcon className="h-4 w-4" />
            </span>
            <span className="font-display">Blood Share</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-6 px-3 py-5" aria-label="Dashboard sidebar">
          {visibleSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 text-xs font-semibold text-slate-400">{section.label}</p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
              <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-red-50 text-red-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-4">
        <Link
          to="/dashboard/profile"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50"
        >
          {avatarFailed ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-red-700">
              {(user || 'A').slice(0, 1).toUpperCase()}
            </div>
          ) : (
            <img
              src={coordinatorAvatar}
              alt="Coordinator avatar"
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{user || 'admin'}</p>
            <p className="truncate text-xs text-slate-500">{isSuperAdmin ? 'Super Admin' : hospitalName || 'Hospital Admin'}</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={logout}
          className="mt-2 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOutIcon className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">{sidebarContent}</div>
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-64 border-r border-slate-200 bg-white">
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-label="Open navigation sidebar"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <Link to="/dashboard" className="hidden text-slate-500 hover:text-slate-900 sm:inline">
                Console
              </Link>
              <ChevronRightIcon className="hidden h-4 w-4 text-slate-400 sm:inline" />
              <span className="truncate font-semibold text-slate-900">{pageTitle}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                aria-label="View clinical notifications"
                aria-expanded={notifOpen}
              >
                <BellIcon className="h-4 w-4 text-slate-600" />
                <span className="hidden sm:inline">Alerts</span>
                {notifications.length > 0 ? (
                  <span className="font-mono text-xs font-semibold text-red-600 tabular-nums">
                    {notifications.length}
                  </span>
                ) : null}
              </button>

              {notifOpen ? (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg sm:w-96">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <p className="text-sm font-semibold text-slate-900">Clinical Alerts</p>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-slate-500 hover:text-slate-900"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-2 max-h-80 space-y-1.5 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-sm text-slate-500">All hospital inventories and queues are nominal.</p>
                    ) : (
                      notifications.map((note) => (
                        <Link
                          key={note.id}
                          to={note.to}
                          onClick={() => setNotifOpen(false)}
                          className="flex items-start gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-slate-50"
                        >
                          <AlertTriangleIcon
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              note.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900">{note.title}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{note.detail}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <Link
              to="/"
              className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Public Portal
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
