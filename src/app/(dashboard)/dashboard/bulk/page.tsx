'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Loader2, FileText, CheckCircle2, TrendingUp, CreditCard } from 'lucide-react';
import { apiService } from '@/lib/services/api';
import { formatNumber, formatDateTime } from '@/lib/utils';
import { Progress } from '@/components/ui/progress'; // Assuming we can use standard progress if available, or just a bar div

export default function BulkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiService.bulk.upload(formData);
      setUploadResult(response.data);
      setFile(null); // Clear file
      loadData(); // Refresh list
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.response?.data?.error || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadResult = async (jobId: string) => {
    try {
      const response = await apiService.bulk.getStatus(jobId);
      if (response.data.result_url) {
        window.open(response.data.result_url, '_blank');
      } else {
        // Fallback or direct download link construction
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/bulk/download/${jobId}`, '_blank');
      }
    } catch (error) {
      // Direct download attempt if endpoint fails
      window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/bulk/download/${jobId}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bulk Validation</h2>
        <p className="text-muted-foreground">
          Heavy-duty processing for large email lists
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.bulkStats?.totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground">Processed lifetime</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Validity Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Upload Section */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>New Job</CardTitle>
              <CardDescription>Upload CSV (max 10MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-primary/20 rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/30 transition-colors relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center p-4">
                  {file ? (
                    <div className="space-y-2">
                      <FileText className="mx-auto h-8 w-8 text-primary" />
                      <p className="font-medium text-sm break-all">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Drag & Drop or Click</p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full"
              >
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Start Processing'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <div className="md:col-span-2">
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
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id || job._id}
                      className="p-4 border rounded-lg hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${job.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                            {job.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{job.name || job.filename || job.originalFileName}</p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(job.createdAt || job.created_at)}</p>
                          </div>
                        </div>
                        {job.status === 'completed' && (
                          <Button variant="outline" size="sm" onClick={() => downloadResult(job.id || job._id)}>
                            <Download className="h-3 w-3 mr-2" />
                            CSV
                          </Button>
                        )}
                      </div>

                      {/* Progress Bar (Visual) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{job.status === 'completed' ? 'Completed' : 'Processing...'}</span>
                          <span>{job.totalEmails ? Math.round(((job.validEmails + job.invalidEmails) / job.totalEmails) * 100) : 0}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${job.status === 'completed' ? 'bg-success' : 'bg-primary animate-pulse'}`}
                            style={{ width: `${job.totalEmails ? ((job.validEmails + job.invalidEmails) / job.totalEmails) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
