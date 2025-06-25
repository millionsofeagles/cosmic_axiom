import { ChevronDown, ChevronRight, Shield, FileText, Clock, Settings, AlertTriangle, Phone, Scale, Edit2, Archive } from "lucide-react";
import { useEffect, useState } from "react";

const SECTION_TYPES = {
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

const RoETemplatesPanel = () => {
    const [templates, setTemplates] = useState({});
    const [expanded, setExpanded] = useState({});
    const [saving, setSaving] = useState({});
    const [lastSaved, setLastSaved] = useState({});

    const token = localStorage.getItem("token");

    const fetchTemplates = async () => {
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
            setTemplates(templatesObj);
        } catch (err) {
            console.error("Failed to load RoE section templates", err);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const toggleExpand = (sectionType) => {
        setExpanded((prev) => ({ ...prev, [sectionType]: !prev[sectionType] }));
    };

    const handleTitleChange = (sectionType, value) => {
        if (value.length <= 200) {
            setTemplates((prev) => ({ 
                ...prev, 
                [sectionType]: { 
                    ...prev[sectionType], 
                    title: value,
                    sectionType: sectionType
                } 
            }));
        }
    };

    const handleContentChange = (sectionType, value) => {
        if (value.length <= 5000) {
            setTemplates((prev) => ({ 
                ...prev, 
                [sectionType]: { 
                    ...prev[sectionType], 
                    content: value,
                    sectionType: sectionType
                } 
            }));
        }
    };

    const handleSave = async (sectionType) => {
        try {
            setSaving(prev => ({ ...prev, [sectionType]: true }));
            
            const template = templates[sectionType] || {
                sectionType,
                title: SECTION_TYPES[sectionType].label,
                content: ''
            };
            
            await fetch(`${import.meta.env.VITE_SATELLITE_URL}/roe/section-templates/${sectionType}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: template.title,
                    content: template.content
                }),
            });
            
            setLastSaved(prev => ({ ...prev, [sectionType]: new Date() }));
            await fetchTemplates(); // Refresh to get updated data
        } catch (err) {
            console.error("Failed to save template", err);
        } finally {
            setSaving(prev => ({ ...prev, [sectionType]: false }));
        }
    };

    return (
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
                {Object.entries(SECTION_TYPES).map(([sectionType, config]) => {
                    const template = templates[sectionType] || {
                        title: config.label,
                        content: ''
                    };
                    const Icon = config.icon;
                    const isExpanded = expanded[sectionType];
                    const isSaving = saving[sectionType];
                    const lastSaveTime = lastSaved[sectionType];

                    return (
                        <div key={sectionType} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                            <button
                                onClick={() => toggleExpand(sectionType)}
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
                                            Default Title
                                        </label>
                                        <input
                                            type="text"
                                            value={template.title}
                                            onChange={(e) => handleTitleChange(sectionType, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder={`Enter default title for ${config.label} sections...`}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {template.title?.length || 0}/200 characters
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Default Content
                                        </label>
                                        <textarea
                                            value={template.content}
                                            onChange={(e) => handleContentChange(sectionType, e.target.value)}
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
                                            onClick={() => handleSave(sectionType)}
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
};

export default RoETemplatesPanel;