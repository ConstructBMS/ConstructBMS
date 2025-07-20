// BIM Integration Tab Component
// 4D Building Information Modeling with time dimension integration

import React, { useState, useEffect } from 'react';
import { bimIntegrationService } from '../../services/bimIntegration';
import type { BIMModel, BIMElement, BIMClash, BIMView } from '../../services/bimIntegration';
import { CubeIcon, EyeIcon, ExclamationTriangleIcon, DocumentIcon, CogIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface BIMIntegrationTabProps {
  project: any;
}

const BIMIntegrationTab: React.FC<BIMIntegrationTabProps> = ({ project }) => {
  const [models, setModels] = useState<BIMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<BIMModel | null>(null);
  const [selectedView, setSelectedView] = useState<BIMView | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showClashModal, setShowClashModal] = useState(false);
  const [selectedClash, setSelectedClash] = useState<BIMClash | null>(null);
  const [syncConfig, setSyncConfig] = useState(bimIntegrationService.getSyncConfig());

  useEffect(() => {
    loadBIMModels();
    initializeBIMService();
  }, [project]);

  const initializeBIMService = async () => {
    try {
      await bimIntegrationService.initialize({
        enabled: true,
        autoSync: true,
        syncInterval: 30
      });
      setSyncConfig(bimIntegrationService.getSyncConfig());
    } catch (error) {
      console.error('Failed to initialize BIM service:', error);
    }
  };

  const loadBIMModels = async () => {
    try {
      setLoading(true);
      const projectModels = bimIntegrationService.getProjectModels(project.id);
      setModels(projectModels);
      
      if (projectModels.length > 0) {
        setSelectedModel(projectModels[0]);
        setSelectedView(projectModels[0].views[0] || null);
      }
    } catch (error) {
      console.error('Error loading BIM models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const model = await bimIntegrationService.uploadModel(file, project.id);
      setModels(prev => [...prev, model]);
      setSelectedModel(model);
      setSelectedView(model.views[0] || null);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading BIM model:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSyncWithTasks = async () => {
    if (!selectedModel) return;

    try {
      setLoading(true);
      await bimIntegrationService.syncWithTasks(project.id, project.tasks || []);
      // Reload models to show updated data
      loadBIMModels();
    } catch (error) {
      console.error('Error syncing BIM with tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClashClick = (clash: BIMClash) => {
    setSelectedClash(clash);
    setShowClashModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-constructbms-dark-1"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-constructbms-dark-1/10 rounded-lg flex items-center justify-center">
            <CubeIcon className="w-6 h-6 text-constructbms-dark-1" />
          </div>
          <h3 className="text-3xl font-bold">4D BIM Integration</h3>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-constructbms-dark-1/10 text-constructbms-dark-1 rounded-lg hover:bg-constructbms-dark-1/20 transition-colors"
            disabled={uploading}
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Model'}
          </button>
          
          <button
            onClick={handleSyncWithTasks}
            className="flex items-center gap-2 px-4 py-2 bg-constructbms-dark-1/10 text-constructbms-dark-1 rounded-lg hover:bg-constructbms-dark-1/20 transition-colors"
            disabled={!selectedModel || loading}
          >
            <CogIcon className="h-4 w-4" />
            Sync with Tasks
          </button>
        </div>
      </div>

      {/* BIM Models Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Models List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="text-lg font-semibold mb-4">BIM Models</h4>
            
            {models.length === 0 ? (
              <div className="text-center py-8">
                <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No BIM models uploaded yet</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 px-4 py-2 bg-constructbms-dark-1 text-white rounded-lg hover:bg-constructbms-dark-1/90 transition-colors"
                >
                  Upload First Model
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {models.map(model => (
                  <div
                    key={model.id}
                                         onClick={() => {
                       setSelectedModel(model);
                       setSelectedView(model.views[0] || null);
                     }}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedModel?.id === model.id
                        ? 'border-constructbms-dark-1 bg-constructbms-dark-1/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{model.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                        {model.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Type: {model.fileType.toUpperCase()}</p>
                      <p>Elements: {model.elements.length}</p>
                      <p>Clashes: {model.clashes.length}</p>
                      <p>Size: {(model.fileSize / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Model Details */}
        <div className="lg:col-span-2">
          {selectedModel ? (
            <div className="space-y-6">
              {/* Model Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold mb-4">Model Information</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Building Name</p>
                    <p className="font-medium">{selectedModel.metadata.buildingName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Building Type</p>
                    <p className="font-medium">{selectedModel.metadata.buildingType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Floors</p>
                    <p className="font-medium">{selectedModel.metadata.floors}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Area</p>
                    <p className="font-medium">{selectedModel.metadata.totalArea.toLocaleString()} m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Architect</p>
                    <p className="font-medium">{selectedModel.metadata.architect}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Engineer</p>
                    <p className="font-medium">{selectedModel.metadata.engineer}</p>
                  </div>
                </div>
              </div>

              {/* Views */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold mb-4">Views</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {selectedModel.views.map(view => (
                    <div
                      key={view.id}
                      onClick={() => setSelectedView(view)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedView?.id === view.id
                          ? 'border-constructbms-dark-1 bg-constructbms-dark-1/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <EyeIcon className="h-4 w-4" />
                        <h5 className="font-medium">{view.name}</h5>
                      </div>
                      <p className="text-sm text-gray-600 capitalize">{view.type} View</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Elements and Clashes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Elements */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold mb-4">Elements ({selectedModel.elements.length})</h4>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedModel.elements.slice(0, 10).map(element => (
                      <div key={element.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{element.name}</p>
                          <p className="text-xs text-gray-600">{element.type} • {element.level}</p>
                        </div>
                        <div className="text-right">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-constructbms-dark-1 h-2 rounded-full"
                              style={{ width: `${element.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{element.progress}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clashes */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold mb-4">Clashes ({selectedModel.clashes.length})</h4>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedModel.clashes.map(clash => (
                      <div
                        key={clash.id}
                        onClick={() => handleClashClick(clash)}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">{clash.name}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(clash.severity)}`}>
                            {clash.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{clash.description}</p>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            clash.status === 'resolved' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                          }`}>
                            {clash.status}
                          </span>
                          <p className="text-xs text-gray-600">Due: {clash.dueDate.toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a BIM model to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Upload BIM Model</h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Drag and drop your BIM file here, or click to browse</p>
                <input
                  type="file"
                  accept=".ifc,.rvt,.skp,.dwg,.dxf,.bimx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="bim-file-upload"
                />
                <label
                  htmlFor="bim-file-upload"
                  className="px-4 py-2 bg-constructbms-dark-1 text-white rounded-lg hover:bg-constructbms-dark-1/90 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Supported formats: IFC, Revit, SketchUp, AutoCAD, BIMx</p>
                <p>Maximum file size: 100 MB</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clash Details Modal */}
      {showClashModal && selectedClash && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Clash Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedClash.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium capitalize">{selectedClash.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Severity</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedClash.severity)}`}>
                    {selectedClash.severity}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedClash.status === 'resolved' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                  }`}>
                    {selectedClash.status}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-medium">{selectedClash.description}</p>
              </div>
              
              {selectedClash.resolution && (
                <div>
                  <p className="text-sm text-gray-600">Resolution</p>
                  <p className="font-medium">{selectedClash.resolution}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Assigned To</p>
                  <p className="font-medium">{selectedClash.assignedTo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium">{selectedClash.dueDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cost Impact</p>
                  <p className="font-medium">£{selectedClash.cost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">{selectedClash.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowClashModal(false)}
                className="px-4 py-2 bg-constructbms-dark-1 text-white rounded-lg hover:bg-constructbms-dark-1/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BIMIntegrationTab; 
