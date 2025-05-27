import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

function FindingForm({ onSubmit, findings }) {
    const [mode, setMode] = useState("select");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const [selectedFindingId, setSelectedFindingId] = useState("");
    const [originalTemplate, setOriginalTemplate] = useState(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        risk: '',
        recommendation: '',
        affectedSystems: '',
        proofImages: []
    });

    useEffect(() => {
        if (mode === "select" && selectedFindingId && findings?.length) {
            const finding = findings.find(f => f.id === selectedFindingId);
            if (finding) {
                const loaded = {
                    title: finding.title || '',
                    description: finding.description || '',
                    risk: finding.severity || '',
                    recommendation: finding.recommendation || '',
                    affectedSystems: (finding.affectedSystems || []).join(', '),
                    proofImages: []
                };
                setForm(loaded);
                setOriginalTemplate(loaded);
            }
        }
    }, [selectedFindingId, mode, findings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleFileList = (files) => {
        const newImages = [];
        files.forEach((file) => {
            if (!file.type.startsWith("image/")) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                newImages.push({
                    title: file.name,
                    caption: '',
                    preview: event.target.result
                });

                if (newImages.length === files.length) {
                    setForm((prev) => ({
                        ...prev,
                        proofImages: [...prev.proofImages, ...newImages]
                    }));
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileBrowse = (e) => {
        const files = Array.from(e.target.files);
        handleFileList(files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFileList(files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleCaptionChange = (index, caption) => {
        setForm((prev) => {
            const updated = [...prev.proofImages];
            updated[index].caption = caption;
            return { ...prev, proofImages: updated };
        });
    };

    const handleRemoveImage = (index) => {
        setForm((prev) => {
            const updated = [...prev.proofImages];
            updated.splice(index, 1);
            return { ...prev, proofImages: updated };
        });
    };

    const handleResetToTemplate = () => {
        if (originalTemplate) {
            setForm({
                ...originalTemplate,
                proofImages: []
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const processedFinding = {
            ...form,
            affectedSystems: form.affectedSystems
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
        };
        onSubmit(processedFinding);
        setSelectedFindingId("");
        setForm({ title: '', description: '', risk: '', recommendation: '', affectedSystems: '', proofImages: [] });
        setOriginalTemplate(null);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            {/* Mode Toggle */}
            <div className="flex gap-4 mb-2">
                <button
                    type="button"
                    onClick={() => setMode("select")}
                    className={`px-4 py-2 rounded border transition ${mode === "select" ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                        }`}
                >
                    Select Existing
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setMode("create");
                        setSelectedFindingId("");
                        setOriginalTemplate(null);
                        setForm({ title: '', description: '', risk: '', recommendation: '', affectedSystems: '', proofImages: [] });
                    }}
                    className={`px-4 py-2 rounded border transition ${mode === "create" ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                        }`}
                >
                    Create New
                </button>
            </div>

            {/* Select Existing Dropdown */}
            {mode === "select" && (
                <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Templates
                    </label>
                    <select
                        value={selectedFindingId}
                        onChange={(e) => setSelectedFindingId(e.target.value)}
                        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                    >
                        <option value="">Select a Finding...</option>
                        {findings.map((f) => (
                            <option key={f.id} value={f.id}>{f.title} ({f.severity})</option>
                        ))}
                    </select>
                    {originalTemplate && (
                        <button
                            type="button"
                            onClick={handleResetToTemplate}
                            className="mt-2 text-sm text-indigo-600 underline hover:text-indigo-800"
                        >
                            Reset to Original Template
                        </button>
                    )}
                </>
            )}
            {(mode !== "select" || selectedFindingId) && (
    <>
            {/* Editable Fields */}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
            </label>
            <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Finding Title"
                required
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
            </label>
            <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Finding Description"
                rows="3"
                required
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Severity
            </label>
            <select
                name="risk"
                value={form.risk}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            >
                <option value="">Select severity...</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
            </select>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reccomendation
            </label>
            <textarea
                name="recommendation"
                value={form.recommendation}
                onChange={handleChange}
                placeholder="Recommendation"
                rows="2"
                required
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            </>
            )}
            {/* Affected Systems */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Affected Systems
                </label>
                <input
                    name="affectedSystems"
                    value={form.affectedSystems}
                    onChange={handleChange}
                    placeholder="Comma-separated (e.g. 10.0.0.1, server.domain.com)"
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
            </div>

            {/* Drag-and-Drop Image Upload */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current.click()}
                className={`cursor-pointer border-2 border-dashed rounded-md p-6 text-center transition ${isDragging
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900"
                    : "border-gray-300 dark:border-gray-600 hover:border-indigo-400"
                    }`}
            >
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Drag and drop images here or click to browse
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    You can upload multiple image files
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileBrowse}
                    className="hidden"
                />
            </div>

            {/* Uploaded Images Preview */}
            {form.proofImages.length > 0 && (
                <div className="space-y-4 mt-4">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">Proof Images</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {form.proofImages.map((img, index) => (
                            <div
                                key={index}
                                className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm"
                            >
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                                >
                                    <X size={16} />
                                </button>
                                <img
                                    src={img.preview}
                                    alt={img.title}
                                    className="w-full h-40 object-cover rounded mb-2"
                                />
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                    {img.title}
                                </p>
                                <input
                                    type="text"
                                    value={img.caption}
                                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                                    placeholder="Enter a caption"
                                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Submit */}
            <div className="pt-4">
                <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded transition"
                >
                    Add Finding
                </button>
            </div>
        </form>
    );
}

export default FindingForm;
