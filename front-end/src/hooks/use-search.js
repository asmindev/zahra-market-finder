import { useState, useEffect, useRef } from "react";

// Custom hook untuk debounce
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Custom hook untuk search functionality
export const useSearch = (onSearch, delay = 500) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, delay);
    const previousSearchTerm = useRef("");

    useEffect(() => {
        if (
            debouncedSearchTerm &&
            debouncedSearchTerm !== previousSearchTerm.current
        ) {
            setIsSearching(true);
            onSearch(debouncedSearchTerm);
            previousSearchTerm.current = debouncedSearchTerm;
        } else if (!debouncedSearchTerm && previousSearchTerm.current) {
            // Reset search when empty
            onSearch("");
            previousSearchTerm.current = "";
        }

        setIsSearching(false);
    }, [debouncedSearchTerm, onSearch]);

    const clearSearch = () => {
        setSearchTerm("");
        previousSearchTerm.current = "";
        onSearch("");
    };

    return {
        searchTerm,
        setSearchTerm,
        isSearching,
        clearSearch,
        debouncedSearchTerm,
    };
};
