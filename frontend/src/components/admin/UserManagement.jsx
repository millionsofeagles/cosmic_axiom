import { useEffect, useState } from "react";

const ROLES = ["ADMIN", "PENTESTER", "PENTEST LEAD"];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({ name: "", username: "", role: "PENTESTER", password: "" });

    const [showResetModal, setShowResetModal] = useState(false);
    const [resetTarget, setResetTarget] = useState(null);
    const [newPassword, setNewPassword] = useState("");

    const token = localStorage.getItem("token");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openModal = (user = null) => {
        setEditingUser(user);
        setForm(
            user
                ? { name: user.name, username: user.username, role: user.role, password: "" }
                : { name: "", username: "", role: "PENTESTER", password: "" }
        );
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setForm({ name: "", username: "", role: "PENTESTER", password: "" });
    };

    const handleSave = async () => {
        const method = editingUser ? "PUT" : "POST";
        const url = editingUser
            ? `${import.meta.env.VITE_SATELLITE_URL}/users/update`
            : `${import.meta.env.VITE_SATELLITE_URL}/users/create`;

        const body = {
            id: editingUser.id,
            name: form.name,
            username: form.username,
            role: form.role,
        };

        if (!editingUser && form.password) {
            body.password = form.password;
        }

        try {
            await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            closeModal();
            fetchUsers();
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await fetch(`${import.meta.env.VITE_SATELLITE_URL}/users/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchUsers();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const openPasswordResetModal = (user) => {
        setResetTarget(user);
        setNewPassword("");
        setShowResetModal(true);
    };

    const handleResetPassword = async () => {
        try {
            await fetch(`${import.meta.env.VITE_SATELLITE_URL}/users/password-reset`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: resetTarget.id, password: newPassword }),
            });
            setShowResetModal(false);
        } catch (err) {
            console.error("Password reset failed", err);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-600">User Management</h3>
                <button
                    onClick={() => openModal()}
                    className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                >
                    Add User
                </button>
            </div>

            {loading ? (
                <div className="text-gray-400">Loading users...</div>
            ) : (
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs uppercase text-gray-600 border-b border-gray-700">
                        <tr>
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Username</th>
                            <th className="px-3 py-2">Role</th>
                            <th className="px-3 py-2">Last Login</th>
                            <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b text-gray-600 border-gray-700">
                                <td className="px-3 py-2">{user.name}</td>
                                <td className="px-3 py-2">{user.username}</td>
                                <td className="px-3 py-2">{user.role}</td>
                                <td className="px-3 py-2">{user.lastLogin || "—"}</td>
                                <td className="px-3 py-2 text-right space-x-2">
                                    <button
                                        onClick={() => openModal(user)}
                                        className="text-xs text-indigo-400 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-xs text-red-400 hover:underline"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => openPasswordResetModal(user)}
                                        className="text-xs text-yellow-400 hover:underline"
                                    >
                                        Reset Password
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl">
                        <h4 className="text-lg font-bold mb-4 text-white">
                            {editingUser ? "Edit User" : "Add User"}
                        </h4>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Username</label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Password</label>
                                    <input
                                        type="password"
                                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Role</label>
                                <select
                                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                >
                                    {ROLES.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                onClick={closeModal}
                                className="text-sm px-4 py-2 text-gray-300 hover:underline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                            >
                                {editingUser ? "Save Changes" : "Create User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm">
                        <h3 className="text-lg font-bold text-white mb-4">
                            Reset Password for {resetTarget.name}
                        </h3>
                        <input
                            type="password"
                            className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 text-white rounded"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowResetModal(false)} className="text-sm text-gray-400 hover:underline">
                                Cancel
                            </button>
                            <button
                                onClick={handleResetPassword}
                                className="bg-yellow-500 hover:bg-yellow-600 text-sm text-black px-4 py-2 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
