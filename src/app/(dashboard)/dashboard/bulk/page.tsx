'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Upload,
  Download,
  Loader2,
  FileText,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  X,
  XCircle,
  Eye,
  AlertCircle,
  Zap,
  Search,
  Shield,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { apiService } from '@/lib/services/api';
import { formatNumber, formatDateTime } from '@/lib/utils';
import type { BulkJob, BulkJobResult, ParsedEmailPreview } from '@/types/bulk';

type ValidationType = 'fast' | 'deep' | 'comprehensive';
type ResultFilter = 'all' | 'valid' | 'invalid';

export default function BulkPage() {
  // File & Upload State
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [emailPreview, setEmailPreview] = useState<ParsedEmailPreview | null>(null);

  // Upload Options
  const [validationType, setValidationType] = useState<ValidationType>('fast');
  const [webhookUrl, setWebhookUrl] = useState('');

  // Jobs State
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Results Modal State
  const [selectedJob, setSelectedJob] = useState<BulkJob | null>(null);
  const [jobResults, setJobResults] = useState<BulkJobResult[]>([]);
  const [resultsFilter, setResultsFilter] = useState<ResultFilter>('all');
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsTotalPages, setResultsTotalPages] = useState(1);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  // Polling ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Parse CSV file to preview emails
  const parseCSVPreview = async (file: File): Promise<ParsedEmailPreview> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split(/\r?\n/).filter(line => line.trim());

          // Check if first line is a header
          const firstLine = lines[0]?.toLowerCase() || '';
          const hasHeader = firstLine.includes('email') && !firstLine.includes('@');

          // Extract emails
          const emails: string[] = [];
          const startIndex = hasHeader ? 1 : 0;

          for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Handle CSV with multiple columns
            const parts = line.split(',');
            for (const part of parts) {
              const cleaned = part.replace(/["']/g, '').trim();
              if (cleaned.includes('@')) {
                emails.push(cleaned);
                break;
              }
            }
          }

          resolve({
            emails,
            totalCount: emails.length,
            previewEmails: emails.slice(0, 10),
            hasHeader
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Parse and preview
      try {
        const preview = await parseCSVPreview(selectedFile);
        setEmailPreview(preview);
      } catch (error) {
        console.error('Failed to parse CSV:', error);
        setEmailPreview(null);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setEmailPreview(null);
  };

  const loadData = useCallback(async () => {
    setIsLoadingJobs(true);
    try {
      const [jobsRes, statsRes] = await Promise.all([
        apiService.bulk.getJobs(),
        apiService.dashboard.getStats()
      ]);
      setJobs(jobsRes.data.jobs || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoadingJobs(false);
    }
  }, []);

  // Poll for processing jobs
  const pollProcessingJobs = useCallback(async () => {
    const processingJobs = jobs.filter(j => j.status === 'processing' || j.status === 'pending');
    if (processingJobs.length === 0) return;

    try {
      const updates = await Promise.all(
        processingJobs.map(job => apiService.bulk.getStatus(job.id || job._id || ''))
      );

      setJobs(prevJobs => {
        const updatedJobs = [...prevJobs];
        updates.forEach((res, idx) => {
          const jobId = processingJobs[idx].id || processingJobs[idx]._id;
          const jobIndex = updatedJobs.findIndex(j => (j.id || j._id) === jobId);
          if (jobIndex !== -1 && res.data) {
            updatedJobs[jobIndex] = { ...updatedJobs[jobIndex], ...res.data };
          }
        });
        return updatedJobs;
      });
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [jobs]);

  // Setup polling for processing jobs
  useEffect(() => {
    const hasProcessingJobs = jobs.some(j => j.status === 'processing' || j.status === 'pending');

    if (hasProcessingJobs) {
      pollingRef.current = setInterval(pollProcessingJobs, 5000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [jobs, pollProcessingJobs]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('validationType', validationType);
      if (webhookUrl) {
        formData.append('webhookUrl', webhookUrl);
      }

      const response = await apiService.bulk.upload(formData);
      clearFile();
      setWebhookUrl('');
      loadData();
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.response?.data?.error || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to cancel this job?')) return;

    try {
      await apiService.bulk.cancel(jobId);
      loadData();
    } catch (error: any) {
      console.error('Cancel error:', error);
      alert(error.response?.data?.error || 'Failed to cancel job');
    }
  };

  const loadJobResults = async (job: BulkJob, filter: ResultFilter = 'all', page: number = 1) => {
    setIsLoadingResults(true);
    try {
      const params: { page: number; limit: number; filter?: 'valid' | 'invalid' } = {
        page,
        limit: 20
      };
      if (filter !== 'all') {
        params.filter = filter;
      }

      const response = await apiService.bulk.getResults(job.id || job._id || '', params);
      setJobResults(response.data.data.results || []);
      setResultsTotalPages(response.data.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to load results:', error);
      setJobResults([]);
    } finally {
      setIsLoadingResults(false);
    }
  };

  const openResultsModal = (job: BulkJob) => {
    setSelectedJob(job);
    setResultsFilter('all');
    setResultsPage(1);
    loadJobResults(job, 'all', 1);
  };

  const closeResultsModal = () => {
    setSelectedJob(null);
    setJobResults([]);
    setResultsFilter('all');
    setResultsPage(1);
  };

  const handleFilterChange = (filter: ResultFilter) => {
    setResultsFilter(filter);
    setResultsPage(1);
    if (selectedJob) {
      loadJobResults(selectedJob, filter, 1);
    }
  };

  const handlePageChange = (page: number) => {
    setResultsPage(page);
    if (selectedJob) {
      loadJobResults(selectedJob, resultsFilter, page);
    }
  };

  const downloadResult = async (jobId: string) => {
    const token = document.cookie.split('; ').find(row => row.startsWith('next-auth'))?.split('=')[1];
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/bulk/download/${jobId}`, '_blank');
  };

  const getJobProgress = (job: BulkJob) => {
    if (!job.totalEmails) return 0;
    return Math.round(((job.validEmails + job.invalidEmails) / job.totalEmails) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'failed': return 'text-red-500 bg-red-500/10';
      case 'cancelled': return 'text-gray-500 bg-gray-500/10';
      case 'processing': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Bulk Validation</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Heavy-duty processing for large email lists
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.bulkStats?.totalJobs || jobs.length || 0}</div>
            <p className="text-xs text-muted-foreground">Processed lifetime</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Validity Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.bulkStats?.validityRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Of processed emails</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.credits?.remaining ? formatNumber(stats.credits.remaining) : 0}</div>
            <p className="text-xs text-muted-foreground">Available for validation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>New Job</CardTitle>
              <CardDescription>Upload CSV or TXT file (max 10MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div className="relative">
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-primary/20 rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/30 transition-colors">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center p-4">
                    {file ? (
                      <div className="space-y-1">
                        <FileText className="mx-auto h-6 w-6 text-primary" />
                        <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Drag & Drop or Click</p>
                      </div>
                    )}
                  </div>
                </div>
                {file && (
                  <button
                    onClick={clearFile}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Email Preview */}
              {emailPreview && (
                <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Preview</span>
                    <span className="text-xs text-muted-foreground">{emailPreview.totalCount} emails found</span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {emailPreview.previewEmails.map((email, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground truncate">
                        {email}
                      </div>
                    ))}
                    {emailPreview.totalCount > 10 && (
                      <div className="text-xs text-primary">
                        +{emailPreview.totalCount - 10} more...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Validation Type Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Validation Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setValidationType('fast')}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      validationType === 'fast'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <Zap className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-xs font-medium">Fast</span>
                  </button>
                  <button
                    onClick={() => setValidationType('deep')}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      validationType === 'deep'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <Search className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-xs font-medium">Deep</span>
                  </button>
                  <button
                    onClick={() => setValidationType('comprehensive')}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      validationType === 'comprehensive'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <Shield className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-xs font-medium">Full</span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {validationType === 'fast' && 'Quick syntax & domain check (1 credit/email)'}
                  {validationType === 'deep' && 'Includes SMTP verification (1 credit/email)'}
                  {validationType === 'comprehensive' && 'Full analysis with fraud detection (5 credits/email)'}
                </p>
              </div>

              {/* Webhook URL (Optional) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-3 w-3" />
                  Webhook URL (Optional)
                </Label>
                <Input
                  type="url"
                  placeholder="https://your-server.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Get notified when the job completes
                </p>
              </div>

              {/* Credit Estimate */}
              {emailPreview && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      Estimated: {formatNumber(emailPreview.totalCount * (validationType === 'comprehensive' ? 5 : 1))} credits
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || isUploading || !emailPreview?.totalCount}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Start Processing
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Jobs</CardTitle>
                  <CardDescription>Monitor status and download results</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadData} disabled={isLoadingJobs}>
                  {isLoadingJobs ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No jobs found. Start your first bulk validation!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div
                      key={job.id || job._id}
                      className="p-4 border rounded-lg hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${getStatusColor(job.status)}`}>
                            {getStatusIcon(job.status)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{job.name || job.filename || job.originalFileName}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatDateTime(job.createdAt || job.created_at || new Date().toISOString())}</span>
                              <span>•</span>
                              <span className="capitalize">{job.validationType || 'fast'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.status === 'completed' && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => openResultsModal(job)}>
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => downloadResult(job.id || job._id || '')}>
                                <Download className="h-3 w-3 mr-1" />
                                CSV
                              </Button>
                            </>
                          )}
                          {(job.status === 'processing' || job.status === 'pending') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleCancelJob(job.id || job._id || '')}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {job.status === 'completed' ? 'Completed' :
                             job.status === 'failed' ? 'Failed' :
                             job.status === 'cancelled' ? 'Cancelled' : 'Processing...'}
                          </span>
                          <span>
                            {job.validEmails + job.invalidEmails} / {job.totalEmails}
                            {' '}({getJobProgress(job)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              job.status === 'completed' ? 'bg-green-500' :
                              job.status === 'failed' ? 'bg-red-500' :
                              job.status === 'cancelled' ? 'bg-gray-500' :
                              'bg-primary animate-pulse'
                            }`}
                            style={{ width: `${getJobProgress(job)}%` }}
                          />
                        </div>
                        {job.status === 'completed' && (
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-green-500">{job.validEmails} valid</span>
                            <span className="text-red-500">{job.invalidEmails} invalid</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden m-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold">{selectedJob.name || selectedJob.originalFileName}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedJob.validEmails} valid • {selectedJob.invalidEmails} invalid
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => downloadResult(selectedJob.id || selectedJob._id || '')}>
                  <Download className="h-3 w-3 mr-1" />
                  Download CSV
                </Button>
                <button onClick={closeResultsModal} className="p-2 hover:bg-muted rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2">
                {(['all', 'valid', 'invalid'] as ResultFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      resultsFilter === filter
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-auto max-h-[50vh]">
              {isLoadingResults ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : jobResults.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No results found
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Email</th>
                      <th className="text-center p-3 text-sm font-medium w-24">Status</th>
                      <th className="text-left p-3 text-sm font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobResults.map((result, idx) => (
                      <tr key={idx} className="border-t hover:bg-muted/30">
                        <td className="p-3 text-sm font-mono">{result.email}</td>
                        <td className="p-3 text-center">
                          {result.isValid ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-500">
                              <XCircle className="h-3 w-3 mr-1" />
                              Invalid
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{result.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {resultsTotalPages > 1 && (
              <div className="p-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Page {resultsPage} of {resultsTotalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(resultsPage - 1)}
                    disabled={resultsPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(resultsPage + 1)}
                    disabled={resultsPage >= resultsTotalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
