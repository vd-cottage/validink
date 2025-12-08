'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { themeConfig } from '@/lib/theme/constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatsChartProps {
  data: any;
  stats?: any;
}

export function StatsChart({ data, stats }: StatsChartProps) {
  // Use real stats data for the chart
  // Use real stats data for the chart
  const validCount = stats?.validations?.valid_clean_count || 0;
  const invalidCount = stats?.validations?.invalid_count || 0;
  const riskyCount = stats?.validations?.valid_risky_count || 0;

  // Create period-based data from stats
  const chartData = {
    labels: ['Today', 'This Week', 'This Month', 'All Time'],
    datasets: [
      {
        label: 'Validations',
        data: [
          stats?.validations?.today || 0,
          stats?.validations?.thisWeek || 0,
          stats?.validations?.thisMonth || 0,
          stats?.validations?.allTime || stats?.validations?.total_validations || 0,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',  // blue
          'rgba(34, 197, 94, 0.8)',   // green
          'rgba(168, 85, 247, 0.8)',  // purple
          'rgba(249, 115, 22, 0.8)',  // orange
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(168, 85, 247)',
          'rgb(249, 115, 22)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // Also show validation breakdown
  const breakdownData = {
    labels: ['Valid', 'Invalid', 'Risky'],
    datasets: [
      {
        label: 'Email Status',
        data: [validCount, invalidCount, riskyCount],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // green for valid
          'rgba(239, 68, 68, 0.8)',   // red for invalid
          'rgba(234, 179, 8, 0.8)',   // yellow for risky
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(234, 179, 8)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Check if we have any data
  const hasData = (stats?.validations?.total_validations || 0) > 0;

  if (!hasData) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">No validation data yet</p>
          <p className="text-xs mt-1">Start validating emails to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Validations by Period</p>
        <div className="h-[140px]">
          <Bar data={chartData} options={options} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Email Status Breakdown</p>
        <div className="h-[140px]">
          <Bar data={breakdownData} options={options} />
        </div>
      </div>
    </div>
  );
}

