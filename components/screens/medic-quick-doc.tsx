'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Mock data - would come from ePCR API when connected
const MOCK_INCIDENTS = [
  { id: 'INC-2024-78432', timestamp: '14:32', status: 'active', chief: 'MVC - Trauma', unit: 'M-41', patient: { age: 34, gender: 'M' } },
  { id: 'INC-2024-78429', timestamp: '13:45', status: 'active', chief: 'Fall - Head Injury', unit: 'M-41', patient: { age: 67, gender: 'F' } },
  { id: 'INC-2024-78415', timestamp: '11:20', status: 'completed', chief: 'GSW - Chest', unit: 'M-41', patient: { age: 22, gender: 'M' } },
]

// Mock data - would come from Delta BloodComm API when connected
const MOCK_BLOOD_PRODUCTS = [
  { unitId: 'W24-089234', productType: 'LTOWB', expiry: '2024-12-15', temp: '4.2°C' },
  { unitId: 'W24-089235', productType: 'LTOWB', expiry: '2024-12-15', temp: '4.1°C' },
  { unitId: 'R24-445521', productType: 'pRBC', expiry: '2024-12-20', temp: '4.0°C' },
  { unitId: 'P24-112233', productType: 'Plasma', expiry: '2024-12-18', temp: '-18°C' },
]

type Incident = typeof MOCK_INCIDENTS[0] | { id: string; manual: true; patient?: { age?: number; gender?: string } }
type BloodProduct = typeof MOCK_BLOOD_PRODUCTS[0] | { unitId: string; productType: string; manual: true }

export function MedicQuickDoc() {
  const pathname = usePathname()
  
  // Connection status
  const [isOnline, setIsOnline] = useState(true)
  const [apiConnected, setApiConnected] = useState(true) // ePCR/BloodComm API available
  
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

  // Check online status
  useEffect(() => {
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
    paddingBottom: 60
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
          // API-fed incident list
          <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_INCIDENTS.map((incident) => (
              <button
                key={incident.id}
                onClick={() => {
                  setSelectedIncident(incident)
                  setView('products')
                }}
                style={{
                  ...card,
                  padding: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15 }}>{incident.id}</span>
                    <span style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: incident.status === 'active' ? '#22C55E' : '#E5E7EB',
                      color: incident.status === 'active' ? '#fff' : '#6B7280',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      {incident.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: '#374151' }}>{incident.chief}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                    {incident.unit} • {incident.timestamp} • Pt: {incident.patient.age}{incident.patient.gender}
                  </div>
                </div>
                <span style={{ fontSize: 24, color: '#D1D5DB' }}>›</span>
              </button>
            ))}
          </div>
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
    return (
      <div style={pageStyle}>
        {/* Incident Banner */}
        <div style={{ backgroundColor: '#1B2B4B', color: '#fff', padding: '10px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase' }}>Incident</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }}>{selectedIncident?.id}</div>
            </div>
            <button 
              onClick={() => { setSelectedIncident(null); setView('incidents') }}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, padding: '6px 12px', color: '#fff', fontSize: 12, cursor: 'pointer' }}
            >
              Change
            </button>
          </div>
        </div>

        {/* Header */}
        <header style={{ backgroundColor: '#1B2B4B', color: '#fff', padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Select Blood Products</h1>
        </header>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', margin: 12, backgroundColor: '#E5E7EB', borderRadius: 8, padding: 4 }}>
          <button onClick={() => setProductTab('api')} style={tabButton(productTab === 'api')}>
            From BloodComm {apiConnected && '●'}
          </button>
          <button onClick={() => setProductTab('manual')} style={tabButton(productTab === 'manual')}>
            Manual/Scan
          </button>
        </div>

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

        {productTab === 'api' && apiConnected ? (
          // API-fed product list
          <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_BLOOD_PRODUCTS.map((product) => {
              const isSelected = selectedProducts.some(p => p.unitId === product.unitId)
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
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: isSelected ? 'none' : '2px solid #D1D5DB',
                    backgroundColor: isSelected ? '#22C55E' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {isSelected && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>{product.unitId}</span>
                      <span style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: product.productType === 'LTOWB' ? '#DC2626' : product.productType === 'pRBC' ? '#B91C1C' : '#1B2B4B',
                        color: '#fff',
                        fontWeight: 600
                      }}>
                        {product.productType}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                      Exp: {product.expiry} • {product.temp}
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
            disabled={selectedProducts.length === 0}
            onClick={() => setView('document')}
            style={{
              width: '100%',
              height: 52,
              borderRadius: 10,
              border: 'none',
              backgroundColor: selectedProducts.length > 0 ? '#1B2B4B' : '#D1D5DB',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: selectedProducts.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            Continue with {selectedProducts.length} Unit{selectedProducts.length !== 1 ? 's' : ''}
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
      <div style={{ backgroundColor: '#1B2B4B', color: '#fff', padding: '10px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase' }}>Incident</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }}>{selectedIncident?.id}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {shockIndex && (
              <span style={{ 
                backgroundColor: shockIndexMet ? '#D94F3D' : 'rgba(255,255,255,0.2)',
                padding: '4px 10px',
                borderRadius: 12,
                fontSize: 12,
                fontFamily: 'monospace'
              }}>
                SI: {shockIndex}
              </span>
            )}
            <span style={{ 
              backgroundColor: criteriaMet >= 2 ? '#22C55E' : 'rgba(255,255,255,0.2)',
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: 12
            }}>
              {criteriaMet}/4
            </span>
          </div>
        </div>
      </div>

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
                fontWeight: 600
              }}>
                {p.productType}: {p.unitId}
              </span>
            ))}
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

// Bottom Navigation Component
function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 56,
      backgroundColor: '#ffffff',
      borderTop: '1px solid #E5E7EB',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center'
    }}>
      {[
        { href: '/', label: 'Document', active: pathname === '/' },
        { href: '/outcomes', label: 'Outcomes', active: pathname === '/outcomes' },
        { href: '/dashboard', label: 'Dashboard', active: pathname === '/dashboard' },
        { href: '/registry', label: 'Registry', active: pathname === '/registry' },
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            textDecoration: 'none',
            color: item.active ? '#1B2B4B' : '#9CA3AF',
            fontSize: 11,
            fontWeight: item.active ? 600 : 400
          }}
        >
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: item.active ? '#1B2B4B' : 'transparent',
            marginBottom: 2
          }} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
