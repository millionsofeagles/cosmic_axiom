import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Download, 
    Edit, 
    Share, 
    FileText, 
    Shield, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    Archive,
    User,
    Calendar,
    Eye,
    Settings,
    Loader2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_SATELLITE_URL || 'http://localhost:3005';

const STATUS_CONFIG = {
    DRAFT: { label: 'Draft', color: 'gray', icon: FileText },
    APPROVED: { label: 'Approved', color: 'green', icon: CheckCircle },
    ACTIVE: { label: 'Active', color: 'blue', icon: Clock },
    EXPIRED: { label: 'Expired', color: 'red', icon: AlertCircle },
    ARCHIVED: { label: 'Archived', color: 'gray', icon: Archive }
};

const getStatusColor = (status) => {
    const colors = {
        gray: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
        green: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
        blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
        red: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
    };
    return colors[STATUS_CONFIG[status]?.color] || colors.gray;
};

const RoEDetails = () => {
    const { engagementId, roeId } = useParams();
    const navigate = useNavigate();
    const pdfIframeRef = useRef(null);
    
    const [roe, setRoe] = useState(null);
    const [engagement, setEngagement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
    const [activeTab, setActiveTab] = useState('pdf');

    useEffect(() => {
        loadData();
    }, [engagementId, roeId]);

    useEffect(() => {
        if (roe && engagement && !pdfBlobUrl && !generatingPdf) {
            generatePDF();
        }
    }, [roe, engagement]);

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

            // Load RoE data
            const roeResponse = await fetch(`${API_BASE}/roe/${roeId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const roeData = await roeResponse.json();
            setRoe(roeData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async () => {
        try {
            setGeneratingPdf(true);
            
            const response = await fetch(`${API_BASE}/reports/generate-roe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    roe,
                    engagement
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Fetch the generated PDF
                const pdfResponse = await fetch(`${API_BASE}/reports/file/${data.filename}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (pdfResponse.ok) {
                    const blob = await pdfResponse.blob();
                    
                    // Check if we're in Firefox and use data URL instead of blob URL
                    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                    
                    if (isFirefox) {
                        const reader = new FileReader();
                        reader.onload = function() {
                            setPdfBlobUrl(reader.result);
                        };
                        reader.readAsDataURL(blob);
                    } else {
                        const url = URL.createObjectURL(blob);
                        setPdfBlobUrl(url);
                    }
                }
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await fetch(`${API_BASE}/reports/generate-roe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    roe,
                    engagement
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Download the file
                const downloadResponse = await fetch(`${API_BASE}/reports/file/${data.filename}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (downloadResponse.ok) {
                    const blob = await downloadResponse.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${roe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            const response = await fetch(`${API_BASE}/roe/${roeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...roe,
                    status: newStatus,
                    approvedAt: newStatus === 'APPROVED' ? new Date().toISOString() : roe.approvedAt
                })
            });
            
            if (response.ok) {
                const updatedRoe = await response.json();
                setRoe(updatedRoe);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!roe) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        RoE Document Not Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        The requested Rules of Engagement document could not be found.
                    </p>
                    <button
                        onClick={() => navigate(`/engagements/${engagementId}/roe`)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to RoE List
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[roe.status];
    const StatusIcon = statusConfig?.icon || FileText;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(`/engagements/${engagementId}/roe`)}
                                className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            
                            <Shield className="w-6 h-6 text-indigo-600 mr-3" />
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    {roe.title}
                                </h1>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{engagement?.name}</span>
                                    <span>Version {roe.version}</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(roe.status)}`}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {statusConfig?.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* Status update dropdown */}
                            {roe.status !== 'ARCHIVED' && (
                                <select
                                    value={roe.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100 bg-white text-gray-900"
                                >
                                    {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                                        <option key={value} value={value} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">{config.label}</option>
                                    ))}
                                </select>
                            )}
                            
                            <button
                                onClick={() => navigate(`/engagements/${engagementId}/roe/${roeId}`)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </button>
                            
                            <button
                                onClick={handleDownloadPDF}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Document Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Document Information
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                    <StatusIcon className="w-4 h-4 text-gray-400" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Status</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{statusConfig?.label}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Version</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{roe.version}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Created</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(roe.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                
                                {roe.authorizedBy && (
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Authorized By</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{roe.authorizedBy}</div>
                                        </div>
                                    </div>
                                )}
                                
                                {roe.expiresAt && (
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Expires</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(roe.expiresAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                    <Settings className="w-4 h-4 text-gray-400" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Sections</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {roe.sections?.length || 0} sections
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - PDF Viewer */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Content */}
                            <div className="relative">
                                {pdfBlobUrl ? (
                                    <iframe
                                        ref={pdfIframeRef}
                                        src={pdfBlobUrl}
                                        className="w-full h-[calc(100vh-12rem)] border-0"
                                        title="RoE PDF Preview"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-[calc(100vh-12rem)] bg-gray-50 dark:bg-gray-900">
                                        <div className="text-center">
                                            <Shield className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                            <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                                                No PDF generated yet
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                                                Loading PDF preview...
                                            </p>
                                            {generatingPdf && (
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 font-medium text-sm">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Generating PDF...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoEDetails;