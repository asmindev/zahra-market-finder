// Contoh penggunaan hooks use-market.js

import React, { useState } from "react";
import {
    useMarkets,
    useMarket,
    useMarketMutations,
    useMarketsByLocation,
    useMarketOperations,
} from "../hooks/use-market";

// Contoh 1: Menampilkan daftar markets dengan pagination
export const MarketListExample = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    const { markets, loading, error, pagination, refetch } = useMarkets({
        page,
        per_page: 10,
        search,
        category,
    });

    if (loading) return <div>Loading markets...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Daftar Pasar</h2>

            {/* Search dan Filter */}
            <div>
                <input
                    type="text"
                    placeholder="Cari pasar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">Semua Kategori</option>
                    <option value="tradisional">Tradisional</option>
                    <option value="modern">Modern</option>
                </select>
                <button onClick={refetch}>Refresh</button>
            </div>

            {/* Daftar Markets */}
            <div>
                {markets.map((market) => (
                    <div key={market.id}>
                        <h3>{market.name}</h3>
                        <p>{market.location}</p>
                        <p>{market.description}</p>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div>
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Previous
                </button>
                <span>
                    Page {pagination.page} of {pagination.total_pages}
                </span>
                <button
                    disabled={page === pagination.total_pages}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

// Contoh 2: Detail market
export const MarketDetailExample = ({ marketId }) => {
    const { market, loading, error, refetch } = useMarket(marketId);

    if (loading) return <div>Loading market detail...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!market) return <div>Market not found</div>;

    return (
        <div>
            <h2>{market.name}</h2>
            <p>Lokasi: {market.location}</p>
            <p>Deskripsi: {market.description}</p>
            <p>Kategori: {market.category}</p>
            <button onClick={refetch}>Refresh Detail</button>
        </div>
    );
};

// Contoh 3: Form untuk create/update market
export const MarketFormExample = ({ marketId = null, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        description: "",
        category: "",
    });

    const { createMarket, updateMarket, loading, error } = useMarketMutations();
    const { market } = useMarket(marketId); // Untuk edit mode

    // Load data untuk edit
    React.useEffect(() => {
        if (market) {
            setFormData({
                name: market.name || "",
                location: market.location || "",
                description: market.description || "",
                category: market.category || "",
            });
        }
    }, [market]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (marketId) {
                // Update mode
                await updateMarket(marketId, formData);
            } else {
                // Create mode
                await createMarket(formData);
            }

            onSuccess?.();

            // Reset form jika create
            if (!marketId) {
                setFormData({
                    name: "",
                    location: "",
                    description: "",
                    category: "",
                });
            }
        } catch (err) {
            console.error("Form submission error:", err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{marketId ? "Edit" : "Tambah"} Pasar</h2>

            {error && <div>Error: {error}</div>}

            <div>
                <label>Nama Pasar:</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                    required
                />
            </div>

            <div>
                <label>Lokasi:</label>
                <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                    }
                    required
                />
            </div>

            <div>
                <label>Deskripsi:</label>
                <textarea
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            description: e.target.value,
                        })
                    }
                />
            </div>

            <div>
                <label>Kategori:</label>
                <select
                    value={formData.category}
                    onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                    }
                >
                    <option value="">Pilih Kategori</option>
                    <option value="tradisional">Tradisional</option>
                    <option value="modern">Modern</option>
                </select>
            </div>

            <button type="submit" disabled={loading}>
                {loading ? "Saving..." : marketId ? "Update" : "Create"}
            </button>
        </form>
    );
};

// Contoh 4: Pencarian berdasarkan lokasi
export const LocationSearchExample = () => {
    const [coordinates, setCoordinates] = useState({
        latitude: null,
        longitude: null,
        radius: 5,
    });

    const { markets, loading, error, searchByLocation } =
        useMarketsByLocation(coordinates);

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoordinates({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        radius: 5,
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    };

    const handleManualSearch = async () => {
        if (coordinates.latitude && coordinates.longitude) {
            await searchByLocation(
                coordinates.latitude,
                coordinates.longitude,
                coordinates.radius
            );
        }
    };

    return (
        <div>
            <h2>Cari Pasar Berdasarkan Lokasi</h2>

            <div>
                <button onClick={getCurrentLocation}>
                    Gunakan Lokasi Saat Ini
                </button>
            </div>

            <div>
                <label>Latitude:</label>
                <input
                    type="number"
                    step="any"
                    value={coordinates.latitude || ""}
                    onChange={(e) =>
                        setCoordinates({
                            ...coordinates,
                            latitude: parseFloat(e.target.value),
                        })
                    }
                />
            </div>

            <div>
                <label>Longitude:</label>
                <input
                    type="number"
                    step="any"
                    value={coordinates.longitude || ""}
                    onChange={(e) =>
                        setCoordinates({
                            ...coordinates,
                            longitude: parseFloat(e.target.value),
                        })
                    }
                />
            </div>

            <div>
                <label>Radius (km):</label>
                <input
                    type="number"
                    value={coordinates.radius}
                    onChange={(e) =>
                        setCoordinates({
                            ...coordinates,
                            radius: parseInt(e.target.value),
                        })
                    }
                />
            </div>

            <button onClick={handleManualSearch}>Cari Pasar</button>

            {loading && <div>Searching...</div>}
            {error && <div>Error: {error}</div>}

            <div>
                <h3>Pasar Terdekat ({markets.length} hasil)</h3>
                {markets.map((market) => (
                    <div key={market.id}>
                        <h4>{market.name}</h4>
                        <p>{market.location}</p>
                        {market.distance && <p>Jarak: {market.distance} km</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Contoh 5: Operasi CRUD lengkap dengan refresh
export const MarketCRUDExample = () => {
    const {
        deleteMarket,
        loading: deleteLoading,
        error: deleteError,
    } = useMarketMutations();
    const { triggerRefresh } = useMarketOperations();
    const { markets, loading, error, refetch } = useMarkets({
        page: 1,
        per_page: 10,
    });

    const handleDelete = async (marketId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus pasar ini?")) {
            try {
                await deleteMarket(marketId);
                refetch(); // Refresh list setelah delete
                // atau bisa menggunakan triggerRefresh() jika menggunakan context
            } catch (err) {
                console.error("Delete error:", err);
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Manajemen Pasar</h2>

            {deleteError && <div>Delete Error: {deleteError}</div>}

            <div>
                {markets.map((market) => (
                    <div
                        key={market.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            margin: "10px",
                        }}
                    >
                        <h3>{market.name}</h3>
                        <p>{market.location}</p>
                        <button
                            onClick={() => handleDelete(market.id)}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
