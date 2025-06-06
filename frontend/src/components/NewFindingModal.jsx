import { useState, useEffect } from "react";

const NewFindingModal = ({ isOpen, onClose, onSave, initialData = null }) => {
    const [formData, setFormData] = useState({
        title: "",
        severity: "MEDIUM",
        reference: "",
        description: "",
        impact: "",
        recommendation: "",
        tags: ""
    });

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                severity: initialData.severity || "MEDIUM",
                reference: initialData.reference || "",
                description: initialData.description || "",
                impact: initialData.impact || "",
                recommendation: initialData.recommendation || "",
                tags: initialData.tags || ""
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedData = {
            ...formData,
            tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        };
        onSave(formattedData);
        onClose();
        // Reset form data
        setFormData({
            title: "",
            severity: "MEDIUM",
            reference: "",
            description: "",
            impact: "",
            recommendation: "",
            tags: ""
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">New Finding</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Severity</label>
                        <select
                            name="severity"
                            value={formData.severity}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Reference</label>
                        <input
                            type="text"
                            name="reference"
                            value={formData.reference}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            rows="3"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Impact</label>
                        <textarea
                            name="impact"
                            value={formData.impact}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            rows="3"
                            placeholder="Describe the potential impact if this vulnerability is exploited"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Recommendation</label>
                        <textarea
                            name="recommendation"
                            value={formData.recommendation}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            rows="3"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Tags (comma-separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="e.g., web, input-validation, XSS"
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <button 
                            type="button" 
                            onClick={() => {
                                onClose();
                                // Reset form when canceling
                                setFormData({
                                    title: "",
                                    severity: "MEDIUM",
                                    reference: "",
                                    description: "",
                                    impact: "",
                                    recommendation: "",
                                    tags: ""
                                });
                            }} 
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded text-gray-800 dark:text-white"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewFindingModal;
