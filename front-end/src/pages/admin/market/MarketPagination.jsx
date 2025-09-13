import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const MarketPagination = ({ pagination, handlePageChange }) => {
    // Always show pagination container
    if (!pagination) {
        return (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200">
                <div className="text-sm text-muted-foreground">
                    Loading pagination...
                </div>
            </div>
        );
    }

    const { current_page, total_pages, total, per_page } = pagination;

    // Generate page numbers to show
    const generatePageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (total_pages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= total_pages; i++) {
                pages.push(i);
            }
        } else {
            // Smart pagination for larger page counts
            pages.push(1);

            if (current_page > 3) {
                pages.push("...");
            }

            const start = Math.max(2, current_page - 1);
            const end = Math.min(total_pages - 1, current_page + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }

            if (current_page < total_pages - 2) {
                pages.push("...");
            }

            if (!pages.includes(total_pages)) {
                pages.push(total_pages);
            }
        }

        return pages;
    };

    const pageNumbers = generatePageNumbers();

    return (
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Info Text */}
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    {total > 0 ? (
                        <>
                            Menampilkan{" "}
                            <span className="font-medium">
                                {(current_page - 1) * per_page + 1}
                            </span>{" "}
                            -{" "}
                            <span className="font-medium">
                                {Math.min(current_page * per_page, total)}
                            </span>{" "}
                            dari <span className="font-medium">{total}</span>{" "}
                            data
                        </>
                    ) : (
                        "Tidak ada data"
                    )}
                </div>

                {/* Pagination Controls */}
                {total_pages > 1 && (
                    <div className="order-1 sm:order-2">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            handlePageChange(current_page - 1)
                                        }
                                        className={
                                            current_page === 1
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>

                                {pageNumbers.map((page, index) => (
                                    <PaginationItem key={index}>
                                        {page === "..." ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink
                                                onClick={() =>
                                                    handlePageChange(page)
                                                }
                                                isActive={page === current_page}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() =>
                                            handlePageChange(current_page + 1)
                                        }
                                        className={
                                            current_page === total_pages
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketPagination;
