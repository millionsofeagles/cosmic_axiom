import { ChevronDown, ChevronUp, Download, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import NewFindingModal from "../components/NewFindingModal";
import DashboardLayout from "../layouts/DashboardLayout";

const Findings = () => {
    const [findings, setFindings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [token] = useState(localStorage.getItem("token"));
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    useEffect(() => {
        const fetchFindings = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/findings`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                setFindings(data);
            } catch (err) {
                console.error("Failed to fetch findings", err);
            }
        };

        fetchFindings();
    }, [token]);

    const handleSaveFinding = async (newFinding) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/findings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newFinding),
            });

            const created = await response.json();
            setFindings((prev) => [created, ...prev]);
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to create finding", err);
        }
    };

    const handleTagClick = (tag) => setSearch(tag);

    const handleExportCSV = () => {
        const headers = ["Title", "Severity", "Reference", "Description", "Tags", "Created"];
        const rows = filteredFindings.map(f => [
            f.title,
            f.severity,
            f.reference || "",
            f.description,
            (f.tags || []).join(", "),
            new Date(f.createdAt).toLocaleDateString()
        ]);
        const csv = [headers, ...rows]
            .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "findings.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const severityCounts = findings.reduce((acc, f) => {
        const key = f.severity.charAt(0).toUpperCase() + f.severity.slice(1).toLowerCase(); // e.g., "CRITICAL" → "Critical"
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const filteredFindings = findings
        .filter((f) => {
            const values = [f.title, f.description, f.severity, f.reference, ...(f.tags || [])];
            return values.some((v) => v?.toLowerCase().includes(search.toLowerCase()));
        })
        .sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
            if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

    const clearFilters = () => {
        setSearch("");
        setSortKey("createdAt");
        setSortOrder("desc");
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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Findings Library</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500 px-4 py-2 rounded"
                    >
                        <Plus size={18} />
                        New Finding
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-500 hover:text-green-500 px-4 py-2 rounded"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-500 hover:text-green-500 px-4 py-2 rounded"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {["Critical", "High", "Medium", "Low"].map((level) => (
                    <div key={level} className={`rounded-lg p-4 text-center transition shadow-sm hover:shadow-md ${level === "Critical"
                        ? "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300"
                        : level === "High"
                            ? "bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300"
                            : level === "Medium"
                                ? "bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-300"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}>
                        <div className="text-2xl font-bold">{severityCounts[level] || 0}</div>
                        <div className="text-sm">{level}</div>
                    </div>
                ))}
            </div>

            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search across all columns..."
                className="mb-6 w-full px-4 py-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm text-sm">
                    <thead>
                        <tr className="text-left text-gray-600 dark:text-gray-300 border-b border-gray-700">
                            {[
                                { key: "title", label: "Title" },
                                { key: "severity", label: "Severity" },
                                { key: "reference", label: "Reference" },
                                { key: "description", label: "Description" },
                                { key: "tags", label: "Tags" },
                                { key: "createdAt", label: "Created" },
                            ].map(({ key, label }) => (
                                <th key={key} onClick={() => toggleSort(key)} className="p-3 cursor-pointer">
                                    {label}{caret(key)}
                                </th>
                            ))}
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFindings.map((f) => (
                            <tr key={f.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{f.title}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${f.severity === "CRITICAL"
                                        ? "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300"
                                        : f.severity === "HIGH"
                                            ? "bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300"
                                            : f.severity === "MEDIUM"
                                                ? "bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-300"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                        }`}>
                                        {f.severity}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-600 dark:text-gray-400">{f.reference || "-"}</td>
                                <td className="p-3 text-gray-600 dark:text-gray-400 line-clamp-2">{f.description}</td>
                                <td className="p-3 text-gray-600 dark:text-gray-400">
                                    {(f.tags || []).map((tag, idx) => (
                                        <span
                                            key={idx}
                                            onClick={() => handleTagClick(tag)}
                                            className="inline-block cursor-pointer bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 text-xs font-medium px-2 py-1 mr-1 mb-1 rounded hover:bg-indigo-200 dark:hover:bg-indigo-600"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </td>
                                <td className="p-3 text-gray-500 dark:text-gray-300">
                                    {new Date(f.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3 flex gap-3">
                                    <button className="text-indigo-500 hover:underline">Edit</button>
                                    <button className="text-red-500 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <NewFindingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveFinding}
            />
        </DashboardLayout>
    );
};

export default Findings;
