'use client'

import { useState } from 'react'
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
              ].map((p) => {
                const isSelected = productType === p.type
                return (
                  <button
                    key={p.type}
                    type="button"
                    onClick={() => setProductType(p.type as ProductType)}
                    className="flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all active:scale-[0.98] min-h-[88px]"
                    style={{
                      borderColor: isSelected ? '#1B2B4B' : undefined,
                      backgroundColor: isSelected ? '#1B2B4B' : undefined,
                      color: isSelected ? '#ffffff' : undefined,
                    }}
                  >
                    <span className="text-lg font-bold">{p.label}</span>
                    <span 
                      className="text-xs"
                      style={{ opacity: isSelected ? 0.8 : 0.6 }}
                    >
                      {p.desc}
                    </span>
                  </button>
                )
              })}
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
                { type: 'trauma', label: 'Trauma' },
                { type: 'gi-bleed', label: 'GI Bleed' },
                { type: 'obstetric', label: 'Obstetric' },
                { type: 'medical', label: 'Medical/Other' },
              ].map((i) => {
                const isSelected = indication === i.type
                return (
                  <button
                    key={i.type}
                    type="button"
                    onClick={() => setIndication(i.type as Indication)}
                    className="flex items-center justify-center rounded-xl border-2 p-4 text-lg font-semibold transition-all active:scale-[0.98] min-h-[64px]"
                    style={{
                      borderColor: isSelected ? '#1B2B4B' : undefined,
                      backgroundColor: isSelected ? '#1B2B4B' : undefined,
                      color: isSelected ? '#ffffff' : undefined,
                    }}
                  >
                    {i.label}
                  </button>
                )
              })}
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
                  {SBP_RANGES.map((range) => {
                    const isSelected = sbpRange === range.value
                    const isCriteriaMet = range.met
                    return (
                      <button
                        key={range.label}
                        type="button"
                        onClick={() => setSbpRange(range.value)}
                        className="rounded-lg border-2 py-3 text-center font-mono text-lg font-semibold transition-all active:scale-95"
                        style={{
                          borderColor: isSelected ? (isCriteriaMet ? '#22C55E' : '#1B2B4B') : undefined,
                          backgroundColor: isSelected ? (isCriteriaMet ? '#22C55E' : '#1B2B4B') : undefined,
                          color: isSelected ? '#ffffff' : undefined,
                        }}
                      >
                        {range.label}
                      </button>
                    )
                  })}
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
                  {HR_RANGES.map((range) => {
                    const isSelected = hrRange === range.value
                    const isCriteriaMet = range.met
                    return (
                      <button
                        key={range.label}
                        type="button"
                        onClick={() => setHrRange(range.value)}
                        className="rounded-lg border-2 py-3 text-center font-mono text-lg font-semibold transition-all active:scale-95"
                        style={{
                          borderColor: isSelected ? (isCriteriaMet ? '#22C55E' : '#1B2B4B') : undefined,
                          backgroundColor: isSelected ? (isCriteriaMet ? '#22C55E' : '#1B2B4B') : undefined,
                          color: isSelected ? '#ffffff' : undefined,
                        }}
                      >
                        {range.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Altered Mental Status */}
              <button
                type="button"
                onClick={() => setAlteredMental(!alteredMental)}
                className="flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all active:scale-[0.99]"
                style={{
                  borderColor: alteredMental ? '#22C55E' : undefined,
                  backgroundColor: alteredMental ? 'rgba(34, 197, 94, 0.1)' : undefined,
                }}
              >
                <span className="font-semibold">Altered Mental Status</span>
                <div 
                  className="flex h-8 w-14 items-center rounded-full p-1 transition-colors"
                  style={{ backgroundColor: alteredMental ? '#22C55E' : '#E5E7EB' }}
                >
                  <div 
                    className="h-6 w-6 rounded-full bg-white shadow transition-transform"
                    style={{ transform: alteredMental ? 'translateX(24px)' : 'translateX(0)' }}
                  />
                </div>
              </button>
            </div>
          </section>

          {/* Cold Chain Toggle */}
          <section>
            <button
              type="button"
              onClick={() => setColdChain(!coldChain)}
              className="flex w-full items-center gap-4 rounded-xl border-2 p-4 transition-all active:scale-[0.99]"
              style={{
                borderColor: coldChain ? '#1B2B4B' : '#D94F3D',
                backgroundColor: coldChain ? 'rgba(27, 43, 75, 0.05)' : 'rgba(217, 79, 61, 0.1)',
              }}
            >
              <div 
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: coldChain ? 'rgba(27, 43, 75, 0.2)' : 'rgba(217, 79, 61, 0.2)' }}
              >
                {coldChain ? (
                  <Snowflake className="h-6 w-6" style={{ color: '#1B2B4B' }} />
                ) : (
                  <AlertTriangle className="h-6 w-6" style={{ color: '#D94F3D' }} />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Cold Chain</p>
                <p className="text-sm" style={{ color: coldChain ? '#6B7280' : '#D94F3D' }}>
                  {coldChain ? 'Confirmed - product maintained at temp' : 'NOT confirmed - document reason'}
                </p>
              </div>
              <div 
                className="flex h-8 w-14 items-center rounded-full p-1 transition-colors"
                style={{ backgroundColor: coldChain ? '#1B2B4B' : '#D94F3D' }}
              >
                <div 
                  className="h-6 w-6 rounded-full bg-white shadow transition-transform"
                  style={{ transform: coldChain ? 'translateX(24px)' : 'translateX(0)' }}
                />
              </div>
            </button>
          </section>

        </div>
      </main>

      {/* Fixed Bottom Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white/95 p-4 backdrop-blur">
        <button
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl text-lg font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50"
          style={{
            backgroundColor: canSubmit ? '#D94F3D' : '#9CA3AF',
          }}
          disabled={!canSubmit || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Submit Transfusion
            </>
          )}
        </button>
      </div>
    </div>
  )
}
