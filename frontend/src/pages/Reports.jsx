import { Edit3 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

function Reports() {
    const [reports, setReports] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to load reports");

                const data = await res.json();
                setReports(data);
            } catch (err) {
                console.error("Error fetching reports:", err);
            }
        };

        fetchReports();
    }, []);

    const handleViewReport = async (reportId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/${reportId}/generate-pdf`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reportId })  // <-- include in body
            });
    
            if (!res.ok) throw new Error("PDF generation failed");
            const data = await res.json();
            console.log("PDF Generated at:", data.url);
    
            navigate(`/reports/${reportId}`);
        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("Failed to generate PDF. Try again.");
        }
    };
    

    const filteredReports = reports.filter((report) => {
        const title = report.title ?? "";
        const engagementName = report.engagement?.name ?? "";
        const customer = report.engagement?.customer ?? "";

        const query = searchQuery.toLowerCase();
        return (
            title.toLowerCase().includes(query) ||
            engagementName.toLowerCase().includes(query) ||
            customer.toLowerCase().includes(query)
        );
    });

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Reports</h2>
                <input
                    type="text"
                    placeholder="Search by title, engagement, or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                    <div
                        key={report.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800"
                    >
                        <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">
                            {report.title}
                        </h3>
                        <p className="text-sm text-gray-800 dark:text-gray-400 mb-1">
                            <strong>Engagement:</strong> {report.engagement?.name ?? "—"}
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-400 mb-1">
                            <strong>Customer:</strong> {report.engagement?.customer ?? "—"}
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-400 mb-1">
                            <strong>Created:</strong>{" "}
                            {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-400 mb-1">
                            <strong>Updated:</strong>{" "}
                            {report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : "N/A"}
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-400 mb-3">
                            <strong>Status:</strong> {report.status}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                            <button
                                onClick={() => handleViewReport(report.engagement.id)}
                                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                            >
                                View Report →
                            </button>
                            {report.engagement?.id && (
                                <Link
                                    to={`/report-writer/${report.engagement.id}`}
                                    title="Edit Report"
                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}

export default Reports;
