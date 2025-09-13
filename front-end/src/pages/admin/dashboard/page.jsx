import React from "react";
import {
    useDashboardStats,
    useSystemHealth,
} from "@/hooks/use-dashboard-stats";
import { useAuth } from "@/contexts/AuthContext";
import CategoryDistributionChart from "@/components/admin/CategoryDistributionChart";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    MapPin,
    TrendingUp,
    Users,
    Activity,
    Calendar,
    Search,
    Database,
    Zap,
    Plus,
    FileDown,
    Map,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
    const { user } = useAuth();
    const {
        stats,
        loading: statsLoading,
        error: statsError,
    } = useDashboardStats();
    const { health } = useSystemHealth();

    const statisticsCards = [
        {
            title: "Total Pasar",
            value: stats.totalMarkets.toString(),
            description: "Pasar terdaftar",
            icon: MapPin,
            trend: "+12%",
            trendUp: true,
        },
        {
            title: "Pencarian Hari Ini",
            value: stats.todaySearches.toString(),
            description: "Aktivitas pencarian",
            icon: Search,
            trend: "+8%",
            trendUp: true,
        },
        {
            title: "Pasar Populer",
            value: stats.popularMarket?.name || "Loading...",
            description: "Paling banyak dicari",
            icon: TrendingUp,
            trend: "64 pencarian",
            trendUp: true,
        },
        {
            title: "Status System",
            value: health.apiStatus === "online" ? "Online" : "Offline",
            description: "Semua service aktif",
            icon: Activity,
            trend: "99.9% uptime",
            trendUp: health.apiStatus === "online",
        },
    ];

    const quickActions = [
        {
            title: "Tambah Pasar",
            description: "Tambah pasar baru",
            icon: Plus,
            action: () => (window.location.href = "/admin/market"),
            color: "bg-blue-500 hover:bg-blue-600",
        },
        {
            title: "Lihat Peta",
            description: "Visualisasi semua pasar",
            icon: Map,
            action: () => (window.location.href = "/market"),
            color: "bg-green-500 hover:bg-green-600",
        },
        {
            title: "Export Data",
            description: "Download laporan",
            icon: FileDown,
            action: () => alert("Fitur export akan segera tersedia"),
            color: "bg-purple-500 hover:bg-purple-600",
        },
        {
            title: "Analytics",
            description: "Lihat statistik detail",
            icon: BarChart3,
            action: () => alert("Dashboard analytics akan segera tersedia"),
            color: "bg-orange-500 hover:bg-orange-600",
        },
    ];

    if (statsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (statsError) {
        return (
            <div className="p-6">
                <Alert className="border-red-200 bg-red-50">
                    <Activity className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        <strong>Error:</strong> Gagal memuat data dashboard.{" "}
                        {statsError}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Welcome Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard Admin
                </h1>
                <p className="text-muted-foreground">
                    Selamat datang kembali, {user?.username || "Admin"}! Berikut
                    overview sistem Market Finder.
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statisticsCards.map((card, index) => (
                    <Card key={index} className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {card.title}
                            </CardTitle>
                            <card.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-ellipsis overflow-hidden">
                                {card.value}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {card.description}
                            </p>
                            <div className="flex items-center space-x-1 mt-2">
                                <Badge
                                    variant={
                                        card.trendUp ? "default" : "secondary"
                                    }
                                    className="text-xs"
                                >
                                    {card.trend}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activities */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Aktivitas Terbaru
                        </CardTitle>
                        <CardDescription>
                            Aktivitas sistem dalam 24 jam terakhir
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {stats.recentActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start space-x-3"
                            >
                                <div className="p-2 bg-secondary rounded-lg">
                                    {activity.icon === "MapPin" && (
                                        <MapPin className="h-4 w-4" />
                                    )}
                                    {activity.icon === "Search" && (
                                        <Search className="h-4 w-4" />
                                    )}
                                    {activity.icon === "Activity" && (
                                        <Activity className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {stats.recentActivities.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Belum ada aktivitas hari ini
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* System Health */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            System Health
                        </CardTitle>
                        <CardDescription>
                            Status sistem dan performa
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">API Status</span>
                                <Badge
                                    variant="default"
                                    className={
                                        health.apiStatus === "online"
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                    }
                                >
                                    {health.apiStatus === "online"
                                        ? "Online"
                                        : "Offline"}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Database</span>
                                <Badge
                                    variant="default"
                                    className={
                                        health.dbStatus === "connected"
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                    }
                                >
                                    {health.dbStatus === "connected"
                                        ? "Connected"
                                        : "Disconnected"}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Avg Response</span>
                                <span className="text-sm font-medium">
                                    {health.avgResponseTime}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Error Rate</span>
                                <span className="text-sm font-medium">
                                    {health.errorRate}
                                </span>
                            </div>
                        </div>

                        <Separator />

                        <Alert>
                            <Zap className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                Sistem berjalan dengan normal. Genetic Algorithm
                                aktif untuk optimisasi pencarian.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Category Distribution Chart */}
                <div className="lg:col-span-2">
                    <CategoryDistributionChart data={stats.marketsByCategory} />
                </div>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Aksi Cepat</CardTitle>
                    <CardDescription>
                        Shortcut untuk tugas-tugas umum admin
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {quickActions.map((action, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow"
                                onClick={action.action}
                            >
                                <div
                                    className={`p-2 rounded-lg ${action.color} text-white`}
                                >
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-sm">
                                        {action.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {action.description}
                                    </p>
                                </div>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
