import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "../components/DarkModeToggle";
import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Decode token to extract user info
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (err) {
                console.error("Invalid token", err);
                localStorage.removeItem("token");
                navigate("/");
            }
        }
    }, [navigate]);

    const handleLogout = async () => {
        const token = localStorage.getItem("token");
    
        try {
            await fetch(`${import.meta.env.VITE_SATALITE_URL}/users/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        } catch (err) {
            console.warn("Logout request failed:", err); // optional: log this
        }
    
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-y-auto">
                <header className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    {/* Left: Logo + Title */}
                    <div className="flex items-center gap-4">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/3212/3212608.png"
                            alt="Cosmic Icon"
                            className="w-10 h-10"
                        />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Cosmic Axiom
                        </h1>
                    </div>

                    {/* Right: User Info + Toggle + Logout */}
                    <div className="flex items-center gap-6">
                        {user && (
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Welcome, <span className="font-semibold">{user.username}</span>
                            </div>
                        )}
                        <DarkModeToggle />
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-500 hover:text-red-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-8">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
