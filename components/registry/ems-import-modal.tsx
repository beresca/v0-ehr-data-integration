'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { searchEmsRuns, getEmsRunById } from '@/lib/mock/imagetrend-data'
import type { ImageTrendData } from '@/lib/types/registry'
import { 
  Search, 
  Ambulance, 
  Calendar, 
  User, 
  Heart, 
  Building, 
  Droplet,
  ArrowRight,
  Check,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface EmsImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: ImageTrendData) => void
}

export function EmsImportModal({
  open,
  onOpenChange,
  onImport,
}: EmsImportModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ImageTrendData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedRun, setSelectedRun] = useState<ImageTrendData | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Search EMS runs
  useEffect(() => {
    const searchRuns = async () => {
      setIsSearching(true)
      const results = await searchEmsRuns(searchQuery)
      setSearchResults(results)
      setIsSearching(false)
    }

    const debounce = setTimeout(searchRuns, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  // Load run details
  const handleSelectRun = async (runId: string) => {
    setIsLoadingDetails(true)
    const data = await getEmsRunById(runId)
    setSelectedRun(data)
    setIsLoadingDetails(false)
  }

  // Format date for display
  const formatDate = (date: string, time?: string) => {
    const d = new Date(`${date}T${time || '00:00:00'}`)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Handle import
  const handleImport = () => {
    if (selectedRun) {
      onImport(selectedRun)
      setSelectedRun(null)
      setSearchQuery('')
    }
  }

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedRun(null)
      setSearchQuery('')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ems-badge/20">
              <Ambulance className="h-5 w-5 text-ems-badge-foreground" />
            </div>
            <div>
              <DialogTitle>Import from ImageTrend Elite</DialogTitle>
              <DialogDescription>
                Search and import EMS run data to auto-populate the form
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Search Panel */}
          <div className="w-96 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Run ID, Agency, or Unit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="mr-2" />
                    <span className="text-sm text-muted-foreground">Searching...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No EMS runs found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((run) => (
                      <button
                        key={run.run_id}
                        type="button"
                        onClick={() => handleSelectRun(run.run_id)}
                        className={cn(
                          'w-full p-3 rounded-lg text-left transition-colors',
                          selectedRun?.run_id === run.run_id
                            ? 'bg-primary/10 border border-primary'
                            : 'hover:bg-muted border border-transparent'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-mono font-medium text-sm truncate">
                              {run.run_id}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {run.agency_name}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {run.unit_id}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(run.incident_date, run.incident_time)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Details Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {isLoadingDetails ? (
              <div className="flex-1 flex items-center justify-center">
                <Spinner className="mr-2" />
                <span className="text-muted-foreground">Loading run details...</span>
              </div>
            ) : selectedRun ? (
              <>
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    {/* Run Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold font-mono">{selectedRun.run_id}</h3>
                        <p className="text-sm text-muted-foreground">{selectedRun.agency_name}</p>
                      </div>
                      <Badge className="bg-ems-badge text-ems-badge-foreground">
                        <Ambulance className="h-3 w-3 mr-1" />
                        {selectedRun.unit_id}
                      </Badge>
                    </div>

                    <Separator />

                    {/* Patient Info */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Patient Information
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Age</p>
                          <p className="font-medium">{selectedRun.patient.age || 'Unknown'} years</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Gender</p>
                          <p className="font-medium">
                            {selectedRun.patient.gender === 'M' ? 'Male' : 
                             selectedRun.patient.gender === 'F' ? 'Female' : 'Unknown'}
                          </p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Blood Type</p>
                          <p className="font-medium">{selectedRun.patient.blood_type || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Vitals */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Vital Signs
                      </h4>
                      <div className="space-y-2">
                        {selectedRun.vitals.map((vital, idx) => (
                          <div 
                            key={idx}
                            className={cn(
                              'grid grid-cols-6 gap-2 p-3 rounded-lg border',
                              idx === 0 && 'bg-primary/5 border-primary/30'
                            )}
                          >
                            <div className="col-span-2">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(vital.timestamp).toLocaleTimeString()}
                              </p>
                              {idx === 0 && (
                                <Badge variant="outline" className="text-[10px] mt-1">First Set</Badge>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">SBP</p>
                              <p className={cn(
                                'font-mono font-medium',
                                vital.sbp && vital.sbp < 90 && 'text-destructive'
                              )}>
                                {vital.sbp || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">HR</p>
                              <p className={cn(
                                'font-mono font-medium',
                                vital.hr && vital.hr > 120 && 'text-destructive'
                              )}>
                                {vital.hr || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">RR</p>
                              <p className="font-mono font-medium">{vital.rr || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">ETCO2</p>
                              <p className={cn(
                                'font-mono font-medium',
                                vital.etco2 && vital.etco2 < 25 && 'text-destructive'
                              )}>
                                {vital.etco2 || '—'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assessments */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Clinical Assessments
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRun.assessments.altered_mental_status && (
                          <Badge variant="outline" className="gap-1">
                            <AlertTriangle className="h-3 w-3 text-warning" />
                            Altered Mental Status
                          </Badge>
                        )}
                        {selectedRun.assessments.pale_skin && (
                          <Badge variant="outline" className="gap-1">
                            <AlertTriangle className="h-3 w-3 text-warning" />
                            Pale Skin
                          </Badge>
                        )}
                        {selectedRun.assessments.capillary_refill_delayed && (
                          <Badge variant="outline" className="gap-1">
                            <AlertTriangle className="h-3 w-3 text-warning" />
                            {"Delayed Cap Refill"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Destination */}
                    {selectedRun.destination && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Destination
                        </h4>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="font-medium">{selectedRun.destination.facility_name}</p>
                          <p className="text-xs text-muted-foreground">{selectedRun.destination.facility_code}</p>
                        </div>
                      </div>
                    )}

                    {/* Transfusion */}
                    {selectedRun.transfusion && selectedRun.transfusion.products_given.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <Droplet className="h-4 w-4" />
                          Blood Products Administered
                        </h4>
                        <div className="space-y-2">
                          {selectedRun.transfusion.products_given.map((product, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                              <div>
                                <Badge variant="destructive" className="mb-1">{product.product_type}</Badge>
                                <p className="text-xs text-muted-foreground font-mono">{product.unit_id}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{product.volume_ml} mL</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(product.start_time).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {selectedRun.transfusion.indication && (
                          <p className="text-sm text-muted-foreground mt-3">
                            <strong>Indication:</strong> {selectedRun.transfusion.indication}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Import Footer */}
                <div className="p-4 border-t bg-muted/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Import this run data to auto-populate the form
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => setSelectedRun(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleImport} className="gap-2">
                        <Check className="h-4 w-4" />
                        Import Data
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg">Select an EMS Run</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Search for and select an EMS run from the list to view details and import data
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
