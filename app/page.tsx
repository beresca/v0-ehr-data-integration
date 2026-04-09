import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Droplet, 
  Baby, 
  AlertCircle, 
  Building2, 
  ArrowRight, 
  Shield,
  Database,
  FileCheck,
  Ambulance
} from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="h-6 w-6 text-primary" />
            <span className="font-semibold">Transfusion Registry</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Droplet className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance max-w-3xl mx-auto">
              Prehospital Blood Transfusion Registry
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Performance improvement documentation system with EMS/EHR integration, 
              automated data linking, and complete audit trail for provenance tracking.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Start Documenting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Complete PI Documentation</h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Comprehensive form types for all prehospital blood transfusion scenarios
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10 mb-4">
                    <Droplet className="h-6 w-6 text-chart-1" />
                  </div>
                  <CardTitle>Adult PI Form</CardTitle>
                  <CardDescription>
                    Document adult patient transfusions with vital sign thresholds, 
                    indications, and complications
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10 mb-4">
                    <Baby className="h-6 w-6 text-chart-4" />
                  </div>
                  <CardTitle>Pediatric PI Form</CardTitle>
                  <CardDescription>
                    Age-specific criteria and thresholds for pediatric patients 
                    requiring blood products
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 mb-4">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle>Emergency Release</CardTitle>
                  <CardDescription>
                    Track emergency blood product releases and document 
                    administration status
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10 mb-4">
                    <Building2 className="h-6 w-6 text-chart-2" />
                  </div>
                  <CardTitle>Blood Bank Follow-up</CardTitle>
                  <CardDescription>
                    Rh-negative patient documentation including RhoGAM, 
                    referrals, and testing
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Integration Features */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold">EMS Integration with ImageTrend Elite</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Automatically import patient data, vital signs, and assessments from your 
                  EMS ePCR system. Reduce manual data entry and ensure accuracy.
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ems-badge/20">
                      <Ambulance className="h-4 w-4 text-ems-badge-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">One-Click Import</p>
                      <p className="text-sm text-muted-foreground">
                        Search and import EMS run data directly into your forms
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Database className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Provenance Tracking</p>
                      <p className="text-sm text-muted-foreground">
                        Every field shows its source: EMS, EHR, or manual entry
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                      <FileCheck className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Complete Audit Trail</p>
                      <p className="text-sm text-muted-foreground">
                        Full history of changes with timestamps and user attribution
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-ems-badge text-ems-badge-foreground">
                      <Ambulance className="h-3 w-3" />
                      EMS
                    </span>
                    <span className="text-sm">Patient Age: <strong>34 years</strong></span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-ems-badge text-ems-badge-foreground">
                      <Ambulance className="h-3 w-3" />
                      EMS
                    </span>
                    <span className="text-sm">SBP: <strong className="text-destructive">82 mmHg</strong></span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-manual-badge text-manual-badge-foreground">
                      Manual
                    </span>
                    <span className="text-sm">Indication: <strong>Injury/Trauma</strong></span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">Built for Healthcare Security</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Row-level security ensures users only access their own data. 
              All data is encrypted in transit and at rest.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Prehospital Blood Transfusion Registry - Performance Improvement Documentation System</p>
        </div>
      </footer>
    </div>
  )
}
