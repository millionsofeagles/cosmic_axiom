import { useState } from "react";

const NewCustomerModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState("");
    const [contacts, setContacts] = useState([
        { name: "", email: "", phone: "", isPrimary: true },
    ]);

    const handleAddContact = () => {
        setContacts([...contacts, { name: "", email: "", phone: "", isPrimary: false }]);
    };

    const handleContactChange = (index, field, value) => {
        const updated = [...contacts];
        updated[index][field] = value;
        setContacts(updated);
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
        onSave({ name, contacts });
        onClose();
        setName("");
        setContacts([{ name: "", email: "", phone: "", isPrimary: true }]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">New Customer</h2>
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
                                className="border border-gray-300 dark:border-gray-700 rounded p-4 space-y-3"
                            >
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={contact.name}
                                        onChange={(e) =>
                                            handleContactChange(index, "name", e.target.value)
                                        }
                                        required
                                        className="flex-1 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={contact.email}
                                        onChange={(e) =>
                                            handleContactChange(index, "email", e.target.value)
                                        }
                                        required
                                        className="flex-1 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone"
                                        value={contact.phone || ""}
                                        onChange={(e) =>
                                            handleContactChange(index, "phone", e.target.value)
                                        }
                                        className="flex-1 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="primaryContact"
                                        checked={contact.isPrimary}
                                        onChange={() => handlePrimaryChange(index)}
                                    />
                                    <label className="text-sm text-gray-600 dark:text-gray-300">
                                        Primary Contact
                                    </label>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddContact}
                            className="text-sm text-indigo-500 hover:underline"
                        >
                            + Add Another Contact
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
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded"
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
