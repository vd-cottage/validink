'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStore } from '@/lib/stores/dashboardStore';
import { formatNumber, formatPercentage } from '@/lib/utils';
import {
  TrendingUp, TrendingDown, Mail, CheckCircle, XCircle, AlertTriangle,
  CreditCard, Zap, Clock, Activity, Calendar, BarChart3, Gauge, FileStack
} from 'lucide-react';
import { StatsChart } from '@/components/dashboard/stats-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { stats, analytics, recentActivity, isLoading, fetchStats, fetchAnalytics, fetchRecentActivity } = useDashboardStore();

  useEffect(() => {
    // Only fetch data when session is fully authenticated (not loading)
    if (status === 'authenticated' && session?.user?.accessToken) {
      fetchStats();
      fetchAnalytics();
      fetchRecentActivity();
    }
  }, [status, session, fetchStats, fetchAnalytics, fetchRecentActivity]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Cast stats to any for accessing dynamic properties
  const s = stats as any;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Overview of your email validation activity
        </p>
      </div>

      {/* Primary Stats - Validations */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Validations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(s?.validations?.total_validations || 0)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {(s?.validations?.change_percentage || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-success mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive mr-1" />
              )}
              {formatPercentage(Math.abs(s?.validations?.change_percentage || 0))} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Emails</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatNumber(s?.validations?.valid_clean_count || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {s?.validations?.total_validations > 0
                ? `${((s?.validations?.valid_clean_count / s?.validations?.total_validations) * 100).toFixed(1)}% success rate`
                : 'No validations yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invalid Emails</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatNumber(s?.validations?.invalid_count || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {s?.validations?.total_validations > 0
                ? `${((s?.validations?.invalid_count / s?.validations?.total_validations) * 100).toFixed(1)}% of total`
                : 'No validations yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risky Emails</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{formatNumber(s?.validations?.valid_risky_count || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {s?.validations?.total_validations > 0
                ? `${((s?.validations?.valid_risky_count / s?.validations?.total_validations) * 100).toFixed(1)}% of total`
                : 'No validations yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Row - Credits, Requests, Performance */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Credits Card */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatNumber(s?.credits?.remaining || 0)}</div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground flex justify-between">
                <span>Used Today:</span>
                <span className="font-medium">{s?.credits?.usedToday || 0}</span>
              </p>
              <p className="text-xs text-muted-foreground flex justify-between">
                <span>Used This Month:</span>
                <span className="font-medium">{s?.credits?.usedThisMonth || 0}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Requests Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{formatNumber(s?.requests?.thisMonth || 0)}</div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground flex justify-between">
                <span>Today:</span>
                <span className="font-medium">{s?.requests?.today || 0}</span>
              </p>
              <p className="text-xs text-muted-foreground flex justify-between">
                <span>This Week:</span>
                <span className="font-medium">{s?.requests?.thisWeek || 0}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Card */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Gauge className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{s?.performance?.successRate || 0}%</div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground flex justify-between">
                <span>Success Rate</span>
              </p>
              <p className="text-xs text-muted-foreground flex justify-between">
                <span>Avg Response:</span>
                <span className="font-medium">{s?.performance?.avgResponseTime || 0}ms</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Stats Card */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bulk Jobs</CardTitle>
            <FileStack className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{formatNumber(s?.bulkStats?.totalJobs || 0)}</div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground flex justify-between">
                <span>Validity Rate:</span>
                <span className="font-medium">{s?.bulkStats?.validityRate || 0}%</span>
              </p>
              <p className="text-xs text-muted-foreground flex justify-between">
                <span>Pending Jobs:</span>
                <span className="font-medium">{s?.pendingJobs || 0}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Period Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(s?.validations?.today || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">validations today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(s?.validations?.thisWeek || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">validations this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(s?.validations?.thisMonth || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">validations this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(s?.validations?.allTime || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">total validations</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Validation Analytics</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your email validation trends over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0 sm:pl-2">
            <div className="w-full overflow-x-auto">
              <StatsChart data={analytics} stats={s} />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your latest email validations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity activities={recentActivity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
