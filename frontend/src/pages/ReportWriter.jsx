import {
    BriefcaseBusiness,
    CalendarCheck,
    ChevronDown,
    ChevronRight,
    IdCard,
    Mail,
    Phone,
    User
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ConnectivityForm from "../components/forms/ConnectivityForm";
import FindingForm from "../components/forms/FindingForm";
import DashboardLayout from "../layouts/DashboardLayout";

function ReportWriter() {
    const { engagementId } = useParams();
    const [token] = useState(localStorage.getItem("token"));

    const [engagement, setEngagement] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [report, setReport] = useState(null);
    const [sections, setSections] = useState([]);
    const [activeForm, setActiveForm] = useState(null);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [editFields, setEditFields] = useState({
        description: "",
        recommendation: "",
        reference: "",
        severity: "",
        tags: []
    });
    const [showMetaSection, setShowMetaSection] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (editingSectionId !== null) {
                e.preventDefault();
                e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        const loadData = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const [engRes, custRes, reportRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_SATELLITE_URL}/engagement/${engagementId}`, { headers }),
                    fetch(`${import.meta.env.VITE_SATELLITE_URL}/customer`, { headers }),
                    fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/${engagementId}`, { headers })
                ]);

                const engagementData = await engRes.json();
                const customers = await custRes.json();
                const reportData = await reportRes.json();

                setEngagement(engagementData);
                setCustomer(customers.find(c => c.id === engagementData.customerId) || null);
                setReport(reportData);

                const secRes = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/${reportData.id}/sections`, { headers });
                const secData = await secRes.json();
                setSections(secData.sort((a, b) => a.position - b.position));
            } catch (err) {
                console.error("Failed to load data:", err);
            }
        };

        loadData();

        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [engagementId, token, editingSectionId]);

    const handleAddFinding = async (data) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/sections`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reportId: report.id,
                    type: "finding",
                    data,
                    position: sections.length
                })
            });

            if (!res.ok) throw new Error("Failed to add finding");
            const created = await res.json();
            setSections(prev => [...prev, created]);
            setActiveForm(null);
        } catch (err) {
            console.error("Error adding finding:", err);
        }
    };

    const handleAddConnectivity = async (data) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/sections`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reportId: report.id,
                    type: "connectivity",
                    data,
                    position: sections.length
                })
            });

            if (!res.ok) throw new Error("Failed to add connectivity");
            const created = await res.json();
            setSections(prev => [...prev, created]);
            setActiveForm(null);
        } catch (err) {
            console.error("Error adding connectivity:", err);
        }
    };

    const toggleMetaSection = () => setShowMetaSection(!showMetaSection);

    const handleSaveNarrative = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/${report.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    executiveSummary: report.executiveSummary,
                    methodology: report.methodology,
                    toolsAndTechniques: report.toolsAndTechniques,
                    conclusion: report.conclusion
                })
            });

            if (!res.ok) throw new Error("Failed to save narrative sections");
            alert("Narrative sections saved.");
        } catch (err) {
            console.error("Failed to save narrative:", err);
            alert("Save failed. Check console for details.");
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Write Report</h2>

                {engagement && customer ? (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                    <User className="h-4 w-4" /> Customer Details
                                </h3>
                                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                    <div><span className="font-medium">Name:</span> {customer.name}</div>
                                    <div className="flex items-center gap-1">
                                        <IdCard className="h-3 w-3 text-gray-500" />
                                        <span className="font-medium">Primary Contact:</span> {customer.contacts?.find(c => c.isPrimary)?.name || "-"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3 text-gray-500" />
                                        <span className="font-medium">Primary Contact Phone:</span> {customer.contacts?.find(c => c.isPrimary)?.phone || "-"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3 text-gray-500" />
                                        <span className="font-medium">Primary Contact Email:</span> {customer.contacts?.find(c => c.isPrimary)?.email || "-"}
                                    </div>
                                </div>
                            </div>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                    <BriefcaseBusiness className="h-4 w-4" /> Engagement Info
                                </h3>
                                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                    <div><span className="font-medium">Name:</span> {engagement.name}</div>
                                    <div><span className="font-medium">Status:</span> {engagement.status}</div>
                                    <div className="flex items-center gap-1">
                                        <CalendarCheck className="h-3 w-3 text-gray-500" />
                                        <span className="font-medium">Start:</span> {engagement.startDate}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CalendarCheck className="h-3 w-3 text-gray-500" />
                                        <span className="font-medium">End:</span> {engagement.endDate}</div>
                                </div>
                            </div>
                        </div>

                        {/* Collapsible Meta Section */}
                        <div className="mt-6 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                                className="w-full px-4 py-3 flex justify-between items-center bg-gray-100 dark:bg-gray-700 text-left hover:bg-gray-200 dark:hover:bg-gray-600"
                                onClick={toggleMetaSection}
                            >
                                <span className="font-semibold text-gray-800 dark:text-gray-100">Report Narrative Sections</span>
                                {showMetaSection ? <ChevronDown /> : <ChevronRight />}
                            </button>
                            {showMetaSection && report && (
                                <div className="p-4 bg-white dark:bg-gray-800 space-y-4">
                                    {['executiveSummary', 'methodology', 'toolsAndTechniques', 'conclusion'].map((field) => (
                                        <div key={field}>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize mb-1">
                                                {field.replace(/([A-Z])/g, ' $1')}
                                            </label>
                                            <textarea
                                                rows={4}
                                                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                                value={report[field] || ''}
                                                onChange={(e) => setReport({ ...report, [field]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        onClick={handleSaveNarrative}
                                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                    >
                                        Save Narrative
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500 dark:text-gray-400">Loading engagement data...</div>
                )}

                <div className="flex gap-4 mb-8">
                    <button onClick={() => setActiveForm("finding")} className="px-4 py-2 border rounded transition hover:border-indigo-500 hover:text-indigo-500">
                        Add New Finding
                    </button>
                    <button onClick={() => setActiveForm("connectivity")} className="px-4 py-2 border rounded transition hover:border-indigo-500 hover:text-indigo-500">
                        Add Connectivity
                    </button>
                </div>

                {activeForm === "finding" && <FindingForm onSubmit={handleAddFinding} />}
                {activeForm === "connectivity" && <ConnectivityForm onSubmit={handleAddConnectivity} />}

                {sections.length > 0 ? (
                    <div className="space-y-6 mt-6">
                        {sections.map((section, i) => (
                            <div key={section.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                <div className="mb-2 text-gray-900 dark:text-gray-100 font-semibold">
                                    Section {i + 1} – {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
                                </div>
                                <div className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                                    {Object.entries(section.data).map(([key, value]) => (
                                        <div key={key} className="mb-1">
                                            <span className="font-medium capitalize">{key}:</span> {typeof value === 'string' ? value : JSON.stringify(value)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 dark:text-gray-400">No sections added yet.</div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default ReportWriter;
