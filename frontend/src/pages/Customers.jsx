import { Plus, Edit2, Trash2, Search, Filter, Users, Mail, Phone, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import NewCustomerModal from "../components/NewCustomerModal";
import DashboardLayout from "../layouts/DashboardLayout";

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [token] = useState(localStorage.getItem("token"));

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/customer`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setCustomers(data);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSaveCustomer = async (customerData) => {
        try {
            if (editingCustomer) {
                // Update existing customer
                const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/customer/${editingCustomer.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(customerData),
                });
                if (!res.ok) throw new Error("Update failed");
                await fetchCustomers();
                setEditingCustomer(null);
            } else {
                // Create new customer
                const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/customer`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(customerData),
                });
                if (!res.ok) throw new Error("Create failed");
                const created = await res.json();
                setCustomers(prev => [created, ...prev]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error saving customer:", err);
        }
    };

    const handleEditCustomer = (customer) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleDeleteCustomer = async (customerId) => {
        if (!confirm("Are you sure you want to delete this customer? This will also delete all related engagements and reports.")) return;
        
        try {
            await fetch(`${import.meta.env.VITE_SATELLITE_URL}/customer/${customerId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCustomers(prev => prev.filter(c => c.id !== customerId));
        } catch (err) {
            console.error("Failed to delete customer", err);
        }
    };

    const getPrimaryContact = (contacts = []) => {
        const primary = contacts.find(c => c.isPrimary);
        return primary || null;
    };

    // Filter and sort customers
    const filteredCustomers = customers
        .filter((c) => {
            if (search === "") return true;
            const lower = search.toLowerCase();
            return c.name.toLowerCase().includes(lower) ||
                c.contacts?.some(contact =>
                    contact.name.toLowerCase().includes(lower) ||
                    contact.email.toLowerCase().includes(lower) ||
                    contact.phone?.toLowerCase().includes(lower)
                );
        })
        .sort((a, b) => {
            let aVal, bVal;
            if (sortKey === "primaryContact") {
                const aPrimary = getPrimaryContact(a.contacts);
                const bPrimary = getPrimaryContact(b.contacts);
                aVal = aPrimary ? aPrimary.name : "";
                bVal = bPrimary ? bPrimary.name : "";
            } else {
                aVal = a[sortKey];
                bVal = b[sortKey];
            }
            if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
            if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

    // Pagination
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

    // Stats
    const totalEngagements = customers.reduce((acc, c) => acc + (c._count?.engagements || 0), 0);
    const customersWithEngagements = customers.filter(c => c._count?.engagements > 0).length;

    const clearFilters = () => {
        setSearch("");
        setSortKey("name");
        setSortOrder("asc");
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customers</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Manage your client database ({filteredCustomers.length} total)
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingCustomer(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} />
                    New Customer
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{customers.length}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Total Customers</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">{customersWithEngagements}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">With Engagements</div>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{totalEngagements}</div>
                    <div className="text-sm text-indigo-700 dark:text-indigo-300">Total Engagements</div>
                </div>
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
                            placeholder="Search customers, contacts, emails, or phone numbers..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <Filter size={16} />
                        Clear
                    </button>
                </div>
            </div>

            {/* Enhanced Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                {[
                                    { key: "name", label: "Customer Name" },
                                    { key: "primaryContact", label: "Primary Contact" },
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Engagements</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{customer.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {(() => {
                                        const primary = getPrimaryContact(customer.contacts);
                                        return primary ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    {primary.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                    <Mail className="w-3 h-3" />
                                                    {primary.email}
                                                </div>
                                                {primary.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                        <Phone className="w-3 h-3" />
                                                        {primary.phone}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400 dark:text-gray-500">No contacts</span>
                                        );
                                    })()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        {customer._count?.engagements || 0}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleEditCustomer(customer)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
                                        >
                                            <Edit2 size={14} />
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCustomer(customer.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
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
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} results
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

            {/* Modal */}
            <NewCustomerModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCustomer(null);
                }}
                onSave={handleSaveCustomer}
                initialData={editingCustomer}
            />
        </DashboardLayout>
    );
}

export default Customers;
