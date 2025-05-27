import { useState, useEffect, useMemo, useRef } from "react";
import { X, Search, Check, CheckSquare, Square, Target, Filter, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

function AffectedSystemsModal({ isOpen, onClose, finding, availableScopes = [], onSave }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSystems, setSelectedSystems] = useState(new Set());
    const [statusFilter, setStatusFilter] = useState("all"); // all, inScope, outOfScope
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [sortBy, setSortBy] = useState("address"); // address, status
    const [sortOrder, setSortOrder] = useState("asc");
    const [showDropdown, setShowDropdown] = useState(false);
    const [newSystem, setNewSystem] = useState("");
    const [loading, setLoading] = useState(false);
    
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Initialize selected systems from finding
    useEffect(() => {
        if (isOpen && finding?.affectedSystems) {
            setSelectedSystems(new Set(finding.affectedSystems));
        }
    }, [isOpen, finding]);

    // Focus search when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter and sort scopes
    const filteredAndSortedScopes = useMemo(() => {
        let filtered = availableScopes.filter(scope => {
            // Search filter
            const matchesSearch = scope.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (scope.description && scope.description.toLowerCase().includes(searchTerm.toLowerCase()));
            
            // Status filter
            const matchesStatus = statusFilter === "all" || 
                                (statusFilter === "inScope" && scope.inScope) ||
                                (statusFilter === "outOfScope" && !scope.inScope);
            
            return matchesSearch && matchesStatus;
        });

        // Sort
        filtered.sort((a, b) => {
            let aVal, bVal;
            
            if (sortBy === "address") {
                aVal = a.address.toLowerCase();
                bVal = b.address.toLowerCase();
            } else if (sortBy === "status") {
                aVal = a.inScope ? "1" : "0";
                bVal = b.inScope ? "1" : "0";
            }
            
            if (sortOrder === "asc") {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });

        return filtered;
    }, [availableScopes, searchTerm, statusFilter, sortBy, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedScopes.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedScopes = filteredAndSortedScopes.slice(startIndex, startIndex + pageSize);

    // Selection handlers
    const toggleSystem = (address) => {
        const newSelected = new Set(selectedSystems);
        if (newSelected.has(address)) {
            newSelected.delete(address);
        } else {
            newSelected.add(address);
        }
        setSelectedSystems(newSelected);
    };

    const toggleAll = () => {
        if (paginatedScopes.every(scope => selectedSystems.has(scope.address))) {
            // Deselect all on current page
            const newSelected = new Set(selectedSystems);
            paginatedScopes.forEach(scope => newSelected.delete(scope.address));
            setSelectedSystems(newSelected);
        } else {
            // Select all on current page
            const newSelected = new Set(selectedSystems);
            paginatedScopes.forEach(scope => newSelected.add(scope.address));
            setSelectedSystems(newSelected);
        }
    };

    const selectAllFiltered = () => {
        const newSelected = new Set(selectedSystems);
        filteredAndSortedScopes.forEach(scope => newSelected.add(scope.address));
        setSelectedSystems(newSelected);
    };

    const clearAll = () => {
        setSelectedSystems(new Set());
    };

    const addCustomSystem = () => {
        if (newSystem.trim()) {
            const newSelected = new Set(selectedSystems);
            newSelected.add(newSystem.trim());
            setSelectedSystems(newSelected);
            setNewSystem("");
        }
    };

    const removeCustomSystem = (address) => {
        // Only remove if it's not in the available scopes (i.e., it's custom)
        const isCustom = !availableScopes.some(scope => scope.address === address);
        if (isCustom) {
            const newSelected = new Set(selectedSystems);
            newSelected.delete(address);
            setSelectedSystems(newSelected);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(Array.from(selectedSystems));
            onClose();
        } catch (error) {
            console.error("Failed to save affected systems:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    // Get custom systems (not in available scopes)
    const customSystems = Array.from(selectedSystems).filter(address => 
        !availableScopes.some(scope => scope.address === address)
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={onClose} />
                
                <div className="inline-block w-full max-w-6xl px-6 py-4 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Affected Systems - {finding?.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {selectedSystems.size} selected • {filteredAndSortedScopes.length} available • {availableScopes.length} total
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="mb-6 space-y-4">
                        {/* Search and Filter Row */}
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search by IP address, domain, or description..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    <Filter className="w-4 h-4" />
                                    Filter
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                
                                {showDropdown && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                                        <div className="p-2">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">STATUS</p>
                                            {[
                                                { value: "all", label: "All Systems" },
                                                { value: "inScope", label: "In Scope Only" },
                                                { value: "outOfScope", label: "Out of Scope Only" }
                                            ].map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setStatusFilter(option.value);
                                                        setCurrentPage(1);
                                                        setShowDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-2 py-1 rounded text-sm ${
                                                        statusFilter === option.value 
                                                            ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100"
                                                            : "hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selection Actions Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <button
                                    onClick={toggleAll}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                >
                                    {paginatedScopes.every(scope => selectedSystems.has(scope.address)) ? "Deselect" : "Select"} Page
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={selectAllFiltered}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                >
                                    Select All Filtered
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={clearAll}
                                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600 dark:text-gray-400">Per page:</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                                >
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value={200}>200</option>
                                </select>
                            </div>
                        </div>

                        {/* Add Custom System */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSystem}
                                onChange={(e) => setNewSystem(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCustomSystem()}
                                placeholder="Add custom system (IP, domain, or hostname)"
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <button
                                onClick={addCustomSystem}
                                disabled={!newSystem.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Custom Systems List */}
                    {customSystems.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Custom Systems ({customSystems.length})</h4>
                            <div className="flex flex-wrap gap-2">
                                {customSystems.map(address => (
                                    <span key={address} className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 rounded text-sm">
                                        {address}
                                        <button
                                            onClick={() => removeCustomSystem(address)}
                                            className="hover:text-yellow-900 dark:hover:text-yellow-100"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Systems Table */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <button
                                                onClick={toggleAll}
                                                className="flex items-center text-gray-700 dark:text-gray-300"
                                            >
                                                {paginatedScopes.every(scope => selectedSystems.has(scope.address)) ? 
                                                    <CheckSquare className="w-4 h-4" /> : 
                                                    <Square className="w-4 h-4" />
                                                }
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            <button
                                                onClick={() => handleSort("address")}
                                                className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-gray-900 dark:hover:text-gray-100"
                                            >
                                                Address
                                                {sortBy === "address" && (
                                                    sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            <button
                                                onClick={() => handleSort("status")}
                                                className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-gray-900 dark:hover:text-gray-100"
                                            >
                                                Status
                                                {sortBy === "status" && (
                                                    sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedScopes.map((scope) => (
                                        <tr 
                                            key={scope.id} 
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ${
                                                selectedSystems.has(scope.address) ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                                            }`}
                                            onClick={() => toggleSystem(scope.address)}
                                        >
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSystem(scope.address);
                                                    }}
                                                    className="text-indigo-600 dark:text-indigo-400"
                                                >
                                                    {selectedSystems.has(scope.address) ? 
                                                        <CheckSquare className="w-4 h-4" /> : 
                                                        <Square className="w-4 h-4" />
                                                    }
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-sm text-gray-900 dark:text-gray-100">
                                                {scope.address}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    scope.inScope 
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                }`}>
                                                    {scope.inScope ? "In Scope" : "Out of Scope"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {scope.description || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredAndSortedScopes.length)} of {filteredAndSortedScopes.length} systems
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {currentPage} of {totalPages}
                                </span>
                                
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedSystems.size} systems selected
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save Selection"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AffectedSystemsModal;