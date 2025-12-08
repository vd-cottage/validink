import { formatDateTime } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle, Zap, Coins, Clock } from 'lucide-react';

interface Activity {
  email: string;
  status: string;
  timestamp: string;
  risk_level?: string;
  type?: string;
  credits_used?: number;
  processing_time?: number;
  validation_type?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  // Ensure activities is an array
  const activityList = Array.isArray(activities) ? activities : [];

  if (activityList.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No recent activity</p>
        <p className="text-xs mt-1">Your validations will appear here</p>
      </div>
    );
  }

  const getStatusIcon = (status: string, riskLevel?: string) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'valid' || normalizedStatus === 'success') {
      return <CheckCircle className="h-4 w-4 text-success" />;
    } else if (normalizedStatus === 'invalid' || normalizedStatus === 'failed') {
      return <XCircle className="h-4 w-4 text-destructive" />;
    } else if (riskLevel === 'high' || riskLevel === 'critical') {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
  };

  const getValidationType = (type?: string, activity?: Activity) => {
    return type || activity?.validation_type || activity?.type || 'fast';
  };

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
      {activityList.slice(0, 10).map((activity, index) => (
        <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className="mt-0.5">
            {getStatusIcon(activity.status, activity.risk_level)}
          </div>
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-none truncate">
                {activity.email}
              </p>
              <span
                className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${activity.status?.toLowerCase() === 'valid' || activity.status?.toLowerCase() === 'success'
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                  }`}
              >
                {activity.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span className="capitalize">{getValidationType(activity.type, activity)}</span>
              </div>

              {activity.credits_used !== undefined && (
                <div className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  <span>{activity.credits_used} credit{activity.credits_used !== 1 ? 's' : ''}</span>
                </div>
              )}

              {activity.processing_time !== undefined && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{activity.processing_time}ms</span>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {formatDateTime(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
