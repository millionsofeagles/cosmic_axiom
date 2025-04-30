import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ConnectivityForm from "../components/forms/ConnectivityForm";
import FindingForm from "../components/forms/FindingForm";
import DashboardLayout from "../layouts/DashboardLayout";
import customersTestData from "../test_data/customersTestData";
import engagementsTestData from "../test_data/engagementsTestData";

function ReportWriter() {
    const { engagementId } = useParams();

    const [engagements, setEngagements] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedEngagement, setSelectedEngagement] = useState(null);
    const [relatedCustomer, setRelatedCustomer] = useState(null);

    const [sections, setSections] = useState([]);
    const [activeForm, setActiveForm] = useState(null); // 'finding' or 'connectivity'

    useEffect(() => {
        setEngagements(engagementsTestData);
        setCustomers(customersTestData);
    }, []);

    useEffect(() => {
        if (engagements.length && engagementId) {
            const id = parseInt(engagementId);
            const engagement = engagements.find((e) => e.id === id);
            setSelectedEngagement(engagement);

            if (engagement) {
                const customer = customers.find((c) => c.name === engagement.client);
                setRelatedCustomer(customer || null);
            }
        }
    }, [engagementId, engagements, customers]);

    const handleAddFinding = (findingData) => {
        setSections(prev => [{ type: "finding", data: findingData }, ...prev]);
        setActiveForm(null);
    };

    const handleAddConnectivity = (connectivityData) => {
        setSections(prev => [{ type: "connectivity", data: connectivityData }, ...prev]);
        setActiveForm(null);
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Write Report</h2>

                {/* Customer + Engagement Overview */}
                {selectedEngagement && relatedCustomer && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer Block */}
                            <div className="border rounded-lg p-4 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Customer</h3>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-semibold">Organization:</span> {relatedCustomer.name}</p>
                                    <p><span className="font-semibold">Primary Contact:</span> {relatedCustomer.primaryContact}</p>
                                </div>
                            </div>

                            {/* Engagement Block */}
                            <div className="border rounded-lg p-4 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Engagement</h3>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-semibold">Name:</span> {selectedEngagement.name}</p>
                                    <p><span className="font-semibold">Status:</span> {selectedEngagement.status}</p>
                                    <p><span className="font-semibold">Start Date:</span> {selectedEngagement.startDate}</p>
                                    <p><span className="font-semibold">End Date:</span> {selectedEngagement.endDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Buttons to add sections */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveForm('finding')}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500 rounded transition"
                    >
                        Add New Finding
                    </button>
                    <button
                        onClick={() => setActiveForm('connectivity')}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500 rounded transition"
                    >
                        Add Connectivity
                    </button>
                </div>

                {/* Dynamic Form based on activeForm */}
                {activeForm === 'finding' && (
                    <FindingForm onSubmit={handleAddFinding} />
                )}
                {activeForm === 'connectivity' && (
                    <ConnectivityForm onSubmit={handleAddConnectivity} />
                )}

                {/* List of Sections */}
                <div className="space-y-6 mt-6">
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                            {section.type === "finding" && (
                                <>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Finding: {section.data.title}</h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-400">{section.data.description}</p>

                                    {/* Risk Level with Badge */}
                                    <div className="mt-2 flex items-center gap-2">
                                        <strong className="text-sm text-gray-900 dark:text-gray-200">Risk:</strong>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold
                                                ${section.data.risk === "Critical" ? "bg-red-600 text-white"
                                                : section.data.risk === "High" ? "bg-orange-500 text-white"
                                                : section.data.risk === "Medium" ? "bg-yellow-400 text-black"
                                                : "bg-gray-500 text-white"}`}
                                        >
                                            {section.data.risk}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        <strong>Recommendation:</strong> {section.data.recommendation}
                                    </p>

                                    {/* Affected Systems */}
                                    {section.data.affectedSystems?.length > 0 && (
                                        <div className="mt-2">
                                            <strong className="text-sm text-gray-900 dark:text-gray-200">Affected Systems:</strong>
                                            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-400">
                                                {section.data.affectedSystems.map((system, idx) => (
                                                    <li key={idx}>{system}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Proof Screenshots */}
                                    {section.data.proofImages?.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">Proof Screenshots:</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                {section.data.proofImages.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={img}
                                                        alt={`Proof ${idx + 1}`}
                                                        className="rounded-lg shadow-md object-cover max-h-48"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {section.type === "connectivity" && (
                                <>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Connectivity Results</h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-400 whitespace-pre-wrap">{section.data.results}</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ReportWriter;
