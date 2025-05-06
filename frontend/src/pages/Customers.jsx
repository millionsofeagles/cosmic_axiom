import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import NewCustomerModal from "../components/NewCustomerModal";
import DashboardLayout from "../layouts/DashboardLayout";

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [token] = useState(localStorage.getItem("token"));

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/customer`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setCustomers(data);
            setFilteredCustomers(data);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSaveCustomer = async (newCustomer) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/customer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newCustomer),
            });

            if (!res.ok) throw new Error("Create failed");
            const created = await res.json();
            setCustomers(prev => [created, ...prev]);
            setFilteredCustomers(prev => [created, ...prev]);
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error saving customer:", err);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        const lower = value.toLowerCase();

        if (!lower) {
            setFilteredCustomers(customers);
        } else {
            const filtered = customers.filter(c =>
                c.name.toLowerCase().includes(lower) ||
                c.contacts?.find(contact =>
                    contact.isPrimary &&
                    `${contact.name} ${contact.email}`.toLowerCase().includes(lower)
                )
            );
            setFilteredCustomers(filtered);
        }
    };

    const getPrimaryContact = (contacts = []) => {
        const primary = contacts.find(c => c.isPrimary);
        return primary ? `${primary.name} (${primary.email})` : "-";
    };

    return (
        <DashboardLayout>
            {/* Top bar */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customers</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search customers..."
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500 font-medium px-4 py-2 rounded transition"
                    >
                        <Plus size={18} />
                        New Customer
                    </button>
                </div>
            </div>

            {/* Customers table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <thead>
                        <tr className="text-left text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-sm">
                            <th className="p-4">Customer Name</th>
                            <th className="p-4">Primary Contact</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{customer.name}</td>
                                <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                                    {getPrimaryContact(customer.contacts)}
                                </td>
                                <td className="p-4 flex gap-4 text-sm">
                                    <button className="text-indigo-500 hover:underline font-medium">Edit</button>
                                    <button className="text-red-500 hover:underline font-medium">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <NewCustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCustomer}
            />
        </DashboardLayout>
    );
}

export default Customers;
