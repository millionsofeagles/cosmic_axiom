import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Shield, FileText, Cloud, Settings, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";

const SECTION_TYPES = {
    AUTHORIZATION: { label: 'Authorization', icon: Shield, color: 'yellow' },
    SCOPE: { label: 'Scope Definition', icon: Settings, color: 'blue' },
    TESTING_WINDOW: { label: 'Testing Window', icon: FileText, color: 'green' },
    METHODOLOGY: { label: 'Testing Methodology', icon: FileText, color: 'purple' },
    RESTRICTIONS: { label: 'Restrictions & Limitations', icon: FileText, color: 'red' },
    COMMUNICATION: { label: 'Communication Protocols', icon: FileText, color: 'indigo' },
    EMERGENCY: { label: 'Emergency Procedures', icon: FileText, color: 'orange' },
    LEGAL: { label: 'Legal & Compliance', icon: FileText, color: 'gray' },
    CUSTOM: { label: 'Custom Section', icon: FileText, color: 'slate' }
};

const getTemplateIcon = (templateName) => {
    if (templateName.toLowerCase().includes("network")) return Shield;
    if (templateName.toLowerCase().includes("web")) return FileText;
    if (templateName.toLowerCase().includes("cloud")) return Cloud;
    return FileText;
};

function RoETemplateManager() {
    const [templates, setTemplates] = useState([]);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        description: '',
        isDefault: false,
        sections: []
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/roe/templates/list`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setTemplates(data);
        } catch (err) {
            console.error("Failed to load RoE templates", err);
        } finally {
            setLoading(false);
        }
    };


    const handleEdit = (template) => {
        setEditingTemplate({
            ...template,
            sections: [...template.sections] // Create a copy
        });
    };

    const handleSave = async (template) => {
        try {
            setSaving(true);
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/roe/templates/${template.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: template.name,
                    description: template.description,
                    isDefault: template.isDefault,
                    sections: template.sections
                }),
            });
            
            if (res.ok) {
                await fetchTemplates();
                setEditingTemplate(null);
            } else {
                throw new Error('Failed to save template');
            }
        } catch (err) {
            console.error("Failed to save template", err);
            alert("Failed to save template. Check console for details.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (templateId) => {
        if (!confirm("Are you sure you want to delete this template?")) return;
        
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/roe/templates/${templateId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (res.ok) {
                await fetchTemplates();
            } else {
                throw new Error('Failed to delete template');
            }
        } catch (err) {
            console.error("Failed to delete template", err);
            alert("Failed to delete template. Check console for details.");
        }
    };

    const handleAddSection = (template) => {
        const updatedSections = [...template.sections, {
            type: 'AUTHORIZATION',
            position: template.sections.length,
            title: 'Authorization',
            content: ''
        }];
        
        setEditingTemplate({
            ...template,
            sections: updatedSections
        });
    };

    const handleRemoveSection = (template, index) => {
        const updatedSections = template.sections.filter((_, i) => i !== index)
            .map((section, i) => ({ ...section, position: i }));
        
        setEditingTemplate({
            ...template,
            sections: updatedSections
        });
    };

    const handleSectionChange = (template, index, field, value) => {
        const updatedSections = [...template.sections];
        if (field === 'type') {
            updatedSections[index] = { 
                ...updatedSections[index], 
                type: value,
                title: SECTION_TYPES[value]?.label || value
            };
        } else if (field === 'title') {
            updatedSections[index] = {
                ...updatedSections[index],
                title: value
            };
        } else if (field === 'content') {
            updatedSections[index] = {
                ...updatedSections[index],
                content: value
            };
        }
        
        setEditingTemplate({
            ...template,
            sections: updatedSections
        });
    };

    const moveSectionUp = (template, index) => {
        if (index === 0) return;
        
        const updatedSections = [...template.sections];
        [updatedSections[index - 1], updatedSections[index]] = [updatedSections[index], updatedSections[index - 1]];
        updatedSections.forEach((section, i) => section.position = i);
        
        setEditingTemplate({
            ...template,
            sections: updatedSections
        });
    };

    const moveSectionDown = (template, index) => {
        if (index === template.sections.length - 1) return;
        
        const updatedSections = [...template.sections];
        [updatedSections[index], updatedSections[index + 1]] = [updatedSections[index + 1], updatedSections[index]];
        updatedSections.forEach((section, i) => section.position = i);
        
        setEditingTemplate({
            ...template,
            sections: updatedSections
        });
    };

    const toggleSectionExpanded = (templateId, sectionIndex) => {
        const key = `${templateId}-${sectionIndex}`;
        setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };


    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">RoE Template Manager</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage template compositions - which sections to include and their order
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Template
                </button>
            </div>

            <div className="space-y-6">
                {templates.map((template) => {
                    const Icon = getTemplateIcon(template.name);
                    const isEditing = editingTemplate?.id === template.id;
                    const currentTemplate = isEditing ? editingTemplate : template;

                    return (
                        <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <Icon className="w-6 h-6 text-indigo-600 mr-3" />
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={currentTemplate.name}
                                                onChange={(e) => setEditingTemplate({
                                                    ...currentTemplate,
                                                    name: e.target.value
                                                })}
                                                className="text-xl font-semibold bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                                            />
                                            <input
                                                type="text"
                                                value={currentTemplate.description || ''}
                                                onChange={(e) => setEditingTemplate({
                                                    ...currentTemplate,
                                                    description: e.target.value
                                                })}
                                                placeholder="Description"
                                                className="block text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                                {template.name}
                                            </h3>
                                            {template.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {template.description}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {template.isDefault && (
                                        <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs rounded">
                                            Default
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex space-x-2">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => handleSave(currentTemplate)}
                                                disabled={saving}
                                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {saving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={() => setEditingTemplate(null)}
                                                className="inline-flex items-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEdit(template)}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(template.id)}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Sections ({currentTemplate.sections.length})</h4>
                                
                                {currentTemplate.sections.map((section, index) => {
                                    const SectionIcon = SECTION_TYPES[section.type]?.icon || FileText;
                                    const isExpanded = expandedSections[`${currentTemplate.id}-${index}`];
                                    
                                    return (
                                        <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center space-x-3 p-3">
                                                <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                                                <SectionIcon className="w-4 h-4 text-gray-500" />
                                                
                                                {isEditing ? (
                                                    <>
                                                        <select
                                                            value={section.type}
                                                            onChange={(e) => handleSectionChange(currentTemplate, index, 'type', e.target.value)}
                                                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                                                        >
                                                            {Object.entries(SECTION_TYPES).map(([type, config]) => (
                                                                <option key={type} value={type}>{config.label}</option>
                                                            ))}
                                                        </select>
                                                        
                                                        <input
                                                            type="text"
                                                            value={section.title || ''}
                                                            onChange={(e) => handleSectionChange(currentTemplate, index, 'title', e.target.value)}
                                                            placeholder="Section title"
                                                            className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                                                        />
                                                        
                                                        <div className="flex space-x-1">
                                                            <button
                                                                onClick={() => toggleSectionExpanded(currentTemplate.id, index)}
                                                                className="p-1 text-gray-400 hover:text-gray-600"
                                                            >
                                                                {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => moveSectionUp(currentTemplate, index)}
                                                                disabled={index === 0}
                                                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                            >
                                                                <ArrowUp className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => moveSectionDown(currentTemplate, index)}
                                                                disabled={index === currentTemplate.sections.length - 1}
                                                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                            >
                                                                <ArrowDown className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRemoveSection(currentTemplate, index)}
                                                                className="p-1 text-red-400 hover:text-red-600"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex-1">
                                                            <div className="flex items-center">
                                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {section.title}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {SECTION_TYPES[section.type]?.label || section.type}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleSectionExpanded(currentTemplate.id, index)}
                                                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                        >
                                                            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                            
                                            {isExpanded && (
                                                <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-600 mt-2 pt-3">
                                                    {isEditing ? (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                Section Content
                                                            </label>
                                                            <textarea
                                                                value={section.content || ''}
                                                                onChange={(e) => handleSectionChange(currentTemplate, index, 'content', e.target.value)}
                                                                rows={6}
                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                placeholder="Enter section content..."
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                                                            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Content</h5>
                                                            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                                {section.content || 'No content'}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                
                                {isEditing && (
                                    <button
                                        onClick={() => handleAddSection(currentTemplate)}
                                        className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded text-gray-500 hover:border-gray-400 hover:text-gray-600"
                                    >
                                        <Plus className="w-4 h-4 inline mr-2" />
                                        Add Section
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default RoETemplateManager;