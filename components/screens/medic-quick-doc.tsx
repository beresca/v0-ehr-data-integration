'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Droplet, 
  Scan, 
  Check, 
  Minus, 
  Plus,
  Snowflake,
  AlertTriangle,
  Send
} from 'lucide-react'

type ProductType = 'LTOWB' | 'pRBC' | 'Plasma' | 'Platelets' | null
type Indication = 'trauma' | 'gi-bleed' | 'obstetric' | 'medical' | null

// Preset ranges for quick tap selection
const SBP_RANGES = [
  { label: '<70', value: 65, met: true },
  { label: '70-89', value: 80, met: true },
  { label: '90-99', value: 95, met: false },
  { label: '100+', value: 110, met: false },
]

const HR_RANGES = [
  { label: '<80', value: 75, met: false },
  { label: '80-99', value: 90, met: false },
  { label: '100-119', value: 110, met: true },
  { label: '120+', value: 130, met: true },
]

export function MedicQuickDoc() {
  const [productType, setProductType] = useState<ProductType>(null)
  const [indication, setIndication] = useState<Indication>(null)
  const [unitCount, setUnitCount] = useState(1)
  const [sbpRange, setSbpRange] = useState<number | null>(null)
  const [hrRange, setHrRange] = useState<number | null>(null)
  const [coldChain, setColdChain] = useState(true)
  const [alteredMental, setAlteredMental] = useState(false)
  const [scannedBarcode, setScannedBarcode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Calculate shock index
  const shockIndex = sbpRange && hrRange ? (hrRange / sbpRange).toFixed(1) : null
  const shockIndexMet = shockIndex ? parseFloat(shockIndex) > 0.9 : false

  // Count criteria met
  const criteriaMet = [
    sbpRange !== null && sbpRange < 90,
    hrRange !== null && hrRange > 100,
    shockIndexMet,
    alteredMental,
  ].filter(Boolean).length

  // Check if form is complete enough to submit
  const canSubmit = productType !== null && indication !== null && (sbpRange !== null || hrRange !== null)

  const handleSubmit = async () => {
    setSubmitting(true)
    // Simulate submission
    await new Promise(r => setTimeout(r, 1000))
    setSubmitting(false)
    alert('Submitted! Case created.')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 border-b bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplet className="h-6 w-6" />
            <span className="text-lg font-bold">BloodTrack</span>
          </div>
          <div className="flex items-center gap-3">
            {shockIndex && (
              <Badge 
                variant="outline" 
                className={cn(
                  "border-primary-foreground/30 text-sm font-mono",
                  shockIndexMet ? "bg-destructive border-destructive" : "bg-primary-foreground/10"
                )}
              >
                SI: {shockIndex}
              </Badge>
            )}
            <Badge variant="outline" className="border-primary-foreground/30 bg-primary-foreground/10">
              {criteriaMet}/4 criteria
            </Badge>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-auto p-4 pb-28">
        <div className="mx-auto max-w-2xl space-y-6">
          
          {/* Blood Product Type - Large tap targets */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Product Type
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'LTOWB', label: 'LTOWB', desc: 'Low-Titer O Whole Blood' },
                { type: 'pRBC', label: 'pRBCs', desc: 'Packed Red Blood Cells' },
                { type: 'Plasma', label: 'Plasma', desc: 'Liquid or Dried' },
                { type: 'Platelets', label: 'Platelets', desc: 'Platelet Concentrate' },
              ].map((p) => (
                <button
                  key={p.type}
                  type="button"
                  onClick={() => setProductType(p.type as ProductType)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all active:scale-[0.98]",
                    "min-h-[88px]",
                    productType === p.type
                      ? "border-primary bg-primary text-primary-foreground shadow-lg"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <span className="text-lg font-bold">{p.label}</span>
                  <span className={cn(
                    "text-xs",
                    productType === p.type ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>{p.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Unit Count */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Units
            </h2>
            <div className="flex items-center justify-center gap-4 rounded-xl border bg-card p-4">
              <button
                type="button"
                onClick={() => setUnitCount(Math.max(1, unitCount - 1))}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-muted text-xl font-bold transition-all active:scale-95 active:bg-muted/80"
                disabled={unitCount <= 1}
              >
                <Minus className="h-6 w-6" />
              </button>
              <span className="w-20 text-center text-5xl font-bold tabular-nums">{unitCount}</span>
              <button
                type="button"
                onClick={() => setUnitCount(Math.min(6, unitCount + 1))}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-primary text-xl font-bold text-primary-foreground transition-all active:scale-95 active:bg-primary/90"
                disabled={unitCount >= 6}
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>
          </section>

          {/* Barcode Scanner */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Unit ID
            </h2>
            <button
              type="button"
              onClick={() => {
                // In production this would trigger device camera/scanner
                setScannedBarcode('W' + Math.random().toString().slice(2, 10))
              }}
              className={cn(
                "flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-all active:scale-[0.99]",
                scannedBarcode
                  ? "border-success bg-success/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              {scannedBarcode ? (
                <>
                  <Check className="h-6 w-6 text-success" />
                  <span className="font-mono text-lg font-semibold">{scannedBarcode}</span>
                </>
              ) : (
                <>
                  <Scan className="h-6 w-6 text-muted-foreground" />
                  <span className="text-muted-foreground">Tap to scan barcode</span>
                </>
              )}
            </button>
          </section>

          {/* Indication - Large tap targets */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Indication
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'trauma', label: 'Trauma', color: 'destructive' },
                { type: 'gi-bleed', label: 'GI Bleed', color: 'warning' },
                { type: 'obstetric', label: 'Obstetric', color: 'accent' },
                { type: 'medical', label: 'Medical/Other', color: 'muted' },
              ].map((i) => (
                <button
                  key={i.type}
                  type="button"
                  onClick={() => setIndication(i.type as Indication)}
                  className={cn(
                    "flex items-center justify-center rounded-xl border-2 p-4 text-lg font-semibold transition-all active:scale-[0.98]",
                    "min-h-[64px]",
                    indication === i.type
                      ? "border-primary bg-primary text-primary-foreground shadow-lg"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </section>

          {/* Vitals - Range selectors instead of number inputs */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Vitals
            </h2>
            <div className="space-y-4">
              {/* SBP */}
              <div className="rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold">SBP</span>
                  <Badge variant={sbpRange !== null && sbpRange < 90 ? "default" : "secondary"} className={cn(
                    sbpRange !== null && sbpRange < 90 && "bg-success"
                  )}>
                    {sbpRange !== null ? (sbpRange < 90 ? 'Met (<90)' : 'Not Met') : '—'}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {SBP_RANGES.map((range) => (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => setSbpRange(range.value)}
                      className={cn(
                        "rounded-lg border-2 py-3 text-center font-mono text-lg font-semibold transition-all active:scale-95",
                        sbpRange === range.value
                          ? range.met
                            ? "border-success bg-success text-success-foreground"
                            : "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* HR */}
              <div className="rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold">HR</span>
                  <Badge variant={hrRange !== null && hrRange > 100 ? "default" : "secondary"} className={cn(
                    hrRange !== null && hrRange > 100 && "bg-success"
                  )}>
                    {hrRange !== null ? (hrRange > 100 ? 'Met (>100)' : 'Not Met') : '—'}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {HR_RANGES.map((range) => (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => setHrRange(range.value)}
                      className={cn(
                        "rounded-lg border-2 py-3 text-center font-mono text-lg font-semibold transition-all active:scale-95",
                        hrRange === range.value
                          ? range.met
                            ? "border-success bg-success text-success-foreground"
                            : "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Altered Mental Status */}
              <button
                type="button"
                onClick={() => setAlteredMental(!alteredMental)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all active:scale-[0.99]",
                  alteredMental
                    ? "border-success bg-success/10"
                    : "border-border bg-card"
                )}
              >
                <span className="font-semibold">Altered Mental Status</span>
                <div className={cn(
                  "flex h-8 w-14 items-center rounded-full p-1 transition-colors",
                  alteredMental ? "bg-success" : "bg-muted"
                )}>
                  <div className={cn(
                    "h-6 w-6 rounded-full bg-white shadow transition-transform",
                    alteredMental && "translate-x-6"
                  )} />
                </div>
              </button>
            </div>
          </section>

          {/* Cold Chain Toggle */}
          <section>
            <button
              type="button"
              onClick={() => setColdChain(!coldChain)}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl border-2 p-4 transition-all active:scale-[0.99]",
                coldChain
                  ? "border-primary bg-primary/5"
                  : "border-destructive bg-destructive/10"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                coldChain ? "bg-primary/20" : "bg-destructive/20"
              )}>
                {coldChain ? (
                  <Snowflake className="h-6 w-6 text-primary" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Cold Chain</p>
                <p className={cn(
                  "text-sm",
                  coldChain ? "text-muted-foreground" : "text-destructive"
                )}>
                  {coldChain ? 'Confirmed - product maintained at temp' : 'NOT confirmed - document reason'}
                </p>
              </div>
              <div className={cn(
                "flex h-8 w-14 items-center rounded-full p-1 transition-colors",
                coldChain ? "bg-primary" : "bg-destructive"
              )}>
                <div className={cn(
                  "h-6 w-6 rounded-full bg-white shadow transition-transform",
                  coldChain && "translate-x-6"
                )} />
              </div>
            </button>
          </section>

        </div>
      </main>

      {/* Fixed Bottom Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Button
          size="lg"
          className={cn(
            "h-14 w-full text-lg font-semibold transition-all",
            canSubmit
              ? "bg-accent hover:bg-accent/90"
              : "bg-muted text-muted-foreground"
          )}
          disabled={!canSubmit || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Submitting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Submit Transfusion
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
