import { useEffect, useState } from "react";

const services = [
    { name: "Satellite", url: import.meta.env.VITE_SATELLITE_URL },
    { name: "Horizon", url: import.meta.env.VITE_HORIZON_URL },
    { name: "Forge", url: import.meta.env.VITE_FORGE_URL },
    { name: "Singularity", url: import.meta.env.VITE_SINGULARITY_URL },
    { name: "Astral", url: import.meta.env.VITE_ASTRAL_URL },
    { name: "Library", url: import.meta.env.VITE_LIBRARY_URL }
];

const SystemHealth = () => {
    const [healthStatus, setHealthStatus] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");

        const results = await Promise.all(
            services.map(async (service) => {
                try {
                    const res = await fetch(`${service.url}/health`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    return { name: service.name, status: res.ok ? "online" : "offline" };
                } catch {
                    return { name: service.name, status: "offline" };
                }
            })
        );

        const statusMap = {};
        results.forEach((svc) => {
            statusMap[svc.name] = svc.status;
        });
        setHealthStatus(statusMap);
        setLoading(false);
    };

    useEffect(() => {
        fetchHealth();
    }, []);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Microservice Status</h3>

            {loading ? (
                <p className="text-sm text-gray-500 dark:text-gray-300">Checking service health...</p>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {services.map((svc) => (
                        <li key={svc.name} className="flex justify-between py-2 text-sm">
                            <span className="text-gray-800 dark:text-gray-200">{svc.name}</span>
                            <span
                                className={`font-medium ${
                                    healthStatus[svc.name] === "online"
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                }`}
                            >
                                {healthStatus[svc.name] || "unknown"}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <button
                onClick={fetchHealth}
                className="text-sm px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
                Refresh
            </button>
        </div>
    );
};

export default SystemHealth;
