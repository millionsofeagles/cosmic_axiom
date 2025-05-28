import { useEffect, useState } from "react";

const statusOptions = [
    { value: "PLANNED", label: "Planned" },
    { value: "ACTIVE", label: "Active" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELED", label: "Canceled" }
];

const NewEngagementModal = ({ isOpen, onClose, onSave, customers = [], initialData = null }) => {
    const [form, setForm] = useState({
        name: "",
        description: "",
        customerId: "",
        startDate: "",
        endDate: "",
        status: "PLANNED",
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Edit mode - populate with existing data
                setForm({
                    name: initialData.name || "",
                    description: initialData.description || "",
                    customerId: initialData.customerId || "",
                    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
                    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
                    status: initialData.status || "PLANNED",
                });
            } else {
                // Create mode - reset form
                setForm({
                    name: "",
                    description: "",
                    customerId: customers[0]?.id || "",
                    startDate: "",
                    endDate: "",
                    status: "PLANNED",
                });
            }
        }
    }, [isOpen, initialData, customers]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.customerId || !form.startDate || !form.endDate || !form.status) {
            alert("Please fill in all required fields");
            return;
        }
        onSave(form);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    {initialData ? "Edit Engagement" : "New Engagement"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Engagement Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Brief description of the engagement..."
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white resize-vertical"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Customer <span className="text-red-500">*</span></label>
                        <select
                            name="customerId"
                            value={form.customerId}
                            onChange={handleChange}
                            required
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Select a customer</option>
                            {customers.map((cust) => (
                                <option key={cust.id} value={cust.id}>
                                    {cust.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Start Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                required
                                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">End Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                required
                                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Status <span className="text-red-500">*</span></label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            required
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            {statusOptions.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded text-gray-800 dark:text-white">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold">
                            {initialData ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewEngagementModal;
