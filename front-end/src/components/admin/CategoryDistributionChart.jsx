import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, BarChart3 } from "lucide-react";

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
                        <PieChart className="h-5 w-5" />
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

    // Generate colors for categories
    const colors = [
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
        "bg-red-500",
        "bg-indigo-500",
        "bg-pink-500",
        "bg-gray-500",
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Distribusi Kategori Pasar
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Simple bar chart representation */}
                <div className="space-y-3">
                    {categories.map((category, index) => {
                        const count = data[category];
                        const percentage = (
                            (count / totalMarkets) *
                            100
                        ).toFixed(1);
                        const widthPercentage =
                            (count / Math.max(...Object.values(data))) * 100;

                        return (
                            <div key={category} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        {category}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {count} ({percentage}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${
                                            colors[index % colors.length]
                                        }`}
                                        style={{ width: `${widthPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                            Total Pasar:
                        </span>
                        <span className="text-sm font-bold">
                            {totalMarkets}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Kategori:</span>
                        <span className="text-sm font-bold">
                            {categories.length}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CategoryDistributionChart;
