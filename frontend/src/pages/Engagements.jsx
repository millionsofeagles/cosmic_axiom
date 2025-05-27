import { Plus, Edit2, Trash2, Search, Filter, Calendar, Users, FileText, ChevronDown, ChevronUp, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NewEngagementModal from "../components/NewEngagementModal";
import NewReportModal from "../components/NewReportModal";
import ScopeModal from "../components/ScopeModal";
import DashboardLayout from "../layouts/DashboardLayout";

function Engagements() {
    const [engagements, setEngagements] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
    const [selectedEngagement, setSelectedEngagement] = useState(null);
    const [editingEngagement, setEditingEngagement] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortKey, setSortKey] = useState("startDate");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/customer`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setCustomers(data);
            } catch (err) {
                console.error("Error loading customers:", err);
            }
        };

        fetchCustomers();
    }, []);

    const fetchEngagements = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/engagement`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to load engagements");
            const data = await res.json();
            setEngagements(data);
        } catch (err) {
            console.error("Error fetching engagements:", err);
        }
    };

    useEffect(() => {
        fetchEngagements();
    }, []);

    const handleSaveEngagement = async (engagementData) => {
        try {
            if (editingEngagement) {
                // Update existing engagement
                const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/engagement/${editingEngagement.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(engagementData),
                });
                if (!res.ok) throw new Error("Failed to update engagement");
                await fetchEngagements();
                setEditingEngagement(null);
            } else {
                // Create new engagement
                const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/engagement`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(engagementData),
                });
                if (!res.ok) throw new Error("Failed to create engagement");
                const created = await res.json();
                setEngagements((prev) => [created, ...prev]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error saving engagement:", err);
        }
    };

    const handleEditEngagement = (engagement) => {
        setEditingEngagement(engagement);
        setIsModalOpen(true);
    };

    const handleDeleteEngagement = async (engagementId) => {
        if (!confirm("Are you sure you want to delete this engagement?")) return;
        
        try {
            await fetch(`${import.meta.env.VITE_SATELLITE_URL}/engagement/${engagementId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEngagements((prev) => prev.filter(e => e.id !== engagementId));
        } catch (err) {
            console.error("Failed to delete engagement", err);
        }
    };

    const handleStartReport = (engagement) => {
        setSelectedEngagement(engagement);
        setIsReportModalOpen(true);
    };

    const submitNewReport = async (title) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ engagementId: selectedEngagement.id, title }),
            });

            if (!res.ok) throw new Error("Failed to create report");

            const created = await res.json();
            navigate(`/report-writer/${created.engagementId}`);
        } catch (err) {
            console.error("Error creating report:", err);
            alert("Failed to start report. Try again.");
        } finally {
            setIsReportModalOpen(false);
            setSelectedEngagement(null);
        }
    };

    // Filter and sort engagements
    const filteredEngagements = engagements
        .filter((e) => {
            const matchesSearch = search === "" || 
                e.name.toLowerCase().includes(search.toLowerCase()) ||
                e.customer?.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "" || e.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
            if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

    // Pagination
    const totalPages = Math.ceil(filteredEngagements.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEngagements = filteredEngagements.slice(startIndex, startIndex + itemsPerPage);

    const statusCounts = engagements.reduce((acc, engagement) => {
        acc[engagement.status] = (acc[engagement.status] || 0) + 1;
        return acc;
    }, {});

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("");
        setSortKey("startDate");
        setSortOrder("desc");
        setCurrentPage(1);
    };

    const toggleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    const caret = (key) =>
        sortKey === key ? (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />) : "";

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Engagements</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Manage client engagements and pentests ({filteredEngagements.length} total)
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingEngagement(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} />
                    New Engagement
                </button>
            </div>

            {/* Status Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {["Active", "Completed", "Upcoming"].map((status) => {
                    const count = statusCounts[status] || 0;
                    const isActive = statusFilter === status;
                    return (
                        <div 
                            key={status} 
                            onClick={() => setStatusFilter(isActive ? "" : status)}
                            className={`rounded-xl p-4 text-center transition-all duration-200 cursor-pointer border-2 ${
                                status === "Active"
                                    ? isActive ? "bg-indigo-600 text-white border-indigo-600 shadow-lg" : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                                    : status === "Completed"
                                        ? isActive ? "bg-green-600 text-white border-green-600 shadow-lg" : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
                                        : isActive ? "bg-yellow-600 text-white border-yellow-600 shadow-lg" : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                            }`}
                        >
                            <div className="flex items-center justify-center mb-2">
                                {status === "Active" ? <Calendar className="w-5 h-5" /> : status === "Completed" ? <FileText className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                            </div>
                            <div className="text-2xl font-bold mb-1">{count}</div>
                            <div className="text-sm font-medium">{status}</div>
                            {isActive && <div className="text-xs mt-1 opacity-90">Click to clear</div>}
                        </div>
                    );
                })}
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search engagements by name or client..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                            <option value="Upcoming">Upcoming</option>
                        </select>
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Filter size={16} />
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                {[
                                    { key: "name", label: "Engagement Name" },
                                    { key: "customer", label: "Client" },
                                    { key: "status", label: "Status" },
                                    { key: "startDate", label: "Start Date" },
                                    { key: "endDate", label: "End Date" },
                                ].map(({ key, label }) => (
                                    <th 
                                        key={key} 
                                        onClick={() => toggleSort(key)} 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            {label}
                                            {caret(key)}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedEngagements.map((engagement) => (
                            <tr key={engagement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{engagement.name}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                    {engagement.customer}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        engagement.status === "Active"
                                            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
                                            : engagement.status === "Completed"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    }`}>
                                        {engagement.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {engagement.startDate ? new Date(engagement.startDate).toLocaleDateString() : "-"}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {engagement.endDate ? new Date(engagement.endDate).toLocaleDateString() : "-"}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleEditEngagement(engagement)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
                                        >
                                            <Edit2 size={14} />
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setSelectedEngagement(engagement);
                                                setIsScopeModalOpen(true);
                                            }}
                                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors flex items-center gap-1"
                                        >
                                            <Target size={14} />
                                            Scope
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteEngagement(engagement.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                        {engagement.report ? (
                                            <Link
                                                to={`/report-writer/${engagement.report.id}`}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors flex items-center gap-1"
                                            >
                                                <FileText size={14} />
                                                Edit Report
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => handleStartReport(engagement)}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors flex items-center gap-1"
                                            >
                                                <FileText size={14} />
                                                Start Report
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEngagements.length)} of {filteredEngagements.length} results
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => 
                                        page === 1 || 
                                        page === totalPages || 
                                        Math.abs(page - currentPage) <= 1
                                    )
                                    .map((page, idx, arr) => (
                                        <div key={page} className="flex items-center">
                                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                <span className="px-2 text-gray-400">...</span>
                                            )}
                                            <button
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-1 text-sm border rounded transition-colors ${
                                                    currentPage === page
                                                        ? "bg-indigo-600 border-indigo-600 text-white"
                                                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </div>
                                    ))
                                }
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <NewEngagementModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingEngagement(null);
                }}
                onSave={handleSaveEngagement}
                customers={customers}
                initialData={editingEngagement}
            />

            <NewReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={submitNewReport}
                engagement={selectedEngagement}
            />

            <ScopeModal
                isOpen={isScopeModalOpen}
                onClose={() => {
                    setIsScopeModalOpen(false);
                    setSelectedEngagement(null);
                }}
                engagement={selectedEngagement}
                onScopeUpdated={() => {
                    // Optionally refresh engagement data to show scope count
                    fetchEngagements();
                }}
            />
        </DashboardLayout>
    );
}

export default Engagements;
