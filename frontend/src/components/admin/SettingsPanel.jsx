import { ChevronDown, ChevronRight, Shield, FileText, Clock, Settings, AlertTriangle, Phone, Scale, Edit2, Archive, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

const REPORT_SECTIONS = [
    { key: "executiveSummary", label: "Executive Summary", icon: BookOpen, description: "High-level summary and key findings overview" },
    { key: "methodology", label: "Methodology", icon: Settings, description: "Testing approach and procedures used" },
    { key: "toolsAndTechniques", label: "Tools and Techniques", icon: FileText, description: "Software and methods employed during testing" },
    { key: "conclusion", label: "Conclusion", icon: Archive, description: "Final recommendations and overall assessment" },
];

const ROE_SECTION_TYPES = {
    AUTHORIZATION: { 
        label: 'Authorization', 
        icon: Shield, 
        color: 'yellow',
        description: 'Authorization details and approval information'
    },
    SCOPE: { 
        label: 'Scope Definition', 
        icon: Settings, 
        color: 'blue',
        description: 'In-scope and out-of-scope systems and assets'
    },
    TESTING_WINDOW: { 
        label: 'Testing Window', 
        icon: Clock, 
        color: 'green',
        description: 'Testing timeframes and blackout periods'
    },
    METHODOLOGY: { 
        label: 'Testing Methodology', 
        icon: FileText, 
        color: 'purple',
        description: 'Approved testing methods and techniques'
    },
    RESTRICTIONS: { 
        label: 'Restrictions & Limitations', 
        icon: AlertTriangle, 
        color: 'red',
        description: 'Testing restrictions and system limitations'
    },
    COMMUNICATION: { 
        label: 'Communication Protocol', 
        icon: Phone, 
        color: 'indigo',
        description: 'Communication channels and protocols'
    },
    EMERGENCY: { 
        label: 'Emergency Procedures', 
        icon: AlertTriangle, 
        color: 'orange',
        description: 'Emergency contact and escalation procedures'
    },
    LEGAL: { 
        label: 'Legal & Compliance', 
        icon: Scale, 
        color: 'gray',
        description: 'Legal requirements and compliance considerations'
    },
    CUSTOM: { 
        label: 'Custom Section', 
        icon: Edit2, 
        color: 'pink',
        description: 'Custom content section'
    }
};

const SettingsPanel = () => {
    const [activeTab, setActiveTab] = useState('reports');
    
    // Report template state
    const [reportTemplate, setReportTemplate] = useState({});
    const [reportExpanded, setReportExpanded] = useState({});
    const [reportSaving, setReportSaving] = useState(false);
    
    // RoE template state
    const [roeTemplates, setRoeTemplates] = useState({});
    const [roeExpanded, setRoeExpanded] = useState({});
    const [roeSaving, setRoeSaving] = useState({});
    const [roeLastSaved, setRoeLastSaved] = useState({});

    const token = localStorage.getItem("token");

    const fetchReportTemplate = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/default-template`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setReportTemplate(data);
        } catch (err) {
            console.error("Failed to load report template settings", err);
        }
    };

    const fetchRoeTemplates = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/roe/section-templates`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            
            // Convert array to object keyed by sectionType
            const templatesObj = {};
            data.forEach(template => {
                templatesObj[template.sectionType] = template;
            });
            setRoeTemplates(templatesObj);
        } catch (err) {
            console.error("Failed to load RoE section templates", err);
        }
    };

    useEffect(() => {
        fetchReportTemplate();
        fetchRoeTemplates();
    }, []);

    // Report template functions
    const toggleReportExpand = (key) => {
        setReportExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleReportChange = (key, value) => {
        if (value.length <= 1000) {
            setReportTemplate((prev) => ({ ...prev, [key]: value }));
        }
    };

    const handleReportSave = async () => {
        try {
            setReportSaving(true);
            await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/default-template`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reportTemplate),
            });
            alert("Report template saved.");
        } catch (err) {
            console.error("Failed to save report template", err);
            alert("Failed to save report template. Check console for details.");
        } finally {
            setReportSaving(false);
        }
    };

    // RoE template functions
    const toggleRoeExpand = (sectionType) => {
        setRoeExpanded((prev) => ({ ...prev, [sectionType]: !prev[sectionType] }));
    };

    const handleRoeContentChange = (sectionType, value) => {
        if (value.length <= 5000) {
            setRoeTemplates((prev) => ({ 
                ...prev, 
                [sectionType]: { 
                    ...prev[sectionType], 
                    content: value,
                    sectionType: sectionType
                } 
            }));
        }
    };

    const handleRoeSave = async (sectionType) => {
        try {
            setRoeSaving(prev => ({ ...prev, [sectionType]: true }));
            
            const template = roeTemplates[sectionType] || {
                sectionType,
                title: ROE_SECTION_TYPES[sectionType].label,
                content: ''
            };
            
            // Ensure we always have a title
            const title = template.title || ROE_SECTION_TYPES[sectionType].label;
            const content = template.content || '';
            
            await fetch(`${import.meta.env.VITE_SATELLITE_URL}/roe/section-templates/${sectionType}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title,
                    content: content
                }),
            });
            
            setRoeLastSaved(prev => ({ ...prev, [sectionType]: new Date() }));
            await fetchRoeTemplates(); // Refresh to get updated data
        } catch (err) {
            console.error("Failed to save RoE template", err);
        } finally {
            setRoeSaving(prev => ({ ...prev, [sectionType]: false }));
        }
    };

    const renderReportTemplates = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Report Section Templates
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Configure default content for each type of report section. This content will be automatically populated when creating new reports.
                </p>
            </div>

            <div className="space-y-4">
                {REPORT_SECTIONS.map((section) => {
                    const isExpanded = reportExpanded[section.key];
                    const Icon = section.icon;

                    return (
                        <div key={section.key} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                            <button
                                onClick={() => toggleReportExpand(section.key)}
                                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                            {section.label}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {section.description}
                                        </p>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {isExpanded && (
                                <div className="px-4 pb-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Default Content
                                        </label>
                                        <textarea
                                            value={reportTemplate[section.key] || ''}
                                            onChange={(e) => handleReportChange(section.key, e.target.value)}
                                            rows={8}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder={`Enter default content for ${section.label} sections...`}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {reportTemplate[section.key]?.length || 0}/1000 characters
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleReportSave}
                    disabled={reportSaving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                    {reportSaving ? 'Saving...' : 'Save All Report Templates'}
                </button>
            </div>
        </div>
    );

    const renderRoeTemplates = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    RoE Section Templates
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Configure default content for each type of Rules of Engagement section. This content will be automatically populated when users add new sections.
                </p>
            </div>

            <div className="space-y-4">
                {Object.entries(ROE_SECTION_TYPES).map(([sectionType, config]) => {
                    const template = roeTemplates[sectionType] || {
                        title: config.label,
                        content: ''
                    };
                    const Icon = config.icon;
                    const isExpanded = roeExpanded[sectionType];
                    const isSaving = roeSaving[sectionType];
                    const lastSaveTime = roeLastSaved[sectionType];

                    return (
                        <div key={sectionType} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                            <button
                                onClick={() => toggleRoeExpand(sectionType)}
                                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                            {config.label}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {config.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {lastSaveTime && (
                                        <span className="text-xs text-green-600 dark:text-green-400">
                                            Saved {lastSaveTime.toLocaleTimeString()}
                                        </span>
                                    )}
                                    {isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="px-4 pb-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Default Content
                                        </label>
                                        <textarea
                                            value={template.content}
                                            onChange={(e) => handleRoeContentChange(sectionType, e.target.value)}
                                            rows={8}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder={`Enter default content for ${config.label} sections...`}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {template.content?.length || 0}/5000 characters
                                        </p>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleRoeSave(sectionType)}
                                            disabled={isSaving}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Template'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Template Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Configure default content for report sections and Rules of Engagement sections.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'reports'
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        Report Sections
                    </button>
                    <button
                        onClick={() => setActiveTab('roe')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'roe'
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        RoE Sections
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'reports' ? renderReportTemplates() : renderRoeTemplates()}
            </div>
        </div>
    );
};

export default SettingsPanel;
