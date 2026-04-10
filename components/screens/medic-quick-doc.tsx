'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MedicQuickDoc() {
  // Incident linkage
  const [incidentNumber, setIncidentNumber] = useState<string | null>(null)
  const [showIncidentInput, setShowIncidentInput] = useState(false)
  const [incidentInput, setIncidentInput] = useState('')
  
  // Patient info
  const [ageGroup, setAgeGroup] = useState<string | null>(null)
  const [gender, setGender] = useState<string | null>(null)
  
  // Transfusion info
  const [productType, setProductType] = useState<string | null>(null)
  const [unitCount, setUnitCount] = useState(1)
  const [indication, setIndication] = useState<string | null>(null)
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null)
  
  // Vitals
  const [sbpRange, setSbpRange] = useState<number | null>(null)
  const [hrRange, setHrRange] = useState<number | null>(null)
  const [alteredMental, setAlteredMental] = useState(false)
  
  // Confirmations
  const [coldChain, setColdChain] = useState(true)

  const pathname = usePathname()

  // Calculate shock index
  const shockIndex = sbpRange && hrRange ? (hrRange / sbpRange).toFixed(1) : null
  const shockIndexMet = shockIndex ? parseFloat(shockIndex) > 0.9 : false

  // Count criteria met
  let criteriaMet = 0
  if (sbpRange !== null && sbpRange < 90) criteriaMet++
  if (hrRange !== null && hrRange > 100) criteriaMet++
  if (shockIndexMet) criteriaMet++
  if (alteredMental) criteriaMet++

  const canSubmit = incidentNumber !== null && productType !== null && indication !== null && ageGroup !== null && gender !== null

  // Styles
  const sectionTitle: React.CSSProperties = { 
    fontSize: 11, 
    fontWeight: 600, 
    textTransform: 'uppercase', 
    letterSpacing: '0.05em', 
    color: '#6B7280', 
    marginBottom: 8,
    marginTop: 0
  }

  const card: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    border: '1px solid #E5E7EB'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Incident Banner - Critical linkage to ePCR */}
      <div style={{
        backgroundColor: incidentNumber ? '#1B2B4B' : '#D94F3D',
        color: '#ffffff',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {incidentNumber ? (
          <>
            <div>
              <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Incident</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace' }}>{incidentNumber}</div>
            </div>
            <button
              onClick={() => { setShowIncidentInput(true); setIncidentInput(incidentNumber) }}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                borderRadius: 6, 
                padding: '6px 12px',
                color: '#fff',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              Change
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowIncidentInput(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              padding: '4px 0',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: 18 }}>⚠️</span>
            Tap to enter Incident Number
          </button>
        )}
      </div>

      {/* Incident Number Input Modal */}
      {showIncidentInput && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 20,
            width: '100%',
            maxWidth: 320
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600 }}>Enter Incident Number</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6B7280' }}>
              This links the transfusion to your ePCR record
            </p>
            <input
              type="text"
              value={incidentInput}
              onChange={(e) => setIncidentInput(e.target.value.toUpperCase())}
              placeholder="e.g. 2024-123456"
              autoFocus
              style={{
                width: '100%',
                padding: 12,
                fontSize: 18,
                fontFamily: 'monospace',
                fontWeight: 600,
                border: '2px solid #E5E7EB',
                borderRadius: 8,
                textAlign: 'center',
                marginBottom: 16,
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowIncidentInput(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#fff',
                  fontSize: 15,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (incidentInput.trim()) {
                    setIncidentNumber(incidentInput.trim())
                  }
                  setShowIncidentInput(false)
                }}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#1B2B4B',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        backgroundColor: '#1B2B4B', 
        color: '#ffffff',
        padding: '10px 16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>BloodTrack</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {shockIndex && (
              <span style={{ 
                backgroundColor: shockIndexMet ? '#D94F3D' : 'rgba(255,255,255,0.2)',
                padding: '4px 10px',
                borderRadius: 12,
                fontSize: 13,
                fontFamily: 'monospace'
              }}>
                SI: {shockIndex}
              </span>
            )}
            <span style={{ 
              backgroundColor: criteriaMet >= 2 ? '#22C55E' : 'rgba(255,255,255,0.2)',
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: 13
            }}>
              {criteriaMet}/4
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: 12, paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Patient Section */}
        <section style={{ ...card, padding: 12 }}>
          <h2 style={sectionTitle}>Patient</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Age Group */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {['Adult', 'Peds', 'Infant'].map((age) => (
                  <button
                    key={age}
                    onClick={() => setAgeGroup(age)}
                    style={{
                      height: 44,
                      borderRadius: 8,
                      border: '2px solid',
                      borderColor: ageGroup === age ? '#1B2B4B' : '#E5E7EB',
                      backgroundColor: ageGroup === age ? '#1B2B4B' : '#ffffff',
                      color: ageGroup === age ? '#ffffff' : '#374151',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>
            {/* Gender */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['M', 'F'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    border: '2px solid',
                    borderColor: gender === g ? (g === 'F' ? '#EC4899' : '#3B82F6') : '#E5E7EB',
                    backgroundColor: gender === g ? (g === 'F' ? '#EC4899' : '#3B82F6') : '#ffffff',
                    color: gender === g ? '#ffffff' : '#374151',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          {/* Rh warning for females */}
          {gender === 'F' && (
            <div style={{ 
              marginTop: 8, 
              padding: '8px 12px', 
              backgroundColor: '#FEF3C7', 
              borderRadius: 8,
              fontSize: 13,
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>⚠️</span>
              <span>Female patient - Rh status follow-up required</span>
            </div>
          )}
        </section>

        {/* Product Type - Large buttons */}
        <section style={{ ...card, padding: 12 }}>
          <h2 style={sectionTitle}>Blood Product</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {[
              { id: 'LTOWB', label: 'LTOWB', desc: 'Whole Blood' },
              { id: 'pRBC', label: 'pRBCs', desc: 'Red Cells' },
              { id: 'Plasma', label: 'Plasma', desc: 'FFP/Liquid' },
              { id: 'Platelets', label: 'Platelets', desc: 'PLT' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setProductType(p.id)}
                style={{
                  height: 64,
                  borderRadius: 10,
                  border: '2px solid',
                  borderColor: productType === p.id ? '#1B2B4B' : '#E5E7EB',
                  backgroundColor: productType === p.id ? '#1B2B4B' : '#ffffff',
                  color: productType === p.id ? '#ffffff' : '#1B2B4B',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700 }}>{p.label}</span>
                <span style={{ fontSize: 11, opacity: 0.7 }}>{p.desc}</span>
              </button>
            ))}
          </div>
          
          {/* Unit Count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 12 }}>
            <button
              onClick={() => setUnitCount(Math.max(1, unitCount - 1))}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '2px solid #E5E7EB',
                backgroundColor: '#F3F4F6',
                fontSize: 20,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              −
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}>{unitCount}</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>units</div>
            </div>
            <button
              onClick={() => setUnitCount(Math.min(6, unitCount + 1))}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '2px solid #1B2B4B',
                backgroundColor: '#1B2B4B',
                color: '#ffffff',
                fontSize: 20,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              +
            </button>
          </div>

          {/* Barcode */}
          <button
            onClick={() => setScannedBarcode('W' + Math.random().toString().slice(2, 10))}
            style={{
              width: '100%',
              marginTop: 12,
              padding: 12,
              borderRadius: 8,
              border: '2px dashed',
              borderColor: scannedBarcode ? '#22C55E' : '#D1D5DB',
              backgroundColor: scannedBarcode ? 'rgba(34, 197, 94, 0.1)' : '#F9FAFB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            {scannedBarcode ? (
              <>
                <span style={{ color: '#22C55E' }}>✓</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{scannedBarcode}</span>
              </>
            ) : (
              <span style={{ color: '#9CA3AF', fontSize: 14 }}>Tap to scan unit barcode</span>
            )}
          </button>
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
                  backgroundColor: indication === ind ? '#1B2B4B' : '#ffffff',
                  color: indication === ind ? '#ffffff' : '#374151',
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
                {sbpRange !== null ? (sbpRange < 90 ? 'CRITERIA MET' : 'Not Met') : '—'}
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
                {hrRange !== null ? (hrRange > 100 ? 'CRITERIA MET' : 'Not Met') : '—'}
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
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 12,
              borderRadius: 8,
              border: '2px solid',
              borderColor: alteredMental ? '#22C55E' : '#E5E7EB',
              backgroundColor: alteredMental ? 'rgba(34, 197, 94, 0.1)' : '#fff',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600 }}>Altered Mental Status</span>
            <div style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              backgroundColor: alteredMental ? '#22C55E' : '#D1D5DB',
              position: 'relative'
            }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#fff',
                position: 'absolute',
                top: 2,
                left: alteredMental ? 22 : 2,
                transition: 'left 0.15s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }} />
            </div>
          </button>
        </section>

        {/* Cold Chain Confirmation */}
        <section>
          <button
            onClick={() => setColdChain(!coldChain)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              borderRadius: 12,
              border: '2px solid',
              borderColor: coldChain ? '#1B2B4B' : '#D94F3D',
              backgroundColor: coldChain ? 'rgba(27, 43, 75, 0.05)' : 'rgba(217, 79, 61, 0.1)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: coldChain ? 'rgba(27, 43, 75, 0.15)' : 'rgba(217, 79, 61, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>
              {coldChain ? '❄️' : '⚠️'}
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Cold Chain</div>
              <div style={{ fontSize: 12, color: coldChain ? '#6B7280' : '#D94F3D' }}>
                {coldChain ? 'Confirmed' : 'NOT confirmed'}
              </div>
            </div>
            <div style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              backgroundColor: coldChain ? '#1B2B4B' : '#D94F3D',
              position: 'relative'
            }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#fff',
                position: 'absolute',
                top: 2,
                left: coldChain ? 22 : 2,
                transition: 'left 0.15s'
              }} />
            </div>
          </button>
        </section>
      </main>

      {/* Fixed Submit Button */}
      <div style={{
        position: 'fixed',
        bottom: 56,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderTop: '1px solid #E5E7EB'
      }}>
        <button
          disabled={!canSubmit}
          onClick={() => alert('Transfusion documented!\n\nIncident: ' + incidentNumber + '\n\nThis would export to NEMSIS XML for ePCR integration.')}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 10,
            border: 'none',
            backgroundColor: canSubmit ? '#D94F3D' : '#D1D5DB',
            color: '#ffffff',
            fontSize: 17,
            fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'not-allowed'
          }}
        >
          Submit Transfusion
        </button>
      </div>

      {/* Bottom Navigation */}
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
          { href: '/', label: 'Document', icon: '📋', active: pathname === '/' },
          { href: '/outcomes', label: 'Outcomes', icon: '📊', active: pathname === '/outcomes' },
          { href: '/dashboard', label: 'Dashboard', icon: '📈', active: pathname === '/dashboard' },
          { href: '/registry', label: 'Registry', icon: '📁', active: pathname === '/registry' },
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
              fontSize: 10,
              fontWeight: item.active ? 600 : 400
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
