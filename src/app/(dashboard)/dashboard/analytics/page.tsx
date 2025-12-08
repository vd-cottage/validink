'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  Title,
  Tooltip,
  Legend 
} from 'chart.js';
import { themeConfig } from '@/lib/theme/constants';
import { apiService } from '@/lib/services/api';

ChartJS.register(
  ArcElement, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');
  const [interval, setInterval] = useState('1d');
  const [loading, setLoading] = useState(true);
  
  const [usageData, setUsageData] = useState<any>(null);
  const [endpointsData, setEndpointsData] = useState<any>(null);
  const [validationTypesData, setValidationTypesData] = useState<any>(null);
  const [errorsData, setErrorsData] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [period, interval]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [usage, endpoints, validationTypes, errors] = await Promise.all([
        apiService.analytics.getUsage({ period, interval }),
        apiService.analytics.getEndpoints({ period }),
        apiService.analytics.getValidationTypes({ period }),
        apiService.analytics.getErrors({ period, interval })
      ]);
      
      setUsageData(usage.data.data);
      setEndpointsData(endpoints.data.data);
      setValidationTypesData(validationTypes.data.data);
      setErrorsData(errors.data.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Usage over time chart
  const usageChartData = {
    labels: usageData?.data_points?.map((d: any) => 
      new Date(d.time_bucket).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: 'Total Requests',
        data: usageData?.data_points?.map((d: any) => d.total_requests) || [],
        borderColor: themeConfig.colors.primary.DEFAULT,
        backgroundColor: themeConfig.colors.primary.DEFAULT + '20',
        fill: true,
      },
      {
        label: 'Successful',
        data: usageData?.data_points?.map((d: any) => d.successful) || [],
        borderColor: themeConfig.colors.success.DEFAULT,
        backgroundColor: themeConfig.colors.success.DEFAULT + '20',
        fill: true,
      },
      {
        label: 'Failed',
        data: usageData?.data_points?.map((d: any) => d.failed) || [],
        borderColor: '#ef4444',
        backgroundColor: '#ef444420',
        fill: true,
      },
    ],
  };

  // Endpoints chart
  const endpointsChartData = {
    labels: endpointsData?.endpoints?.slice(0, 10).map((e: any) => 
      e.endpoint.replace(/\/api\/v1\//, '')
    ) || [],
    datasets: [
      {
        label: 'Request Count',
        data: endpointsData?.endpoints?.slice(0, 10).map((e: any) => e.count) || [],
        backgroundColor: themeConfig.colors.primary.DEFAULT,
      },
    ],
  };

  // Validation types chart
  const validationTypesChartData = {
    labels: validationTypesData?.types?.map((t: any) => 
      t.type.charAt(0).toUpperCase() + t.type.slice(1)
    ) || [],
    datasets: [
      {
        data: validationTypesData?.types?.map((t: any) => t.count) || [],
        backgroundColor: [
          themeConfig.colors.primary.DEFAULT,
          themeConfig.colors.success.DEFAULT,
          '#eab308',
          '#f97316',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4',
          '#10b981',
        ],
      },
    ],
  };

  // Error rate chart
  const errorRateChartData = {
    labels: errorsData?.error_rate?.map((d: any) => 
      new Date(d.time_bucket).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: 'Error Rate (%)',
        data: errorsData?.error_rate?.map((d: any) => d.error_rate) || [],
        borderColor: '#ef4444',
        backgroundColor: '#ef444420',
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Detailed insights into your API usage
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          {(period === '7d' || period === '30d') && (
            <select 
              value={interval} 
              onChange={(e) => setInterval(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="1h">Hourly</option>
              <option value="1d">Daily</option>
            </select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">
              {usageData?.summary?.total_requests?.toLocaleString() || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl">
              {usageData?.summary?.success_rate || 0}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Response Time</CardDescription>
            <CardTitle className="text-3xl">
              {usageData?.summary?.avg_response_time || 0}ms
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Endpoint</CardDescription>
            <CardTitle className="text-lg">
              {endpointsData?.endpoints?.[0]?.endpoint?.replace(/\/api\/v1\//, '') || 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Usage Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>API Usage Over Time</CardTitle>
          <CardDescription>Request volume and success rate</CardDescription>
        </CardHeader>
        <CardContent>
          {usageData?.data_points?.length > 0 ? (
            <Line 
              data={usageChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">No usage data available</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
            <CardDescription>Most frequently used API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            {endpointsData?.endpoints?.length > 0 ? (
              <>
                <Bar 
                  data={endpointsChartData}
                  options={{
                    indexAxis: 'y' as const,
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
                <div className="mt-4 space-y-2">
                  {endpointsData.endpoints.slice(0, 5).map((endpoint: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="truncate">{endpoint.endpoint.replace(/\/api\/v1\//, '')}</span>
                      <span className="font-medium">{endpoint.count} ({endpoint.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">No endpoint data available</p>
            )}
          </CardContent>
        </Card>

        {/* Validation Types */}
        <Card>
          <CardHeader>
            <CardTitle>Validation Types</CardTitle>
            <CardDescription>Distribution of validation methods</CardDescription>
          </CardHeader>
          <CardContent>
            {validationTypesData?.types?.length > 0 ? (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-64 h-64">
                    <Doughnut 
                      data={validationTypesChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {validationTypesData.types.map((type: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="capitalize">{type.type}</span>
                      <span className="font-medium">{type.count} ({type.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">No validation type data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Error Rate Over Time</CardTitle>
          <CardDescription>Error percentage and distribution</CardDescription>
        </CardHeader>
        <CardContent>
          {errorsData?.error_rate?.length > 0 ? (
            <>
              <Line 
                data={errorRateChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
              <div className="mt-4 grid grid-cols-2 gap-4">
                {errorsData.error_rate.slice(0, 1).map((data: any) => (
                  <div key="errors" className="space-y-2">
                    <p className="text-sm font-medium">Error Breakdown</p>
                    <div className="flex justify-between text-sm">
                      <span>4xx Client Errors:</span>
                      <span className="font-medium">{data.errors_by_type?.['400'] || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>5xx Server Errors:</span>
                      <span className="font-medium">{data.errors_by_type?.['500'] || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">No error data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
