import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const MarketFilters = ({
    search,
    setSearch,
    category,
    setCategory,
    perPage,
    setPerPage,
}) => {
    const handleClearSearch = () => {
        setSearch("");
    };

    const handleClearCategory = () => {
        setCategory("");
    };

    const handleClearAll = () => {
        setSearch("");
        setCategory("");
    };

    const hasActiveFilters = search || category;

    const CATEGORIES = [
        { label: "Tradisional", value: "tradisional" },
        { label: "Modern", value: "modern" },
        { label: "Umum", value: "umum" },
    ];

    const PER_PAGE_OPTIONS = [5, 10, 20, 50, 100];

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
            <div className="flex flex-col gap-4">
                {/* Search and Category Row */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Cari pasar berdasarkan nama atau lokasi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-10"
                        />
                        {search && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearSearch}
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Category Filter */}
                    <div className="min-w-[200px] relative">
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem>Semua Kategori</SelectItem>
                                {CATEGORIES.map((item) => (
                                    <SelectItem
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {category && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearCategory}
                                className="absolute right-8 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Per Page Selector */}
                    <div className="min-w-[140px]">
                        <Select
                            value={perPage?.toString()}
                            onValueChange={(value) => setPerPage(Number(value))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Per halaman" />
                            </SelectTrigger>
                            <SelectContent>
                                {PER_PAGE_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option}
                                        value={option.toString()}
                                    >
                                        {option} per halaman
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Active Filters & Clear All */}
                {hasActiveFilters && (
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Filter aktif:</span>
                            {search && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                                    Pencarian: "{search}"
                                </span>
                            )}
                            {category && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">
                                    Kategori: {category}
                                </span>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearAll}
                            className="text-xs"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Hapus Semua Filter
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketFilters;
