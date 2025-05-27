import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const NewCustomerModal = ({ isOpen, onClose, onSave, initialData = null }) => {
    const [name, setName] = useState("");
    const [contacts, setContacts] = useState([
        { name: "", email: "", phone: "", isPrimary: true },
    ]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Edit mode - populate with existing data
                setName(initialData.name || "");
                setContacts(initialData.contacts && initialData.contacts.length > 0 
                    ? initialData.contacts 
                    : [{ name: "", email: "", phone: "", isPrimary: true }]
                );
            } else {
                // Create mode - reset form
                setName("");
                setContacts([{ name: "", email: "", phone: "", isPrimary: true }]);
            }
        }
    }, [isOpen, initialData]);

    const handleAddContact = () => {
        setContacts([...contacts, { name: "", email: "", phone: "", isPrimary: false }]);
    };

    const handleContactChange = (index, field, value) => {
        const updated = [...contacts];
        updated[index][field] = value;
        setContacts(updated);
    };

    const handleRemoveContact = (index) => {
        if (contacts.length > 1) {
            const updated = contacts.filter((_, i) => i !== index);
            // If we removed the primary contact, make the first one primary
            if (contacts[index].isPrimary && updated.length > 0) {
                updated[0].isPrimary = true;
            }
            setContacts(updated);
        }
    };

    const handlePrimaryChange = (index) => {
        const updated = contacts.map((c, i) => ({
            ...c,
            isPrimary: i === index,
        }));
        setContacts(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Filter out empty contacts
        const validContacts = contacts.filter(c => c.name && c.email);
        if (validContacts.length === 0) {
            alert("Please add at least one contact with name and email.");
            return;
        }
        onSave({ name, contacts: validContacts });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {initialData ? "Edit Customer" : "New Customer"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Contacts</h3>
                        {contacts.map((contact, index) => (
                            <div
                                key={index}
                                className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 space-y-3"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Contact name"
                                                    value={contact.name}
                                                    onChange={(e) =>
                                                        handleContactChange(index, "name", e.target.value)
                                                    }
                                                    required
                                                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    placeholder="contact@example.com"
                                                    value={contact.email}
                                                    onChange={(e) =>
                                                        handleContactChange(index, "email", e.target.value)
                                                    }
                                                    required
                                                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone (Optional)</label>
                                            <input
                                                type="tel"
                                                placeholder="+1 (555) 123-4567"
                                                value={contact.phone || ""}
                                                onChange={(e) =>
                                                    handleContactChange(index, "phone", e.target.value)
                                                }
                                                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="primaryContact"
                                                checked={contact.isPrimary}
                                                onChange={() => handlePrimaryChange(index)}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label className="text-sm text-gray-600 dark:text-gray-300">
                                                Primary Contact
                                            </label>
                                        </div>
                                    </div>
                                    {contacts.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveContact(index)}
                                            className="ml-3 p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddContact}
                            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                        >
                            <Plus size={16} />
                            Add Another Contact
                        </button>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded text-gray-800 dark:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded"
                        >
                            {initialData ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewCustomerModal;
