'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormInput, OTPInput, PasswordStrengthIndicator } from '@/components/ui/form-input';
import {
  User, Key, Bell, Shield, Webhook, CreditCard, Copy, Plus, Trash2, RefreshCw, Download, Check, X,
  AlertCircle, Loader2, Globe, Lock, CheckCircle2, Mail, Building2, Sparkles
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { apiService } from '@/lib/services/api';
import { Switch } from '@/components/ui/switch';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  profileUpdateSchema,
  changePasswordSchema,
  apiKeySchema,
  webhookSchema,
  type ProfileUpdateData,
  type ChangePasswordData,
  type APIKeyData,
  type WebhookData
} from '@/lib/validations';

function SettingsContent() {
  const { data: session } = useSession();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'account';

  const handleTabChange = (value: string) => {
    router.push(`/dashboard/settings?tab=${value}`);
  };

  // Profile state
  const [profile, setProfile] = useState<any>(null);

  // Profile form setup
  const profileForm = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    mode: 'onBlur',
    defaultValues: { name: '', company: '' },
  });

  // Password form setup
  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
  });

  // API Key form setup
  const apiKeyForm = useForm<APIKeyData>({
    resolver: zodResolver(apiKeySchema),
    mode: 'onBlur',
    defaultValues: { name: '' },
  });

  // Webhook form setup
  const webhookForm = useForm<WebhookData>({
    resolver: zodResolver(webhookSchema),
    mode: 'onBlur',
    defaultValues: { name: '', url: '', events: [] },
  });

  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false);

  // Billing state
  const [billingInfo, setbillingInfo] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Notifications state
  const [notifications, setNotifications] = useState<any>({
    email_notifications: true,
    low_credit_alerts: true,
    bulk_job_completion: true,
    weekly_report: false,
    marketing_emails: false
  });

  // 2FA state
  const [twoFactorStatus, setTwoFactorStatus] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Password state
  const [otpSent, setOtpSent] = useState(false);

  // Loading states
  const [loading, setLoading] = useState({
    profile: false,
    apiKeys: false,
    webhooks: false,
    billing: false,
    notifications: false,
    twoFactor: false
  });

  // State for Disable 2FA Form
  const [showDisable2FAForm, setShowDisable2FAForm] = useState(false);
  const [disable2FACode, setDisable2FACode] = useState('');

  // Server error states
  const [serverError, setServerError] = useState('');

  // Available webhook events
  const AVAILABLE_EVENTS = [
    { value: 'validation.completed', label: 'Validation Completed', description: 'Triggered when a single email validation completes' },
    { value: 'bulk.completed', label: 'Bulk Job Completed', description: 'Triggered when a bulk validation job finishes' },
    { value: 'credit.low', label: 'Credits Low', description: 'Triggered when credits fall below threshold' },
    { value: 'credit.depleted', label: 'Credits Depleted', description: 'Triggered when credits reach zero' }
  ];

  // Load data on mount
  useEffect(() => {
    loadProfile();
    loadApiKeys();
    loadWebhooks();
    loadBillingInfo();
    loadNotifications();
    loadTwoFactorStatus();
  }, []);

  // Profile functions
  const loadProfile = async () => {
    try {
      const response = await apiService.user.getProfile();
      setProfile(response.data.data);
      profileForm.reset({
        name: response.data.data.name || '',
        company: response.data.data.company || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const updateProfile = async (data: ProfileUpdateData) => {
    setLoading(prev => ({ ...prev, profile: true }));
    setServerError('');
    try {
      await apiService.user.updateProfile(data);
      toast.success('Profile updated successfully');
      loadProfile();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const requestOtp = async () => {
    setLoading(prev => ({ ...prev, profile: true }));
    setServerError('');
    try {
      await apiService.user.requestPasswordChangeOtp();
      toast.success(`OTP sent to ${session?.user?.email}`);
      setOtpSent(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP';
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    setLoading(prev => ({ ...prev, profile: true }));
    setServerError('');
    try {
      await apiService.user.changePasswordWithOtp({
        otp: data.otp,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword
      });
      toast.success('Password changed successfully');
      passwordForm.reset();
      setOtpSent(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    const password = prompt('Enter your password to confirm:');
    if (!password) return;

    try {
      await apiService.user.deleteAccount({ password });
      toast.success('Account deleted successfully');
      localStorage.removeItem('authToken');
      window.location.href = '/';
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  // API Keys functions
  const loadApiKeys = async () => {
    setLoading(prev => ({ ...prev, apiKeys: true }));
    try {
      const response = await apiService.apiKeys.list();
      setApiKeys(response.data.data || []);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoading(prev => ({ ...prev, apiKeys: false }));
    }
  };

  const createApiKey = async (data: APIKeyData) => {
    setLoading(prev => ({ ...prev, apiKeys: true }));
    setServerError('');
    try {
      const response = await apiService.apiKeys.create({ name: data.name });
      toast.success('API key created successfully');
      apiKeyForm.reset();
      setShowNewKeyDialog(false);
      loadApiKeys();
      if (response.data.data.key) {
        alert(`Your new API key (save it now, you won't see it again):\n\n${response.data.data.key}`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create API key';
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, apiKeys: false }));
    }
  };

  const regenerateApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to regenerate this API key? The old key will stop working immediately.')) {
      return;
    }
    try {
      const response = await apiService.apiKeys.regenerate(id);
      toast.success('API key regenerated successfully');
      loadApiKeys();
      if (response.data.data.key) {
        alert(`Your new API key (save it now):\n\n${response.data.data.key}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to regenerate API key');
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }
    try {
      await apiService.apiKeys.delete(id);
      toast.success('API key deleted successfully');
      loadApiKeys();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Webhooks functions
  const loadWebhooks = async () => {
    setLoading(prev => ({ ...prev, webhooks: true }));
    try {
      const response = await apiService.webhooks.list();
      setWebhooks(response.data.data || []);
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    } finally {
      setLoading(prev => ({ ...prev, webhooks: false }));
    }
  };

  const createWebhook = async (data: WebhookData) => {
    setLoading(prev => ({ ...prev, webhooks: true }));
    setServerError('');
    try {
      await apiService.webhooks.create({
        url: data.url,
        events: data.events,
        name: data.name || undefined
      });
      toast.success('Webhook created successfully');
      webhookForm.reset();
      setShowNewWebhookDialog(false);
      loadWebhooks();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create webhook';
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, webhooks: false }));
    }
  };

  const testWebhook = async (id: string) => {
    try {
      await apiService.webhooks.test(id);
      toast.success('Test webhook sent successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send test webhook');
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }
    try {
      await apiService.webhooks.delete(id);
      toast.success('Webhook deleted successfully');
      loadWebhooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete webhook');
    }
  };

  const toggleWebhook = async (id: string, currentStatus: boolean) => {
    try {
      await apiService.webhooks.update(id, { is_active: !currentStatus });
      toast.success(`Webhook ${!currentStatus ? 'enabled' : 'disabled'}`);
      loadWebhooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update webhook');
    }
  };

  // Billing functions
  const loadBillingInfo = async () => {
    setLoading(prev => ({ ...prev, billing: true }));
    try {
      const [infoResponse, plansResponse, invoicesResponse] = await Promise.all([
        apiService.billing.getInfo(),
        apiService.billing.getPlans(),
        apiService.billing.getInvoices()
      ]);
      setbillingInfo(infoResponse.data.data);
      setPlans(plansResponse.data.data || []);
      setInvoices(invoicesResponse.data.data?.invoices || []);
    } catch (error) {
      console.error('Failed to load billing info:', error);
    } finally {
      setLoading(prev => ({ ...prev, billing: false }));
    }
  };

  const downloadInvoice = async (id: string) => {
    try {
      const response = await apiService.billing.downloadInvoice(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download invoice');
    }
  };

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }
    try {
      await apiService.billing.cancelSubscription();
      toast.success('Subscription cancelled');
      loadBillingInfo();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  const changePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to change your plan?')) {
      return;
    }
    setLoading(prev => ({ ...prev, billing: true }));
    try {
      await apiService.billing.changePlan({ plan_id: planId });
      toast.success('Plan changed successfully');
      loadBillingInfo();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change plan');
    } finally {
      setLoading(prev => ({ ...prev, billing: false }));
    }
  };

  // Notifications functions
  const loadNotifications = async () => {
    setLoading(prev => ({ ...prev, notifications: true }));
    try {
      const response = await apiService.user.getNotifications();
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  const updateNotificationPref = async (key: string, value: boolean) => {
    try {
      await apiService.user.updateNotifications({ [key]: value });
      setNotifications({ ...notifications, [key]: value });
      toast.success('Notification preferences updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    }
  };

  // Two-Factor Auth functions
  const loadTwoFactorStatus = async () => {
    setLoading(prev => ({ ...prev, twoFactor: true }));
    try {
      const response = await apiService.user.twoFactor.getStatus();
      setTwoFactorStatus(response.data.data);
    } catch (error) {
      console.error('Failed to load 2FA status:', error);
    } finally {
      setLoading(prev => ({ ...prev, twoFactor: false }));
    }
  };

  const enable2FA = async () => {
    setLoading(prev => ({ ...prev, twoFactor: true }));
    try {
      const response = await apiService.user.twoFactor.enable();
      setQrCode(response.data.data.qr_code);
      setBackupCodes(response.data.data.backup_codes);
      toast.success('Scan the QR code with your authenticator app');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to enable 2FA');
    } finally {
      setLoading(prev => ({ ...prev, twoFactor: false }));
    }
  };

  const verify2FA = async () => {
    if (twoFactorCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    setLoading(prev => ({ ...prev, twoFactor: true }));
    try {
      await apiService.user.twoFactor.verify({ code: twoFactorCode });
      toast.success('Two-factor authentication enabled successfully');
      setQrCode(null);
      setBackupCodes([]);
      setTwoFactorCode('');
      loadTwoFactorStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(prev => ({ ...prev, twoFactor: false }));
    }
  };

  const disable2FA = async () => {
    if (disable2FACode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(prev => ({ ...prev, twoFactor: true }));
    try {
      await apiService.user.twoFactor.disable({
        code: disable2FACode
      });
      toast.success('Two-factor authentication disabled');
      setShowDisable2FAForm(false);
      setDisable2FACode('');
      loadTwoFactorStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(prev => ({ ...prev, twoFactor: false }));
    }
  };

  // Error Alert Component
  const ErrorAlert = ({ message }: { message: string }) => (
    <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 p-1 rounded-full bg-red-100 dark:bg-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-sm text-red-700 dark:text-red-300 font-medium">{message}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-muted/50">
          <TabsTrigger value="account" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <Webhook className="h-4 w-4" />
            <span className="hidden sm:inline">Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6 mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(updateProfile)} className="space-y-5">
                {serverError && activeTab === 'account' && <ErrorAlert message={serverError} />}

                <FormInput
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  leftIcon={<User className="h-4 w-4" />}
                  error={profileForm.formState.errors.name?.message}
                  success={
                    profileForm.formState.touchedFields.name &&
                    !profileForm.formState.errors.name &&
                    profileForm.watch('name')
                      ? 'Looks good!'
                      : undefined
                  }
                  disabled={loading.profile}
                  {...profileForm.register('name')}
                />

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      type="email"
                      value={profile?.email || session?.user?.email}
                      disabled
                      className="pl-10 bg-gray-50 dark:bg-gray-800/50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <FormInput
                  label="Company (Optional)"
                  type="text"
                  placeholder="Your company name"
                  leftIcon={<Building2 className="h-4 w-4" />}
                  error={profileForm.formState.errors.company?.message}
                  disabled={loading.profile}
                  {...profileForm.register('company')}
                />

                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Credits</p>
                        <p className="text-2xl font-bold text-primary">{profile?.credits?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleTabChange('billing')}>
                      Get More
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={loading.profile} className="shadow-lg shadow-primary/25">
                    {loading.profile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="destructive" onClick={deleteAccount}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6 mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage your API keys for integration</CardDescription>
                  </div>
                </div>
                {!showNewKeyDialog && (
                  <Button onClick={() => setShowNewKeyDialog(true)} className="shadow-lg shadow-primary/25">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Key
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showNewKeyDialog && (
                <form onSubmit={apiKeyForm.handleSubmit(createApiKey)} className="p-5 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Plus className="h-5 w-5" />
                    <span>Create New API Key</span>
                  </div>

                  <FormInput
                    label="Key Name"
                    type="text"
                    placeholder="e.g., Production API Key"
                    leftIcon={<Key className="h-4 w-4" />}
                    error={apiKeyForm.formState.errors.name?.message}
                    disabled={loading.apiKeys}
                    {...apiKeyForm.register('name')}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading.apiKeys}>
                      {loading.apiKeys ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Key'
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowNewKeyDialog(false); apiKeyForm.reset(); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {loading.apiKeys ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Key className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">No API keys yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create your first API key to get started with integrations.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{key.name}</p>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            key.is_active
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {key.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                            {key.key_prefix}••••••••••••
                          </code>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(key.key_prefix)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {new Date(key.created_at).toLocaleDateString()}
                          {key.last_used_at && ` • Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => regenerateApiKey(key.id)} title="Regenerate key">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteApiKey(key.id)} title="Delete key">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6 mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Webhook className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>Configure webhook endpoints for async notifications</CardDescription>
                  </div>
                </div>
                {!showNewWebhookDialog && (
                  <Button onClick={() => setShowNewWebhookDialog(true)} className="shadow-lg shadow-primary/25">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Webhook
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showNewWebhookDialog && (
                <form onSubmit={webhookForm.handleSubmit(createWebhook)} className="p-5 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Plus className="h-5 w-5" />
                    <span>Create New Webhook</span>
                  </div>

                  <FormInput
                    label="Name (Optional)"
                    type="text"
                    placeholder="My Webhook"
                    leftIcon={<Webhook className="h-4 w-4" />}
                    error={webhookForm.formState.errors.name?.message}
                    disabled={loading.webhooks}
                    {...webhookForm.register('name')}
                  />

                  <FormInput
                    label="Webhook URL"
                    type="url"
                    placeholder="https://example.com/webhook"
                    leftIcon={<Globe className="h-4 w-4" />}
                    error={webhookForm.formState.errors.url?.message}
                    hint="Must use HTTPS for security"
                    disabled={loading.webhooks}
                    {...webhookForm.register('url')}
                  />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Events</Label>
                    {webhookForm.formState.errors.events?.message && (
                      <p className="text-sm text-red-600 dark:text-red-400">{webhookForm.formState.errors.events.message}</p>
                    )}
                    <div className="grid gap-2">
                      {AVAILABLE_EVENTS.map((event) => (
                        <label
                          key={event.value}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            value={event.value}
                            {...webhookForm.register('events')}
                            className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="font-medium text-sm">{event.label}</p>
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading.webhooks}>
                      {loading.webhooks ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Webhook'
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowNewWebhookDialog(false); webhookForm.reset(); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {loading.webhooks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : webhooks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Webhook className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">No webhooks configured</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add a webhook to receive real-time notifications.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{webhook.name || 'Unnamed Webhook'}</p>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              webhook.is_active
                                ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {webhook.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 truncate">{webhook.url}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {webhook.events.map((event: string) => (
                              <span key={event} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs">
                                {event}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => toggleWebhook(webhook.id, webhook.is_active)} title={webhook.is_active ? 'Disable' : 'Enable'}>
                            {webhook.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => testWebhook(webhook.id)} title="Send test">
                            Test
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteWebhook(webhook.id)} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6 mt-6">
          {loading.billing ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Current Plan</CardTitle>
                      <CardDescription>Manage your subscription</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10">
                    <div>
                      <p className="text-sm text-muted-foreground">Your plan</p>
                      <p className="text-2xl font-bold text-primary">{billingInfo?.plan?.name || 'Free'}</p>
                      {billingInfo?.subscription && (
                        <p className="text-sm text-muted-foreground mt-1">
                          ${billingInfo.subscription.amount}/month • Renews {new Date(billingInfo.subscription.current_period_end).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {billingInfo?.subscription?.status !== 'cancelled' && billingInfo?.plan?.name !== 'Free' && (
                      <Button variant="outline" onClick={cancelSubscription}>
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle>Available Plans</CardTitle>
                  <CardDescription>Upgrade your plan to unlock more features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {plans.map((plan: any) => (
                      <div
                        key={plan.id}
                        className={`relative flex flex-col p-5 rounded-xl border-2 transition-all ${
                          plan.current
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                        }`}
                      >
                        {plan.current && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
                            Current
                          </div>
                        )}
                        <div className="mb-4">
                          <h3 className="font-bold text-lg">{plan.name}</h3>
                          <div className="text-3xl font-bold mt-2">
                            ${plan.price}
                            <span className="text-sm font-normal text-muted-foreground">/mo</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {plan.credits.toLocaleString()} credits / month
                          </p>
                        </div>
                        <ul className="space-y-2 mb-6 flex-1 text-sm">
                          {plan.features.map((feature: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant={plan.current ? 'outline' : 'default'}
                          disabled={plan.current || loading.billing}
                          onClick={() => !plan.current && changePlan(plan.id)}
                          className={`w-full ${!plan.current ? 'shadow-lg shadow-primary/25' : ''}`}
                        >
                          {plan.current ? 'Current Plan' : 'Select Plan'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {billingInfo?.payment_method && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Manage your payment methods</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{billingInfo.payment_method.brand} •••• {billingInfo.payment_method.last4}</p>
                          <p className="text-sm text-muted-foreground">
                            Expires {billingInfo.payment_method.exp_month}/{billingInfo.payment_method.exp_year}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle>Invoice History</CardTitle>
                  <CardDescription>Download your past invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  {invoices.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No invoices yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="font-medium">{new Date(invoice.created_at).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">${invoice.amount}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                            }`}>
                              {invoice.status}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => downloadInvoice(invoice.id)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Configure how you want to be notified</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading.notifications ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-1 divide-y">
                  {[
                    { key: 'email_notifications', label: 'Email Notifications', description: 'Receive email updates about your account' },
                    { key: 'low_credit_alerts', label: 'Low Credit Alerts', description: 'Get notified when credits are running low' },
                    { key: 'bulk_job_completion', label: 'Bulk Job Completion', description: 'Notify when bulk validation jobs complete' },
                    { key: 'weekly_report', label: 'Weekly Reports', description: 'Receive weekly usage reports' },
                    { key: 'marketing_emails', label: 'Marketing Emails', description: 'Receive promotional emails and updates' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key]}
                        onCheckedChange={(checked: boolean) => updateNotificationPref(item.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!otpSent ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">
                      To change your password, we need to verify your identity. Click the button below to send a one-time password (OTP) to your email address <strong className="text-foreground">{session?.user?.email}</strong>.
                    </p>
                  </div>
                  <Button onClick={requestOtp} disabled={loading.profile} className="shadow-lg shadow-primary/25">
                    {loading.profile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <form onSubmit={passwordForm.handleSubmit(changePassword)} className="space-y-5">
                  {serverError && activeTab === 'security' && <ErrorAlert message={serverError} />}

                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Enter OTP</Label>
                    <OTPInput
                      length={6}
                      value={passwordForm.watch('otp')}
                      onChange={(value) => passwordForm.setValue('otp', value)}
                      error={passwordForm.formState.errors.otp?.message}
                      disabled={loading.profile}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">OTP sent to {session?.user?.email}</p>
                      <Button type="button" variant="link" size="sm" onClick={requestOtp} disabled={loading.profile}>
                        Resend OTP
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormInput
                      label="New Password"
                      type="password"
                      placeholder="Create a strong password"
                      leftIcon={<Lock className="h-4 w-4" />}
                      error={passwordForm.formState.errors.newPassword?.message}
                      disabled={loading.profile}
                      {...passwordForm.register('newPassword')}
                    />
                    <PasswordStrengthIndicator password={passwordForm.watch('newPassword')} />
                  </div>

                  <FormInput
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm your password"
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                    error={passwordForm.formState.errors.confirmPassword?.message}
                    success={
                      passwordForm.formState.touchedFields.confirmPassword &&
                      !passwordForm.formState.errors.confirmPassword &&
                      passwordForm.watch('confirmPassword') &&
                      passwordForm.watch('newPassword') === passwordForm.watch('confirmPassword')
                        ? 'Passwords match'
                        : undefined
                    }
                    disabled={loading.profile}
                    {...passwordForm.register('confirmPassword')}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading.profile} className="shadow-lg shadow-primary/25">
                      {loading.profile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => { setOtpSent(false); passwordForm.reset(); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading.twoFactor ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${twoFactorStatus?.enabled ? 'bg-green-100 dark:bg-green-500/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <Shield className={`h-5 w-5 ${twoFactorStatus?.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium">Status</p>
                        {twoFactorStatus?.enabled ? (
                          <span className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
                            <Check className="mr-1 h-4 w-4" /> Enabled
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not enabled</span>
                        )}
                      </div>
                    </div>
                    {twoFactorStatus?.enabled ? (
                      !showDisable2FAForm && (
                        <Button variant="destructive" size="sm" onClick={() => setShowDisable2FAForm(true)}>
                          Disable 2FA
                        </Button>
                      )
                    ) : (
                      !qrCode && (
                        <Button onClick={enable2FA} size="sm" className="shadow-lg shadow-primary/25">
                          <Shield className="mr-2 h-4 w-4" />
                          Set up 2FA
                        </Button>
                      )
                    )}
                  </div>

                  {/* Disable 2FA Form */}
                  {showDisable2FAForm && (
                    <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-5 space-y-4 animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 text-destructive font-medium">
                        <AlertCircle className="h-5 w-5" />
                        <span>Confirm Disabling 2FA</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Please enter your authentication code to confirm disabling 2FA.
                      </p>
                      <OTPInput
                        length={6}
                        value={disable2FACode}
                        onChange={setDisable2FACode}
                        disabled={loading.twoFactor}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setShowDisable2FAForm(false); setDisable2FACode(''); }}>
                          Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={disable2FA} disabled={loading.twoFactor || disable2FACode.length !== 6}>
                          {loading.twoFactor ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Disabling...
                            </>
                          ) : (
                            'Confirm Disable'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Enable 2FA Flow */}
                  {qrCode && (
                    <div className="rounded-xl border p-6 space-y-6 animate-in slide-in-from-top-2">
                      <div className="text-center space-y-4">
                        <div className="bg-white p-3 inline-block rounded-xl shadow-lg">
                          <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                        </div>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy)
                        </p>
                      </div>

                      <div className="max-w-xs mx-auto space-y-4">
                        <Label className="text-center block">Enter Verification Code</Label>
                        <OTPInput
                          length={6}
                          value={twoFactorCode}
                          onChange={setTwoFactorCode}
                          disabled={loading.twoFactor}
                        />

                        <div className="flex gap-2">
                          <Button onClick={verify2FA} className="w-full shadow-lg shadow-primary/25" disabled={loading.twoFactor || twoFactorCode.length !== 6}>
                            {loading.twoFactor ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              'Verify & Enable'
                            )}
                          </Button>
                          <Button variant="outline" onClick={() => { setQrCode(null); setTwoFactorCode(''); }} className="w-full">
                            Cancel
                          </Button>
                        </div>
                      </div>

                      {backupCodes.length > 0 && (
                        <div className="pt-6 border-t">
                          <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-500">
                            <Shield className="h-4 w-4" />
                            <Label>Backup Codes</Label>
                          </div>
                          <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-muted font-mono text-sm border">
                            {backupCodes.map((code, i) => (
                              <div key={i} className="flex items-center justify-between px-2 py-1 rounded bg-background">
                                <code>{code}</code>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(code)}>
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Store these codes safely. You can use them to login if you lose access to your device.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground animate-pulse">Loading settings...</p>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
