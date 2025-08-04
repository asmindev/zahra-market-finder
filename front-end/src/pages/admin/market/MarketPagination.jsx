import React from "react";

const MarketPagination = ({ pagination, handlePageChange }) => {
    if (!pagination || pagination.total_pages <= 1) {
        return null;
    }

    return (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    Menampilkan{" "}
                    {(pagination.current_page - 1) * pagination.per_page + 1} -{" "}
                    {Math.min(
                        pagination.current_page * pagination.per_page,
                        pagination.total
                    )}{" "}
                    dari {pagination.total} data
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() =>
                            handlePageChange(pagination.current_page - 1)
                        }
                        disabled={pagination.current_page === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Sebelumnya
                    </button>
                    <span className="text-sm text-gray-700">
                        {pagination.current_page} / {pagination.total_pages}
                    </span>
                    <button
                        onClick={() =>
                            handlePageChange(pagination.current_page + 1)
                        }
                        disabled={
                            pagination.current_page === pagination.total_pages
                        }
                        className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Selanjutnya
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketPagination;
