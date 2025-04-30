import { useState } from "react";

const NewCustomerModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        primaryContact: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
        setFormData({ name: "", primaryContact: "" });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">New Customer</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Organization Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Primary Contact (Email)</label>
                        <input
                            type="email"
                            name="primaryContact"
                            value={formData.primaryContact}
                            onChange={handleChange}
                            required
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-500 hover:text-indigo-500 font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="text-indigo-600 hover:text-indigo-400 font-semibold transition"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewCustomerModal;
