import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import NewFindingModal from "../components/NewFindingModal";
import DashboardLayout from "../layouts/DashboardLayout";
import findingsData from "../test_data/findingsData";

function Findings() {
    const [findings, setFindings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Simulate API call
        setFindings(findingsData);
    }, []);

    const severityCounts = findings.reduce(
        (acc, finding) => {
            acc[finding.severity] = (acc[finding.severity] || 0) + 1;
            return acc;
        },
        {}
    );

    const handleSaveFinding = (newFinding) => {
        const newEntry = {
            id: findings.length + 1,
            ...newFinding,
        };
        setFindings((prev) => [newEntry, ...prev]);
    };

    return (
        <DashboardLayout>
            {/* Top bar */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Findings Library</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500 font-medium px-4 py-2 rounded transition"
                >
                    <Plus size={18} />
                    New Finding
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-lg p-4 shadow-sm text-center transition hover:shadow-md">
                    <div className="text-2xl font-bold">{severityCounts["Critical"] || 0}</div>
                    <div className="text-sm">Critical</div>
                </div>
                <div className="bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-lg p-4 shadow-sm text-center transition hover:shadow-md">
                    <div className="text-2xl font-bold">{severityCounts["High"] || 0}</div>
                    <div className="text-sm">High</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-300 rounded-lg p-4 shadow-sm text-center transition hover:shadow-md">
                    <div className="text-2xl font-bold">{severityCounts["Medium"] || 0}</div>
                    <div className="text-sm">Medium</div>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg p-4 shadow-sm text-center transition hover:shadow-md">
                    <div className="text-2xl font-bold">{severityCounts["Low"] || 0}</div>
                    <div className="text-sm">Low</div>
                </div>
            </div>

            {/* Findings table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <thead>
                        <tr className="text-left text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-sm">
                            <th className="p-4">Title</th>
                            <th className="p-4">Severity</th>
                            <th className="p-4">Reference</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {findings.map((finding) => (
                            <tr key={finding.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{finding.title}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        finding.severity === "Critical"
                                            ? "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300"
                                            : finding.severity === "High"
                                            ? "bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300"
                                            : finding.severity === "Medium"
                                            ? "bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-300"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    }`}>
                                        {finding.severity}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-700 dark:text-gray-400">{finding.reference}</td>
                                <td className="p-4 text-sm text-gray-700 dark:text-gray-400">{finding.description}</td>
                                <td className="p-4 flex gap-4 text-sm">
                                    <button className="text-indigo-500 hover:underline font-medium">Edit</button>
                                    <button className="text-red-500 hover:underline font-medium">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <NewFindingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveFinding}
            />
        </DashboardLayout>
    );
}

export default Findings;
