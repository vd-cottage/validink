'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiService } from '@/lib/services/api';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Mail, ChevronDown, ChevronUp } from 'lucide-react';

export default function ValidatePage() {
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'fast' | 'deep'>('fast');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showJson, setShowJson] = useState(false);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiService.validation.validate(email, mode);
      // API returns { success, data: { data: {...validation...}, meta: {...} } }
      // or { success, data: {...validation...}, meta: {...} }
      const responseData = response.data;

      // Handle nested data structure from API
      if (responseData?.data?.data) {
        // Double nested: { data: { data: {...}, meta: {...} } }
        setResult({
          ...responseData.data.data,
          meta: responseData.data.meta || responseData.meta
        });
      } else if (responseData?.data && responseData?.success !== undefined) {
        // Single nested: { success, data: {...}, meta: {...} }
        setResult({
          ...responseData.data,
          meta: responseData.meta
        });
      } else {
        // Direct data
        setResult(responseData);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper for check status icons
  const CheckItem = ({ label, status, value }: { label: string, status: boolean | string, value?: string }) => {
    const isSuccess = status === true || status === 'valid' || status === 'low' || status === 'clean';
    const isWarning = status === 'moderate' || status === 'medium' || status === 'risky';

    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : isWarning ? (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
          <span className="font-medium text-sm">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground font-mono">
          {value || (status ? 'Yes' : 'No')}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Email Validation</h2>
        <p className="text-muted-foreground">
          Real-time email verification with syntax checks, domain analysis, and SMTP verification
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validate Email</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={(v) => setMode(v as 'fast' | 'deep')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="fast">Fast Check</TabsTrigger>
                  <TabsTrigger value="deep">Deep Analysis</TabsTrigger>
                </TabsList>

                <form onSubmit={handleValidate} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Validate Now
                      </>
                    )}
                  </Button>
                </form>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick tips based on mode */}
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-primary mb-2">
                {mode === 'fast' ? 'Fast Mode' : 'Deep Analysis'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {mode === 'fast'
                  ? 'Checks syntax, domain DNS records, disposable lists, and role accounts. Instant results.'
                  : 'Includes all fast checks plus real-time SMTP connection to verify mailbox existence. Takes 2-5s.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {loading ? (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground animate-pulse">Running {mode} validation checks...</p>
              </div>
            </Card>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Main Score Card */}
              <Card className="border-t-4 border-t-primary">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className={`
                          h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold
                          ${result.is_valid ? 'bg-success/10 text-success ring-2 ring-success/20' : 'bg-destructive/10 text-destructive ring-2 ring-destructive/20'}
                        `}>
                        {result.score || result.deliverability?.deliverability_score || (result.is_valid ? 100 : 0)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{result.email}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${result.is_valid ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                            {result.is_valid ? 'Valid' : 'Invalid'}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {result.analysis_time ? `${result.analysis_time}ms` : 'Processed'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Deliverability</div>
                      <div className={`font-medium ${
                        (typeof result.deliverability === 'object'
                          ? result.deliverability?.recommendation === 'accept'
                          : result.deliverability === 'deliverable' || result.is_valid
                        ) ? 'text-success' : 'text-destructive'
                      }`}>
                        {typeof result.deliverability === 'object'
                          ? `${result.deliverability.recommendation || 'Unknown'} (${result.deliverability.quality_grade || '-'})`
                          : (result.deliverability || (result.is_valid ? 'Deliverable' : 'Undeliverable'))
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Checks Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Format Validation */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Format Validation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CheckItem label="Syntax Valid" status={result.format?.syntax_valid} />
                    <CheckItem label="TLD Valid" status={result.format?.tld_valid} value={result.format?.tld?.toUpperCase()} />
                    <CheckItem label="Unicode" status={result.format?.is_unicode ? 'moderate' : true} value={result.format?.is_unicode ? 'Yes' : 'No'} />
                    {result.format?.normalized && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium text-sm">Normalized</span>
                        <span className="text-sm text-muted-foreground font-mono">{result.format.normalized}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Domain Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Domain Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CheckItem label="Domain Exists" status={result.domain?.exists} />
                    <CheckItem label="MX Records" status={result.domain?.has_mx} />
                    {result.domain?.mx_servers && result.domain.mx_servers.length > 0 && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <span className="font-medium text-sm block mb-1">MX Servers</span>
                        <div className="text-xs text-muted-foreground font-mono space-y-1">
                          {result.domain.mx_servers.slice(0, 3).map((mx: string, i: number) => (
                            <div key={i} className="truncate">{mx}</div>
                          ))}
                          {result.domain.mx_servers.length > 3 && (
                            <div className="text-xs opacity-60">+{result.domain.mx_servers.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    )}
                    {result.domain?.name && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium text-sm">Domain</span>
                        <span className="text-sm text-muted-foreground font-mono">{result.domain.name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Risk Analysis */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Risk Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CheckItem label="Disposable Email" status={!result.risk?.is_disposable} value={result.risk?.is_disposable ? 'Yes - Detected' : 'No'} />
                    <CheckItem label="Role Account" status={!result.risk?.is_role_account} value={result.risk?.is_role_account ? `Yes (${result.risk.role_type})` : 'No'} />
                    {result.risk?.disposable_confidence !== undefined && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium text-sm">Disposable Confidence</span>
                        <span className="text-sm text-muted-foreground font-mono">{Math.round(result.risk.disposable_confidence * 100)}%</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Provider Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Provider Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="font-medium text-sm">Provider</span>
                      <span className="text-sm text-muted-foreground font-mono">{result.provider?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="font-medium text-sm">Type</span>
                      <span className="text-sm text-muted-foreground font-mono capitalize">{result.provider?.type || 'Unknown'}</span>
                    </div>
                    <CheckItem label="Free Provider" status={!result.provider?.is_free} value={result.provider?.is_free ? 'Yes' : 'No'} />
                    <CheckItem label="Business Domain" status={result.provider?.is_business} value={result.provider?.is_business ? 'Yes' : 'No'} />
                    {result.provider?.confidence !== undefined && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium text-sm">Provider Confidence</span>
                        <span className="text-sm text-muted-foreground font-mono">{Math.round(result.provider.confidence * 100)}%</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* SMTP Verification (Deep Analysis Only) */}
                {result.smtp && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        SMTP Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <CheckItem label="SMTP Valid" status={result.smtp.valid} />
                      <CheckItem label="Mailbox Exists" status={result.smtp.mailbox_exists} value={result.smtp.mailbox_exists === null ? 'Unknown' : (result.smtp.mailbox_exists ? 'Yes' : 'No')} />
                      <CheckItem label="Greylisted" status={!result.smtp.is_greylisted} value={result.smtp.is_greylisted ? 'Yes' : 'No'} />
                      {result.smtp.response_message && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <span className="font-medium text-sm block mb-1">Response</span>
                          <span className="text-xs text-muted-foreground">{result.smtp.response_message}</span>
                        </div>
                      )}
                      {result.smtp.confidence !== undefined && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="font-medium text-sm">Confidence</span>
                          <span className="text-sm text-muted-foreground font-mono">{Math.round(result.smtp.confidence * 100)}%</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Advanced Analysis (Deep Analysis Only) */}
                {result.advanced && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Advanced Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <CheckItem label="Catch-All Domain" status={!result.advanced.is_catchall} value={result.advanced.is_catchall ? 'Yes' : 'No'} />
                      <CheckItem label="Spam Trap" status={!result.advanced.is_spamtrap} value={result.advanced.is_spamtrap ? `Yes (${result.advanced.spamtrap_risk})` : 'No'} />
                      {result.advanced.spamtrap_reasons && result.advanced.spamtrap_reasons.length > 0 && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <span className="font-medium text-sm block mb-1">Spam Trap Reasons</span>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {result.advanced.spamtrap_reasons.map((reason: string, i: number) => (
                              <div key={i}>• {reason}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Deliverability Details (Deep Analysis Only) */}
                {typeof result.deliverability === 'object' && result.deliverability?.score_breakdown && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Deliverability Score Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium text-sm">Total Score</span>
                        <span className="text-sm font-mono font-bold">{result.deliverability.deliverability_score}/{result.deliverability.max_score}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium text-sm">Risk Level</span>
                        <span className={`text-sm font-medium capitalize ${
                          result.deliverability.risk_level === 'low' ? 'text-success' :
                          result.deliverability.risk_level === 'medium-low' ? 'text-blue-500' :
                          result.deliverability.risk_level === 'medium' ? 'text-yellow-500' : 'text-destructive'
                        }`}>{result.deliverability.risk_level}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <span className="font-medium text-sm block mb-2">Score Components</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(result.deliverability.score_breakdown).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="font-mono">{value as number}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Processing Info */}
              <Card className="bg-muted/30">
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-6 flex-wrap">
                      <div>
                        <span className="text-muted-foreground">Processing Time: </span>
                        <span className="font-mono font-medium">{result.processing_time_ms?.toFixed(0) || result.meta?.processingTimeMs || '-'}ms</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quality: </span>
                        <span className={`font-medium capitalize ${
                          (result.quality === 'excellent' || result.deliverability?.quality_grade === 'A') ? 'text-success' :
                          (result.quality === 'good' || result.deliverability?.quality_grade === 'B') ? 'text-blue-500' :
                          (result.quality === 'fair' || result.deliverability?.quality_grade === 'C') ? 'text-yellow-500' : 'text-destructive'
                        }`}>{result.quality || result.deliverability?.quality_grade || 'Unknown'}</span>
                      </div>
                      {result.validation_level && (
                        <div>
                          <span className="text-muted-foreground">Mode: </span>
                          <span className="font-mono capitalize">{result.validation_level}</span>
                        </div>
                      )}
                      {result.features_checked && (
                        <div>
                          <span className="text-muted-foreground">Features: </span>
                          <span className="font-mono">{result.features_checked}</span>
                        </div>
                      )}
                      {result.cached !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Cached: </span>
                          <span className="font-mono">{result.cached ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                    </div>
                    {result.meta?.creditsRemaining !== undefined && (
                      <div className="text-muted-foreground">
                        Credits remaining: <span className="font-mono text-foreground">{result.meta.creditsRemaining}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* JSON Toggle */}
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setShowJson(!showJson)} className="text-muted-foreground">
                  {showJson ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                  {showJson ? 'Hide Raw Data' : 'View Raw Data'}
                </Button>
              </div>

              {showJson && (
                <Card className="bg-muted font-mono text-xs">
                  <CardContent className="p-4 overflow-auto max-h-96">
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg text-muted-foreground">
              <div className="text-center space-y-2">
                <Mail className="h-12 w-12 mx-auto opacity-20" />
                <p>Enter an email to see detailed results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
