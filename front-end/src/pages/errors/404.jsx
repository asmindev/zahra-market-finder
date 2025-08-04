import React from "react";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
            <div className="text-center">
                {/* 404 Text */}
                <div className="mb-8">
                    <h1 className="text-8xl md:text-9xl font-black text-emerald-600 mb-4">
                        404
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 font-medium">
                        Halaman tidak ditemukan
                    </p>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-1 group"
                >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                    <span>Kembali</span>
                </button>
            </div>
        </div>
    );
}
