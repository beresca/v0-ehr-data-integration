'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Droplet,
  Activity,
  FileText,
  ClipboardCheck,
  LayoutDashboard,
  Database,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react'

const NOTIFICATIONS = [
  {
    id: 1,
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    title: 'Outcome review overdue',
    body: 'P-2026-0892 — hospital outcome not yet documented. Case is 3 days old.',
    time: '2h ago',
    unread: true,
  },
  {
    id: 2,
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    title: 'EHR data pulled successfully',
    body: 'Admission labs for P-2026-0845 synced from Tampa General Hospital.',
    time: '4h ago',
    unread: true,
  },
  {
    id: 3,
    icon: Clock,
    iconColor: 'text-blue-500',
    title: 'New case assigned for review',
    body: 'P-2026-0801 — Hillsborough County FR. Awaiting PI review sign-off.',
    time: 'Yesterday',
    unread: true,
  },
]

const navItems = [
  { href: '/', label: 'Field Documentation', icon: FileText },
  { href: '/outcomes', label: 'Outcome Review', icon: ClipboardCheck },
  { href: '/dashboard', label: 'PI Review', icon: LayoutDashboard },
  { href: '/registry', label: 'Program Analytics', icon: Database },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Droplet className="h-5 w-5 text-accent-foreground" />
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-semibold tracking-tight">BloodTrack</span>
              <Activity className="h-4 w-4 text-accent" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>

        {/* User */}
        <div className="border-t border-sidebar-border p-3">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <Avatar className="h-9 w-9 border border-sidebar-border">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                AB
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">Alison Bereschak</span>
                <span className="text-xs text-sidebar-foreground/60">Program Director</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <h1 className="text-lg font-semibold text-foreground">
            {navItems.find((item) => item.href === pathname)?.label || 'BloodTrack'}
          </h1>
          <div className="flex items-center gap-2">
  <div className="relative">
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => setNotifOpen(prev => !prev)}
    >
      <Bell className="h-5 w-5 text-muted-foreground" />
      {unreadCount > 0 && (
        <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-accent p-0 text-[10px] text-accent-foreground">
          {unreadCount}
        </Badge>
      )}
    </Button>

    {notifOpen && (
      <>
        {/* backdrop */}
        <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
        {/* dropdown */}
        <div className="absolute right-0 top-10 z-50 w-80 rounded-lg border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="divide-y">
            {notifications.map((n) => {
              const Icon = n.icon
              return (
                <div
                  key={n.id}
                  className={cn(
                    'flex gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors',
                    n.unread && 'bg-blue-50/50'
                  )}
                  onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}
                >
                  <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', n.iconColor)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('text-sm', n.unread ? 'font-semibold' : 'font-medium')}>{n.title}</p>
                      {n.unread && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{n.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </>
    )}
  </div>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  )
}
