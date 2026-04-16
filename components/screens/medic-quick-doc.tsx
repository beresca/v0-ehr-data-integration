'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Mock data - would come from ePCR API when connected
// Sorted reverse chronological (newest first)
// ecrImported: ePCR data has been pulled into the system
// bloodScanned: blood products have been scanned via BloodComm
// scannedProducts: array of product IDs already scanned for this incident
const MOCK_INCIDENTS = [
  { id: 'INC-2026-78432', date: '2026-04-11', time: '14:32', status: 'active', chief: 'MVC - Trauma', agency: 'Miami-Dade Fire Rescue', unit: 'R-41', patient: { age: 34, gender: 'M' }, epcrImported: true, bloodScanned: true, scannedProducts: ['W26-089234', 'W26-089235'], patientId: 'PT-2026-0892' },
  { id: 'INC-2026-78429', date: '2026-04-11', time: '13:45', status: 'active', chief: 'Fall - Head Injury', agency: 'Miami-Dade Fire Rescue', unit: 'M-22', patient: { age: 67, gender: 'F' }, epcrImported: true, bloodScanned: false, scannedProducts: [], patientId: null },
  { id: 'INC-2026-78415', date: '2026-04-11', time: '11:20', status: 'completed', chief: 'GSW - Chest', agency: 'Broward County EMS', unit: 'M-41', patient: { age: 22, gender: 'M' }, epcrImported: true, bloodScanned: true, scannedProducts: ['R26-445521'], patientId: 'PT-2026-0915' },
  { id: 'INC-2026-78398', date: '2026-04-10', time: '22:15', status: 'completed', chief: 'Stabbing - Abdomen', agency: 'Miami-Dade Fire Rescue', unit: 'R-12', patient: { age: 28, gender: 'M' }, epcrImported: true, bloodScanned: true, scannedProducts: ['P26-112233'], patientId: 'PT-2026-0901' },
  { id: 'INC-2026-78356', date: '2026-04-10', time: '16:42', status: 'completed', chief: 'OB Hemorrhage', agency: 'Palm Beach County FR', unit: 'M-07', patient: { age: 31, gender: 'F' }, epcrImported: false, bloodScanned: false, scannedProducts: [], patientId: null },
  { id: 'INC-2026-78301', date: '2026-04-09', time: '08:23', status: 'completed', chief: 'MVC - Ejection', agency: 'Orange County EMS', unit: 'R-33', patient: { age: 45, gender: 'M' }, epcrImported: true, bloodScanned: true, scannedProducts: ['W26-089234'], patientId: 'PT-2026-0923' },
]

// Mock data - would come from Delta BloodComm API when connected
const MOCK_BLOOD_PRODUCTS = [
  { unitId: 'W26-089234', productType: 'LTOWB', expiry: '2026-04-25', temp: '4.2°C', scannedAt: '2026-04-11 14:08' },
  { unitId: 'W26-089235', productType: 'LTOWB', expiry: '2026-04-25', temp: '4.1°C', scannedAt: '2026-04-11 14:09' },
  { unitId: 'R26-445521', productType: 'pRBC',  expiry: '2026-05-02', temp: '4.0°C', scannedAt: '2026-04-11 13:52' },
  { unitId: 'P26-112233', productType: 'Plasma', expiry: '2026-04-30', temp: '-18°C', scannedAt: '2026-04-11 13:53' },
]

type Incident = typeof MOCK_INCIDENTS[0] | { id: string; date?: string; manual: true; patient?: { age?: number; gender?: string } }
type BloodProduct = typeof MOCK_BLOOD_PRODUCTS[0] | { unitId: string; productType: string; manual: true; needsUnitId?: boolean }

// ─── Toast ────────────────────────────────────────────────────────────────────
interface Toast { id: number; message: string; type: 'success' | 'info' | 'warning' }

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null
  return (
    <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8, width: 'calc(100% - 32px)', maxWidth: 400 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => onDismiss(t.id)} style={{
          padding: '12px 16px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          backgroundColor: t.type === 'success' ? '#ECFDF5' : t.type === 'warning' ? '#FFFBEB' : '#EFF6FF',
          color: t.type === 'success' ? '#065F46' : t.type === 'warning' ? '#92400E' : '#1E40AF',
          border: `1px solid ${t.type === 'success' ? '#6EE7B7' : t.type === 'warning' ? '#FCD34D' : '#BFDBFE'}`,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>
            {t.type === 'success' ? '✓' : t.type === 'warning' ? '⚠' : 'ℹ'}
          </span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <span style={{ opacity: 0.5, fontSize: 16, flexShrink: 0 }}>×</span>
        </div>
      ))}
    </div>
  )
}

export function MedicQuickDoc() {
  const pathname = usePathname()
  
  // Connection status
  const [isOnline, setIsOnline] = useState(true)
  const [apiConnected, setApiConnected] = useState(true) // ePCR/BloodComm API available

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastCounter = useState(0)
  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }
  const dismissToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))
  
  // Current view
  const [view, setView] = useState<'incidents' | 'products' | 'document'>('incidents')
  const [incidentTab, setIncidentTab] = useState<'api' | 'manual'>('api')
  const [productTab, setProductTab] = useState<'api' | 'manual'>('api')
  
  // Selected data
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<BloodProduct[]>([])
  
  // Manual entry form
  const [manualIncidentId, setManualIncidentId] = useState('')
  const [manualPatientAge, setManualPatientAge] = useState('')
  const [manualPatientGender, setManualPatientGender] = useState<string | null>(null)
  const [manualProductId, setManualProductId] = useState('')
  const [manualProductType, setManualProductType] = useState<string | null>(null)
  
  // Documentation
  const [indication, setIndication] = useState<string | null>(null)
  const [sbpRange, setSbpRange] = useState<number | null>(null)
  const [hrRange, setHrRange] = useState<number | null>(null)
  const [alteredMental, setAlteredMental] = useState(false)
  const [coldChainConfirmed, setColdChainConfirmed] = useState(true)
  
  // Pending sync queue (for offline)
  const [pendingSync, setPendingSync] = useState<number>(0)
  const [mounted, setMounted] = useState(false)

  // Check online status + mount state
  useEffect(() => {
    setMounted(true)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => { setIsOnline(false); setApiConnected(false) }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Calculations
  const shockIndex = sbpRange && hrRange ? (hrRange / sbpRange).toFixed(1) : null
  const shockIndexMet = shockIndex ? parseFloat(shockIndex) > 0.9 : false
  let criteriaMet = 0
  if (sbpRange !== null && sbpRange < 90) criteriaMet++
  if (hrRange !== null && hrRange > 100) criteriaMet++
  if (shockIndexMet) criteriaMet++
  if (alteredMental) criteriaMet++

  const canSubmit = selectedIncident && selectedProducts.length > 0 && indication

  // Styles
  const pageStyle: React.CSSProperties = { 
    minHeight: '100vh', 
    backgroundColor: '#F8FAFC', 
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    paddingBottom: 120  // space for fixed submit + bottom nav on mobile
  }
  
  const card: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    border: '1px solid #E5E7EB'
  }

  const sectionTitle: React.CSSProperties = { 
    fontSize: 11, 
    fontWeight: 600, 
    textTransform: 'uppercase', 
    letterSpacing: '0.05em', 
    color: '#6B7280', 
    marginBottom: 8,
    marginTop: 0
  }

  const tabButton = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px',
    borderRadius: 6,
    border: 'none',
    backgroundColor: active ? '#fff' : 'transparent',
    fontWeight: active ? 600 : 400,
    fontSize: 14,
    color: active ? '#1B2B4B' : '#6B7280',
    cursor: 'pointer',
    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
  })

  // Toggle product selection
  const toggleProduct = (product: BloodProduct) => {
    setSelectedProducts(prev => 
      prev.find(p => p.unitId === product.unitId)
        ? prev.filter(p => p.unitId !== product.unitId)
        : [...prev, product]
    )
  }

  // Add manual product
  const addManualProduct = () => {
    if (manualProductId && manualProductType) {
      setSelectedProducts(prev => [...prev, { unitId: manualProductId, productType: manualProductType, manual: true }])
      setManualProductId('')
      setManualProductType(null)
    }
  }

  // Submit
  const handleSubmit = () => {
    const record = {
      incident: selectedIncident,
      products: selectedProducts,
      indication,
      vitals: { sbpRange, hrRange, alteredMental, shockIndex },
      coldChainConfirmed,
      timestamp: new Date().toISOString(),
      syncStatus: isOnline ? 'synced' : 'pending'
    }
    
    if (!isOnline) {
      // Store locally for later sync
      setPendingSync(prev => prev + 1)
      alert('Saved offline. Will sync when connection is restored.')
    } else {
      alert('Transfusion documented!\n\nWould export NEMSIS XML to ePCR.')
    }
    
    // Reset for next entry
    setSelectedIncident(null)
    setSelectedProducts([])
    setIndication(null)
    setSbpRange(null)
    setHrRange(null)
    setAlteredMental(false)
    setView('incidents')
  }

  // ==================== INCIDENT SELECTION VIEW ====================
  if (view === 'incidents') {
    return (
      <div style={pageStyle}>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        {/* Status Bar */}
        <div style={{ 
          backgroundColor: isOnline ? (apiConnected ? '#1B2B4B' : '#F59E0B') : '#DC2626', 
          color: '#fff', 
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12
        }}>
          <span style={{ fontWeight: 600 }}>BloodTrack</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {pendingSync > 0 && (
              <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10 }}>
                {pendingSync} pending sync
              </span>
            )}
            <span style={{ opacity: 0.8 }}>
              {isOnline ? (apiConnected ? 'Connected' : 'Limited') : 'Offline'}
            </span>
            <span style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: isOnline ? (apiConnected ? '#22C55E' : '#F59E0B') : '#fff' 
            }} />
          </div>
        </div>

        {/* Header */}
        <header style={{ backgroundColor: '#1B2B4B', color: '#fff', padding: '12px 16px' }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Select Incident</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.7 }}>Link transfusion to ePCR record</p>
        </header>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', margin: 12, backgroundColor: '#E5E7EB', borderRadius: 8, padding: 4 }}>
          <button onClick={() => setIncidentTab('api')} style={tabButton(incidentTab === 'api')}>
            From ePCR {apiConnected && '●'}
          </button>
          <button onClick={() => setIncidentTab('manual')} style={tabButton(incidentTab === 'manual')}>
            Manual Entry
          </button>
        </div>

        {incidentTab === 'api' && apiConnected ? (
          // API-fed incident list - reverse chronological with date grouping
          mounted && (
          <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Group by date */}
            {(() => {
              const grouped: Record<string, typeof MOCK_INCIDENTS> = {}
              MOCK_INCIDENTS.forEach(inc => {
                if (!grouped[inc.date]) grouped[inc.date] = []
                grouped[inc.date].push(inc)
              })
              return Object.entries(grouped).map(([date, incidents]) => (
                <div key={date}>
                  {/* Date header - static format to avoid hydration mismatch */}
                  <div style={{ 
                    fontSize: 11, 
                    fontWeight: 600, 
                    color: '#6B7280', 
                    padding: '8px 4px 4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                  }}>
                    {/* Use fixed format: parse YYYY-MM-DD manually */}
                    {(() => {
                      const [year, month, day] = date.split('-')
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                      return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`
                    })()}
                  </div>
                  {/* Incidents for this date */}
                  {incidents.map((incident) => (
                    <button
                      key={incident.id}
                      onClick={() => {
                        setSelectedIncident(incident)
                        // Auto-populate blood products if ePCR has them
                        if (incident.epcrImported && incident.scannedProducts.length > 0) {
                          const matched = incident.scannedProducts
                            .map(id => MOCK_BLOOD_PRODUCTS.find(p => p.unitId === id))
                            .filter(Boolean) as BloodProduct[]
                          setSelectedProducts(matched)
                          addToast(`ePCR loaded — ${matched.length} blood unit${matched.length !== 1 ? 's' : ''} pre-selected from BloodComm. Please confirm.`, 'success')
                        } else if (incident.epcrImported && incident.scannedProducts.length === 0) {
                          setSelectedProducts([])
                          addToast('ePCR loaded — no blood products scanned yet. Please add unit IDs manually.', 'warning')
                        } else {
                          setSelectedProducts([])
                        }
                        setView('products')
                      }}
                      style={{
                        ...card,
                        width: '100%',
                        padding: '12px 14px',
                        marginBottom: 6,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {/* Time column */}
                      <div style={{ 
                        minWidth: 48, 
                        fontFamily: 'monospace', 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: '#374151',
                        paddingTop: 2
                      }}>
                        {incident.time}
                      </div>
                      
                      {/* Main content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Top row: ID + Status + Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: '#1B2B4B' }}>
                            {incident.id}
                          </span>
                          <span style={{
                            fontSize: 9,
                            padding: '2px 5px',
                            borderRadius: 3,
                            backgroundColor: incident.status === 'active' ? '#22C55E' : '#E5E7EB',
                            color: incident.status === 'active' ? '#fff' : '#6B7280',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            letterSpacing: '0.02em'
                          }}>
                            {incident.status}
                          </span>
                          {/* ePCR Imported Badge */}
                          {incident.epcrImported && (
                            <span style={{
                              fontSize: 9,
                              padding: '2px 6px',
                              borderRadius: 3,
                              backgroundColor: '#EFF6FF',
                              color: '#1D4ED8',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3
                            }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2z" />
                              </svg>
                              ePCR
                            </span>
                          )}
                          {/* Blood badge — Scanned or Unit ID Needed */}
                          {incident.epcrImported && incident.bloodScanned && incident.scannedProducts.length > 0 && (
                            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, backgroundColor: '#FEF2F2', color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C12 2 6 9 6 14a6 6 0 1012 0c0-5-6-12-6-12z" />
                              </svg>
                              {incident.scannedProducts.length} unit{incident.scannedProducts.length !== 1 ? 's' : ''} scanned
                            </span>
                          )}
                          {incident.epcrImported && !incident.bloodScanned && (
                            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, backgroundColor: '#FFFBEB', color: '#92400E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, border: '1px solid #FCD34D' }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                              Unit ID needed
                            </span>
                          )}
                        </div>
                        
                        {/* Chief complaint - prominent */}
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 3 }}>
                          {incident.chief}
                        </div>
                        
                        {/* Bottom row: Patient + Agency + Unit */}
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap',
                          gap: '4px 12px',
                          fontSize: 12, 
                          color: '#6B7280' 
                        }}>
                          <span style={{ fontWeight: 500 }}>
                            {incident.patient.age}y {incident.patient.gender === 'M' ? 'Male' : 'Female'}
                          </span>
                          <span style={{ color: '#9CA3AF' }}>|</span>
                          <span>{incident.agency}</span>
                          <span style={{ color: '#9CA3AF' }}>|</span>
                          <span>{incident.unit}</span>
                        </div>
                      </div>
                      
                      {/* Chevron */}
                      <span style={{ fontSize: 20, color: '#D1D5DB', paddingTop: 6 }}>›</span>
                    </button>
                  ))}
                </div>
              ))
            })()}
          </div>
          )
        ) : (
          // Manual entry form
          <div style={{ padding: 12 }}>
            <div style={{ ...card, padding: 16 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Incident Information</h3>
              
              <label style={{ display: 'block', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>Incident/Run Number</span>
                <input
                  type="text"
                  value={manualIncidentId}
                  onChange={(e) => setManualIncidentId(e.target.value.toUpperCase())}
                  placeholder="e.g. 2024-123456"
                  style={{
                    width: '100%',
                    padding: 12,
                    fontSize: 16,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    border: '2px solid #E5E7EB',
                    borderRadius: 8,
                    boxSizing: 'border-box'
                  }}
                />
              </label>

              <h3 style={{ margin: '16px 0 12px', fontSize: 14, fontWeight: 600 }}>Patient (Optional)</h3>
              
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <label style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>Age</span>
                  <input
                    type="number"
                    value={manualPatientAge}
                    onChange={(e) => setManualPatientAge(e.target.value)}
                    placeholder="Years"
                    style={{
                      width: '100%',
                      padding: 12,
                      fontSize: 16,
                      border: '2px solid #E5E7EB',
                      borderRadius: 8,
                      boxSizing: 'border-box'
                    }}
                  />
                </label>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>Gender</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['M', 'F'].map(g => (
                      <button
                        key={g}
                        onClick={() => setManualPatientGender(g)}
                        style={{
                          flex: 1,
                          padding: 12,
                          borderRadius: 8,
                          border: '2px solid',
                          borderColor: manualPatientGender === g ? '#1B2B4B' : '#E5E7EB',
                          backgroundColor: manualPatientGender === g ? '#1B2B4B' : '#fff',
                          color: manualPatientGender === g ? '#fff' : '#374151',
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                disabled={!manualIncidentId}
                onClick={() => {
                  setSelectedIncident({ 
                    id: manualIncidentId, 
                    manual: true,
                    patient: manualPatientAge || manualPatientGender ? {
                      age: manualPatientAge ? parseInt(manualPatientAge) : undefined,
                      gender: manualPatientGender || undefined
                    } : undefined
                  })
                  setView('products')
                }}
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: manualIncidentId ? '#1B2B4B' : '#D1D5DB',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: manualIncidentId ? 'pointer' : 'not-allowed'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        <BottomNav pathname={pathname} />
      </div>
    )
  }

  // ==================== PRODUCT SELECTION VIEW ====================
  if (view === 'products') {
    // Determine if this incident has ePCR-linked products for confirm mode
    const epcrIncident = selectedIncident && !('manual' in selectedIncident) ? selectedIncident : null
    const isConfirmMode = !!(epcrIncident?.epcrImported && epcrIncident?.scannedProducts?.length > 0)
    const needsUnitIds = !!(epcrIncident?.epcrImported && epcrIncident?.scannedProducts?.length === 0)

    return (
      <div style={pageStyle}>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        {/* Incident Banner */}
        {(() => {
          const inc = selectedIncident && !('manual' in selectedIncident) ? selectedIncident : null
          return (
            <div style={{ backgroundColor: '#1B2B4B', color: '#fff', padding: '12px 16px' }}>
              {/* Top row: ID + status + Change button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15 }}>{selectedIncident?.id}</span>
                  {inc && (
                    <span style={{
                      fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                      backgroundColor: inc.status === 'active' ? '#22C55E' : 'rgba(255,255,255,0.2)',
                      color: '#fff'
                    }}>
                      {inc.status}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedIncident(null); setView('incidents') }}
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 6, padding: '5px 12px', color: '#fff', fontSize: 12, cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}
                >
                  Change
                </button>
              </div>

              {/* Chief complaint */}
              {inc && (
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: '#fff' }}>
                  {inc.chief}
                </div>
              )}

              {/* Detail row: age/sex · agency · unit · time */}
              {inc && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', marginTop: 5 }}>
                  <span style={{ fontSize: 12, opacity: 0.85 }}>
                    {inc.patient.age}y&nbsp;{inc.patient.gender === 'M' ? 'Male' : 'Female'}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.4 }}>|</span>
                  <span style={{ fontSize: 12, opacity: 0.85 }}>{inc.agency}</span>
                  <span style={{ fontSize: 12, opacity: 0.4 }}>|</span>
                  <span style={{ fontSize: 12, opacity: 0.85 }}>Unit&nbsp;{inc.unit}</span>
                  <span style={{ fontSize: 12, opacity: 0.4 }}>|</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', opacity: 0.85 }}>{inc.date}&nbsp;{inc.time}</span>
                </div>
              )}
            </div>
          )
        })()}

        {/* Header */}
        <header style={{ backgroundColor: '#1B2B4B', color: '#fff', padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            {isConfirmMode ? 'Confirm Blood Products' : needsUnitIds ? 'Add Blood Products' : 'Select Blood Products'}
          </h1>
          {isConfirmMode && (
            <p style={{ margin: '3px 0 0', fontSize: 12, opacity: 0.8 }}>Pre-filled from ePCR — review and confirm</p>
          )}
          {needsUnitIds && (
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#FCD34D' }}>ePCR loaded — unit IDs not yet scanned, please add manually</p>
          )}
        </header>

        {/* Mode Tabs — only show if not in confirm mode */}
        {!isConfirmMode && (
          <div style={{ display: 'flex', margin: 12, backgroundColor: '#E5E7EB', borderRadius: 8, padding: 4 }}>
            <button onClick={() => setProductTab('api')} style={tabButton(productTab === 'api')}>
              From BloodComm {apiConnected && '●'}
            </button>
            <button onClick={() => setProductTab('manual')} style={tabButton(productTab === 'manual')}>
              Manual/Scan
            </button>
          </div>
        )}

        {/* Selected Products Summary */}
        {selectedProducts.length > 0 && (
          <div style={{ margin: '0 12px 8px', padding: 10, backgroundColor: '#ECFDF5', borderRadius: 8, border: '1px solid #A7F3D0' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#065F46', marginBottom: 4 }}>
              {selectedProducts.length} unit{selectedProducts.length > 1 ? 's' : ''} selected
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {selectedProducts.map(p => (
                <span key={p.unitId} style={{ fontSize: 11, fontFamily: 'monospace', color: '#047857' }}>
                  {p.productType}: {p.unitId}
                </span>
              ))}
            </div>
          </div>
        )}

        {isConfirmMode ? (
          // ── Confirm mode: show pre-populated products from ePCR ──────────────
          <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ padding: '8px 4px', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pre-filled from BloodComm — tap to deselect
            </div>
            {selectedProducts.map((product) => (
              <div
                key={product.unitId}
                style={{
                  ...card,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: '2px solid #22C55E',
                  backgroundColor: 'rgba(34, 197, 94, 0.04)',
                  width: '100%'
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  ✓
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>{product.unitId}</span>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, backgroundColor: product.productType === 'LTOWB' ? '#DC2626' : product.productType === 'pRBC' ? '#B91C1C' : '#1B2B4B', color: '#fff', fontWeight: 600 }}>
                      {product.productType}
                    </span>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, backgroundColor: '#ECFDF5', color: '#065F46', fontWeight: 700, border: '1px solid #6EE7B7', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      Scanned
                    </span>
                  </div>
                  {'scannedAt' in product && (
                    <>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>
                        Exp: {(product as typeof MOCK_BLOOD_PRODUCTS[0]).expiry} &nbsp;•&nbsp; {(product as typeof MOCK_BLOOD_PRODUCTS[0]).temp}
                      </div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                        Scanned: {(product as typeof MOCK_BLOOD_PRODUCTS[0]).scannedAt}
                      </div>
                    </>
                  )}
                </div>
                {/* Delete button */}
                <button
                  onClick={() => {
                    if (confirm(`Remove ${product.unitId} from this record?`)) {
                      setSelectedProducts(prev => prev.filter(p => p.unitId !== product.unitId))
                      addToast(`Removed ${product.unitId}`, 'warning')
                    }
                  }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: '1px solid #FCA5A5',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  title="Remove product"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                </button>
              </div>
            ))}

            {/* Available scanned units not yet linked */}
            {(() => {
              const availableUnits = MOCK_BLOOD_PRODUCTS.filter(
                p => !selectedProducts.some(sp => sp.unitId === p.unitId)
              )
              if (availableUnits.length === 0) return null
              return (
                <>
                  <div style={{ padding: '12px 4px 6px', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Available Scanned Units
                  </div>
                  {availableUnits.map((product) => (
                    <button
                      key={product.unitId}
                      onClick={() => {
                        setSelectedProducts(prev => [...prev, product])
                        addToast(`Added ${product.unitId} (${product.productType})`, 'success')
                      }}
                      style={{
                        ...card,
                        padding: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        border: '1px dashed #D1D5DB',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%'
                      }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 6, border: '2px solid #D1D5DB', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                        +
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>{product.unitId}</span>
                          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, backgroundColor: product.productType === 'LTOWB' ? '#DC2626' : product.productType === 'pRBC' ? '#B91C1C' : '#1B2B4B', color: '#fff', fontWeight: 600 }}>
                            {product.productType}
                          </span>
                          <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, backgroundColor: '#FFFBEB', color: '#92400E', fontWeight: 700, border: '1px solid #FCD34D' }}>
                            Not linked
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>
                          Exp: {product.expiry} &nbsp;•&nbsp; {product.temp}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )
            })()}

            {/* Add additional unit */}
            <div style={{ marginTop: 8, ...card, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Add additional unit
              </div>

              {/* Product type buttons — same style as Indication buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {['LTOWB', 'pRBC', 'Plasma', 'Platelets'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setManualProductType(manualProductType === t ? null : t)}
                    style={{
                      height: 48,
                      borderRadius: 8,
                      border: '2px solid',
                      borderColor: manualProductType === t ? '#1B2B4B' : '#E5E7EB',
                      backgroundColor: manualProductType === t ? '#1B2B4B' : '#fff',
                      color: manualProductType === t ? '#fff' : '#374151',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Unit ID — scan or type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Scan mock button */}
                <button
                  onClick={() => {
                    // Mock: simulate a barcode scan populating a unit ID
                    const mockId = `W26-0${Math.floor(10000 + Math.random() * 89999)}`
                    setManualProductId(mockId)
                    addToast(`Barcode scanned: ${mockId}`, 'info')
                  }}
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 8,
                    border: '2px dashed #1B2B4B',
                    backgroundColor: '#F8FAFF',
                    color: '#1B2B4B',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {/* Barcode icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 5v14M7 5v14M11 5v14M15 5v4M15 15v4M19 5v4M19 15v4M3 9h4M15 9h4M3 15h4M15 15h4"/>
                  </svg>
                  Scan Barcode
                </button>

                {/* Manual text entry */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={manualProductId}
                    onChange={(e) => setManualProductId(e.target.value.toUpperCase())}
                    placeholder="Enter unit ID manually"
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      fontSize: 14,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      border: '2px solid #E5E7EB',
                      borderRadius: 8,
                      outline: 'none',
                      boxSizing: 'border-box' as const,
                    }}
                  />
                  <button
                    onClick={addManualProduct}
                    disabled={!manualProductId || !manualProductType}
                    style={{
                      padding: '12px 18px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: manualProductId && manualProductType ? '#1B2B4B' : '#E5E7EB',
                      color: manualProductId && manualProductType ? '#fff' : '#9CA3AF',
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: manualProductId && manualProductType ? 'pointer' : 'not-allowed',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : productTab === 'api' && apiConnected ? (
          // ── Normal BloodComm list ─────────────────────────────────────────────
          <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_BLOOD_PRODUCTS.map((product) => {
              const isSelected = selectedProducts.some(p => p.unitId === product.unitId)
              // Check if this product is linked to the current incident's scanned list
              const linkedToIncident = epcrIncident?.scannedProducts?.includes(product.unitId)
              return (
                <button
                  key={product.unitId}
                  onClick={() => toggleProduct(product)}
                  style={{
                    ...card,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    border: isSelected ? '2px solid #22C55E' : '1px solid #E5E7EB',
                    backgroundColor: isSelected ? 'rgba(34, 197, 94, 0.05)' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 6, border: isSelected ? 'none' : '2px solid #D1D5DB', backgroundColor: isSelected ? '#22C55E' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                    {isSelected && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>{product.unitId}</span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, backgroundColor: product.productType === 'LTOWB' ? '#DC2626' : product.productType === 'pRBC' ? '#B91C1C' : '#1B2B4B', color: '#fff', fontWeight: 600 }}>
                        {product.productType}
                      </span>
                      {/* Scanned vs needs unit ID badge */}
                      {linkedToIncident ? (
                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, backgroundColor: '#ECFDF5', color: '#065F46', fontWeight: 700, border: '1px solid #6EE7B7', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          Scanned
                        </span>
                      ) : (
                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, backgroundColor: '#FFFBEB', color: '#92400E', fontWeight: 700, border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                          Not linked
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>
                      Exp: {product.expiry} &nbsp;•&nbsp; {product.temp}
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                      Scanned: {product.scannedAt}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          // Manual entry
          <div style={{ padding: 12 }}>
            <div style={{ ...card, padding: 16 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Add Blood Product</h3>
              
              <label style={{ display: 'block', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>Unit ID (scan or type)</span>
                <input
                  type="text"
                  value={manualProductId}
                  onChange={(e) => setManualProductId(e.target.value.toUpperCase())}
                  placeholder="Scan barcode or enter ID"
                  style={{
                    width: '100%',
                    padding: 12,
                    fontSize: 16,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    border: '2px solid #E5E7EB',
                    borderRadius: 8,
                    boxSizing: 'border-box'
                  }}
                />
              </label>

              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>Product Type</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {['LTOWB', 'pRBC', 'Plasma', 'Platelets'].map(type => (
                    <button
                      key={type}
                      onClick={() => setManualProductType(type)}
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        border: '2px solid',
                        borderColor: manualProductType === type ? '#1B2B4B' : '#E5E7EB',
                        backgroundColor: manualProductType === type ? '#1B2B4B' : '#fff',
                        color: manualProductType === type ? '#fff' : '#374151',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!manualProductId || !manualProductType}
                onClick={addManualProduct}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: (manualProductId && manualProductType) ? '#22C55E' : '#D1D5DB',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: (manualProductId && manualProductType) ? 'pointer' : 'not-allowed'
                }}
              >
                + Add Unit
              </button>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div style={{ position: 'fixed', bottom: 60, left: 0, right: 0, padding: 12, backgroundColor: 'rgba(255,255,255,0.98)', borderTop: '1px solid #E5E7EB' }}>
          <button
            onClick={() => setView('document')}
            style={{
              width: '100%',
              height: 52,
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#1B2B4B',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {selectedProducts.length > 0 
              ? `Continue with ${selectedProducts.length} Unit${selectedProducts.length !== 1 ? 's' : ''}`
              : 'Continue (No Products)'}
          </button>
        </div>

        <BottomNav pathname={pathname} />
      </div>
    )
  }

  // ==================== DOCUMENTATION VIEW ====================
  return (
    <div style={pageStyle}>
      {/* Incident Banner */}
      {(() => {
        const inc = selectedIncident && !('manual' in selectedIncident) ? selectedIncident : null
        return (
          <div style={{ backgroundColor: '#1B2B4B', color: '#fff', padding: '12px 16px' }}>
            {/* Top row: ID + status + criteria/SI pills */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15 }}>{selectedIncident?.id}</span>
                {inc && (
                  <span style={{
                    fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                    backgroundColor: inc.status === 'active' ? '#22C55E' : 'rgba(255,255,255,0.2)',
                    color: '#fff'
                  }}>
                    {inc.status}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                {shockIndex && (
                  <span style={{ backgroundColor: shockIndexMet ? '#D94F3D' : 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontFamily: 'monospace' }}>
                    SI: {shockIndex}
                  </span>
                )}
                <span style={{ backgroundColor: criteriaMet >= 2 ? '#22C55E' : 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 12, fontSize: 12 }}>
                  {criteriaMet}/4
                </span>
              </div>
            </div>

            {/* Chief complaint */}
            {inc && (
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                {inc.chief}
              </div>
            )}

            {/* Detail row: age/sex · agency · unit · time */}
            {inc && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', marginTop: 5 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>
                  {inc.patient.age}y&nbsp;{inc.patient.gender === 'M' ? 'Male' : 'Female'}
                </span>
                <span style={{ fontSize: 12, opacity: 0.4 }}>|</span>
                <span style={{ fontSize: 12, opacity: 0.85 }}>{inc.agency}</span>
                <span style={{ fontSize: 12, opacity: 0.4 }}>|</span>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Unit&nbsp;{inc.unit}</span>
                <span style={{ fontSize: 12, opacity: 0.4 }}>|</span>
                <span style={{ fontSize: 12, fontFamily: 'monospace', opacity: 0.85 }}>{inc.date}&nbsp;{inc.time}</span>
              </div>
            )}
          </div>
        )
      })()}

      {/* Offline Banner */}
      {!isOnline && (
        <div style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '8px 16px', fontSize: 13, textAlign: 'center' }}>
          Offline mode - will sync when connected
        </div>
      )}

      {/* Main Content */}
      <main style={{ padding: 12, paddingBottom: 140, display: 'flex', flexDirection: 'column', gap: 12 }}>
        
        {/* Products Summary */}
        <section style={{ ...card, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={sectionTitle}>Blood Products ({selectedProducts.length})</h2>
            <button 
              onClick={() => setView('products')}
              style={{ fontSize: 12, color: '#1B2B4B', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Edit
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selectedProducts.map(p => (
              <span key={p.unitId} style={{
                padding: '6px 10px',
                borderRadius: 6,
                backgroundColor: '#F3F4F6',
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{
                  padding: '2px 5px',
                  borderRadius: 3,
                  backgroundColor: p.productType === 'LTOWB' ? '#DC2626' : p.productType === 'pRBC' ? '#B91C1C' : '#1B2B4B',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700
                }}>
                  {p.productType}
                </span>
                {p.unitId}
              </span>
            ))}
            {selectedProducts.length === 0 && (
              <div style={{ padding: 12, textAlign: 'center', color: '#9CA3AF', fontSize: 13, width: '100%' }}>
                No blood products — <button onClick={() => setView('products')} style={{ color: '#1B2B4B', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>add products</button>
              </div>
            )}
          </div>
        </section>

        {/* Indication */}
        <section style={{ ...card, padding: 12 }}>
          <h2 style={sectionTitle}>Indication</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {['Trauma', 'GI Bleed', 'Obstetric', 'Medical'].map((ind) => (
              <button
                key={ind}
                onClick={() => setIndication(ind)}
                style={{
                  height: 48,
                  borderRadius: 8,
                  border: '2px solid',
                  borderColor: indication === ind ? '#1B2B4B' : '#E5E7EB',
                  backgroundColor: indication === ind ? '#1B2B4B' : '#fff',
                  color: indication === ind ? '#fff' : '#374151',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {ind}
              </button>
            ))}
          </div>
        </section>

        {/* Pre-Transfusion Vitals */}
        <section style={{ ...card, padding: 12 }}>
          <h2 style={sectionTitle}>Pre-Transfusion Vitals</h2>
          
          {/* SBP */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>SBP</span>
              <span style={{ 
                fontSize: 11, 
                padding: '2px 8px', 
                borderRadius: 10,
                backgroundColor: sbpRange !== null && sbpRange < 90 ? '#22C55E' : '#F3F4F6',
                color: sbpRange !== null && sbpRange < 90 ? '#fff' : '#6B7280'
              }}>
                {sbpRange !== null ? (sbpRange < 90 ? 'MET' : 'Not Met') : '—'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[
                { label: '<70', value: 60, met: true },
                { label: '70-89', value: 80, met: true },
                { label: '90-99', value: 95, met: false },
                { label: '100+', value: 110, met: false },
              ].map((r) => (
                <button
                  key={r.label}
                  onClick={() => setSbpRange(r.value)}
                  style={{
                    padding: '10px 0',
                    borderRadius: 6,
                    border: '2px solid',
                    borderColor: sbpRange === r.value ? (r.met ? '#22C55E' : '#1B2B4B') : '#E5E7EB',
                    backgroundColor: sbpRange === r.value ? (r.met ? '#22C55E' : '#1B2B4B') : '#fff',
                    color: sbpRange === r.value ? '#fff' : '#374151',
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* HR */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>HR</span>
              <span style={{ 
                fontSize: 11, 
                padding: '2px 8px', 
                borderRadius: 10,
                backgroundColor: hrRange !== null && hrRange > 100 ? '#22C55E' : '#F3F4F6',
                color: hrRange !== null && hrRange > 100 ? '#fff' : '#6B7280'
              }}>
                {hrRange !== null ? (hrRange > 100 ? 'MET' : 'Not Met') : '—'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[
                { label: '<80', value: 70, met: false },
                { label: '80-99', value: 90, met: false },
                { label: '100-119', value: 110, met: true },
                { label: '120+', value: 130, met: true },
              ].map((r) => (
                <button
                  key={r.label}
                  onClick={() => setHrRange(r.value)}
                  style={{
                    padding: '10px 0',
                    borderRadius: 6,
                    border: '2px solid',
                    borderColor: hrRange === r.value ? (r.met ? '#22C55E' : '#1B2B4B') : '#E5E7EB',
                    backgroundColor: hrRange === r.value ? (r.met ? '#22C55E' : '#1B2B4B') : '#fff',
                    color: hrRange === r.value ? '#fff' : '#374151',
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Altered Mental */}
          <button
            onClick={() => setAlteredMental(!alteredMental)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '2px solid',
              borderColor: alteredMental ? '#22C55E' : '#E5E7EB',
              backgroundColor: alteredMental ? 'rgba(34, 197, 94, 0.1)' : '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500 }}>Altered Mental Status</span>
            <div style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              backgroundColor: alteredMental ? '#22C55E' : '#D1D5DB',
              position: 'relative',
              transition: 'background-color 0.2s'
            }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#fff',
                position: 'absolute',
                top: 2,
                left: alteredMental ? 22 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }} />
            </div>
          </button>
        </section>

        {/* Cold Chain */}
        <section style={{ ...card, padding: 12 }}>
          <h2 style={sectionTitle}>Cold Chain Verification</h2>
          <button
            onClick={() => setColdChainConfirmed(!coldChainConfirmed)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '2px solid',
              borderColor: coldChainConfirmed ? '#22C55E' : '#DC2626',
              backgroundColor: coldChainConfirmed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: coldChainConfirmed ? '#065F46' : '#991B1B' }}>
                {coldChainConfirmed ? 'Cold Chain Confirmed' : 'Cold Chain NOT Confirmed'}
              </div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                Product maintained at proper temperature
              </div>
            </div>
            <div style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              backgroundColor: coldChainConfirmed ? '#22C55E' : '#DC2626',
              position: 'relative'
            }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#fff',
                position: 'absolute',
                top: 2,
                left: coldChainConfirmed ? 22 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }} />
            </div>
          </button>
        </section>
      </main>

      {/* Submit Button */}
      <div style={{ position: 'fixed', bottom: 60, left: 0, right: 0, padding: 12, backgroundColor: 'rgba(255,255,255,0.98)', borderTop: '1px solid #E5E7EB' }}>
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 10,
            border: 'none',
            backgroundColor: canSubmit ? '#D94F3D' : '#D1D5DB',
            color: '#fff',
            fontSize: 17,
            fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'not-allowed'
          }}
        >
          {isOnline ? 'Submit Transfusion' : 'Save Offline'}
        </button>
      </div>

      <BottomNav pathname={pathname} />
    </div>
  )
}

// SVG icon paths for bottom nav
const NAV_ICONS: Record<string, React.ReactNode> = {
  '/': (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2z" />
    </svg>
  ),
  '/outcomes': (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  '/dashboard': (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  '/registry': (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 8h5M8 16h4" />
    </svg>
  ),
}

// Bottom Navigation Component — only shown on mobile (md:hidden via className)
function BottomNav({ pathname }: { pathname: string }) {
  const items = [
    { href: '/',          label: 'Document'  },
    { href: '/outcomes',  label: 'Outcomes'  },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/registry',  label: 'Registry'  },
  ]

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 58,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 50,
      }}
    >
      {items.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              textDecoration: 'none',
              color: active ? '#1B2B4B' : '#9CA3AF',
              fontSize: 10,
              fontWeight: active ? 700 : 400,
              flex: 1,
              paddingTop: 6,
            }}
          >
            <div style={{ color: active ? '#1B2B4B' : '#9CA3AF' }}>
              {NAV_ICONS[item.href]}
            </div>
            <span>{item.label}</span>
            {active && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                width: 28,
                height: 3,
                borderRadius: '2px 2px 0 0',
                backgroundColor: '#1B2B4B',
              }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
