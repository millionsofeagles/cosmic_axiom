import { useState, useRef } from 'react';
import { 
    X, 
    Image, 
    Upload, 
    Trash2, 
    Edit3, 
    Save, 
    ChevronLeft, 
    ChevronRight,
    Download
} from 'lucide-react';

function ImageManagementModal({ 
    isOpen, 
    onClose, 
    images = [], 
    onUpload, 
    onUpdate, 
    onDelete, 
    uploading = false,
    reportFindingId 
}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [editingField, setEditingField] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [pendingUpload, setPendingUpload] = useState(null);
    const [uploadMetadata, setUploadMetadata] = useState({ title: '', caption: '' });
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const currentImage = images[currentImageIndex];

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert("Please select an image file.");
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert("Image size must be less than 10MB.");
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPendingUpload({
                file,
                preview: e.target.result,
                name: file.name
            });
            setUploadMetadata({ 
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                caption: '' 
            });
        };
        reader.readAsDataURL(file);
        
        // Clear file input
        event.target.value = '';
    };

    const handleUploadConfirm = async () => {
        if (!pendingUpload) return;
        
        await onUpload(reportFindingId, pendingUpload.file, uploadMetadata.title, uploadMetadata.caption);
        setPendingUpload(null);
        setUploadMetadata({ title: '', caption: '' });
    };

    const handleUploadCancel = () => {
        setPendingUpload(null);
        setUploadMetadata({ title: '', caption: '' });
    };

    const startEdit = (field, currentValue) => {
        setEditingField(field);
        setEditValues({ ...editValues, [field]: currentValue });
    };

    const saveEdit = async (field) => {
        if (currentImage && editValues[field] !== undefined) {
            await onUpdate(currentImage.id, field, editValues[field]);
            setEditingField(null);
        }
    };

    const cancelEdit = () => {
        setEditingField(null);
        setEditValues({});
    };

    const nextImage = () => {
        if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
            cancelEdit();
        }
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
            cancelEdit();
        }
    };

    const handleDelete = async () => {
        if (!currentImage) return;
        
        const confirmed = window.confirm(`Are you sure you want to delete "${currentImage.title}"?`);
        if (confirmed) {
            await onDelete(currentImage.id, reportFindingId);
            
            // Adjust current index if needed
            if (currentImageIndex >= images.length - 1 && images.length > 1) {
                setCurrentImageIndex(images.length - 2);
            } else if (images.length === 1) {
                setCurrentImageIndex(0);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Supporting Evidence Management
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left Panel - Upload & Navigation */}
                    <div className="w-80 border-r border-gray-200 dark:border-gray-600 p-6 flex flex-col">
                        {/* Upload Section */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Add New Image
                            </h3>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading || pendingUpload}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                            >
                                <Upload className="w-4 h-4" />
                                {uploading ? 'Uploading...' : 'Select Image'}
                            </button>
                        </div>

                        {/* Pending Upload */}
                        {pendingUpload && (
                            <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                                    Configure New Image
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={uploadMetadata.title}
                                            onChange={(e) => setUploadMetadata({...uploadMetadata, title: e.target.value})}
                                            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                                            placeholder="Image title..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Caption
                                        </label>
                                        <textarea
                                            value={uploadMetadata.caption}
                                            onChange={(e) => setUploadMetadata({...uploadMetadata, caption: e.target.value})}
                                            rows={2}
                                            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                                            placeholder="Image caption..."
                                        />
                                    </div>
                                    <img 
                                        src={pendingUpload.preview} 
                                        alt="Preview" 
                                        className="w-full h-20 object-cover rounded border"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUploadConfirm}
                                            disabled={!uploadMetadata.title.trim()}
                                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded font-medium"
                                        >
                                            Upload
                                        </button>
                                        <button
                                            onClick={handleUploadCancel}
                                            className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Image List */}
                        {images.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Images ({images.length})
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {images.map((image, index) => (
                                        <div
                                            key={image.id}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                                index === currentImageIndex 
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600' 
                                                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`data:${image.mimeType};base64,${image.imageData}`}
                                                    alt={image.title}
                                                    className="w-10 h-10 object-cover rounded border"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {image.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {image.caption || 'No caption'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {images.length === 0 && !pendingUpload && (
                            <div className="text-center py-8 text-gray-400">
                                <Image className="w-12 h-12 mx-auto mb-3" />
                                <p className="text-sm">No images yet</p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Image Details */}
                    <div className="flex-1 p-6">
                        {currentImage ? (
                            <div className="h-full flex flex-col">
                                {/* Navigation */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={prevImage}
                                            disabled={currentImageIndex === 0}
                                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {currentImageIndex + 1} of {images.length}
                                        </span>
                                        <button
                                            onClick={nextImage}
                                            disabled={currentImageIndex === images.length - 1}
                                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>

                                {/* Image */}
                                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg mb-4 overflow-hidden">
                                    <img
                                        src={`data:${currentImage.mimeType};base64,${currentImage.imageData}`}
                                        alt={currentImage.title}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>

                                {/* Metadata */}
                                <div className="space-y-4">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Title
                                        </label>
                                        {editingField === 'title' ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editValues.title ?? ''}
                                                    onChange={(e) => setEditValues({...editValues, title: e.target.value})}
                                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                                                />
                                                <button
                                                    onClick={() => saveEdit('title')}
                                                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => startEdit('title', currentImage.title)}
                                                className="p-2 bg-gray-50 dark:bg-gray-900 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between"
                                            >
                                                <span>{currentImage.title}</span>
                                                <Edit3 className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Caption */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Caption
                                        </label>
                                        {editingField === 'caption' ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    value={editValues.caption ?? ''}
                                                    onChange={(e) => setEditValues({...editValues, caption: e.target.value})}
                                                    rows={3}
                                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => saveEdit('caption')}
                                                        className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => startEdit('caption', currentImage.caption)}
                                                className="p-2 bg-gray-50 dark:bg-gray-900 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-start justify-between min-h-[4rem]"
                                            >
                                                <span className="whitespace-pre-wrap flex-1">
                                                    {currentImage.caption || 'Click to add caption...'}
                                                </span>
                                                <Edit3 className="w-4 h-4 text-gray-400 mt-1 ml-2 flex-shrink-0" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <Image className="w-16 h-16 mx-auto mb-4" />
                                    <p>Select an image to view details</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImageManagementModal;