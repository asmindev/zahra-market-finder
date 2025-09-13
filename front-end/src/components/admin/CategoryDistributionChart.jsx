import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

export const CategoryDistributionChart = ({ data = {} }) => {
    const categories = Object.keys(data);
    const totalMarkets = Object.values(data).reduce(
        (sum, count) => sum + count,
        0
    );

    if (totalMarkets === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Distribusi Kategori
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Belum ada data pasar
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Transform data for charts
    const chartData = categories.map((category) => ({
        name: category,
        value: data[category],
        percentage: ((data[category] / totalMarkets) * 100).toFixed(1),
    }));

    // Generate colors for categories
    const COLORS = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#8b5cf6",
        "#ef4444",
        "#6366f1",
        "#ec4899",
        "#6b7280",
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Distribusi Kategori Pasar
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">
                            Total Pasar
                        </p>
                        <p className="text-3xl font-bold text-blue-700">
                            {totalMarkets}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600 font-medium">
                            Kategori
                        </p>
                        <p className="text-3xl font-bold text-green-700">
                            {categories.length}
                        </p>
                    </div>
                </div>

                {/* Main Chart */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Distribusi Visual
                        </h3>
                        <div className="h-[350px] w-full bg-gray-50 rounded-lg p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={120}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            boxShadow:
                                                "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                        }}
                                        formatter={(value) => [
                                            value,
                                            "Jumlah Pasar",
                                        ]}
                                        labelFormatter={(label) => `${label}`}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={50}
                                        wrapperStyle={{
                                            fontSize: "14px",
                                            paddingTop: "20px",
                                            color: "#374151",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Detail Kategori
                        </h3>
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                            {chartData.map((category, index) => (
                                <div
                                    key={category.name}
                                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    COLORS[
                                                        index % COLORS.length
                                                    ],
                                            }}
                                        ></div>
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {category.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {category.percentage}% dari
                                                total
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className="text-2xl font-bold"
                                            style={{
                                                color: COLORS[
                                                    index % COLORS.length
                                                ],
                                            }}
                                        >
                                            {category.value}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            pasar
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CategoryDistributionChart;
