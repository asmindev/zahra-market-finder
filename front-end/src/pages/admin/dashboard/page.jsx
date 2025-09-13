import React from "react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useAuth } from "@/contexts/AuthContext";
import CategoryDistributionChart from "@/components/admin/CategoryDistributionChart";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    MapPin,
    Users,
    Activity,
    Calendar,
    Search,
    Plus,
    FileDown,
    Map,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Cell,
    PieChart,
    Pie,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

export default function Dashboard() {
    const { user } = useAuth();
    const {
        stats,
        loading: statsLoading,
        error: statsError,
    } = useDashboardStats();

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
            title: "Pengunjung Hari Ini",
            value: stats.todayVisitors.toString(),
            description: "Unique visitors",
            icon: Users,
            trend: "+15%",
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

            {/* Recent Activities & Device Analytics Row */}
            <div className="flex flex-col lg:flex-row-reverse gap-6">
                {/* Recent Activities - 1/3 width on desktop */}
                <div className="lg:w-1/3">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Aktivitas Terbaru
                            </CardTitle>
                            <CardDescription>
                                Aktivitas sistem dalam 24 jam terakhir
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <div className="h-full overflow-y-auto space-y-2 pr-2">
                                {stats.recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
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
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-lg font-medium text-gray-600 mb-2">
                                                Belum Ada Aktivitas
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Aktivitas sistem akan muncul di
                                                sini
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Device Analytics - 2/3 width on desktop */}
                <div className="lg:w-2/3">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Device Analytics
                            </CardTitle>
                            <CardDescription>
                                Distribusi pengunjung berdasarkan jenis
                                perangkat
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(stats.deviceAnalytics.breakdown)
                                .length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Pie Chart */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-700">
                                            Distribusi Visual
                                        </h3>
                                        <div className="h-[250px]">
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={Object.entries(
                                                            stats
                                                                .deviceAnalytics
                                                                .breakdown
                                                        ).map(
                                                            ([
                                                                device,
                                                                data,
                                                            ]) => ({
                                                                name:
                                                                    device
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase() +
                                                                    device.slice(
                                                                        1
                                                                    ),
                                                                value: data.count,
                                                                percentage:
                                                                    data.percentage,
                                                            })
                                                        )}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={40}
                                                        outerRadius={80}
                                                        paddingAngle={2}
                                                        dataKey="value"
                                                    >
                                                        {Object.entries(
                                                            stats
                                                                .deviceAnalytics
                                                                .breakdown
                                                        ).map(
                                                            (entry, index) => {
                                                                const colors = [
                                                                    "#3b82f6",
                                                                    "#10b981",
                                                                    "#8b5cf6",
                                                                    "#f59e0b",
                                                                ];
                                                                return (
                                                                    <Cell
                                                                        key={`cell-${index}`}
                                                                        fill={
                                                                            colors[
                                                                                index %
                                                                                    colors.length
                                                                            ]
                                                                        }
                                                                    />
                                                                );
                                                            }
                                                        )}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor:
                                                                "white",
                                                            border: "1px solid #e2e8f0",
                                                            borderRadius: "8px",
                                                            boxShadow:
                                                                "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                                        }}
                                                        formatter={(value) => [
                                                            value,
                                                            "Pengunjung",
                                                        ]}
                                                    />
                                                    <Legend
                                                        verticalAlign="bottom"
                                                        height={36}
                                                        wrapperStyle={{
                                                            fontSize: "12px",
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Device Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-700">
                                            Detail Perangkat
                                        </h3>
                                        <div className="space-y-3">
                                            {Object.entries(
                                                stats.deviceAnalytics.breakdown
                                            ).map(([device, data], index) => {
                                                const colors = [
                                                    "#3b82f6",
                                                    "#10b981",
                                                    "#8b5cf6",
                                                    "#f59e0b",
                                                ];
                                                const bgColors = [
                                                    "bg-blue-50",
                                                    "bg-green-50",
                                                    "bg-purple-50",
                                                    "bg-yellow-50",
                                                ];
                                                return (
                                                    <div
                                                        key={device}
                                                        className={`p-4 rounded-lg border ${
                                                            bgColors[
                                                                index %
                                                                    bgColors.length
                                                            ]
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            colors[
                                                                                index %
                                                                                    colors.length
                                                                            ],
                                                                    }}
                                                                ></div>
                                                                <span className="font-medium capitalize text-sm">
                                                                    {device}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm text-gray-600">
                                                                {
                                                                    data.percentage
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-gray-500">
                                                                Sessions
                                                            </span>
                                                            <span
                                                                className="font-bold text-lg"
                                                                style={{
                                                                    color: colors[
                                                                        index %
                                                                            colors.length
                                                                    ],
                                                                }}
                                                            >
                                                                {data.count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Summary Stats */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-700">
                                            Ringkasan
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                                <div className="text-center">
                                                    <p className="text-sm text-blue-600 font-medium">
                                                        Total Sessions
                                                    </p>
                                                    <p className="text-3xl font-bold text-blue-700">
                                                        {
                                                            stats
                                                                .deviceAnalytics
                                                                .total_sessions
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                                <div className="text-center">
                                                    <p className="text-sm text-green-600 font-medium">
                                                        Device Types
                                                    </p>
                                                    <p className="text-3xl font-bold text-green-700">
                                                        {
                                                            Object.keys(
                                                                stats
                                                                    .deviceAnalytics
                                                                    .breakdown
                                                            ).length
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                                <div className="text-center">
                                                    <p className="text-sm text-purple-600 font-medium">
                                                        Most Popular
                                                    </p>
                                                    <p className="text-lg font-bold text-purple-700">
                                                        {Object.entries(
                                                            stats
                                                                .deviceAnalytics
                                                                .breakdown
                                                        )
                                                            .sort(
                                                                (
                                                                    [, a],
                                                                    [, b]
                                                                ) =>
                                                                    b.count -
                                                                    a.count
                                                            )[0]?.[0]
                                                            ?.charAt(0)
                                                            .toUpperCase() +
                                                            Object.entries(
                                                                stats
                                                                    .deviceAnalytics
                                                                    .breakdown
                                                            )
                                                                .sort(
                                                                    (
                                                                        [, a],
                                                                        [, b]
                                                                    ) =>
                                                                        b.count -
                                                                        a.count
                                                                )[0]?.[0]
                                                                ?.slice(1) ||
                                                            "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-gray-600 mb-2">
                                        Belum Ada Data Device
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Data analytics perangkat akan muncul
                                        setelah ada aktivitas pengguna
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Category Distribution Chart - Full Width */}
            <CategoryDistributionChart data={stats.marketsByCategory} />

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
