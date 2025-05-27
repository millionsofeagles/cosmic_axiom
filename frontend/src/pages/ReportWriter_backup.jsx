import {
    BriefcaseBusiness,
    CalendarCheck,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    IdCard,
    Mail,
    Phone,
    User,
    Plus,
    Network,
    FileText,
    Download,
    Save,
    Edit2,
    Trash2,
    Move,
    AlertCircle,
    Shield,
    X,
    Eye,
    EyeOff,
    Search,
    Filter,
    Clock,
    CheckCircle,
    Info,
    FileImage,
    List,
    Grid3x3,
    Settings,
    Palette,
    Book
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ConnectivityForm from "../components/forms/ConnectivityForm";
import FindingForm from "../components/forms/FindingForm";
import DashboardLayout from "../layouts/DashboardLayout";

function ReportWriter() {
    const { reportId } = useParams();
    const [token] = useState(localStorage.getItem("token"));

    // Core data
    const [report, setReport] = useState(null);
    const [engagement, setEngagement] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [sections, setSections] = useState([]);
    const [findings, setFindings] = useState([]);
    
    // UI state
    const [activeForm, setActiveForm] = useState(null);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [showMetaSection, setShowMetaSection] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [reorderMode, setReorderMode] = useState(false);
    const [draggedSection, setDraggedSection] = useState(null);
    const [activeTab, setActiveTab] = useState("content"); // content, preview, findings
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [viewMode, setViewMode] = useState("list"); // list, grid
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSeverity, setFilterSeverity] = useState("");
    const [showOnlyIncluded, setShowOnlyIncluded] = useState(false);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [lastSaved, setLastSaved] = useState(null);
    
    const navigate = useNavigate();
    const autoSaveTimerRef = useRef(null);

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

                const reportRes = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/${reportId}`, { headers });
                const reportData = await reportRes.json();
                setReport(reportData);

                const engRes = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/engagement/${reportData.engagementId}`, { headers });
                const engagementData = await engRes.json();
                setEngagement(engagementData);

                const custRes = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/customer`, { headers });
                const customers = await custRes.json();
                setCustomer(customers.find(c => c.id === engagementData.customerId) || null);

                const secRes = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/${reportId}/sections`, { headers });
                const secData = await secRes.json();
                setSections(secData.sort((a, b) => a.position - b.position));

                const findingRes = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/findings`, { headers });
                const findingTemplates = await findingRes.json();
                setFindings(findingTemplates);
            } catch (err) {
                console.error("Failed to load data:", err);
            }
        };

        loadData();
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [reportId, token, editingSectionId]);

    const handleAddFinding = async (data) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/sections`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reportId,
                    type: "finding",
                    ...data,
                    position: sections.length
                })
            });

            const created = await res.json();
            setSections(prev => [...prev, created]);
            setActiveForm(null);
        } catch (err) {
            console.error("Error adding finding:", err);
        }
    };

    const handleFormSubmit = (handler) => async (data) => {
        await handler(data);
        setActiveForm(null);
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
                    reportId,
                    type: "connectivity",
                    data,
                    position: sections.length
                })
            });

            const created = await res.json();
            setSections(prev => [...prev, created]);
            setActiveForm(null);
        } catch (err) {
            console.error("Error adding connectivity:", err);
        }
    };

    const toggleMetaSection = () => setShowMetaSection(!showMetaSection);

    const handleSaveNarrative = async (silent = false) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/${reportId}`, {
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

            if (!res.ok) throw new Error("Failed to save narrative");
            setLastSaved(new Date());
            if (!silent) {
                alert("Narrative sections saved.");
            }
        } catch (err) {
            console.error("Failed to save narrative:", err);
            alert("Save failed. Check console.");
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!confirm("Are you sure you want to delete this section?")) return;
        
        try {
            await fetch(`${import.meta.env.VITE_SATELLITE_URL}/sections/${sectionId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSections(prev => prev.filter(s => s.id !== sectionId));
        } catch (err) {
            console.error("Failed to delete section:", err);
        }
    };

    const handleEditSection = (sectionId) => {
        setEditingSectionId(sectionId);
        // TODO: Implement inline editing
    };

    const handleGenerateReport = async (format) => {
        setIsGenerating(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/${reportId}/generate`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ format })
            });

            if (!res.ok) throw new Error("Failed to generate report");
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report_${reportId}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Failed to generate report:", err);
            alert("Failed to generate report");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDragStart = (e, section) => {
        setDraggedSection(section);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, targetSection) => {
        e.preventDefault();
        if (!draggedSection || draggedSection.id === targetSection.id) return;

        const draggedIndex = sections.findIndex(s => s.id === draggedSection.id);
        const targetIndex = sections.findIndex(s => s.id === targetSection.id);
        
        const newSections = [...sections];
        newSections.splice(draggedIndex, 1);
        newSections.splice(targetIndex, 0, draggedSection);
        
        // Update positions
        const updatedSections = newSections.map((s, i) => ({ ...s, position: i }));
        setSections(updatedSections);
        
        // TODO: Save new positions to backend
        setDraggedSection(null);
    };

    const getSeverityIcon = (severity) => {
        const icons = {
            CRITICAL: <AlertCircle className="w-5 h-5 text-red-600" />,
            HIGH: <AlertCircle className="w-5 h-5 text-orange-600" />,
            MEDIUM: <Shield className="w-5 h-5 text-yellow-600" />,
            LOW: <Shield className="w-5 h-5 text-blue-600" />
        };
        return icons[severity] || null;
    };

    const getSeverityBadge = (severity) => {
        const classes = {
            CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
            HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
            MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        };
        return `inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${classes[severity] || "bg-gray-100 text-gray-800"}`;
    };

    // Auto-save functionality
    useEffect(() => {
        if (autoSaveEnabled && report && (report.executiveSummary || report.methodology || report.toolsAndTechniques || report.conclusion)) {
            autoSaveTimerRef.current = setTimeout(() => {
                handleSaveNarrative(true); // silent save
            }, 3000); // Save after 3 seconds of inactivity
        }
        return () => clearTimeout(autoSaveTimerRef.current);
    }, [report?.executiveSummary, report?.methodology, report?.toolsAndTechniques, report?.conclusion, autoSaveEnabled]);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${sidebarCollapsed ? 'hidden' : ''}`}>
                            Report Sections
                        </h3>
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>
                </div>
                
                {/* Section List */}
                {!sidebarCollapsed && (
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-2">
                            {sections.map((section, index) => (
                                <button
                                    key={section.id}
                                    onClick={() => document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">#{index + 1}</span>
                                        {section.type === "finding" && section.reportFinding && (
                                            <span className={`w-2 h-2 rounded-full ${
                                                section.reportFinding.severity === "CRITICAL" ? "bg-red-500" :
                                                section.reportFinding.severity === "HIGH" ? "bg-orange-500" :
                                                section.reportFinding.severity === "MEDIUM" ? "bg-yellow-500" :
                                                "bg-blue-500"
                                            }`} />
                                        )}
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                            {section.type === "finding" && section.reportFinding
                                                ? section.reportFinding.title
                                                : section.type.charAt(0).toUpperCase() + section.type.slice(1)
                                            }
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {!sidebarCollapsed && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Auto-save</span>
                                <button
                                    onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                        autoSaveEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                >
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                        autoSaveEnabled ? 'translate-x-5' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                            {lastSaved && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <CheckCircle size={12} />
                                    Saved {new Date(lastSaved).toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {report?.title || "Loading report..."}
                            </h1>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <BriefcaseBusiness size={14} />
                                    {engagement?.name}
                                </span>
                                <span className="flex items-center gap-1">
                                    <User size={14} />
                                    {customer?.name}
                                </span>
                                <span className="flex items-center gap-1">
                                    <CalendarCheck size={14} />
                                    {engagement?.startDate} - {engagement?.endDate}
                                </span>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleGenerateReport('pdf')}
                                disabled={isGenerating || sections.length === 0}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <Download size={18} />
                                PDF
                            </button>
                            <button
                                onClick={() => handleGenerateReport('docx')}
                                disabled={isGenerating || sections.length === 0}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <FileText size={18} />
                                DOCX
                            </button>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex gap-1 mt-4">
                        <button
                            onClick={() => setActiveTab("content")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
                                activeTab === "content"
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            }`}
                        >
                            <Edit2 size={16} />
                            Content
                        </button>
                        <button
                            onClick={() => setActiveTab("findings")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
                                activeTab === "findings"
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            }`}
                        >
                            <AlertCircle size={16} />
                            Finding Library
                        </button>
                        <button
                            onClick={() => setActiveTab("preview")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
                                activeTab === "preview"
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            }`}
                        >
                            <Eye size={16} />
                            Preview
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === "content" && (
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
                                {showMetaSection ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </button>
                            {showMetaSection && report && (
                                <div className="p-4 bg-white dark:bg-gray-800 space-y-4">
                                    {["executiveSummary", "methodology", "toolsAndTechniques", "conclusion"].map((field) => (
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
                                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                    >
                                        <Save size={18} />
                                        Save Narrative
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    )}
                    
                    {activeTab === "findings" && (
                        <div className="p-6">
                            {/* Finding Library Tab */}
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Finding Library</h2>
                                
                                {/* Search and Filters */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                                    <div className="flex flex-col lg:flex-row gap-4">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search findings..."
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <select
                                            value={filterSeverity}
                                            onChange={(e) => setFilterSeverity(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">All Severities</option>
                                            <option value="CRITICAL">Critical</option>
                                            <option value="HIGH">High</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="LOW">Low</option>
                                        </select>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                {viewMode === "list" ? <Grid3x3 size={20} /> : <List size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Finding Grid/List */}
                                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                                    {findings
                                        .filter(f => {
                                            const matchesSearch = !searchTerm || 
                                                f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                f.description.toLowerCase().includes(searchTerm.toLowerCase());
                                            const matchesSeverity = !filterSeverity || f.severity === filterSeverity;
                                            return matchesSearch && matchesSeverity;
                                        })
                                        .map(finding => (
                                            <div 
                                                key={finding.id} 
                                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{finding.title}</h3>
                                                    <span className={getSeverityBadge(finding.severity)}>
                                                        {finding.severity}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                                    {finding.description}
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setActiveForm("finding");
                                                        setActiveTab("content");
                                                        // TODO: Pre-fill the finding form with this template
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    <Plus size={16} />
                                                    Use Template
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === "preview" && (
                        <div className="p-6">
                            {/* Preview Tab */}
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                                        {report?.title}
                                    </h1>
                                    
                                    {/* Executive Summary */}
                                    {report?.executiveSummary && (
                                        <div className="mb-8">
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Executive Summary</h2>
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{report.executiveSummary}</p>
                                        </div>
                                    )}
                                    
                                    {/* Findings Summary */}
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Findings Summary</h2>
                                        <div className="grid grid-cols-4 gap-4 mb-6">
                                            {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(severity => {
                                                const count = sections.filter(s => 
                                                    s.type === "finding" && s.reportFinding?.severity === severity
                                                ).length;
                                                return (
                                                    <div key={severity} className="text-center">
                                                        <div className={`text-2xl font-bold ${
                                                            severity === "CRITICAL" ? "text-red-600" :
                                                            severity === "HIGH" ? "text-orange-600" :
                                                            severity === "MEDIUM" ? "text-yellow-600" :
                                                            "text-blue-600"
                                                        }`}>{count}</div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">{severity}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    {/* Findings */}
                                    {sections.filter(s => s.type === "finding").map((section, index) => (
                                        <div key={section.id} className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-8">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                {index + 1}. {section.reportFinding?.title}
                                            </h3>
                                            <div className="mb-4">
                                                <span className={getSeverityBadge(section.reportFinding?.severity)}>
                                                    {section.reportFinding?.severity}
                                                </span>
                                            </div>
                                            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                                <div>
                                                    <h4 className="font-medium mb-1">Description</h4>
                                                    <p className="whitespace-pre-wrap">{section.reportFinding?.description}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium mb-1">Recommendation</h4>
                                                    <p className="whitespace-pre-wrap">{section.reportFinding?.recommendation}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Methodology */}
                                    {report?.methodology && (
                                        <div className="mb-8">
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Methodology</h2>
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{report.methodology}</p>
                                        </div>
                                    )}
                                    
                                    {/* Conclusion */}
                                    {report?.conclusion && (
                                        <div className="mb-8">
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Conclusion</h2>
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{report.conclusion}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReportWriter;

                        <div className="p-6">
                            {/* Quick Actions Bar */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                                        <p className="text-sm opacity-90">Add content to your report</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setActiveForm(activeForm === "finding" ? null : "finding")} 
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                                                activeForm === "finding"
                                                    ? "bg-white text-indigo-600 shadow-lg"
                                                    : "bg-white/20 backdrop-blur hover:bg-white/30"
                                            }`}
                                        >
                                            <AlertCircle size={18} />
                                            Add Finding
                                        </button>
                                        <button 
                                            onClick={() => setActiveForm(activeForm === "connectivity" ? null : "connectivity")} 
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                                                activeForm === "connectivity"
                                                    ? "bg-white text-indigo-600 shadow-lg"
                                                    : "bg-white/20 backdrop-blur hover:bg-white/30"
                                            }`}
                                        >
                                            <Network size={18} />
                                            Add Connectivity
                                        </button>
                                        <button
                                            onClick={() => setReorderMode(!reorderMode)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                                                reorderMode 
                                                    ? "bg-white text-indigo-600 shadow-lg" 
                                                    : "bg-white/20 backdrop-blur hover:bg-white/30"
                                            }`}
                                        >
                                            <Move size={18} />
                                            {reorderMode ? "Done" : "Reorder"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Forms */}
                            {activeForm && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
                                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {activeForm === "finding" ? "Add Finding" : "Add Connectivity Test"}
                                        </h3>
                                        <button
                                            onClick={() => setActiveForm(null)}
                                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        {activeForm === "finding" && <FindingForm onSubmit={(data) => { handleAddFinding(data); setActiveForm(null); }} findings={findings} />}
                                        {activeForm === "connectivity" && <ConnectivityForm onSubmit={(data) => { handleAddConnectivity(data); setActiveForm(null); }} />}
                                    </div>
                                </div>
                            )}

                            {/* Report Sections */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Report Sections ({sections.length})
                                    </h3>
                                    {reorderMode && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <Move size={16} />
                                            Drag and drop to reorder
                                        </p>
                                    )}
                                </div>
                                
                                {sections.length > 0 ? (
                        <div className="space-y-4">
                            {sections.map((section, i) => (
                                <div 
                                    key={section.id} 
                                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all ${
                                        reorderMode ? "cursor-move" : ""
                                    }`}
                                    draggable={reorderMode}
                                    onDragStart={(e) => handleDragStart(e, section)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, section)}
                                >
                                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                #{i + 1}
                                            </span>
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {section.type === "finding" && section.reportFinding ? (
                                                    <div className="flex items-center gap-2">
                                                        {getSeverityIcon(section.reportFinding.severity)}
                                                        {section.reportFinding.title}
                                                    </div>
                                                ) : (
                                                    section.type.charAt(0).toUpperCase() + section.type.slice(1)
                                                )}
                                            </h4>
                                        </div>
                                        {!reorderMode && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditSection(section.id)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSection(section.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-6">
                                        {section.reportFinding ? (
                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="mb-4">
                                                            <span className={getSeverityBadge(section.reportFinding.severity)}>
                                                                {section.reportFinding.severity}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="space-y-3">
                                                            <div>
                                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h5>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                                    {section.reportFinding.description}
                                                                </p>
                                                            </div>
                                                            
                                                            <div>
                                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recommendation</h5>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                                    {section.reportFinding.recommendation}
                                                                </p>
                                                            </div>
                                                            
                                                            {section.reportFinding.impact && (
                                                                <div>
                                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Impact</h5>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                                        {section.reportFinding.impact}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            
                                                            {section.reportFinding.affectedSystems && section.reportFinding.affectedSystems.length > 0 && (
                                                                <div>
                                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Affected Systems</h5>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {section.reportFinding.affectedSystems.map((system, idx) => (
                                                                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                                                {system}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {section.reportFinding.reference && (
                                                                <div>
                                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference</h5>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {section.reportFinding.reference}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {section.data && Object.entries(section.data).map(([key, value]) => (
                                                    <div key={key} className="flex">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize min-w-[120px]">
                                                            {key}:
                                                        </span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {typeof value === 'string' ? value : JSON.stringify(value)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                                        <Book className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400 mb-2">No sections added yet</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">
                                            Add findings or connectivity tests to build your report
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
}

export default ReportWriter;
