import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Save, 
    Download, 
    Eye, 
    Plus, 
    Trash2, 
    GripVertical, 
    FileText, 
    Shield, 
    Clock, 
    Settings, 
    AlertTriangle, 
    Phone, 
    Scale,
    Edit2,
    ChevronDown,
    ChevronUp,
    Loader2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_SATELLITE_URL || 'http://localhost:3005';

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
        description: 'Forbidden activities and limitations'
    },
    COMMUNICATION: { 
        label: 'Communication Protocols', 
        icon: Phone, 
        color: 'indigo',
        description: 'Contact information and escalation procedures'
    },
    EMERGENCY: { 
        label: 'Emergency Procedures', 
        icon: AlertTriangle, 
        color: 'red',
        description: 'Emergency contacts and incident response'
    },
    LEGAL: { 
        label: 'Legal & Compliance', 
        icon: Scale, 
        color: 'gray',
        description: 'Legal considerations and compliance requirements'
    },
    CUSTOM: { 
        label: 'Custom Section', 
        icon: Edit2, 
        color: 'slate',
        description: 'Custom content section'
    }
};

const getSectionColor = (type) => {
    const colors = {
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
        blue: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
        green: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
        purple: 'bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-200',
        red: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-200',
        gray: 'bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-200',
        slate: 'bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-900/20 dark:border-slate-800 dark:text-slate-200'
    };
    return colors[SECTION_TYPES[type]?.color] || colors.slate;
};

const RoEBuilder = () => {
    const { engagementId, roeId } = useParams();
    const navigate = useNavigate();
    
    // Core state
    const [roe, setRoe] = useState(null);
    const [engagement, setEngagement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    
    // UI state
    const [editingSection, setEditingSection] = useState(null);
    const [showAddSection, setShowAddSection] = useState(false);
    const [selectedSectionType, setSelectedSectionType] = useState('');
    const [expandedSections, setExpandedSections] = useState(new Set());
    
    // Drag and drop state
    const [isDragging, setIsDragging] = useState(false);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);
    
    // Form state for editing
    const [editForm, setEditForm] = useState({
        title: '',
        content: '',
        data: {}
    });

    // Auto-save timer
    useEffect(() => {
        let timer;
        if (hasUnsavedChanges && roe) {
            timer = setTimeout(() => {
                handleSave();
            }, 2000);
        }
        return () => clearTimeout(timer);
    }, [hasUnsavedChanges, roe]);

    // Load initial data
    useEffect(() => {
        loadData();
    }, [engagementId, roeId]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            // Load engagement data
            const engagementResponse = await fetch(`${API_BASE}/engagement/${engagementId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const engagementData = await engagementResponse.json();
            setEngagement(engagementData);

            if (roeId && roeId !== 'new') {
                // Load existing RoE
                const roeResponse = await fetch(`${API_BASE}/roe/${roeId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const roeData = await roeResponse.json();
                setRoe(roeData);
                
                // Initialize expanded sections
                setExpandedSections(new Set(roeData.sections?.map(s => s.id) || []));
            } else {
                // Create new RoE
                const newRoe = {
                    engagementId,
                    title: `Rules of Engagement - ${engagementData.name}`,
                    version: '1.0',
                    status: 'DRAFT',
                    classification: 'CONFIDENTIAL',
                    sections: []
                };
                setRoe(newRoe);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!roe || saving) return;
        
        try {
            setSaving(true);
            
            const url = roeId && roeId !== 'new' 
                ? `${API_BASE}/roe/${roe.id}`
                : `${API_BASE}/roe`;
            
            const method = roeId && roeId !== 'new' ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(roe)
            });
            
            if (response.ok) {
                const savedRoe = await response.json();
                setRoe(savedRoe);
                setHasUnsavedChanges(false);
                setLastSaved(new Date());
                
                // Navigate to the saved RoE if this was a new creation
                if (roeId === 'new') {
                    navigate(`/engagements/${engagementId}/roe/${savedRoe.id}`, { replace: true });
                }
            }
        } catch (error) {
            console.error('Error saving RoE:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddSection = async (type) => {
        if (!roe?.id) return; // Can't add sections to unsaved RoE
        
        // Try to fetch template for this section type
        let templateContent = '';
        let templateTitle = SECTION_TYPES[type].label;
        
        try {
            const templateResponse = await fetch(`${API_BASE}/roe/section-templates/${type}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (templateResponse.ok) {
                const template = await templateResponse.json();
                templateContent = template.content;
                templateTitle = template.title;
            }
        } catch (error) {
            console.log('No template found for section type:', type);
            // Continue with empty content if no template exists
        }
        
        const newSectionData = {
            type,
            title: templateTitle,
            content: templateContent,
            data: {},
            position: roe.sections.length
        };
        
        try {
            const response = await fetch(`${API_BASE}/roe/${roe.id}/sections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newSectionData)
            });
            
            if (response.ok) {
                const createdSection = await response.json();
                
                // Add the new section to local state
                setRoe(prev => ({
                    ...prev,
                    sections: [...prev.sections, createdSection]
                }));
                
                setExpandedSections(prev => new Set([...prev, createdSection.id]));
                setEditingSection(createdSection.id);
                setEditForm({
                    title: createdSection.title,
                    content: createdSection.content,
                    data: createdSection.data
                });
                setShowAddSection(false);
            }
        } catch (error) {
            console.error('Error adding section:', error);
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!window.confirm('Are you sure you want to delete this section?')) return;
        if (!roe?.id) return;
        
        try {
            const response = await fetch(`${API_BASE}/roe/${roe.id}/sections/${sectionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                // Remove the section from local state
                setRoe(prev => ({
                    ...prev,
                    sections: prev.sections.filter(s => s.id !== sectionId)
                        .map((s, index) => ({ ...s, position: index }))
                }));
                
                // Clear editing state if this was the section being edited
                if (editingSection === sectionId) {
                    setEditingSection(null);
                    setEditForm({ title: '', content: '', data: {} });
                }
                
                // Remove from expanded sections
                setExpandedSections(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(sectionId);
                    return newSet;
                });
            }
        } catch (error) {
            console.error('Error deleting section:', error);
        }
    };

    const handleEditSection = (section) => {
        setEditingSection(section.id);
        setEditForm({
            title: section.title,
            content: section.content,
            data: section.data || {}
        });
        setExpandedSections(prev => new Set([...prev, section.id]));
    };

    const handleSaveSection = async () => {
        if (!editingSection || !roe?.id) return;
        
        const sectionData = {
            title: editForm.title,
            content: editForm.content,
            data: editForm.data
        };
        
        try {
            const response = await fetch(`${API_BASE}/roe/${roe.id}/sections/${editingSection}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(sectionData)
            });
            
            if (response.ok) {
                const updatedSection = await response.json();
                
                // Update the section in local state
                setRoe(prev => ({
                    ...prev,
                    sections: prev.sections.map(s => 
                        s.id === editingSection ? updatedSection : s
                    )
                }));
                
                setEditingSection(null);
            }
        } catch (error) {
            console.error('Error saving section:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingSection(null);
        setEditForm({ title: '', content: '', data: {} });
    };

    const toggleSectionExpanded = (sectionId) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };

    // Drag and drop handlers
    const handleDragStart = (e, section) => {
        setIsDragging(true);
        setDraggedItem(section);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, section) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverItem(section);
    };

    const handleDrop = (e, targetSection) => {
        e.preventDefault();
        
        if (!draggedItem || draggedItem.id === targetSection.id) {
            setIsDragging(false);
            setDraggedItem(null);
            setDragOverItem(null);
            return;
        }

        const sections = [...roe.sections];
        const draggedIndex = sections.findIndex(s => s.id === draggedItem.id);
        const targetIndex = sections.findIndex(s => s.id === targetSection.id);

        // Remove dragged item and insert at target position
        const [removed] = sections.splice(draggedIndex, 1);
        sections.splice(targetIndex, 0, removed);

        // Update positions
        const updatedSections = sections.map((section, index) => ({
            ...section,
            position: index
        }));

        setRoe(prev => ({ ...prev, sections: updatedSections }));
        setHasUnsavedChanges(true);
        setIsDragging(false);
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDraggedItem(null);
        setDragOverItem(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Shield className="w-6 h-6 text-indigo-600 mr-3" />
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    {roe?.title || 'Rules of Engagement'}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {engagement?.name} • Version {roe?.version || '1.0'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* Save status */}
                            <div className="flex items-center text-sm">
                                {saving ? (
                                    <div className="flex items-center text-yellow-600">
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Saving...
                                    </div>
                                ) : hasUnsavedChanges ? (
                                    <span className="text-orange-600">Unsaved changes</span>
                                ) : lastSaved ? (
                                    <span className="text-green-600">
                                        Saved {new Date(lastSaved).toLocaleTimeString()}
                                    </span>
                                ) : null}
                            </div>
                            
                            {/* Action buttons */}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </button>
                            
                            <button
                                onClick={() => navigate(`/engagements/${engagementId}/roe/${roe?.id}/preview`)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Section Types */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Add Section
                            </h2>
                            
                            <div className="space-y-2">
                                {Object.entries(SECTION_TYPES).map(([type, config]) => {
                                    const Icon = config.icon;
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => handleAddSection(type)}
                                            className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <Icon className="w-5 h-5 mr-3 text-gray-500" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {config.label}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {config.description}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Sections */}
                    <div className="lg:col-span-3">
                        <div className="space-y-6">
                            {roe?.sections?.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        No sections yet
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Start building your Rules of Engagement by adding sections from the sidebar.
                                    </p>
                                </div>
                            ) : (
                                roe?.sections?.map((section, index) => {
                                    const sectionType = SECTION_TYPES[section.type];
                                    const Icon = sectionType?.icon || FileText;
                                    const isExpanded = expandedSections.has(section.id);
                                    const isEditing = editingSection === section.id;
                                    
                                    return (
                                        <div
                                            key={section.id}
                                            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 transition-all ${
                                                getSectionColor(section.type)
                                            } ${
                                                dragOverItem?.id === section.id ? 'border-indigo-400 shadow-lg' : ''
                                            }`}
                                            onDragOver={(e) => handleDragOver(e, section)}
                                            onDrop={(e) => handleDrop(e, section)}
                                        >
                                            {/* Section Header */}
                                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                                                <div className="flex items-center flex-1">
                                                    <div
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, section)}
                                                        onDragEnd={handleDragEnd}
                                                        className="cursor-move mr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    >
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>
                                                    
                                                    <Icon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                                                    
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                            {section.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {sectionType?.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleEditSection(section)}
                                                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => handleDeleteSection(section.id)}
                                                        className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => toggleSectionExpanded(section.id)}
                                                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Section Content */}
                                            {isExpanded && (
                                                <div className="p-4">
                                                    {isEditing ? (
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                    Section Title
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={editForm.title}
                                                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                />
                                                            </div>
                                                            
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                    Content
                                                                </label>
                                                                <textarea
                                                                    value={editForm.content}
                                                                    onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                                                    rows={8}
                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                    placeholder="Enter section content..."
                                                                />
                                                            </div>
                                                            
                                                            <div className="flex justify-end space-x-3">
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={handleSaveSection}
                                                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                                                                >
                                                                    Save Section
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="prose dark:prose-invert max-w-none">
                                                            {section.content ? (
                                                                <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{section.content}</p>
                                                            ) : (
                                                                <p className="text-gray-500 dark:text-gray-400 italic">
                                                                    No content yet. Click edit to add content.
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoEBuilder;