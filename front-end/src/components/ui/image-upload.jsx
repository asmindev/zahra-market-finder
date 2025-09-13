import React, { useState, useRef } from "react";
import { Upload, X, Eye, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const ImageUpload = ({
    images = [],
    onImagesChange,
    maxImages = 5,
    maxFileSize = 5 * 1024 * 1024, // 5MB
    acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
    disabled = false,
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

    // Handle file selection
    const handleFiles = (files) => {
        const validFiles = [];
        const errors = [];

        Array.from(files).forEach((file) => {
            // Check file type
            if (!acceptedTypes.includes(file.type)) {
                errors.push(`${file.name}: File type not supported`);
                return;
            }

            // Check file size
            if (file.size > maxFileSize) {
                errors.push(
                    `${file.name}: File size too large (max ${
                        maxFileSize / 1024 / 1024
                    }MB)`
                );
                return;
            }

            // Check max images limit
            if (images.length + validFiles.length >= maxImages) {
                errors.push(`Maximum ${maxImages} images allowed`);
                return;
            }

            validFiles.push(file);
        });

        if (errors.length > 0) {
            console.warn("Upload errors:", errors);
            // You could show these errors in a toast
        }

        if (validFiles.length > 0) {
            onImagesChange([...images, ...validFiles]);
        }
    };

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle drop
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    // Remove image
    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    // Get image preview URL
    const getImageUrl = (image) => {
        if (typeof image === "string") {
            // Existing image URL
            return image;
        } else if (image instanceof File) {
            // New file
            return URL.createObjectURL(image);
        } else if (image.file_path) {
            // Existing image object
            return `${
                import.meta.env.VITE_BASE_API_URL || "http://localhost:8000"
            }/api/markets/images/${image.filename}`;
        }
        return null;
    };

    // Get image name
    const getImageName = (image) => {
        if (typeof image === "string") {
            return image.split("/").pop();
        } else if (image instanceof File) {
            return image.name;
        } else if (image.original_filename) {
            return image.original_filename;
        }
        return "Unknown";
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={`
                    relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
                    ${
                        dragActive
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-300"
                    }
                    ${
                        disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:border-emerald-400 hover:bg-gray-50"
                    }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes.join(",")}
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={disabled}
                />

                <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="text-sm text-gray-600">
                        <span className="font-medium text-emerald-600">
                            Click to upload
                        </span>{" "}
                        or drag and drop
                    </div>
                    <div className="text-xs text-gray-500">
                        PNG, JPG, GIF up to {maxFileSize / 1024 / 1024}MB (max{" "}
                        {maxImages} images)
                    </div>
                </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => {
                        const imageUrl = getImageUrl(image);
                        const imageName = getImageName(image);

                        return (
                            <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={imageName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                e.target.nextSibling.style.display =
                                                    "flex";
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="w-full h-full flex items-center justify-center bg-gray-100"
                                        style={{ display: "none" }}
                                    >
                                        <ImageIcon className="h-8 w-8 text-gray-400" />
                                    </div>
                                </div>

                                {/* Overlay with actions */}
                                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewImage(imageUrl);
                                        }}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage(index);
                                        }}
                                        className="h-8 w-8 p-0"
                                        disabled={disabled}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Image name */}
                                <div className="mt-1 text-xs text-gray-600 truncate">
                                    {imageName}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-full p-4">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
