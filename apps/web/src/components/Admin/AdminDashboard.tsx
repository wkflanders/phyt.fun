import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useGetUser } from '@/hooks/use-get-user';
import {
    usePendingRunners,
    usePendingRuns,
    useApproveRunner,
    useUpdateRunVerification
} from '@/hooks/use-admin';
import {
    Users,
    Activity,
    Search,
    RefreshCw,
    CheckCircle,
    XCircle,
} from 'lucide-react';

const AdminDashboard = () => {
    const router = useRouter();
    const { ready } = usePrivy();
    const [searchTerm, setSearchTerm] = useState('');
    const { data: user, isLoading: userLoading } = useGetUser();

    const { data: pendingRunners = [], isLoading: loadingRunners } = usePendingRunners();
    const { data: pendingRuns = [], isLoading: loadingRuns } = usePendingRuns();
    const approveRunnerMutation = useApproveRunner();
    const verifyRunMutation = useUpdateRunVerification();

    // Protect the route
    if (!ready || userLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="w-6 h-6 animate-spin text-phyt_blue" />
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        router.push('/');
        return null;
    }

    const filteredRunners = pendingRunners.filter(runner =>
        runner.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        runner.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRuns = pendingRuns.filter(run =>
        run.runner_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <h1 className="text-3xl font-bold text-phyt_text mb-8">Admin</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-phyt_form border-phyt_form_border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-phyt_text">
                            Pending Runners
                        </CardTitle>
                        <Users className="h-4 w-4 text-phyt_blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-phyt_text">{pendingRunners.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-phyt_form border-phyt_form_border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-phyt_text">
                            Pending Runs
                        </CardTitle>
                        <Activity className="h-4 w-4 text-phyt_blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-phyt_text">{pendingRuns.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-phyt_text_secondary" />
                        <Input
                            placeholder="Search..."
                            className="pl-8 bg-phyt_form border-phyt_form_border text-phyt_text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Tabs defaultValue="runners" className="space-y-4">
                    <TabsList className="bg-phyt_form">
                        <TabsTrigger value="runners" className="text-phyt_text">Pending Runners</TabsTrigger>
                        <TabsTrigger value="runs" className="text-phyt_text">Pending Runs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="runners">
                        <Card className="bg-phyt_form border-phyt_form_border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-phyt_text">Username</TableHead>
                                        <TableHead className="text-phyt_text">Email</TableHead>
                                        <TableHead className="text-phyt_text">Applied At</TableHead>
                                        <TableHead className="text-phyt_text">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingRunners ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-phyt_text">
                                                <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                                                Loading runners...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredRunners.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-phyt_text">
                                                No pending runners found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredRunners.map((runner) => (
                                            <TableRow key={runner.id}>
                                                <TableCell className="text-phyt_text">{runner.username}</TableCell>
                                                <TableCell className="text-phyt_text">{runner.email}</TableCell>
                                                <TableCell className="text-phyt_text">
                                                    {new Date(runner.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => approveRunnerMutation.mutate(runner.id)}
                                                        disabled={approveRunnerMutation.isPending}
                                                    >
                                                        {approveRunnerMutation.isPending ? (
                                                            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                        )}
                                                        Approve
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="runs">
                        <Card className="bg-phyt_form border-phyt_form_border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-phyt_text">Runner</TableHead>
                                        <TableHead className="text-phyt_text">Distance</TableHead>
                                        <TableHead className="text-phyt_text">Time</TableHead>
                                        <TableHead className="text-phyt_text">Date</TableHead>
                                        <TableHead className="text-phyt_text">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingRuns ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-phyt_text">
                                                <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                                                Loading runs...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredRuns.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-phyt_text">
                                                No pending runs found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredRuns.map((run) => (
                                            <TableRow key={run.run.id}>
                                                <TableCell className="text-phyt_text">{run.runner_name}</TableCell>
                                                <TableCell className="text-phyt_text">
                                                    {(run.run.distance_m / 1000).toFixed(2)} km
                                                </TableCell>
                                                <TableCell className="text-phyt_text">
                                                    {new Date(run.run.duration_seconds * 1000).toISOString().substr(11, 8)}
                                                </TableCell>
                                                <TableCell className="text-phyt_text">
                                                    {new Date(run.run.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => verifyRunMutation.mutate({
                                                            runId: run.run.id,
                                                            status: 'verified'
                                                        })}
                                                        disabled={verifyRunMutation.isPending}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Verify
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => verifyRunMutation.mutate({
                                                            runId: run.run.id,
                                                            status: 'flagged'
                                                        })}
                                                        disabled={verifyRunMutation.isPending}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Flag
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;