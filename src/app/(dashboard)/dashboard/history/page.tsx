'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/lib/stores/dashboardStore';
import { formatDateTime } from '@/lib/utils';
import { Search, CheckCircle, XCircle, AlertTriangle, Download, FileText, ChevronDown, ChevronUp, Zap, Shield, Clock } from 'lucide-react';

interface ValidationActivity {
  id: string;
  email: string;
  status: string;
  type: string;
  validation_type: string;
  credits_used: number;
  processing_time: number;
  timestamp: string;
  score: number;
  quality?: string;
  risk_level?: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const { recentActivity, fetchRecentActivity, isLoading } = useDashboardStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActivity, setFilteredActivity] = useState<ValidationActivity[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch when session is authenticated
    if (status === 'authenticated' && session?.user?.accessToken) {
      fetchRecentActivity();
    }
  }, [status, session, fetchRecentActivity]);

  useEffect(() => {
    if (recentActivity) {
      const filtered = (recentActivity as ValidationActivity[]).filter((activity) =>
        activity.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredActivity(filtered);
    }
  }, [searchTerm, recentActivity]);

  // Get score-based color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    if (score > 0) return 'text-orange-500';
    return 'text-destructive';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-success/10 ring-success/20';
    if (score >= 60) return 'bg-blue-500/10 ring-blue-500/20';
    if (score >= 40) return 'bg-yellow-500/10 ring-yellow-500/20';
    if (score > 0) return 'bg-orange-500/10 ring-orange-500/20';
    return 'bg-destructive/10 ring-destructive/20';
  };

  // Get quality badge color
  const getQualityColor = (quality?: string) => {
    switch (quality?.toLowerCase()) {
      case 'excellent': return 'bg-success/20 text-success';
      case 'good': return 'bg-blue-500/20 text-blue-500';
      case 'fair': return 'bg-yellow-500/20 text-yellow-500';
      case 'poor': return 'bg-orange-500/20 text-orange-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Get validation type badge
  const getTypeBadge = (type: string) => {
    const isFast = type === 'fast';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${isFast ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'
        }`}>
        {isFast ? <Zap className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
        {isFast ? 'Fast' : 'Deep'}
      </span>
    );
  };

  const getStatusIcon = (status: string, score: number, quality?: string) => {
    // If score is 0, show warning
    if (score === 0) {
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    }
    if (status === 'success' && score >= 60) {
      return <CheckCircle className="h-5 w-5 text-success" />;
    } else if (status === 'success' && score < 60 && score > 0) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else if (status === 'invalid' || status === 'error') {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
  };

  const exportToCSV = () => {
    const csvData = filteredActivity.map((activity) => ({
      email: activity.email,
      status: activity.status,
      score: activity.score,
      quality: activity.quality || 'N/A',
      type: activity.type || activity.validation_type,
      credits_used: activity.credits_used,
      processing_time: activity.processing_time,
      timestamp: activity.timestamp
    }));

    const headers = ['Email', 'Status', 'Score', 'Quality', 'Type', 'Credits Used', 'Processing Time (ms)', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) =>
        [
          `"${row.email}"`,
          row.status,
          row.score,
          row.quality,
          row.type,
          row.credits_used,
          row.processing_time,
          row.timestamp
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `validation-history-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const jsonData = JSON.stringify(filteredActivity, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `validation-history-${Date.now()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Validation History</h2>
        <p className="text-muted-foreground">
          View all your email validation history
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search History</CardTitle>
              <CardDescription>
                Search through your validation history
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredActivity.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToJSON}
                disabled={filteredActivity.length === 0}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Validations</CardTitle>
          <CardDescription>
            {filteredActivity.length} validation{filteredActivity.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No validations found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivity.map((activity) => (
                <div
                  key={activity.id}
                  className={`border rounded-lg transition-all ${expandedId === activity.id ? 'ring-2 ring-primary/20' : ''
                    }`}
                >
                  {/* Main Row - Always Visible */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedId(expandedId === activity.id ? null : activity.id)}
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(activity.status, activity.score, activity.quality)}
                      <div>
                        <p className="font-medium">{activity.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Score Badge */}
                      <div className={`flex items-center justify-center h-10 w-10 rounded-full ring-2 ${getScoreBgColor(activity.score)}`}>
                        <span className={`text-sm font-bold ${getScoreColor(activity.score)}`}>
                          {activity.score}
                        </span>
                      </div>

                      {/* Type Badge */}
                      {getTypeBadge(activity.type || activity.validation_type)}

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${activity.status === 'success'
                            ? 'bg-success/10 text-success'
                            : activity.status === 'error' || activity.status === 'invalid'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-yellow-500/10 text-yellow-500'
                          }`}
                      >
                        {activity.status}
                      </span>

                      {/* Expand Icon */}
                      {expandedId === activity.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === activity.id && (
                    <div className="px-4 pb-4 border-t bg-muted/30">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                        {/* Score */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase font-medium">Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(activity.score)}`}>
                            {activity.score}
                            <span className="text-sm font-normal text-muted-foreground">/100</span>
                          </p>
                        </div>

                        {/* Quality */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase font-medium">Quality</p>
                          {activity.quality ? (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getQualityColor(activity.quality)}`}>
                              {activity.quality}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {activity.score === 0 ? 'Not Available' : 'Unknown'}
                            </span>
                          )}
                        </div>

                        {/* Validation Type */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase font-medium">Validation Type</p>
                          <div className="flex items-center gap-2">
                            {(activity.type || activity.validation_type) === 'fast' ? (
                              <>
                                <Zap className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium text-blue-500">Fast Validation</span>
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4 text-purple-500" />
                                <span className="text-sm font-medium text-purple-500">Deep Analysis</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Processing Time */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase font-medium">Processing Time</p>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{activity.processing_time}ms</span>
                          </div>
                        </div>

                        {/* Credits Used */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase font-medium">Credits Used</p>
                          <p className="text-sm font-medium">{activity.credits_used} credit{activity.credits_used !== 1 ? 's' : ''}</p>
                        </div>

                        {/* Status */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase font-medium">Status</p>
                          <span className={`inline-flex items-center gap-1 text-sm font-medium ${activity.status === 'success' ? 'text-success' :
                              activity.status === 'error' ? 'text-destructive' : 'text-yellow-500'
                            }`}>
                            {activity.status === 'success' ? <CheckCircle className="h-4 w-4" /> :
                              activity.status === 'error' ? <XCircle className="h-4 w-4" /> :
                                <AlertTriangle className="h-4 w-4" />}
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </span>
                        </div>

                        {/* Validation ID */}
                        <div className="space-y-1 col-span-2">
                          <p className="text-xs text-muted-foreground uppercase font-medium">Validation ID</p>
                          <p className="text-xs font-mono text-muted-foreground">{activity.id}</p>
                        </div>
                      </div>

                      {/* Warning for score 0 */}
                      {activity.score === 0 && (
                        <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-destructive">Score Unavailable</p>
                              <p className="text-xs text-destructive/80 mt-1">
                                This validation returned a score of 0. This typically occurs with deep/comprehensive analysis
                                when additional checks couldn&apos;t be completed. Consider using Fast validation for quick scoring.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

