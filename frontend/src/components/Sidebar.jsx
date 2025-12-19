import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Award, 
  User, 
  Settings,
  PlusCircle,
  BarChart,
  Heart,
  History,
  FileText,
  DollarSign,
  Users,
  FolderTree,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { cn } from '../lib/utils';

export const Sidebar = () => {
  const { user, isInstructor } = useAuth();
  const location = useLocation();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const studentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'Browse Courses' },
    { to: '/my-learning', icon: GraduationCap, label: 'My Learning' },
    { to: '/quiz-history', icon: History, label: 'Quiz History' },
    { to: '/grades', icon: FileText, label: 'Assignment Grades' },
    { to: '/certificates', icon: Award, label: 'Certificates' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const instructorLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-courses', icon: BookOpen, label: 'My Courses' },
    { to: '/create-course', icon: PlusCircle, label: 'Create Course' },
    { to: '/analytics', icon: BarChart, label: 'Analytics' },
    { to: '/instructor/earnings', icon: DollarSign, label: 'Earnings' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: Shield, label: 'Admin Dashboard' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
    { to: '/courses', icon: BookOpen, label: 'All Courses' },
    { to: '/analytics', icon: BarChart, label: 'Analytics' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const links = user?.role === 'admin' ? adminLinks : (isInstructor ? instructorLinks : studentLinks);

  return (
    <>
      <aside 
        className={cn(
          "fixed left-0 border-r bg-gradient-to-b from-white to-slate-50 overflow-y-auto transition-all duration-300 shadow-lg z-40",
          isCollapsed ? "w-20" : "w-64"
        )}
        style={{ 
          top: '5rem',
          height: 'calc(100vh - 4rem)',
          maxHeight: 'calc(100vh - 6rem)' 
        }}
      >
        <nav className="flex flex-col gap-1 p-3">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? link.label : undefined}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform group-hover:scale-110",
                isCollapsed ? "mx-auto" : ""
              )} />
              {!isCollapsed && (
                <span className="transition-opacity duration-200">
                  {link.label}
                </span>
              )}
              
              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-lg z-50">
                  {link.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>
      </aside>
      
      {/* Toggle Button - Aligned with Dashboard */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "fixed bg-gradient-to-r from-primary to-blue-600 text-white rounded-full p-2.5 shadow-xl hover:shadow-2xl transition-all hover:scale-110 active:scale-95 z-50 border-4 border-white group",
          isCollapsed ? "left-16" : "left-60"
        )}
        style={{ top: '6.5rem' }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
        ) : (
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
        )}
      </button>
    </>
  );
};
