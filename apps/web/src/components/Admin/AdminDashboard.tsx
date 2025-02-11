import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useGetUser } from '@/hooks/use-get-user';
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
import {
    Users,
    Activity,
    Shield,
    Flag,
    Search,
    RefreshCw,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
    const router = useRouter();
    const { toast } = useToast();
    const { user: privyUser, ready } = usePrivy();
    const { data: user, isLoading } = useGetUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('users');

    // Protect the route
    if (!ready || isLoading) {
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

    // Mock data - replace with actual API calls
    const mockUsers = [
        { id: 1, username: "user1", email: "user1@example.com", role: "user", status: "active" },
        { id: 2, username: "user2", email: "user2@example.com", role: "runner", status: "active" },
    ];

    const mockRuns = [
        { id: 1, user: "user1", distance: "5.2km", time: "25:30", status: "pending" },
        { id: 2, user: "user2", distance: "3.1km", time: "15:45", status: "verified" },
    ];

    const mockReports = [
        { id: 1, type: "User", subject: "Suspicious activity", status: "pending" },
        { id: 2, type: "Run", subject: "Invalid data", status: "resolved" },
    ];

    const handleVerifyRun = (runId: number) => {
        toast({
            title: "Success",
            description: `Run ${runId} has been verified`,
        });
    };

    const handleFlagRun = (runId: number) => {
        toast({
            title: "Success",
            description: `Run ${runId} has been flagged`,
        });
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <h1 className="text-3xl font-bold text-phyt_text mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-phyt_form border-phyt_form_border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-phyt_text">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-phyt_blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-phyt_text">2,845</div>
                    </CardContent>
                </Card>
                <Card className="bg-phyt_form border-phyt_form_border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-phyt_text">
                            Active Runs
                        </CardTitle>
                        <Activity className="h-4 w-4 text-phyt_blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-phyt_text">245</div>
                    </CardContent>
                </Card>
                <Card className="bg-phyt_form border-phyt_form_border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-phyt_text">
                            Pending Reports
                        </CardTitle>
                        <Flag className="h-4 w-4 text-phyt_blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-phyt_text">12</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
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

                <Tabs defaultValue="users" className="space-y-4">
                    <TabsList className="bg-phyt_form">
                        <TabsTrigger value="users" className="text-phyt_text">Users</TabsTrigger>
                        <TabsTrigger value="runs" className="text-phyt_text">Runs</TabsTrigger>
                        <TabsTrigger value="reports" className="text-phyt_text">Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users">
                        <Card className="bg-phyt_form border-phyt_form_border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-phyt_text">Username</TableHead>
                                        <TableHead className="text-phyt_text">Email</TableHead>
                                        <TableHead className="text-phyt_text">Role</TableHead>
                                        <TableHead className="text-phyt_text">Status</TableHead>
                                        <TableHead className="text-phyt_text">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="text-phyt_text">{user.username}</TableCell>
                                            <TableCell className="text-phyt_text">{user.email}</TableCell>
                                            <TableCell className="text-phyt_text">{user.role}</TableCell>
                                            <TableCell className="text-phyt_text">{user.status}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="runs">
                        <Card className="bg-phyt_form border-phyt_form_border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-phyt_text">User</TableHead>
                                        <TableHead className="text-phyt_text">Distance</TableHead>
                                        <TableHead className="text-phyt_text">Time</TableHead>
                                        <TableHead className="text-phyt_text">Status</TableHead>
                                        <TableHead className="text-phyt_text">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockRuns.map((run) => (
                                        <TableRow key={run.id}>
                                            <TableCell className="text-phyt_text">{run.user}</TableCell>
                                            <TableCell className="text-phyt_text">{run.distance}</TableCell>
                                            <TableCell className="text-phyt_text">{run.time}</TableCell>
                                            <TableCell className="text-phyt_text">{run.status}</TableCell>
                                            <TableCell className="space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleVerifyRun(run.id)}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Verify
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleFlagRun(run.id)}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Flag
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports">
                        <Card className="bg-phyt_form border-phyt_form_border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-phyt_text">Type</TableHead>
                                        <TableHead className="text-phyt_text">Subject</TableHead>
                                        <TableHead className="text-phyt_text">Status</TableHead>
                                        <TableHead className="text-phyt_text">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockReports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="text-phyt_text">{report.type}</TableCell>
                                            <TableCell className="text-phyt_text">{report.subject}</TableCell>
                                            <TableCell className="text-phyt_text">{report.status}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">
                                                    Review
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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