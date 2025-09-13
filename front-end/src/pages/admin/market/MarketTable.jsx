import React from "react";
import {
    Edit,
    Trash2,
    MapPin,
    Eye,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Loading from "@/layouts/loading";

const columnHelper = createColumnHelper();

const MarketTable = ({
    markets,
    loading,
    error,
    onViewMarket,
    onEditMarket,
    onDeleteMarket,
    isAdmin = false,
}) => {
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);

    const columns = React.useMemo(
        () => [
            columnHelper.display({
                id: "index",
                header: "No",
                cell: ({ row }) => (
                    <div className="text-sm text-gray-500 font-medium text-center">
                        {row.index + 1}
                    </div>
                ),
                size: 60,
                maxSize: 60,
            }),
            columnHelper.accessor("name", {
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="h-auto p-0 font-medium text-xs uppercase tracking-wider hover:bg-transparent"
                    >
                        Nama Pasar
                        {column.getIsSorted() === "asc" ? (
                            <ChevronUp className="ml-1 h-3 w-3" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ChevronDown className="ml-1 h-3 w-3" />
                        ) : null}
                    </Button>
                ),
                cell: ({ getValue }) => (
                    <div className="text-sm font-medium text-gray-900">
                        {getValue()}
                    </div>
                ),
            }),
            columnHelper.accessor("location", {
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="h-auto p-0 font-medium text-xs uppercase tracking-wider hover:bg-transparent"
                    >
                        Lokasi
                        {column.getIsSorted() === "asc" ? (
                            <ChevronUp className="ml-1 h-3 w-3" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ChevronDown className="ml-1 h-3 w-3" />
                        ) : null}
                    </Button>
                ),
                cell: ({ getValue }) => (
                    <div className="text-sm text-gray-600 flex items-center max-w-48">
                        <MapPin className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                        <span className="truncate" title={getValue()}>
                            {getValue()}
                        </span>
                    </div>
                ),
                size: 200,
                maxSize: 200,
            }),
            columnHelper.accessor("category", {
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="h-auto p-0 font-medium text-xs uppercase tracking-wider hover:bg-transparent"
                    >
                        Kategori
                        {column.getIsSorted() === "asc" ? (
                            <ChevronUp className="ml-1 h-3 w-3" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ChevronDown className="ml-1 h-3 w-3" />
                        ) : null}
                    </Button>
                ),
                cell: ({ getValue }) => (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        {getValue() || "Umum"}
                    </span>
                ),
            }),
            columnHelper.display({
                id: "coordinates",
                header: "Koordinat",
                cell: ({ row }) => (
                    <div className="text-xs text-gray-500 font-mono">
                        {row.original.latitude}, {row.original.longitude}
                    </div>
                ),
            }),
            columnHelper.display({
                id: "actions",
                header: () => <div className="text-right">Aksi</div>,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end space-x-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewMarket(row.original)}
                            className="h-8 w-8 text-gray-600 hover:text-gray-900"
                        >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View market</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditMarket(row.original)}
                            disabled={!isAdmin}
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit market</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteMarket(row.original)}
                            disabled={!isAdmin}
                            className="h-8 w-8 text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete market</span>
                        </Button>
                    </div>
                ),
            }),
        ],
        [onViewMarket, onEditMarket, onDeleteMarket, isAdmin]
    );

    const table = useReactTable({
        data: markets || [],
        columns,
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <p>Error: {error}</p>
            </div>
        );
    }

    if (!markets || markets.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>Tidak ada data pasar yang ditemukan.</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="px-6 py-3"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className="px-6 py-4"
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {markets?.map((market, index) => (
                    <div
                        key={market.id}
                        className="p-4 border border-gray-200 rounded-lg bg-white"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                                        #{index + 1}
                                    </span>
                                    <h3 className="font-medium text-gray-900">
                                        {market.name}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                    <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                                    {market.location}
                                </p>
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 mt-2">
                                    {market.category || "Umum"}
                                </span>
                                <p className="text-xs text-gray-500 font-mono mt-1">
                                    {market.latitude}, {market.longitude}
                                </p>
                            </div>
                            <div className="flex items-center space-x-1 ml-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onViewMarket(market)}
                                    className="h-8 w-8 text-gray-600 hover:text-gray-900"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEditMarket(market)}
                                    disabled={!isAdmin}
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDeleteMarket(market)}
                                    disabled={!isAdmin}
                                    className="h-8 w-8 text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default MarketTable;
