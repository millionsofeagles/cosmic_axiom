import { useState, useEffect } from "react";
import { X } from "lucide-react";

const severityOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function FindingDetailsModal({ isOpen, onClose, findingId }) {
    const [finding, setFinding] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!isOpen || !findingId) {
            setLoading(true);
            setFinding(null);
            setFormData({});
            setEditing(false);
            return;
        }

        const fetchFinding = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/findings/${findingId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setFinding(data);
                setFormData(data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch finding", err);
                setLoading(false);
            }
        };
        fetchFinding();
    }, [findingId, isOpen, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/findings/${findingId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error("Update failed");
            const updated = await res.json();
            setFinding(updated);
            setEditing(false);
        } catch (err) {
            console.error("Failed to update finding", err);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this finding?")) return;
        try {
            await fetch(`${import.meta.env.VITE_SATELLITE_URL}/findings/${findingId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            onClose();
            // Trigger a refresh of the findings list
            window.location.reload();
        } catch (err) {
            console.error("Failed to delete finding", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity"
                    onClick={onClose}
                />
                
                {/* Modal */}
                <div className="inline-block w-full max-w-4xl px-6 py-4 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                    {loading ? (
                        <p className="text-gray-500 dark:text-gray-300">Loading...</p>
                    ) : (
                        <>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-medium text-gray-900 dark:text-white tracking-tight">
                                    {editing ? "Edit Finding" : finding?.title}
                                </h2>
                                <div className="flex items-center gap-2">
                                    {!editing && (
                                        <>
                                            <button
                                                onClick={() => setEditing(true)}
                                                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                {editing ? (
                                    <form className="space-y-5" onSubmit={handleSave}>
                                        {[
                                            { label: "Title", name: "title", type: "input" },
                                            { label: "Description", name: "description", type: "textarea", rows: 4 },
                                            { label: "Recommendation", name: "recommendation", type: "textarea", rows: 3 },
                                            { label: "Impact", name: "impact", type: "textarea", rows: 3 },
                                            { label: "Reference", name: "reference", type: "input" }
                                        ].map(({ label, name, type, rows }) => (
                                            <div key={name}>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    {label}
                                                </label>
                                                {type === "textarea" ? (
                                                    <textarea
                                                        name={name}
                                                        rows={rows}
                                                        value={formData[name] || ""}
                                                        onChange={handleChange}
                                                        className="w-full p-2 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                ) : (
                                                    <input
                                                        name={name}
                                                        value={formData[name] || ""}
                                                        onChange={handleChange}
                                                        className="w-full p-2 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                )}
                                            </div>
                                        ))}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                                            <select
                                                name="severity"
                                                value={formData.severity || "LOW"}
                                                onChange={handleChange}
                                                className="w-full p-2 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                                            >
                                                {severityOptions.map((level) => (
                                                    <option key={level} value={level}>{level}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-300 dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={() => setEditing(false)}
                                                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-gray-800 dark:text-gray-200">
                                        <div>
                                            <h4 className="text-sm font-semibold mb-1 text-gray-500 dark:text-gray-400">Description</h4>
                                            <p className="whitespace-pre-wrap">{finding?.description}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold mb-1 text-gray-500 dark:text-gray-400">Recommendation</h4>
                                            <p className="whitespace-pre-wrap">{finding?.recommendation}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold mb-1 text-gray-500 dark:text-gray-400">Impact</h4>
                                            <p className="whitespace-pre-wrap">{finding?.impact || "—"}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold mb-1 text-gray-500 dark:text-gray-400">Severity</h4>
                                            <span className={`px-2 py-1 rounded text-sm font-medium inline-block ${{
                                                CRITICAL: "bg-red-200 dark:bg-red-700 text-red-900 dark:text-red-200",
                                                HIGH: "bg-orange-200 dark:bg-orange-700 text-orange-900 dark:text-orange-200",
                                                MEDIUM: "bg-yellow-200 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100",
                                                LOW: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                            }[finding?.severity]}`}>
                                                {finding?.severity}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold mb-1 text-gray-500 dark:text-gray-400">Reference</h4>
                                            <p>{finding?.reference || "—"}</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <h4 className="text-sm font-semibold mb-1 text-gray-500 dark:text-gray-400">Tags</h4>
                                            {finding?.tags?.length ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {finding.tags.map((tag, i) => (
                                                        <span key={i} className="bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-white px-2 py-1 rounded text-xs font-medium">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p>—</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FindingDetailsModal;