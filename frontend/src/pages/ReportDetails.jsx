import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

function ReportDetails() {
    const { reportid } = useParams();
    const [report, setReport] = useState(null);
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pdf");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                // Step 1: Fetch report metadata
                const resReport = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/${reportid}`, { headers });
                const reportData = await resReport.json();
                setReport(reportData);

                
                // Step 2: Fetch the actual PDF file as blob
                const resPdf = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/pdf/${reportData.filename}`, {
                    method: "GET",
                    headers,
                });

                if (!resPdf.ok) throw new Error("Failed to fetch PDF");
                const blob = await resPdf.blob();
                const blobUrl = URL.createObjectURL(blob);
                setPdfBlobUrl(blobUrl);

                setLoading(false);
            } catch (err) {
                console.error("Failed to load report or PDF:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, [reportid]);

    if (loading) {
        return (
            <DashboardLayout>
                <p className="text-gray-700 dark:text-gray-300">Loading...</p>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Report Viewer</h2>
            {report && report.engagement ? (
                <div className="flex flex-col md:flex-row gap-6 bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
                    {/* Left Column */}
                    <div className="md:w-1/3 space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold border-b pb-2 mb-2 text-gray-900 dark:text-gray-100">Report Details</h3>
                        <div className="text-sm text-gray-800 dark:text-gray-300 space-y-2">
                            <p><span className="font-medium">Title:</span> {report.title}</p>
                            <p><span className="font-medium">Engagement:</span> {report.engagement.name}</p>
                            <p><span className="font-medium">Customer:</span> {report.engagement.customer}</p>
                            <p><span className="font-medium">Status:</span> {report.engagement.status}</p>
                            <p><span className="font-medium">Created:</span> {new Date(report.createdAt).toLocaleString()}</p>
                            <p><span className="font-medium">Updated:</span> {new Date(report.updatedAt).toLocaleString()}</p>
                        </div>

                        <div className="pt-4 border-t space-y-2">
                            {pdfBlobUrl && (
                                <a
                                    href={pdfBlobUrl}
                                    download={`${report.title}.pdf`}
                                    className="text-indigo-600 hover:underline text-sm flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </a>
                            )}
                            {report.generatedPptUrl && (
                                <a
                                    href={report.generatedPptUrl}
                                    download
                                    className="text-indigo-600 hover:underline text-sm flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download PowerPoint
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Viewer */}
                    <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {activeTab === "pdf" ? "PDF Report" : "PowerPoint Presentation"}
                                </h3>
                                <div className="flex gap-4 text-sm">
                                    <button
                                        onClick={() => setActiveTab("pdf")}
                                        className={`pb-1 font-medium border-b-2 ${activeTab === "pdf" ? "border-indigo-600 text-indigo-600" : "border-transparent hover:text-indigo-500"}`}
                                    >
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("ppt")}
                                        className={`pb-1 font-medium border-b-2 ${activeTab === "ppt" ? "border-indigo-600 text-indigo-600" : "border-transparent hover:text-indigo-500"}`}
                                    >
                                        PowerPoint
                                    </button>
                                </div>
                            </div>

                            <div className="border rounded overflow-hidden">
                                {activeTab === "pdf" && pdfBlobUrl ? (
                                    <iframe
                                        src={pdfBlobUrl}
                                        className="w-full h-[80vh] border-0"
                                        title="PDF Report"
                                    />
                                ) : (
                                    <iframe
                                        src={report.generatedPptUrl}
                                        className="w-full h-[80vh] border-0"
                                        title="PowerPoint Report"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-gray-600">No report data available.</p>
            )}
        </DashboardLayout>
    );
}

export default ReportDetails;
