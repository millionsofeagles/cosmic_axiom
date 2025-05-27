import React, { useState, useEffect } from 'react';
import { 
  KeyIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const ApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    expiresAt: ''
  });
  const [showKeyValues, setShowKeyValues] = useState({});

  // Define all APIs that can use keys
  const apiServices = [
    { 
      service: 'github', 
      name: 'GitHub API',
      description: 'Enhanced access to GitHub Security Advisories (optional - works without key)',
      docsUrl: 'https://docs.github.com/en/rest/authentication',
      requiredFields: ['key']
    },
    { 
      service: 'openai', 
      name: 'OpenAI API',
      description: 'AI-powered vulnerability analysis and report generation',
      docsUrl: 'https://platform.openai.com/docs/api-reference',
      requiredFields: ['key']
    },
    { 
      service: 'shodan', 
      name: 'Shodan API',
      description: 'Search engine for Internet-connected devices',
      docsUrl: 'https://developer.shodan.io/api',
      requiredFields: ['key']
    },
    { 
      service: 'virustotal', 
      name: 'VirusTotal API',
      description: 'Analyze suspicious files and URLs',
      docsUrl: 'https://developers.virustotal.com/reference',
      requiredFields: ['key']
    }
  ];

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_ASTRAL_URL}/apikeys`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Organize keys by service
        const keysByService = {};
        data.forEach(key => {
          keysByService[key.service] = key;
        });
        setApiKeys(keysByService);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const existingKey = apiKeys[editingService];
      const method = existingKey ? 'PUT' : 'POST';
      const url = existingKey 
        ? `${import.meta.env.VITE_ASTRAL_URL}/apikeys/${existingKey.id}`
        : `${import.meta.env.VITE_ASTRAL_URL}/apikeys`;

      const apiService = apiServices.find(s => s.service === editingService);
      const payload = {
        name: apiService.name,
        service: editingService,
        ...formData
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchApiKeys();
        setEditingService(null);
        setFormData({
          key: '',
          value: '',
          expiresAt: ''
        });
      }
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_ASTRAL_URL}/apikeys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const toggleKeyVisibility = (id) => {
    setShowKeyValues(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openEditModal = (service) => {
    const existingKey = apiKeys[service];
    setEditingService(service);
    setFormData({
      key: '', // Don't show existing key
      value: '', // Don't show existing value
      expiresAt: existingKey?.expiresAt ? new Date(existingKey.expiresAt).toISOString().split('T')[0] : ''
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          API Integrations
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure API keys for external services to enhance functionality
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {apiServices.map((api) => {
          const existingKey = apiKeys[api.service];
          const isExpired = existingKey?.expiresAt && new Date(existingKey.expiresAt) < new Date();
          const hasKey = !!existingKey;
          
          return (
            <div key={api.service} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                      <KeyIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {api.name}
                    </h3>
                  </div>
                  {hasKey && (
                    <div>
                      {existingKey.isActive && !isExpired ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          {isExpired ? 'Expired' : 'Inactive'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {api.description}
                </p>
                
                {hasKey && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4 bg-gray-50 dark:bg-gray-900/50 rounded-md p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-500">Added:</span>
                      <span className="text-gray-900 dark:text-gray-300">{new Date(existingKey.createdAt).toLocaleDateString()}</span>
                    </div>
                    {existingKey.lastUsedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-500">Last used:</span>
                        <span className="text-gray-900 dark:text-gray-300">{new Date(existingKey.lastUsedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {existingKey.expiresAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-500">Expires:</span>
                        <span className="text-gray-900 dark:text-gray-300">{new Date(existingKey.expiresAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-3">
                  {hasKey ? (
                    <>
                      <button
                        onClick={() => openEditModal(api.service)}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(existingKey.id)}
                        className="inline-flex justify-center items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => openEditModal(api.service)}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add API Key
                    </button>
                  )}
                  <a
                    href={api.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Docs
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            {(() => {
              const api = apiServices.find(a => a.service === editingService);
              const existingKey = apiKeys[editingService];
              return (
                <>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {existingKey ? 'Update' : 'Add'} {api.name}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        API Key
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type={showKeyValues.form ? 'text' : 'password'}
                          value={formData.key}
                          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm pr-10 focus:ring-indigo-500 focus:border-indigo-500"
                          required={!existingKey}
                          placeholder={existingKey ? 'Leave blank to keep existing' : ''}
                        />
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility('form')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showKeyValues.form ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {api.requiredFields.includes('value') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          API Secret/Value
                        </label>
                        <input
                          type={showKeyValues.form ? 'text' : 'password'}
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder={existingKey ? 'Leave blank to keep existing' : ''}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Expires On (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingService(null);
                          setFormData({
                            key: '',
                            value: '',
                            expiresAt: ''
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        {existingKey ? 'Update' : 'Add'} API Key
                      </button>
                    </div>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;