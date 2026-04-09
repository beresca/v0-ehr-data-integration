'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty } from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import type { TransfusionCase, FormType, CaseStatus } from '@/lib/types/registry'
import { 
  Plus, 
  Search, 
  Filter,
  Droplet, 
  Baby, 
  AlertCircle, 
  Building2,
  Clock,
  FileCheck,
  CheckCircle,
  Send,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  LogOut,
  User,
  FileText,
  TrendingUp
} from 'lucide-react'

interface DashboardContentProps {
  cases: TransfusionCase[]
  stats: {
    total: number
    drafts: number
    pendingReview: number
    completed: number
  }
  userEmail: string
}

const FORM_TYPE_CONFIG: Record<FormType, { label: string; icon: typeof Droplet; color: string }> = {
  adult_pi: { label: 'Adult PI', icon: Droplet, color: 'text-chart-1' },
  pediatric_pi: { label: 'Pediatric PI', icon: Baby, color: 'text-chart-4' },
  emergency_release: { label: 'Emergency Release', icon: AlertCircle, color: 'text-destructive' },
  blood_bank: { label: 'Blood Bank', icon: Building2, color: 'text-chart-2' },
}

const STATUS_CONFIG: Record<CaseStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Clock }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: Clock },
  pending_review: { label: 'Pending Review', variant: 'outline', icon: FileCheck },
  completed: { label: 'Completed', variant: 'default', icon: CheckCircle },
  submitted_to_rac: { label: 'Submitted to RAC', variant: 'default', icon: Send },
}

export function DashboardContent({ cases, stats, userEmail }: DashboardContentProps) {
  const router = useRouter()
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all')
  const [formTypeFilter, setFormTypeFilter] = useState<FormType | 'all'>('all')

  // Filter cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.case_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patient_mrn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.agency?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    const matchesFormType = formTypeFilter === 'all' || c.form_type === formTypeFilter

    return matchesSearch && matchesStatus && matchesFormType
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Droplet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Transfusion Registry</h1>
                <p className="text-xs text-muted-foreground">Prehospital Blood Transfusion Documentation</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild className="gap-2 bg-destructive hover:bg-destructive/90">
                <Link href="/document">
                  <Droplet className="h-4 w-4" />
                  Quick Document
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Case
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Select Form Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/forms/adult-pi" className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-chart-1" />
                      Adult PI Form
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/forms/pediatric-pi" className="flex items-center gap-2">
                      <Baby className="h-4 w-4 text-chart-4" />
                      Pediatric PI Form
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/forms/emergency-release" className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      Emergency Release
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/forms/blood-bank" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-chart-2" />
                      Blood Bank Follow-up
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cases</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-3xl font-bold">{stats.drafts}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold">{stats.pendingReview}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cases Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Case Registry</CardTitle>
                <CardDescription>
                  View and manage all transfusion documentation cases
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CaseStatus | 'all')}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="submitted_to_rac">Submitted to RAC</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={formTypeFilter} onValueChange={(v) => setFormTypeFilter(v as FormType | 'all')}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Form Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Form Types</SelectItem>
                    <SelectItem value="adult_pi">Adult PI</SelectItem>
                    <SelectItem value="pediatric_pi">Pediatric PI</SelectItem>
                    <SelectItem value="emergency_release">Emergency Release</SelectItem>
                    <SelectItem value="blood_bank">Blood Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCases.length === 0 ? (
              <Empty
                icon={FileText}
                title="No cases found"
                description={
                  cases.length === 0
                    ? "You haven't created any cases yet. Click 'New Case' to get started."
                    : "No cases match your current filters. Try adjusting your search or filters."
                }
                action={
                  cases.length === 0 ? (
                    <Button asChild>
                      <Link href="/forms/adult-pi">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Case
                      </Link>
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Form Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((c) => {
                    const formConfig = FORM_TYPE_CONFIG[c.form_type]
                    const statusConfig = STATUS_CONFIG[c.status]
                    const FormIcon = formConfig.icon
                    const StatusIcon = statusConfig.icon

                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Link 
                            href={`/cases/${c.id}`}
                            className="font-mono text-sm hover:underline"
                          >
                            {c.case_number}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FormIcon className={cn('h-4 w-4', formConfig.color)} />
                            <span className="text-sm">{formConfig.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {c.patient_mrn ? (
                              <span className="font-mono">{c.patient_mrn}</span>
                            ) : (
                              <span className="text-muted-foreground">No MRN</span>
                            )}
                            {c.age && (
                              <span className="text-muted-foreground ml-2">
                                ({c.age}y {c.gender || ''})
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(c.event_date)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(c.created_at)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/cases/${c.id}`} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              {c.status === 'draft' && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/cases/${c.id}/edit`} className="flex items-center gap-2">
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
