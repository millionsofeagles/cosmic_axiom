import { useEffect, useState } from "react";
import { X, Shield, AlertTriangle, Settings, Users, Database, Zap, Clock, Calendar, Sun, Moon, AlertCircle } from "lucide-react";

const TestingParametersModal = ({ isOpen, onClose, onSave, engagement, initialData = null }) => {
    const [form, setForm] = useState({
        // Automated vs Manual
        automatedScanningAllowed: true,
        manualTestingAllowed: true,
        
        // Load and stress testing
        maxRequestsPerSecond: "",
        maxConcurrentConnections: "",
        loadTestingAllowed: false,
        stressTestingAllowed: false,
        
        // Social engineering
        socialEngineeringAllowed: false,
        phishingAllowed: false,
        vishingAllowed: false,
        physicalTestingAllowed: false,
        
        // Credential testing
        bruteForceAllowed: false,
        passwordSprayingAllowed: false,
        credentialStuffingAllowed: false,
        defaultCredsTestingAllowed: true,
        
        // Data handling
        dataExfiltrationAllowed: false,
        maxDataExfilSize: "",
        screenshotAllowed: true,
        
        // DoS and disruption
        dosTestingAllowed: false,
        disruptiveTestingAllowed: false,
        
        // Custom restrictions
        customRestrictions: [],
        
        // Testing window & schedule
        testingWindowEnabled: false,
        allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        testingStartTime: "09:00",
        testingEndTime: "17:00",
        timezone: "EST",
        disruptiveTestingWindow: {
            enabled: false,
            startTime: "12:00",
            endTime: "14:00",
        },
        emergencyContactRequired: false,
        blackoutDates: [],
    });

    const [newRestriction, setNewRestriction] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setForm({
                    automatedScanningAllowed: initialData.automatedScanningAllowed ?? true,
                    manualTestingAllowed: initialData.manualTestingAllowed ?? true,
                    maxRequestsPerSecond: initialData.maxRequestsPerSecond || "",
                    maxConcurrentConnections: initialData.maxConcurrentConnections || "",
                    loadTestingAllowed: initialData.loadTestingAllowed ?? false,
                    stressTestingAllowed: initialData.stressTestingAllowed ?? false,
                    socialEngineeringAllowed: initialData.socialEngineeringAllowed ?? false,
                    phishingAllowed: initialData.phishingAllowed ?? false,
                    vishingAllowed: initialData.vishingAllowed ?? false,
                    physicalTestingAllowed: initialData.physicalTestingAllowed ?? false,
                    bruteForceAllowed: initialData.bruteForceAllowed ?? false,
                    passwordSprayingAllowed: initialData.passwordSprayingAllowed ?? false,
                    credentialStuffingAllowed: initialData.credentialStuffingAllowed ?? false,
                    defaultCredsTestingAllowed: initialData.defaultCredsTestingAllowed ?? true,
                    dataExfiltrationAllowed: initialData.dataExfiltrationAllowed ?? false,
                    maxDataExfilSize: initialData.maxDataExfilSize || "",
                    screenshotAllowed: initialData.screenshotAllowed ?? true,
                    dosTestingAllowed: initialData.dosTestingAllowed ?? false,
                    disruptiveTestingAllowed: initialData.disruptiveTestingAllowed ?? false,
                    customRestrictions: initialData.customRestrictions || [],
                    testingWindowEnabled: initialData.testingWindowEnabled ?? false,
                    allowedDays: initialData.allowedDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    testingStartTime: initialData.testingStartTime || "09:00",
                    testingEndTime: initialData.testingEndTime || "17:00",
                    timezone: initialData.timezone || "EST",
                    disruptiveTestingWindow: initialData.disruptiveTestingWindow || { enabled: false, startTime: "12:00", endTime: "14:00" },
                    emergencyContactRequired: initialData.emergencyContactRequired ?? false,
                    blackoutDates: initialData.blackoutDates || [],
                });
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? (value ? parseInt(value) : "") : value
        }));
    };

    const addCustomRestriction = () => {
        if (newRestriction.trim()) {
            setForm(prev => ({
                ...prev,
                customRestrictions: [...prev.customRestrictions, newRestriction.trim()]
            }));
            setNewRestriction("");
        }
    };

    const removeCustomRestriction = (index) => {
        setForm(prev => ({
            ...prev,
            customRestrictions: prev.customRestrictions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const submitData = {
            ...form,
            maxRequestsPerSecond: form.maxRequestsPerSecond ? parseInt(form.maxRequestsPerSecond) : null,
            maxConcurrentConnections: form.maxConcurrentConnections ? parseInt(form.maxConcurrentConnections) : null,
            maxDataExfilSize: form.maxDataExfilSize || null,
        };
        
        onSave(submitData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <style>{`
                .checkbox-light {
                    appearance: none;
                    background-color: white !important;
                    border: 2px solid #d1d5db;
                    border-radius: 0.25rem;
                    width: 1rem;
                    height: 1rem;
                    position: relative;
                }
                .checkbox-light:checked {
                    background-color: #3b82f6 !important;
                    border-color: #3b82f6 !important;
                }
                .checkbox-light:checked::after {
                    content: '';
                    position: absolute;
                    left: 0.125rem;
                    top: 0rem;
                    width: 0.25rem;
                    height: 0.5rem;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }
                .checkbox-light:focus {
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
                }
            `}</style>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        Testing Parameters - {engagement?.name}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="space-y-8">
                        {/* Basic Testing Methods */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Basic Testing Methods
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.automatedScanningAllowed}
                                        onChange={(e) => setForm(prev => ({ ...prev, automatedScanningAllowed: e.target.checked }))}
                                        className="checkbox-light w-4 h-4 rounded border-gray-300 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Automated Scanning</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="manualTestingAllowed"
                                        checked={form.manualTestingAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manual Testing</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="screenshotAllowed"
                                        checked={form.screenshotAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Screenshots Allowed</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="defaultCredsTestingAllowed"
                                        checked={form.defaultCredsTestingAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Credentials Testing</span>
                                </label>
                            </div>
                        </div>

                        {/* Testing Window & Schedule */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-amber-800 dark:text-amber-200 flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Testing Window & Schedule
                            </h3>
                            
                            {/* Enable Testing Window */}
                            <div className="mb-6">
                                <label className="flex items-center gap-3 cursor-pointer mb-4">
                                    <input
                                        type="checkbox"
                                        checked={form.testingWindowEnabled}
                                        onChange={(e) => setForm(prev => ({ ...prev, testingWindowEnabled: e.target.checked }))}
                                        className="checkbox-light w-4 h-4 rounded border-gray-300 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Testing Window Restrictions</span>
                                </label>
                            </div>

                            {form.testingWindowEnabled && (
                                <div className="space-y-6">
                                    {/* Visual Timeline */}
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                                        <h4 className="text-md font-semibold mb-3 text-amber-800 dark:text-amber-200 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Weekly Testing Schedule
                                        </h4>
                                        
                                        {/* Week Days Visual */}
                                        <div className="grid grid-cols-7 gap-2 mb-4">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                                                const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                                const fullDay = fullDayNames[index];
                                                const isSelected = form.allowedDays.includes(fullDay);
                                                const isWeekend = index === 0 || index === 6;
                                                
                                                return (
                                                    <div
                                                        key={day}
                                                        onClick={() => {
                                                            setForm(prev => ({
                                                                ...prev,
                                                                allowedDays: isSelected 
                                                                    ? prev.allowedDays.filter(d => d !== fullDay)
                                                                    : [...prev.allowedDays, fullDay]
                                                            }));
                                                        }}
                                                        className={`
                                                            text-center p-3 rounded-lg cursor-pointer transition-all duration-200 border-2
                                                            ${isSelected 
                                                                ? 'bg-amber-500 text-white border-amber-600 shadow-lg' 
                                                                : isWeekend 
                                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700' 
                                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                            }
                                                        `}
                                                    >
                                                        <div className="text-xs font-semibold">{day}</div>
                                                        <div className="text-xs mt-1">
                                                            {isSelected ? '✓' : isWeekend ? '✗' : '○'}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Time Range Visual */}
                                        <div className="mb-4">
                                            <h5 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                                <Sun className="w-4 h-4" />
                                                Daily Testing Hours
                                            </h5>
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={form.testingStartTime}
                                                        onChange={(e) => setForm(prev => ({ ...prev, testingStartTime: e.target.value }))}
                                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">End Time</label>
                                                    <input
                                                        type="time"
                                                        value={form.testingEndTime}
                                                        onChange={(e) => setForm(prev => ({ ...prev, testingEndTime: e.target.value }))}
                                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* Visual 24-hour timeline */}
                                            <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                    <span>12 AM</span>
                                                    <span>6 AM</span>
                                                    <span>12 PM</span>
                                                    <span>6 PM</span>
                                                    <span>12 AM</span>
                                                </div>
                                                <div className="relative h-6 bg-gray-200 dark:bg-gray-600 rounded">
                                                    {/* Testing window overlay */}
                                                    <div 
                                                        className="absolute h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded shadow-sm"
                                                        style={{
                                                            left: `${(parseInt(form.testingStartTime.split(':')[0]) + parseInt(form.testingStartTime.split(':')[1])/60) / 24 * 100}%`,
                                                            width: `${((parseInt(form.testingEndTime.split(':')[0]) + parseInt(form.testingEndTime.split(':')[1])/60) - (parseInt(form.testingStartTime.split(':')[0]) + parseInt(form.testingStartTime.split(':')[1])/60)) / 24 * 100}%`
                                                        }}
                                                    />
                                                    {/* Disruptive testing window if enabled */}
                                                    {form.disruptiveTestingWindow.enabled && (
                                                        <div 
                                                            className="absolute h-full bg-gradient-to-r from-red-400 to-red-500 rounded shadow-sm border-2 border-red-600"
                                                            style={{
                                                                left: `${(parseInt(form.disruptiveTestingWindow.startTime.split(':')[0]) + parseInt(form.disruptiveTestingWindow.startTime.split(':')[1])/60) / 24 * 100}%`,
                                                                width: `${((parseInt(form.disruptiveTestingWindow.endTime.split(':')[0]) + parseInt(form.disruptiveTestingWindow.endTime.split(':')[1])/60) - (parseInt(form.disruptiveTestingWindow.startTime.split(':')[0]) + parseInt(form.disruptiveTestingWindow.startTime.split(':')[1])/60)) / 24 * 100}%`
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex justify-center mt-2 gap-4 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-3 h-3 bg-amber-500 rounded"></div>
                                                        <span className="text-gray-600 dark:text-gray-400">Testing Window</span>
                                                    </div>
                                                    {form.disruptiveTestingWindow.enabled && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-3 h-3 bg-red-500 rounded border border-red-600"></div>
                                                            <span className="text-gray-600 dark:text-gray-400">No Disruptive Tests</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timezone */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Timezone</label>
                                                <select
                                                    value={form.timezone}
                                                    onChange={(e) => setForm(prev => ({ ...prev, timezone: e.target.value }))}
                                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                                                >
                                                    <option value="EST">Eastern (EST)</option>
                                                    <option value="CST">Central (CST)</option>
                                                    <option value="MST">Mountain (MST)</option>
                                                    <option value="PST">Pacific (PST)</option>
                                                    <option value="UTC">UTC</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Disruptive Testing Restrictions */}
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                                        <h5 className="text-sm font-semibold mb-3 text-red-800 dark:text-red-200 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            Disruptive Testing Restrictions
                                        </h5>
                                        <label className="flex items-center gap-3 cursor-pointer mb-3">
                                            <input
                                                type="checkbox"
                                                checked={form.disruptiveTestingWindow.enabled}
                                                onChange={(e) => setForm(prev => ({ 
                                                    ...prev, 
                                                    disruptiveTestingWindow: { ...prev.disruptiveTestingWindow, enabled: e.target.checked }
                                                }))}
                                                className="checkbox-light w-4 h-4 rounded border-gray-300 cursor-pointer"
                                            />
                                            <span className="text-sm font-medium text-red-700 dark:text-red-300">Restrict Disruptive Testing Hours</span>
                                        </label>
                                        
                                        {form.disruptiveTestingWindow.enabled && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-red-600 dark:text-red-400 mb-1">No Disruptive Tests From</label>
                                                    <input
                                                        type="time"
                                                        value={form.disruptiveTestingWindow.startTime}
                                                        onChange={(e) => setForm(prev => ({ 
                                                            ...prev, 
                                                            disruptiveTestingWindow: { ...prev.disruptiveTestingWindow, startTime: e.target.value }
                                                        }))}
                                                        className="w-full p-2 border border-red-300 dark:border-red-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-red-600 dark:text-red-400 mb-1">No Disruptive Tests Until</label>
                                                    <input
                                                        type="time"
                                                        value={form.disruptiveTestingWindow.endTime}
                                                        onChange={(e) => setForm(prev => ({ 
                                                            ...prev, 
                                                            disruptiveTestingWindow: { ...prev.disruptiveTestingWindow, endTime: e.target.value }
                                                        }))}
                                                        className="w-full p-2 border border-red-300 dark:border-red-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Emergency Contact */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.emergencyContactRequired}
                                                onChange={(e) => setForm(prev => ({ ...prev, emergencyContactRequired: e.target.checked }))}
                                                className="checkbox-light w-4 h-4 rounded border-gray-300 cursor-pointer"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Emergency Contact Required</span>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Require emergency contact availability during off-hours testing</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Load Testing */}
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-200 flex items-center gap-2">
                                <Zap className="w-5 h-5" />
                                Load & Stress Testing
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="loadTestingAllowed"
                                        checked={form.loadTestingAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Load Testing</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="stressTestingAllowed"
                                        checked={form.stressTestingAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stress Testing</span>
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Requests/Second</label>
                                    <input
                                        type="number"
                                        name="maxRequestsPerSecond"
                                        value={form.maxRequestsPerSecond}
                                        onChange={handleChange}
                                        min="1"
                                        placeholder="e.g., 100"
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Concurrent Connections</label>
                                    <input
                                        type="number"
                                        name="maxConcurrentConnections"
                                        value={form.maxConcurrentConnections}
                                        onChange={handleChange}
                                        min="1"
                                        placeholder="e.g., 50"
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Engineering */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4 text-purple-800 dark:text-purple-200 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Social Engineering
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="socialEngineeringAllowed"
                                        checked={form.socialEngineeringAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Social Engineering</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="phishingAllowed"
                                        checked={form.phishingAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phishing</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="vishingAllowed"
                                        checked={form.vishingAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vishing (Voice Phishing)</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="physicalTestingAllowed"
                                        checked={form.physicalTestingAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Physical Testing</span>
                                </label>
                            </div>
                        </div>

                        {/* Credential Testing */}
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4 text-orange-800 dark:text-orange-200 flex items-center gap-2">
                                <Database className="w-5 h-5" />
                                Credential Testing
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="bruteForceAllowed"
                                        checked={form.bruteForceAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Brute Force Attacks</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="passwordSprayingAllowed"
                                        checked={form.passwordSprayingAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Spraying</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="credentialStuffingAllowed"
                                        checked={form.credentialStuffingAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Credential Stuffing</span>
                                </label>
                            </div>
                        </div>

                        {/* Data Handling */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4 text-yellow-800 dark:text-yellow-200">Data Handling</h3>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="dataExfiltrationAllowed"
                                        checked={form.dataExfiltrationAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Exfiltration Allowed</span>
                                </label>
                                {form.dataExfiltrationAllowed && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Data Exfiltration Size</label>
                                        <input
                                            type="text"
                                            name="maxDataExfilSize"
                                            value={form.maxDataExfilSize}
                                            onChange={handleChange}
                                            placeholder="e.g., 10MB, 1GB"
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Disruptive Testing */}
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4 text-red-800 dark:text-red-200 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Disruptive Testing
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="dosTestingAllowed"
                                        checked={form.dosTestingAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">DoS Testing</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="disruptiveTestingAllowed"
                                        checked={form.disruptiveTestingAllowed}
                                        onChange={handleChange}
                                        className="checkbox-light"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Other Disruptive Testing</span>
                                </label>
                            </div>
                        </div>

                        {/* Custom Restrictions */}
                        <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Custom Restrictions</h3>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newRestriction}
                                        onChange={(e) => setNewRestriction(e.target.value)}
                                        placeholder="Add custom restriction..."
                                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomRestriction())}
                                    />
                                    <button
                                        type="button"
                                        onClick={addCustomRestriction}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                                    >
                                        Add
                                    </button>
                                </div>
                                {form.customRestrictions.length > 0 && (
                                    <ul className="space-y-2">
                                        {form.customRestrictions.map((restriction, index) => (
                                            <li key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{restriction}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCustomRestriction(index)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded text-gray-800 dark:text-white">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold">
                            Save Testing Parameters
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default TestingParametersModal;