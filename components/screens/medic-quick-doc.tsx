'use client'

import { useState } from 'react'

export function MedicQuickDoc() {
  const [productType, setProductType] = useState<string | null>(null)
  const [unitCount, setUnitCount] = useState(1)
  const [indication, setIndication] = useState<string | null>(null)
  const [sbpRange, setSbpRange] = useState<number | null>(null)
  const [hrRange, setHrRange] = useState<number | null>(null)
  const [alteredMental, setAlteredMental] = useState(false)
  const [coldChain, setColdChain] = useState(true)
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null)

  // Calculate shock index
  const shockIndex = sbpRange && hrRange ? (hrRange / sbpRange).toFixed(1) : null
  const shockIndexMet = shockIndex ? parseFloat(shockIndex) > 0.9 : false

  // Count criteria met
  let criteriaMet = 0
  if (sbpRange !== null && sbpRange < 90) criteriaMet++
  if (hrRange !== null && hrRange > 100) criteriaMet++
  if (shockIndexMet) criteriaMet++
  if (alteredMental) criteriaMet++

  const canSubmit = productType !== null && indication !== null && (sbpRange !== null || hrRange !== null)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        backgroundColor: '#1B2B4B', 
        color: '#ffffff',
        padding: '12px 16px',
        borderBottom: '1px solid #2d3f5f'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🩸</span>
            <span style={{ fontSize: 18, fontWeight: 700 }}>BloodTrack</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {shockIndex && (
              <span style={{ 
                backgroundColor: shockIndexMet ? '#D94F3D' : 'rgba(255,255,255,0.15)',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 14,
                fontFamily: 'monospace'
              }}>
                SI: {shockIndex}
              </span>
            )}
            <span style={{ 
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 14
            }}>
              {criteriaMet}/4 criteria
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: 16, paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Product Type */}
        <section>
          <h2 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: 12 }}>
            Product Type
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {['LTOWB', 'pRBCs', 'Plasma', 'Platelets'].map((type) => (
              <button
                key={type}
                onClick={() => setProductType(type)}
                style={{
                  minHeight: 80,
                  borderRadius: 12,
                  border: '2px solid',
                  borderColor: productType === type ? '#1B2B4B' : '#E5E7EB',
                  backgroundColor: productType === type ? '#1B2B4B' : '#ffffff',
                  color: productType === type ? '#ffffff' : '#1B2B4B',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        {/* Unit Count */}
        <section>
          <h2 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: 12 }}>
            Units
          </h2>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 24, 
            padding: 16, 
            backgroundColor: '#ffffff', 
            borderRadius: 12, 
            border: '1px solid #E5E7EB' 
          }}>
            <button
              onClick={() => setUnitCount(Math.max(1, unitCount - 1))}
              disabled={unitCount <= 1}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                border: '2px solid #E5E7EB',
                backgroundColor: '#F3F4F6',
                fontSize: 24,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              −
            </button>
            <span style={{ fontSize: 48, fontWeight: 700, width: 60, textAlign: 'center' }}>{unitCount}</span>
            <button
              onClick={() => setUnitCount(Math.min(6, unitCount + 1))}
              disabled={unitCount >= 6}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                border: '2px solid #1B2B4B',
                backgroundColor: '#1B2B4B',
                color: '#ffffff',
                fontSize: 24,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              +
            </button>
          </div>
        </section>

        {/* Barcode Scanner */}
        <section>
          <h2 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: 12 }}>
            Unit ID
          </h2>
          <button
            onClick={() => setScannedBarcode('W' + Math.random().toString().slice(2, 10))}
            style={{
              width: '100%',
              padding: 24,
              borderRadius: 12,
              border: '2px dashed',
              borderColor: scannedBarcode ? '#22C55E' : '#E5E7EB',
              backgroundColor: scannedBarcode ? 'rgba(34, 197, 94, 0.1)' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              cursor: 'pointer'
            }}
          >
            {scannedBarcode ? (
              <>
                <span style={{ color: '#22C55E', fontSize: 20 }}>✓</span>
                <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 600 }}>{scannedBarcode}</span>
              </>
            ) : (
              <span style={{ color: '#6B7280' }}>Tap to scan barcode</span>
            )}
          </button>
        </section>

        {/* Indication */}
        <section>
          <h2 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: 12 }}>
            Indication
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {['Trauma', 'GI Bleed', 'Obstetric', 'Medical/Other'].map((type) => (
              <button
                key={type}
                onClick={() => setIndication(type)}
                style={{
                  minHeight: 56,
                  borderRadius: 12,
                  border: '2px solid',
                  borderColor: indication === type ? '#1B2B4B' : '#E5E7EB',
                  backgroundColor: indication === type ? '#1B2B4B' : '#ffffff',
                  color: indication === type ? '#ffffff' : '#1B2B4B',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        {/* Vitals */}
        <section>
          <h2 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: 12 }}>
            Vitals
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* SBP */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 600 }}>SBP</span>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: 20, 
                  fontSize: 12,
                  fontWeight: 500,
                  backgroundColor: sbpRange !== null && sbpRange < 90 ? '#22C55E' : '#E5E7EB',
                  color: sbpRange !== null && sbpRange < 90 ? '#ffffff' : '#374151'
                }}>
                  {sbpRange !== null ? (sbpRange < 90 ? 'Met (<90)' : 'Not Met') : '—'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { label: '<70', value: 60, met: true },
                  { label: '70-89', value: 80, met: true },
                  { label: '90-99', value: 95, met: false },
                  { label: '100+', value: 110, met: false },
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setSbpRange(range.value)}
                    style={{
                      padding: '12px 0',
                      borderRadius: 8,
                      border: '2px solid',
                      borderColor: sbpRange === range.value ? (range.met ? '#22C55E' : '#1B2B4B') : '#E5E7EB',
                      backgroundColor: sbpRange === range.value ? (range.met ? '#22C55E' : '#1B2B4B') : '#ffffff',
                      color: sbpRange === range.value ? '#ffffff' : '#374151',
                      fontFamily: 'monospace',
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* HR */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 600 }}>HR</span>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: 20, 
                  fontSize: 12,
                  fontWeight: 500,
                  backgroundColor: hrRange !== null && hrRange > 100 ? '#22C55E' : '#E5E7EB',
                  color: hrRange !== null && hrRange > 100 ? '#ffffff' : '#374151'
                }}>
                  {hrRange !== null ? (hrRange > 100 ? 'Met (>100)' : 'Not Met') : '—'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { label: '<80', value: 70, met: false },
                  { label: '80-99', value: 90, met: false },
                  { label: '100-119', value: 110, met: true },
                  { label: '120+', value: 130, met: true },
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setHrRange(range.value)}
                    style={{
                      padding: '12px 0',
                      borderRadius: 8,
                      border: '2px solid',
                      borderColor: hrRange === range.value ? (range.met ? '#22C55E' : '#1B2B4B') : '#E5E7EB',
                      backgroundColor: hrRange === range.value ? (range.met ? '#22C55E' : '#1B2B4B') : '#ffffff',
                      color: hrRange === range.value ? '#ffffff' : '#374151',
                      fontFamily: 'monospace',
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Altered Mental Status */}
        <section>
          <button
            onClick={() => setAlteredMental(!alteredMental)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderRadius: 12,
              border: '2px solid',
              borderColor: alteredMental ? '#22C55E' : '#E5E7EB',
              backgroundColor: alteredMental ? 'rgba(34, 197, 94, 0.1)' : '#ffffff',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontWeight: 600 }}>Altered Mental Status</span>
            <div style={{
              width: 52,
              height: 28,
              borderRadius: 14,
              backgroundColor: alteredMental ? '#22C55E' : '#E5E7EB',
              position: 'relative',
              transition: 'background-color 0.2s'
            }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                position: 'absolute',
                top: 2,
                left: alteredMental ? 26 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </div>
          </button>
        </section>

        {/* Cold Chain */}
        <section>
          <button
            onClick={() => setColdChain(!coldChain)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: 16,
              borderRadius: 12,
              border: '2px solid',
              borderColor: coldChain ? '#1B2B4B' : '#D94F3D',
              backgroundColor: coldChain ? 'rgba(27, 43, 75, 0.05)' : 'rgba(217, 79, 61, 0.1)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: coldChain ? 'rgba(27, 43, 75, 0.2)' : 'rgba(217, 79, 61, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24
            }}>
              {coldChain ? '❄️' : '⚠️'}
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontWeight: 600, margin: 0 }}>Cold Chain</p>
              <p style={{ fontSize: 14, color: coldChain ? '#6B7280' : '#D94F3D', margin: 0 }}>
                {coldChain ? 'Confirmed - product maintained at temp' : 'NOT confirmed - document reason'}
              </p>
            </div>
            <div style={{
              width: 52,
              height: 28,
              borderRadius: 14,
              backgroundColor: coldChain ? '#1B2B4B' : '#D94F3D',
              position: 'relative'
            }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                position: 'absolute',
                top: 2,
                left: coldChain ? 26 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </div>
          </button>
        </section>
      </main>

      {/* Fixed Submit Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTop: '1px solid #E5E7EB'
      }}>
        <button
          disabled={!canSubmit}
          onClick={() => alert('Submitted!')}
          style={{
            width: '100%',
            height: 56,
            borderRadius: 12,
            border: 'none',
            backgroundColor: canSubmit ? '#D94F3D' : '#9CA3AF',
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          Submit Transfusion
        </button>
      </div>
    </div>
  )
}
