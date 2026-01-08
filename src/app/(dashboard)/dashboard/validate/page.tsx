'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiService } from '@/lib/services/api';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';

export default function ValidatePage() {
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'fast' | 'deep'>('fast');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  // Fetch credits from dashboard stats API
  const fetchCredits = async () => {
    try {
      const response = await apiService.dashboard.getStats();
      if (response.data?.data?.credits?.remaining !== undefined) {
        setCreditsRemaining(response.data.data.credits.remaining);
      }
    } catch (err) {
      console.error('Failed to fetch credits:', err);
    }
  };

  // Fetch credits on initial load
  useEffect(() => {
    fetchCredits();
  }, []);

  // Normalize API response to a consistent format for the UI
  const normalizeResult = (rawData: any) => {
    // The API returns nested structure: { success, data: { success, data: { email, result: {...} } } }
    // We need to extract and normalize the actual validation result

    let data = rawData;

    // Unwrap nested data structures
    if (data?.data?.data?.result) {
      // Triple nested with result: { data: { data: { result: {...} } } }
      data = data.data.data.result;
    } else if (data?.data?.result) {
      // Double nested with result: { data: { result: {...} } }
      data = data.data.result;
    } else if (data?.result) {
      // Single nested with result: { result: {...} }
      data = data.result;
    } else if (data?.data?.data) {
      // Triple nested without result
      data = data.data.data;
    } else if (data?.data) {
      // Double nested without result
      data = data.data;
    }

    // Now normalize the fields to match what the UI expects
    const normalized: any = {
      email: data.email,
      is_valid: data.is_valid,
      reason: data.reason,
      cached: data.cached,
      processing_time_ms: rawData?.data?.data?.processing_time_ms || rawData?.data?.processing_time_ms || data.processing_time_ms,
    };

    // Normalize format validation - derive from validation object if not present
    normalized.format = data.format || {
      syntax_valid: data.validation?.domain_valid !== false && data.is_valid !== false,
      tld_valid: data.domain?.exists || data.validation?.domain_valid,
      is_unicode: false,
      normalized: data.email,
    };

    // Normalize domain info
    normalized.domain = data.domain || {};

    // Normalize risk analysis - map from validation object
    normalized.risk = data.risk || {
      is_disposable: data.validation?.is_disposable || false,
      is_role_account: data.validation?.is_role_account || false,
      is_fraud: data.validation?.is_fraud || false,
      fraud_evidence: data.validation?.fraud_evidence || [],
      disposable_confidence: data.validation?.is_disposable ? 0.9 : 0,
    };

    // Normalize provider info
    normalized.provider = data.provider || {
      name: data.domain?.name ? data.domain.name.split('.')[0] : 'Unknown',
      type: 'Unknown',
      is_free: data.validation?.is_disposable || false,
      is_business: !data.validation?.is_disposable && !data.validation?.is_role_account,
    };

    // Include intelligence data if present
    if (data.intelligence) {
      normalized.intelligence = data.intelligence;
    }

    // Include risk assessment if present
    if (data.risk_assessment) {
      normalized.risk_assessment = data.risk_assessment;
    }

    // Include SMTP data if present
    if (data.smtp) {
      normalized.smtp = data.smtp;
    }

    // Include advanced data if present
    if (data.advanced) {
      normalized.advanced = data.advanced;
    }

    // Include deliverability if present
    if (data.deliverability) {
      normalized.deliverability = data.deliverability;
    }

    // Extract credits info from outer response
    normalized.meta = {
      creditsRemaining: rawData?.data?.credits_remaining || rawData?.credits_remaining,
      creditsUsed: rawData?.data?.credits_used || rawData?.credits_used,
    };

    return normalized;
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiService.validation.validate(email, mode);
      const normalized = normalizeResult(response.data);
      setResult(normalized);
      // Fetch updated credits after validation
      await fetchCredits();
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Email Validation</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Real-time email verification with syntax checks, domain analysis, and SMTP verification
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
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
          {error && (
            <Card className="border-destructive bg-destructive/5 mb-4">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}
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
              <Card className={`border-t-4 ${result.is_valid ? 'border-t-success' : 'border-t-destructive'}`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`
                          h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold
                          ${result.is_valid ? 'bg-success/10 text-success ring-2 ring-success/20' : 'bg-destructive/10 text-destructive ring-2 ring-destructive/20'}
                        `}>
                        {result.score || result.deliverability?.deliverability_score ||
                          (result.risk_assessment?.score !== undefined
                            ? Math.round((1 - result.risk_assessment.score) * 100)
                            : (result.is_valid ? 100 : 0)
                          )}
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-2xl font-bold break-all">{result.email}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${result.is_valid ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                            {result.is_valid ? 'Valid' : 'Invalid'}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {result.processing_time_ms ? `${result.processing_time_ms.toFixed(1)}ms` : 'Processed'}
                          </span>
                        </div>
                        {result.reason && !result.is_valid && (
                          <div className="mt-2 text-sm text-destructive">
                            Reason: {result.reason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-center sm:text-right">
                      <div className="text-sm text-muted-foreground">Deliverability</div>
                      <div className={`font-medium ${result.is_valid ? 'text-success' : 'text-destructive'}`}>
                        {typeof result.deliverability === 'object'
                          ? `${result.deliverability.recommendation || 'Unknown'} (${result.deliverability.quality_grade || '-'})`
                          : (result.is_valid ? 'Deliverable' : 'Undeliverable')
                        }
                      </div>
                      {result.risk_assessment?.risk_level && (
                        <div className={`text-sm mt-1 ${
                          result.risk_assessment.risk_level === 'low' ? 'text-success' :
                          result.risk_assessment.risk_level === 'medium' ? 'text-yellow-500' : 'text-destructive'
                        }`}>
                          Risk: {result.risk_assessment.risk_level}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Checks Grid */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {/* Format Validation */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Format Validation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CheckItem
                      label="Syntax Valid"
                      status={result.format?.syntax_valid ?? (result.domain?.exists && !result.risk?.is_fraud)}
                    />
                    <CheckItem
                      label="TLD Valid"
                      status={result.format?.tld_valid ?? result.domain?.exists}
                      value={result.format?.tld?.toUpperCase() || result.domain?.name?.split('.').pop()?.toUpperCase()}
                    />
                    <CheckItem
                      label="Unicode"
                      status={result.format?.is_unicode ? 'moderate' : true}
                      value={result.format?.is_unicode ? 'Yes' : 'No'}
                    />
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="font-medium text-sm">Normalized</span>
                      <span className="text-sm text-muted-foreground font-mono truncate max-w-[200px]">
                        {result.format?.normalized || result.email}
                      </span>
                    </div>
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
                    <CheckItem label="Role Account" status={!result.risk?.is_role_account} value={result.risk?.is_role_account ? `Yes (${result.risk.role_type || 'detected'})` : 'No'} />
                    <CheckItem label="Fraud Detected" status={!result.risk?.is_fraud} value={result.risk?.is_fraud ? 'Yes' : 'No'} />
                    {result.risk_assessment && (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="font-medium text-sm">Risk Level</span>
                          <span className={`text-sm font-medium capitalize ${
                            result.risk_assessment.risk_level === 'low' ? 'text-success' :
                            result.risk_assessment.risk_level === 'medium' ? 'text-yellow-500' : 'text-destructive'
                          }`}>{result.risk_assessment.risk_level}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="font-medium text-sm">Risk Score</span>
                          <span className="text-sm text-muted-foreground font-mono">{Math.round(result.risk_assessment.score * 100)}%</span>
                        </div>
                      </>
                    )}
                    {result.risk?.fraud_evidence && result.risk.fraud_evidence.length > 0 && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <span className="font-medium text-sm block mb-2 text-destructive">Fraud Evidence</span>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {result.risk.fraud_evidence.map((evidence: string, i: number) => (
                            <div key={i}>• {evidence}</div>
                          ))}
                        </div>
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

                {/* Pattern Analysis (if available) */}
                {result.intelligence?.pattern_analysis && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Pattern Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <CheckItem
                        label="Pattern Suspicious"
                        status={!result.intelligence.pattern_analysis.is_suspicious}
                        value={result.intelligence.pattern_analysis.is_suspicious ? 'Yes' : 'No'}
                      />
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium text-sm">Pattern Score</span>
                        <span className="text-sm text-muted-foreground font-mono">
                          {Math.round(result.intelligence.pattern_analysis.score * 100)}%
                        </span>
                      </div>
                      {result.intelligence.pattern_analysis.patterns && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <span className="font-medium text-sm block mb-2">Pattern Details</span>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Local Length</span>
                              <span className="font-mono">{result.intelligence.pattern_analysis.patterns.local_length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Numbers Ratio</span>
                              <span className="font-mono">{Math.round(result.intelligence.pattern_analysis.patterns.numbers_ratio * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Random Looking</span>
                              <span className="font-mono">{result.intelligence.pattern_analysis.patterns.random_looking ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Consecutive #s</span>
                              <span className="font-mono">{result.intelligence.pattern_analysis.patterns.consecutive_numbers ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {result.intelligence.pattern_analysis.reasons && result.intelligence.pattern_analysis.reasons.length > 0 && (
                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <span className="font-medium text-sm block mb-2 text-yellow-600">Pattern Warnings</span>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {result.intelligence.pattern_analysis.reasons.map((reason: string, i: number) => (
                              <div key={i}>• {reason}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

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
                        <span className={`text-sm font-medium capitalize ${result.deliverability.risk_level === 'low' ? 'text-success' :
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
                        <span className={`font-medium capitalize ${(result.quality === 'excellent' || result.deliverability?.quality_grade === 'A') ? 'text-success' :
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
                    {creditsRemaining !== null && (
                      <div className="text-muted-foreground">
                        Credits remaining: <span className="font-mono text-foreground font-medium">{creditsRemaining}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
