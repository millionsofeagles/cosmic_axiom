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
                                                            
                                                            {/* Section-specific editing forms */}
                                                            {section.type === 'AUTHORIZATION' ? (
                                                                <div className="space-y-4">
                                                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                                                        <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                                                            Professional Authorization Template
                                                                        </h4>
                                                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                                            This section uses a professional template with data from your engagement. 
                                                                            Customize the authorization details below:
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                Authorizing Official Name
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                value={editForm.data?.authorizingOfficial || ''}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, authorizingOfficial: e.target.value }
                                                                                }))}
                                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                placeholder="Enter authorizing official's full name"
                                                                            />
                                                                        </div>
                                                                        
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                Official Title
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                value={editForm.data?.authorizingTitle || ''}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, authorizingTitle: e.target.value }
                                                                                }))}
                                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                placeholder="e.g., Chief Information Security Officer"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            id="emergencyContactRequired"
                                                                            checked={editForm.data?.emergencyContactRequired || false}
                                                                            onChange={(e) => setEditForm(prev => ({ 
                                                                                ...prev, 
                                                                                data: { ...prev.data, emergencyContactRequired: e.target.checked }
                                                                            }))}
                                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                        />
                                                                        <label htmlFor="emergencyContactRequired" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                                            Emergency contact required during testing
                                                                        </label>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Additional Authorization Notes
                                                                            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                                                                        </label>
                                                                        <textarea
                                                                            value={editForm.content}
                                                                            onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                                                            rows={4}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            placeholder="Enter any additional authorization details or constraints..."
                                                                        />
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                            The professional authorization template will be used automatically. 
                                                                            This field is for any additional details specific to your organization.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ) : section.type === 'SCOPE' ? (
                                                                <div className="space-y-4">
                                                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                                                            Professional Scope Template
                                                                        </h4>
                                                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                            This section automatically displays your asset inventory from the engagement configuration.
                                                                            Use the fields below to add any additional assets or scope considerations:
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    {engagement?.scopes && engagement.scopes.length > 0 ? (
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                Scope Asset Configuration
                                                                                <span className="text-xs text-gray-500 ml-1">({engagement.scopes.length} assets)</span>
                                                                            </label>
                                                                            
                                                                            {/* Search and Filters for large scopes */}
                                                                            {engagement.scopes.length > 10 && (
                                                                                <div className="mb-3 space-y-2">
                                                                                    <div className="flex gap-2">
                                                                                        <div className="flex-1 relative">
                                                                                            <input
                                                                                                type="text"
                                                                                                placeholder="Search assets..."
                                                                                                value={editForm.data?.scopeSearch || ''}
                                                                                                onChange={(e) => setEditForm(prev => ({
                                                                                                    ...prev,
                                                                                                    data: { ...prev.data, scopeSearch: e.target.value }
                                                                                                }))}
                                                                                                className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                            />
                                                                                        </div>
                                                                                        <select
                                                                                            value={editForm.data?.scopeTypeFilter || ''}
                                                                                            onChange={(e) => setEditForm(prev => ({
                                                                                                ...prev,
                                                                                                data: { ...prev.data, scopeTypeFilter: e.target.value }
                                                                                            }))}
                                                                                            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                        >
                                                                                            <option value="">All Types</option>
                                                                                            <option value="NETWORK">Network</option>
                                                                                            <option value="WEB_APPLICATION">Web App</option>
                                                                                            <option value="DATABASE">Database</option>
                                                                                            <option value="API">API</option>
                                                                                            <option value="MOBILE_APPLICATION">Mobile</option>
                                                                                        </select>
                                                                                        <select
                                                                                            value={editForm.data?.scopeStatusFilter || ''}
                                                                                            onChange={(e) => setEditForm(prev => ({
                                                                                                ...prev,
                                                                                                data: { ...prev.data, scopeStatusFilter: e.target.value }
                                                                                            }))}
                                                                                            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                        >
                                                                                            <option value="">All Status</option>
                                                                                            <option value="in">In Scope</option>
                                                                                            <option value="out">Out of Scope</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    {engagement.scopes.length > 50 && (
                                                                                        <div className="flex gap-2">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                    const newOverrides = { ...editForm.data?.scopeOverrides };
                                                                                                    engagement.scopes.forEach(item => {
                                                                                                        newOverrides[item.id] = true;
                                                                                                    });
                                                                                                    setEditForm(prev => ({
                                                                                                        ...prev,
                                                                                                        data: { ...prev.data, scopeOverrides: newOverrides }
                                                                                                    }));
                                                                                                }}
                                                                                                className="px-3 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                                                                                            >
                                                                                                All In Scope
                                                                                            </button>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                    const newOverrides = { ...editForm.data?.scopeOverrides };
                                                                                                    engagement.scopes.forEach(item => {
                                                                                                        newOverrides[item.id] = false;
                                                                                                    });
                                                                                                    setEditForm(prev => ({
                                                                                                        ...prev,
                                                                                                        data: { ...prev.data, scopeOverrides: newOverrides }
                                                                                                    }));
                                                                                                }}
                                                                                                className="px-3 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                                                                                            >
                                                                                                All Out of Scope
                                                                                            </button>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => setEditForm(prev => ({
                                                                                                    ...prev,
                                                                                                    data: { ...prev.data, scopeOverrides: {} }
                                                                                                }))}
                                                                                                className="px-3 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                                                            >
                                                                                                Reset to Defaults
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                            
                                                                            <div className={`${engagement.scopes.length > 20 ? 'max-h-80' : 'max-h-64'} overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg`}>
                                                                                <table className="w-full text-sm">
                                                                                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                                                                        <tr>
                                                                                            <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Asset</th>
                                                                                            <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Type</th>
                                                                                            <th className="px-3 py-2 text-center font-medium text-gray-700 dark:text-gray-300">In Scope</th>
                                                                                            <th className="px-3 py-2 text-center font-medium text-gray-700 dark:text-gray-300">Out of Scope</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                                                                        {(() => {
                                                                                            let filteredScopes = engagement.scopes;
                                                                                            
                                                                                            // Apply search filter
                                                                                            if (editForm.data?.scopeSearch) {
                                                                                                const search = editForm.data.scopeSearch.toLowerCase();
                                                                                                filteredScopes = filteredScopes.filter(item =>
                                                                                                    item.address?.toLowerCase().includes(search) ||
                                                                                                    item.description?.toLowerCase().includes(search)
                                                                                                );
                                                                                            }
                                                                                            
                                                                                            // Apply type filter
                                                                                            if (editForm.data?.scopeTypeFilter) {
                                                                                                filteredScopes = filteredScopes.filter(item =>
                                                                                                    item.assetType === editForm.data.scopeTypeFilter
                                                                                                );
                                                                                            }
                                                                                            
                                                                                            // Apply status filter
                                                                                            if (editForm.data?.scopeStatusFilter) {
                                                                                                filteredScopes = filteredScopes.filter(item => {
                                                                                                    const scopeOverrides = editForm.data?.scopeOverrides || {};
                                                                                                    const currentScope = scopeOverrides[item.id] !== undefined ? scopeOverrides[item.id] : item.inScope;
                                                                                                    return editForm.data.scopeStatusFilter === 'in' ? currentScope === true : currentScope === false;
                                                                                                });
                                                                                            }
                                                                                            
                                                                                            // Limit to 100 items for performance
                                                                                            const displayedScopes = filteredScopes.slice(0, 100);
                                                                                            
                                                                                            return displayedScopes.map((scopeItem) => {
                                                                                                const scopeOverrides = editForm.data?.scopeOverrides || {};
                                                                                                const currentScope = scopeOverrides[scopeItem.id] !== undefined ? scopeOverrides[scopeItem.id] : scopeItem.inScope;
                                                                                                
                                                                                                return (
                                                                                                    <tr key={scopeItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                                                        <td className="px-3 py-2">
                                                                                                            <div className="font-medium text-gray-900 dark:text-gray-100">{scopeItem.address}</div>
                                                                                                            {scopeItem.description && (
                                                                                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{scopeItem.description}</div>
                                                                                                            )}
                                                                                                        </td>
                                                                                                        <td className="px-3 py-2">
                                                                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                                                                scopeItem.assetType === 'NETWORK' 
                                                                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                                                                                    : scopeItem.assetType === 'WEB_APPLICATION'
                                                                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                                                                        : scopeItem.assetType === 'DATABASE'
                                                                                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                                                                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                                                                                            }`}>
                                                                                                                {scopeItem.assetType?.replace(/_/g, ' ') || 'Network'}
                                                                                                            </span>
                                                                                                        </td>
                                                                                                        <td className="px-3 py-2 text-center">
                                                                                                            <input
                                                                                                                type="radio"
                                                                                                                name={`scope-${scopeItem.id}`}
                                                                                                                checked={currentScope === true}
                                                                                                                onChange={() => setEditForm(prev => ({
                                                                                                                    ...prev,
                                                                                                                    data: {
                                                                                                                        ...prev.data,
                                                                                                                        scopeOverrides: {
                                                                                                                            ...prev.data?.scopeOverrides,
                                                                                                                            [scopeItem.id]: true
                                                                                                                        }
                                                                                                                    }
                                                                                                                }))}
                                                                                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                                                                                            />
                                                                                                        </td>
                                                                                                        <td className="px-3 py-2 text-center">
                                                                                                            <input
                                                                                                                type="radio"
                                                                                                                name={`scope-${scopeItem.id}`}
                                                                                                                checked={currentScope === false}
                                                                                                                onChange={() => setEditForm(prev => ({
                                                                                                                    ...prev,
                                                                                                                    data: {
                                                                                                                        ...prev.data,
                                                                                                                        scopeOverrides: {
                                                                                                                            ...prev.data?.scopeOverrides,
                                                                                                                            [scopeItem.id]: false
                                                                                                                        }
                                                                                                                    }
                                                                                                                }))}
                                                                                                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                                                                                            />
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                );
                                                                                            });
                                                                                        })()}
                                                                                    </tbody>
                                                                                </table>
                                                                                {(() => {
                                                                                    let filteredCount = engagement.scopes.length;
                                                                                    if (editForm.data?.scopeSearch || editForm.data?.scopeTypeFilter || editForm.data?.scopeStatusFilter) {
                                                                                        let filtered = engagement.scopes;
                                                                                        if (editForm.data?.scopeSearch) {
                                                                                            const search = editForm.data.scopeSearch.toLowerCase();
                                                                                            filtered = filtered.filter(item =>
                                                                                                item.address?.toLowerCase().includes(search) ||
                                                                                                item.description?.toLowerCase().includes(search)
                                                                                            );
                                                                                        }
                                                                                        if (editForm.data?.scopeTypeFilter) {
                                                                                            filtered = filtered.filter(item => item.assetType === editForm.data.scopeTypeFilter);
                                                                                        }
                                                                                        if (editForm.data?.scopeStatusFilter) {
                                                                                            filtered = filtered.filter(item => {
                                                                                                const scopeOverrides = editForm.data?.scopeOverrides || {};
                                                                                                const currentScope = scopeOverrides[item.id] !== undefined ? scopeOverrides[item.id] : item.inScope;
                                                                                                return editForm.data.scopeStatusFilter === 'in' ? currentScope === true : currentScope === false;
                                                                                            });
                                                                                        }
                                                                                        filteredCount = filtered.length;
                                                                                    }
                                                                                    
                                                                                    return filteredCount > 100 ? (
                                                                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 text-center border-t border-gray-200 dark:border-gray-600">
                                                                                            <span className="text-xs text-yellow-700 dark:text-yellow-300">
                                                                                                Showing 100 of {filteredCount} assets. Use filters to narrow down the list.
                                                                                            </span>
                                                                                        </div>
                                                                                    ) : null;
                                                                                })()}
                                                                            </div>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                                                Override the scope settings for specific assets. Changes here will be reflected in the RoE document.
                                                                            </p>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                                                            <div className="flex items-center">
                                                                                <div className="flex-shrink-0">
                                                                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                </div>
                                                                                <div className="ml-3">
                                                                                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                                                        No Scope Assets Configured
                                                                                    </h3>
                                                                                    <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                                                                        Add assets to the engagement scope first to configure them for this RoE.
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="space-y-3">
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                            Scope Considerations & Special Requirements
                                                                        </label>
                                                                        
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    id="thirdPartyApproval"
                                                                                    checked={editForm.data?.thirdPartyApproval || false}
                                                                                    onChange={(e) => setEditForm(prev => ({ 
                                                                                        ...prev, 
                                                                                        data: { ...prev.data, thirdPartyApproval: e.target.checked }
                                                                                    }))}
                                                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                                />
                                                                                <label htmlFor="thirdPartyApproval" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                                                    Third-party services require separate approval
                                                                                </label>
                                                                            </div>
                                                                            
                                                                            <div className="flex items-center">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    id="dataExfiltrationRestricted"
                                                                                    checked={editForm.data?.dataExfiltrationRestricted || false}
                                                                                    onChange={(e) => setEditForm(prev => ({ 
                                                                                        ...prev, 
                                                                                        data: { ...prev.data, dataExfiltrationRestricted: e.target.checked }
                                                                                    }))}
                                                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                                />
                                                                                <label htmlFor="dataExfiltrationRestricted" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                                                    Data exfiltration prohibited (screenshot/logging only)
                                                                                </label>
                                                                            </div>
                                                                            
                                                                            <div className="flex items-center">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    id="geoRestrictions"
                                                                                    checked={editForm.data?.geoRestrictions || false}
                                                                                    onChange={(e) => setEditForm(prev => ({ 
                                                                                        ...prev, 
                                                                                        data: { ...prev.data, geoRestrictions: e.target.checked }
                                                                                    }))}
                                                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                                />
                                                                                <label htmlFor="geoRestrictions" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                                                    Geographic or jurisdictional testing restrictions apply
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Additional Scope Notes
                                                                            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                                                                        </label>
                                                                        <textarea
                                                                            value={editForm.content}
                                                                            onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                                                            rows={4}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            placeholder="Enter any additional scope considerations, special requirements, or constraints..."
                                                                        />
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                            Professional scope framework will be used automatically. This field is for organization-specific requirements.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ) : section.type === 'TESTING_WINDOW' ? (
                                                                <div className="space-y-4">
                                                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                                        <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                                                                            Testing Schedule Configuration
                                                                        </h4>
                                                                        <p className="text-sm text-green-700 dark:text-green-300">
                                                                            Define when testing activities can occur and any blackout periods.
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                Testing Start Date
                                                                            </label>
                                                                            <input
                                                                                type="date"
                                                                                value={editForm.data?.startDate || ''}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, startDate: e.target.value }
                                                                                }))}
                                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            />
                                                                        </div>
                                                                        
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                Testing End Date
                                                                            </label>
                                                                            <input
                                                                                type="date"
                                                                                value={editForm.data?.endDate || ''}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, endDate: e.target.value }
                                                                                }))}
                                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                Daily Start Time
                                                                            </label>
                                                                            <input
                                                                                type="time"
                                                                                value={editForm.data?.dailyStartTime || '09:00'}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, dailyStartTime: e.target.value }
                                                                                }))}
                                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            />
                                                                        </div>
                                                                        
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                Daily End Time
                                                                            </label>
                                                                            <input
                                                                                type="time"
                                                                                value={editForm.data?.dailyEndTime || '17:00'}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, dailyEndTime: e.target.value }
                                                                                }))}
                                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Allowed Testing Days
                                                                        </label>
                                                                        <div className="grid grid-cols-4 gap-2">
                                                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                                                                <div key={day} className="flex items-center">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        id={day}
                                                                                        checked={(editForm.data?.allowedDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']).includes(day)}
                                                                                        onChange={(e) => {
                                                                                            const currentDays = editForm.data?.allowedDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                                                                                            const newDays = e.target.checked 
                                                                                                ? [...currentDays, day]
                                                                                                : currentDays.filter(d => d !== day);
                                                                                            setEditForm(prev => ({ 
                                                                                                ...prev, 
                                                                                                data: { ...prev.data, allowedDays: newDays }
                                                                                            }));
                                                                                        }}
                                                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                                    />
                                                                                    <label htmlFor={day} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                        {day.substring(0, 3)}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Blackout Periods/Holidays
                                                                            <span className="text-xs text-gray-500 ml-1">(One per line)</span>
                                                                        </label>
                                                                        <textarea
                                                                            value={(editForm.data?.blackoutPeriods || []).join('\n')}
                                                                            onChange={(e) => setEditForm(prev => ({ 
                                                                                ...prev, 
                                                                                data: { 
                                                                                    ...prev.data, 
                                                                                    blackoutPeriods: e.target.value.split('\n').map(item => item.trim()).filter(item => item)
                                                                                }
                                                                            }))}
                                                                            rows={4}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            placeholder="December 25, 2024 - Christmas Day&#10;January 1, 2025 - New Year's Day&#10;March 15-17, 2025 - System Maintenance Window"
                                                                        />
                                                                    </div>
                                                                    
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                id="afterHoursTesting"
                                                                                checked={editForm.data?.afterHoursTesting || false}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, afterHoursTesting: e.target.checked }
                                                                                }))}
                                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                            />
                                                                            <label htmlFor="afterHoursTesting" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                                                After-hours testing permitted (requires approval)
                                                                            </label>
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                id="weekendTesting"
                                                                                checked={editForm.data?.weekendTesting || false}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, weekendTesting: e.target.checked }
                                                                                }))}
                                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                            />
                                                                            <label htmlFor="weekendTesting" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                                                Weekend testing permitted
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Additional Schedule Notes
                                                                            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                                                                        </label>
                                                                        <textarea
                                                                            value={editForm.content}
                                                                            onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                                                            rows={3}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            placeholder="Any additional scheduling constraints or requirements..."
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : section.type === 'METHODOLOGY' ? (
                                                                <div className="space-y-4">
                                                                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                                                        <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2">
                                                                            Testing Methodology & Approach
                                                                        </h4>
                                                                        <p className="text-sm text-purple-700 dark:text-purple-300">
                                                                            Define the testing approach, methodologies, and techniques to be used.
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Testing Methodology
                                                                        </label>
                                                                        <select
                                                                            value={editForm.data?.methodology || 'OWASP'}
                                                                            onChange={(e) => setEditForm(prev => ({ 
                                                                                ...prev, 
                                                                                data: { ...prev.data, methodology: e.target.value }
                                                                            }))}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                        >
                                                                            <option value="OWASP">OWASP Testing Guide</option>
                                                                            <option value="NIST">NIST SP 800-115</option>
                                                                            <option value="OSSTMM">OSSTMM</option>
                                                                            <option value="PTES">PTES</option>
                                                                            <option value="CUSTOM">Custom Methodology</option>
                                                                        </select>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Testing Approach
                                                                        </label>
                                                                        <div className="space-y-2">
                                                                            {[
                                                                                { value: 'blackBox', label: 'Black Box Testing (External perspective, no internal knowledge)' },
                                                                                { value: 'whiteBox', label: 'White Box Testing (Full internal knowledge and access)' },
                                                                                { value: 'grayBox', label: 'Gray Box Testing (Limited internal knowledge)' }
                                                                            ].map(approach => (
                                                                                <div key={approach.value} className="flex items-center">
                                                                                    <input
                                                                                        type="radio"
                                                                                        id={approach.value}
                                                                                        name="testingApproach"
                                                                                        checked={editForm.data?.approach === approach.value}
                                                                                        onChange={(e) => setEditForm(prev => ({ 
                                                                                            ...prev, 
                                                                                            data: { ...prev.data, approach: approach.value }
                                                                                        }))}
                                                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                                                    />
                                                                                    <label htmlFor={approach.value} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                        {approach.label}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Testing Techniques (Select all that apply)
                                                                        </label>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {[
                                                                                'Network Scanning', 'Vulnerability Assessment', 'Web Application Testing',
                                                                                'Social Engineering', 'Physical Security', 'Wireless Testing',
                                                                                'Database Security', 'API Testing', 'Mobile Application Testing',
                                                                                'Cloud Security', 'Network Segmentation', 'Authentication Testing',
                                                                                'Privilege Escalation', 'Data Leakage', 'Configuration Review',
                                                                                'Source Code Review'
                                                                            ].map(technique => (
                                                                                <div key={technique} className="flex items-center">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        id={technique.replace(/\s+/g, '')}
                                                                                        checked={(editForm.data?.techniques || []).includes(technique)}
                                                                                        onChange={(e) => {
                                                                                            const currentTechniques = editForm.data?.techniques || [];
                                                                                            const newTechniques = e.target.checked 
                                                                                                ? [...currentTechniques, technique]
                                                                                                : currentTechniques.filter(t => t !== technique);
                                                                                            setEditForm(prev => ({ 
                                                                                                ...prev, 
                                                                                                data: { ...prev.data, techniques: newTechniques }
                                                                                            }));
                                                                                        }}
                                                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                                    />
                                                                                    <label htmlFor={technique.replace(/\s+/g, '')} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                        {technique}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Tools and Frameworks
                                                                            <span className="text-xs text-gray-500 ml-1">(Comma separated)</span>
                                                                        </label>
                                                                        <textarea
                                                                            value={(editForm.data?.tools || []).join(', ')}
                                                                            onChange={(e) => setEditForm(prev => ({ 
                                                                                ...prev, 
                                                                                data: { 
                                                                                    ...prev.data, 
                                                                                    tools: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                                                                                }
                                                                            }))}
                                                                            rows={3}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            placeholder="Nmap, Burp Suite, Metasploit, OWASP ZAP, Nessus, Wireshark"
                                                                        />
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Additional Methodology Notes
                                                                            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                                                                        </label>
                                                                        <textarea
                                                                            value={editForm.content}
                                                                            onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                                                            rows={4}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            placeholder="Any specific methodology requirements or custom approaches..."
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : section.type === 'RESTRICTIONS' ? (
                                                                <div className="space-y-4">
                                                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                                        <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                                                                            Testing Restrictions & Limitations
                                                                        </h4>
                                                                        <p className="text-sm text-red-700 dark:text-red-300">
                                                                            Define what activities are prohibited and testing limitations.
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Prohibited Activities (Select all that apply)
                                                                        </label>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {[
                                                                                'Denial of Service (DoS) attacks', 'Data destruction or modification',
                                                                                'Social engineering of employees', 'Physical security testing',
                                                                                'Email phishing campaigns', 'Password brute forcing',
                                                                                'Network flooding attacks', 'System reboots or shutdowns',
                                                                                'Data exfiltration', 'Malware deployment',
                                                                                'Privilege escalation beyond test scope', 'Third-party system access'
                                                                            ].map(activity => (
                                                                                <div key={activity} className="flex items-center">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        id={activity.replace(/\s+/g, '')}
                                                                                        checked={(editForm.data?.prohibitedActivities || []).includes(activity)}
                                                                                        onChange={(e) => {
                                                                                            const current = editForm.data?.prohibitedActivities || [];
                                                                                            const updated = e.target.checked 
                                                                                                ? [...current, activity]
                                                                                                : current.filter(a => a !== activity);
                                                                                            setEditForm(prev => ({ 
                                                                                                ...prev, 
                                                                                                data: { ...prev.data, prohibitedActivities: updated }
                                                                                            }));
                                                                                        }}
                                                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                                    />
                                                                                    <label htmlFor={activity.replace(/\s+/g, '')} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                        {activity}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Rate Limiting & Traffic Restrictions
                                                                        </label>
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                                    Max requests per second
                                                                                </label>
                                                                                <input
                                                                                    type="number"
                                                                                    value={editForm.data?.maxRequestsPerSecond || ''}
                                                                                    onChange={(e) => setEditForm(prev => ({ 
                                                                                        ...prev, 
                                                                                        data: { ...prev.data, maxRequestsPerSecond: e.target.value }
                                                                                    }))}
                                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                    placeholder="10"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                                    Max concurrent connections
                                                                                </label>
                                                                                <input
                                                                                    type="number"
                                                                                    value={editForm.data?.maxConnections || ''}
                                                                                    onChange={(e) => setEditForm(prev => ({ 
                                                                                        ...prev, 
                                                                                        data: { ...prev.data, maxConnections: e.target.value }
                                                                                    }))}
                                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                    placeholder="5"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Excluded Networks/Systems
                                                                            <span className="text-xs text-gray-500 ml-1">(One per line)</span>
                                                                        </label>
                                                                        <textarea
                                                                            value={(editForm.data?.excludedSystems || []).join('\n')}
                                                                            onChange={(e) => setEditForm(prev => ({ 
                                                                                ...prev, 
                                                                                data: { 
                                                                                    ...prev.data, 
                                                                                    excludedSystems: e.target.value.split('\n').map(item => item.trim()).filter(item => item)
                                                                                }
                                                                            }))}
                                                                            rows={4}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            placeholder="backup.example.com&#10;192.168.100.0/24&#10;legacy-system.internal"
                                                                        />
                                                                    </div>
                                                                    
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                id="requireApprovalForCredentials"
                                                                                checked={editForm.data?.requireApprovalForCredentials || false}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, requireApprovalForCredentials: e.target.checked }
                                                                                }))}
                                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                            />
                                                                            <label htmlFor="requireApprovalForCredentials" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                                                Require approval before using discovered credentials
                                                                            </label>
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                id="noProductionData"
                                                                                checked={editForm.data?.noProductionData || false}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, noProductionData: e.target.checked }
                                                                                }))}
                                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                            />
                                                                            <label htmlFor="noProductionData" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                                                No access to production data permitted
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Additional Restrictions
                                                                            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                                                                        </label>
                                                                        <textarea
                                                                            value={editForm.content}
                                                                            onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                                                            rows={4}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            placeholder="Any additional restrictions or special limitations..."
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : section.type === 'COMMUNICATION' ? (
                                                                <div className="space-y-4">
                                                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                                                                        <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-2">
                                                                            Communication Protocols & Contacts
                                                                        </h4>
                                                                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                                                            Define communication procedures and key contacts during testing.
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Primary Communication Channel
                                                                        </label>
                                                                        <select
                                                                            value={editForm.data?.primaryChannel || 'email'}
                                                                            onChange={(e) => setEditForm(prev => ({ 
                                                                                ...prev, 
                                                                                data: { ...prev.data, primaryChannel: e.target.value }
                                                                            }))}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                        >
                                                                            <option value="email">Email</option>
                                                                            <option value="slack">Slack</option>
                                                                            <option value="teams">Microsoft Teams</option>
                                                                            <option value="phone">Phone</option>
                                                                            <option value="ticketing">Ticketing System</option>
                                                                        </select>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Emergency Communication Method
                                                                        </label>
                                                                        <select
                                                                            value={editForm.data?.emergencyChannel || 'phone'}
                                                                            onChange={(e) => setEditForm(prev => ({ 
                                                                                ...prev, 
                                                                                data: { ...prev.data, emergencyChannel: e.target.value }
                                                                            }))}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                        >
                                                                            <option value="phone">Phone Call</option>
                                                                            <option value="sms">SMS/Text</option>
                                                                            <option value="pager">Pager</option>
                                                                            <option value="email">Email</option>
                                                                        </select>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Reporting Requirements
                                                                        </label>
                                                                        <div className="space-y-2">
                                                                            {[
                                                                                { value: 'dailyUpdates', label: 'Daily status updates required' },
                                                                                { value: 'weeklyReports', label: 'Weekly progress reports' },
                                                                                { value: 'immediateNotification', label: 'Immediate notification of critical findings' },
                                                                                { value: 'preApprovalRequired', label: 'Pre-approval required for high-risk activities' }
                                                                            ].map(requirement => (
                                                                                <div key={requirement.value} className="flex items-center">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        id={requirement.value}
                                                                                        checked={(editForm.data?.reportingRequirements || []).includes(requirement.value)}
                                                                                        onChange={(e) => {
                                                                                            const current = editForm.data?.reportingRequirements || [];
                                                                                            const updated = e.target.checked 
                                                                                                ? [...current, requirement.value]
                                                                                                : current.filter(r => r !== requirement.value);
                                                                                            setEditForm(prev => ({ 
                                                                                                ...prev, 
                                                                                                data: { ...prev.data, reportingRequirements: updated }
                                                                                            }));
                                                                                        }}
                                                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                                    />
                                                                                    <label htmlFor={requirement.value} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                        {requirement.label}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Communication Schedule
                                                                        </label>
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                                    Daily check-in time
                                                                                </label>
                                                                                <input
                                                                                    type="time"
                                                                                    value={editForm.data?.dailyCheckInTime || ''}
                                                                                    onChange={(e) => setEditForm(prev => ({ 
                                                                                        ...prev, 
                                                                                        data: { ...prev.data, dailyCheckInTime: e.target.value }
                                                                                    }))}
                                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                                    Weekly report day
                                                                                </label>
                                                                                <select
                                                                                    value={editForm.data?.weeklyReportDay || 'Friday'}
                                                                                    onChange={(e) => setEditForm(prev => ({ 
                                                                                        ...prev, 
                                                                                        data: { ...prev.data, weeklyReportDay: e.target.value }
                                                                                    }))}
                                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                >
                                                                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                                                                        <option key={day} value={day}>{day}</option>
                                                                                    ))}
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Additional Communication Notes
                                                                            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                                                                        </label>
                                                                        <textarea
                                                                            value={editForm.content}
                                                                            onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                                                            rows={4}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            placeholder="Any additional communication requirements or protocols..."
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : section.type === 'EMERGENCY' ? (
                                                                <div className="space-y-4">
                                                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                                        <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                                                                            Emergency Procedures & Escalation
                                                                        </h4>
                                                                        <p className="text-sm text-red-700 dark:text-red-300">
                                                                            Define emergency contacts and incident response procedures.
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Emergency Contact Information
                                                                        </label>
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                                    Primary Emergency Contact
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={editForm.data?.primaryEmergencyContact || ''}
                                                                                    onChange={(e) => setEditForm(prev => ({ 
                                                                                        ...prev, 
                                                                                        data: { ...prev.data, primaryEmergencyContact: e.target.value }
                                                                                    }))}
                                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                    placeholder="John Smith"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                                    Emergency Phone Number
                                                                                </label>
                                                                                <input
                                                                                    type="tel"
                                                                                    value={editForm.data?.emergencyPhone || ''}
                                                                                    onChange={(e) => setEditForm(prev => ({ 
                                                                                        ...prev, 
                                                                                        data: { ...prev.data, emergencyPhone: e.target.value }
                                                                                    }))}
                                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                    placeholder="+1-555-123-4567"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Escalation Triggers (Select all that apply)
                                                                        </label>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {[
                                                                                'System outage or unavailability', 'Security incident detected',
                                                                                'Critical vulnerability discovered', 'Data breach suspected',
                                                                                'Unauthorized access achieved', 'Service disruption caused',
                                                                                'Legal or compliance issue', 'Media or public exposure'
                                                                            ].map(trigger => (
                                                                                <div key={trigger} className="flex items-center">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        id={trigger.replace(/\s+/g, '')}
                                                                                        checked={(editForm.data?.escalationTriggers || []).includes(trigger)}
                                                                                        onChange={(e) => {
                                                                                            const current = editForm.data?.escalationTriggers || [];
                                                                                            const updated = e.target.checked 
                                                                                                ? [...current, trigger]
                                                                                                : current.filter(t => t !== trigger);
                                                                                            setEditForm(prev => ({ 
                                                                                                ...prev, 
                                                                                                data: { ...prev.data, escalationTriggers: updated }
                                                                                            }));
                                                                                        }}
                                                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                                    />
                                                                                    <label htmlFor={trigger.replace(/\s+/g, '')} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                        {trigger}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Emergency Response Timeline
                                                                        </label>
                                                                        <div className="grid grid-cols-3 gap-4">
                                                                            <div>
                                                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                                    Initial response time
                                                                                </label>
                                                                                <select
                                                                                    value={editForm.data?.initialResponseTime || '15'}
                                                                                    onChange={(e) => setEditForm(prev => ({ 
                                                                                        ...prev, 
                                                                                        data: { ...prev.data, initialResponseTime: e.target.value }
                                                                                    }))}
                                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                >
                                                                                    <option value="5">5 minutes</option>
                                                                                    <option value="15">15 minutes</option>
                                                                                    <option value="30">30 minutes</option>
                                                                                    <option value="60">1 hour</option>
                                                                                </select>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                                    Testing halt time
                                                                                </label>
                                                                                <select
                                                                                    value={editForm.data?.testingHaltTime || 'immediate'}
                                                                                    onChange={(e) => setEditForm(prev => ({ 
                                                                                        ...prev, 
                                                                                        data: { ...prev.data, testingHaltTime: e.target.value }
                                                                                    }))}
                                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                >
                                                                                    <option value="immediate">Immediate</option>
                                                                                    <option value="5">5 minutes</option>
                                                                                    <option value="15">15 minutes</option>
                                                                                </select>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                                    Resolution reporting
                                                                                </label>
                                                                                <select
                                                                                    value={editForm.data?.resolutionReporting || '24'}
                                                                                    onChange={(e) => setEditForm(prev => ({ 
                                                                                        ...prev, 
                                                                                        data: { ...prev.data, resolutionReporting: e.target.value }
                                                                                    }))}
                                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                >
                                                                                    <option value="4">4 hours</option>
                                                                                    <option value="8">8 hours</option>
                                                                                    <option value="24">24 hours</option>
                                                                                    <option value="72">72 hours</option>
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                id="automaticTestingHalt"
                                                                                checked={editForm.data?.automaticTestingHalt || false}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, automaticTestingHalt: e.target.checked }
                                                                                }))}
                                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                            />
                                                                            <label htmlFor="automaticTestingHalt" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                                                Automatic testing halt upon emergency
                                                                            </label>
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                id="incidentDocumentation"
                                                                                checked={editForm.data?.incidentDocumentation || false}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, incidentDocumentation: e.target.checked }
                                                                                }))}
                                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                            />
                                                                            <label htmlFor="incidentDocumentation" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                                                Detailed incident documentation required
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Additional Emergency Procedures
                                                                            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                                                                        </label>
                                                                        <textarea
                                                                            value={editForm.content}
                                                                            onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                                                            rows={4}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            placeholder="Any additional emergency procedures or special requirements..."
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : section.type === 'LEGAL' ? (
                                                                <div className="space-y-4">
                                                                    <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                                                                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                                            Legal & Compliance Requirements
                                                                        </h4>
                                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                            Define legal frameworks and compliance requirements for testing.
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Applicable Legal Frameworks (Select all that apply)
                                                                        </label>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {[
                                                                                'GDPR (General Data Protection Regulation)', 'HIPAA (Health Insurance Portability)',
                                                                                'PCI DSS (Payment Card Industry)', 'SOX (Sarbanes-Oxley Act)',
                                                                                'FISMA (Federal Information Security)', 'NIST Cybersecurity Framework',
                                                                                'ISO 27001', 'FedRAMP', 'SOC 2', 'CCPA (California Consumer Privacy Act)'
                                                                            ].map(framework => (
                                                                                <div key={framework} className="flex items-center">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        id={framework.replace(/\s+/g, '')}
                                                                                        checked={(editForm.data?.legalFrameworks || []).includes(framework)}
                                                                                        onChange={(e) => {
                                                                                            const current = editForm.data?.legalFrameworks || [];
                                                                                            const updated = e.target.checked 
                                                                                                ? [...current, framework]
                                                                                                : current.filter(f => f !== framework);
                                                                                            setEditForm(prev => ({ 
                                                                                                ...prev, 
                                                                                                data: { ...prev.data, legalFrameworks: updated }
                                                                                            }));
                                                                                        }}
                                                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                                    />
                                                                                    <label htmlFor={framework.replace(/\s+/g, '')} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                        {framework}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Data Handling Requirements
                                                                        </label>
                                                                        <div className="space-y-2">
                                                                            {[
                                                                                { value: 'dataMinimization', label: 'Data minimization - collect only necessary data' },
                                                                                { value: 'encryptionRequired', label: 'Encryption required for data at rest and in transit' },
                                                                                { value: 'dataRetentionLimits', label: 'Data retention time limits apply' },
                                                                                { value: 'rightToErasure', label: 'Right to erasure/deletion must be respected' },
                                                                                { value: 'dataProcessingAgreement', label: 'Data processing agreement required' }
                                                                            ].map(requirement => (
                                                                                <div key={requirement.value} className="flex items-center">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        id={requirement.value}
                                                                                        checked={(editForm.data?.dataHandlingRequirements || []).includes(requirement.value)}
                                                                                        onChange={(e) => {
                                                                                            const current = editForm.data?.dataHandlingRequirements || [];
                                                                                            const updated = e.target.checked 
                                                                                                ? [...current, requirement.value]
                                                                                                : current.filter(r => r !== requirement.value);
                                                                                            setEditForm(prev => ({ 
                                                                                                ...prev, 
                                                                                                data: { ...prev.data, dataHandlingRequirements: updated }
                                                                                            }));
                                                                                        }}
                                                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                                    />
                                                                                    <label htmlFor={requirement.value} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                        {requirement.label}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                Liability Limitation Amount
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                value={editForm.data?.liabilityLimit || ''}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, liabilityLimit: e.target.value }
                                                                                }))}
                                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                placeholder="$1,000,000"
                                                                            />
                                                                        </div>
                                                                        
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                Governing Law Jurisdiction
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                value={editForm.data?.governingLaw || ''}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, governingLaw: e.target.value }
                                                                                }))}
                                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                                placeholder="State of California, USA"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                id="indemnificationClause"
                                                                                checked={editForm.data?.indemnificationClause || false}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, indemnificationClause: e.target.checked }
                                                                                }))}
                                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                            />
                                                                            <label htmlFor="indemnificationClause" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                                                Mutual indemnification clause applies
                                                                            </label>
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                id="confidentialityAgreement"
                                                                                checked={editForm.data?.confidentialityAgreement || false}
                                                                                onChange={(e) => setEditForm(prev => ({ 
                                                                                    ...prev, 
                                                                                    data: { ...prev.data, confidentialityAgreement: e.target.checked }
                                                                                }))}
                                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                            />
                                                                            <label htmlFor="confidentialityAgreement" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                                                Separate confidentiality agreement in place
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Additional Legal Considerations
                                                                            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                                                                        </label>
                                                                        <textarea
                                                                            value={editForm.content}
                                                                            onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                                                            rows={4}
                                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                            placeholder="Any additional legal requirements or compliance considerations..."
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
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
                                                            )}
                                                            
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