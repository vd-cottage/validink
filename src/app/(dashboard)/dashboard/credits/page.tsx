'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import { CreditCard, TrendingUp, Package, RefreshCw } from 'lucide-react';
import { useDashboardStore } from '@/lib/stores/dashboardStore';

const creditPackages = [
  {
    name: 'Starter',
    credits: 10000,
    price: 29,
    savings: 0,
  },
  {
    name: 'Professional',
    credits: 50000,
    price: 99,
    savings: 15,
    popular: true,
  },
  {
    name: 'Business',
    credits: 100000,
    price: 179,
    savings: 25,
  },
  {
    name: 'Enterprise',
    credits: 500000,
    price: 749,
    savings: 35,
  },
];

export default function CreditsPage() {
  const { data: session, status } = useSession();
  const { stats, isLoading, fetchStats } = useDashboardStore();

  // Fetch fresh stats on mount when session is authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.accessToken) {
      fetchStats();
    }
  }, [status, session, fetchStats]);

  const credits = stats?.credits?.remaining ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Credits</h2>
        <p className="text-muted-foreground">
          Manage your credits and purchase more
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Your available validation credits</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchStats()}
            disabled={isLoading}
            title="Refresh credits"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">
                {isLoading ? '...' : formatNumber(credits)}
              </p>
              <p className="text-sm text-muted-foreground">credits remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Credits</CardTitle>
          <CardDescription>
            Choose a credit package that fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {creditPackages.map((pkg) => (
              <Card
                key={pkg.name}
                className={pkg.popular ? 'border-primary shadow-md' : ''}
              >
                {pkg.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-medium rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <CardDescription>
                    {formatNumber(pkg.credits)} credits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">${pkg.price}</p>
                    {pkg.savings > 0 && (
                      <p className="text-sm text-success flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Save {pkg.savings}%
                      </p>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Information</CardTitle>
          <CardDescription>How credits are consumed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email Validation:</span>
              <span className="font-medium">1 credit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bulk Validation:</span>
              <span className="font-medium">1 credit per email</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SMTP Verification:</span>
              <span className="font-medium">2 credits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email Enrichment:</span>
              <span className="font-medium">3 credits</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

