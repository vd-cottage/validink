'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Loader2, ArrowLeft, Mail, KeyRound, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '@/lib/services/api';
import { Navbar } from '@/components/marketing/navbar';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Step 1: Request OTP
    async function onRequestOtp(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiService.auth.forgotPassword(email);
            toast.success('OTP sent to your email');
            setStep(2);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    }

    // Step 2: Verify OTP
    async function onVerifyOtp(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await apiService.auth.verifyForgotOtp(email, otp);
            setResetToken(res.data.data.resetToken);
            toast.success('OTP verified');
            setStep(3);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    }

    // Step 3: Reset Password
    async function onResetPassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            await apiService.auth.resetPassword({ token: resetToken, password });
            toast.success('Password reset successfully');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1 w-full lg:grid lg:grid-cols-2">
                <div className="flex items-center justify-center py-8 sm:py-12 px-4 min-h-[calc(100vh-4rem)] lg:min-h-0">
                    <div className="w-full max-w-[350px] space-y-6">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tighter">Reset Password</h1>
                        <p className="text-muted-foreground">
                            {step === 1 && "Enter your email to receive a verification code"}
                            {step === 2 && "Enter the verification code sent to your email"}
                            {step === 3 && "Create a new password for your account"}
                        </p>
                    </div>

                    {step === 1 && (
                        <form onSubmit={onRequestOtp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-9"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send OTP
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={onVerifyOtp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Verification Code</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="otp"
                                        placeholder="123456"
                                        className="pl-9 tracking-widest"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify Code
                            </Button>
                            <div className="text-center text-sm">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-primary hover:underline"
                                >
                                    Change Email
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={onResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        className="pl-9 pr-9"
                                        required
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        className="pl-9"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Reset Password
                            </Button>
                        </form>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <Link href="/login" className="bg-background px-2 text-muted-foreground hover:text-foreground flex items-center gap-1">
                                <ArrowLeft className="h-3 w-3" /> Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Side */}
            <div className="hidden bg-muted lg:block relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-lg p-8 relative z-10 flex flex-col items-center text-center">

                        <div className="p-4 bg-background/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
                            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
                                Secure your Account.
                            </h2>
                            <p className="text-md text-muted-foreground leading-relaxed">
                                Recover access to your account quickly and securely. We use industry-standard encryption to keep your data safe.
                            </p>
                        </div>

                        {/* Abstract decorative elements */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-50 -z-10" />
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 -z-10" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}
