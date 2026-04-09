'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { ProvenanceBadgeInline } from '@/components/registry/provenance-badge'
import type { DataSource } from '@/lib/types/registry'
import { Calendar, Ambulance, Building } from 'lucide-react'

interface EventDetailsProps {
  eventDate?: string
  agency?: string
  transportingUnit?: string
  destinationFacility?: string
  patientTransported?: boolean
  onEventDateChange: (value: string) => void
  onAgencyChange: (value: string) => void
  onTransportingUnitChange: (value: string) => void
  onDestinationFacilityChange: (value: string) => void
  onPatientTransportedChange: (value: boolean) => void
  provenanceSource?: DataSource
  readOnly?: boolean
}

export function EventDetails({
  eventDate,
  agency,
  transportingUnit,
  destinationFacility,
  patientTransported,
  onEventDateChange,
  onAgencyChange,
  onTransportingUnitChange,
  onDestinationFacilityChange,
  onPatientTransportedChange,
  provenanceSource,
  readOnly = false,
}: EventDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-chart-3" />
              Event Details
            </CardTitle>
            <CardDescription>
              Date, agency, and transport information
            </CardDescription>
          </div>
          {provenanceSource && <ProvenanceBadgeInline source={provenanceSource} />}
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="event-date">Event Date & Time</FieldLabel>
              <Input
                id="event-date"
                type="datetime-local"
                value={eventDate ? eventDate.slice(0, 16) : ''}
                onChange={(e) => onEventDateChange(e.target.value)}
                disabled={readOnly}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="agency">Agency</FieldLabel>
              <div className="relative">
                <Ambulance className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="agency"
                  value={agency || ''}
                  onChange={(e) => onAgencyChange(e.target.value)}
                  placeholder="EMS agency name"
                  className="pl-10"
                  disabled={readOnly}
                />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="transporting-unit">Transporting Unit</FieldLabel>
              <Input
                id="transporting-unit"
                value={transportingUnit || ''}
                onChange={(e) => onTransportingUnitChange(e.target.value)}
                placeholder="Unit identifier"
                disabled={readOnly}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="destination-facility">Destination Facility</FieldLabel>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="destination-facility"
                  value={destinationFacility || ''}
                  onChange={(e) => onDestinationFacilityChange(e.target.value)}
                  placeholder="Hospital name"
                  className="pl-10"
                  disabled={readOnly}
                />
              </div>
            </Field>
          </div>

          <Field orientation="horizontal" className="pt-2">
            <Switch
              id="patient-transported"
              checked={patientTransported ?? true}
              onCheckedChange={onPatientTransportedChange}
              disabled={readOnly}
            />
            <div>
              <FieldLabel htmlFor="patient-transported" className="cursor-pointer">
                Patient Transported
              </FieldLabel>
              <FieldDescription>
                Was the patient transported to the receiving facility?
              </FieldDescription>
            </div>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
