import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NewEngagementModal from "../components/NewEngagementModal";
import NewReportModal from "../components/NewReportModal";
import DashboardLayout from "../layouts/DashboardLayout";

function Engagements() {
    const [engagements, setEngagements] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedEngagement, setSelectedEngagement] = useState(null);
    const [customers, setCustomers] = useState([]);
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

    const handleSaveEngagement = async (newEngagement) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/engagement`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newEngagement),
            });
            if (!res.ok) throw new Error("Failed to create engagement");
            const created = await res.json();
            setEngagements((prev) => [created, ...prev]);
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error creating engagement:", err);
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

    const statusCounts = engagements.reduce((acc, engagement) => {
        acc[engagement.status] = (acc[engagement.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <DashboardLayout>
            {/* Top bar */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Engagements</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500 font-medium px-4 py-2 rounded transition"
                >
                    <Plus size={18} />
                    New Engagement
                </button>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{statusCounts["Active"] || 0}</div>
                    <div className="text-sm">Active</div>
                </div>
                <div className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{statusCounts["Completed"] || 0}</div>
                    <div className="text-sm">Completed</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-300 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{statusCounts["Upcoming"] || 0}</div>
                    <div className="text-sm">Upcoming</div>
                </div>
            </div>

            {/* Engagements table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <thead>
                        <tr className="text-left text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-sm">
                            <th className="p-4">Engagement Name</th>
                            <th className="p-4">Client</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Start Date</th>
                            <th className="p-4">End Date</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {engagements.map((engagement) => (
                            <tr key={engagement.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{engagement.name}</td>
                                <td className="p-4 text-sm text-gray-700 dark:text-gray-400">{engagement.customer}</td>
                                <td className="p-4 text-sm">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                            engagement.status === "Active"
                                                ? "bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300"
                                                : engagement.status === "Completed"
                                                ? "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300"
                                                : "bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-300"
                                        }`}
                                    >
                                        {engagement.status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-700 dark:text-gray-400">{engagement.startDate}</td>
                                <td className="p-4 text-sm text-gray-700 dark:text-gray-400">{engagement.endDate}</td>
                                <td className="p-4 flex gap-4 text-sm">
                                    <button className="text-indigo-500 hover:underline font-medium">Edit</button>
                                    <button className="text-red-500 hover:underline font-medium">Delete</button>
                                    {engagement.report ? (
                                        <Link
                                            to={`/report-writer/${engagement.id}`}
                                            className="text-green-500 hover:underline font-medium"
                                        >
                                            Edit Report
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => handleStartReport(engagement)}
                                            className="text-green-500 hover:underline font-medium"
                                        >
                                            Start Report
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <NewEngagementModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEngagement}
                customers={customers}
            />

            <NewReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={submitNewReport}
                engagement={selectedEngagement}
            />
        </DashboardLayout>
    );
}

export default Engagements;
