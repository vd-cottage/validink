'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, Check, Search } from 'lucide-react';
import { apiService } from '@/lib/services/api';

export default function EmailFinderPage() {
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleFind = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await apiService.emailFinder.find(name, domain);
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to find email');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (result?.email) {
            navigator.clipboard.writeText(result.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Helper to determine confidence color/label
    const getConfidenceLevel = (score: number) => {
        if (score >= 0.8) return { label: 'High', color: 'text-success bg-success/10' };
        if (score >= 0.5) return { label: 'Medium', color: 'text-yellow-500 bg-yellow-500/10' };
        return { label: 'Low', color: 'text-destructive bg-destructive/10' };
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Email Finder</h2>
                <p className="text-muted-foreground">
                    Find accurate professional email addresses by name and domain
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Search Criteria</CardTitle>
                        <CardDescription>
                            Enter the full name and company domain to find the email
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFind} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="domain" className="text-sm font-medium">Domain</label>
                                    <Input
                                        id="domain"
                                        placeholder="e.g. company.com"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-2 h-4 w-4" />
                                        Find Email
                                    </>
                                )}
                            </Button>

                            {error && (
                                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {result && (
                    <Card className="border-primary/20 bg-primary/5 animate-in">
                        <CardHeader>
                            <CardTitle>Result Found</CardTitle>
                            <CardDescription>
                                Best match for {name} at {domain}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-xl border bg-card p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-primary">{result.email}</h3>
                                        <div className="mt-2 flex items-center space-x-2">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getConfidenceLevel(result.confidence).color}`}>
                                                {getConfidenceLevel(result.confidence).label} Confidence
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                Method: {result.pattern || 'Pattern Analysis'}
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            {result.candidates && result.candidates.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Other Potential Matches</h4>
                                    <div className="space-y-2">
                                        {result.candidates.slice(0, 3).map((candidate: string, i: number) => (
                                            <div key={i} className="text-sm p-2 rounded bg-muted/50">
                                                {candidate}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
