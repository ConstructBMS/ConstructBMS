import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { activityTemplatesService } from '../../services/activityTemplatesService';
import type { ActivityTemplate, TemplateStep } from '../../services/activityTemplatesService';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui';

interface ActivityTemplatesModalProps {
  isOpen: boolean;
  onApplyTemplate: (templateId: string) => void;
  onClose: () => void;
  taskId: string;
  userId: string;
}

interface TemplateFormData {
  category: string;
  description: string;
  is_public: boolean;
  name: string;
  tags: string[];
}

interface StepFormData {
  dependencies: string[];
  description: string;
  duration: number;
  is_milestone: boolean;
  label: string;
  sequence: number;
}

const ActivityTemplatesModal: React.FC<ActivityTemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  taskId,
  userId
}) => {
  const [templates, setTemplates] = useState<ActivityTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null);
  const [templateSteps, setTemplateSteps] = useState<TemplateStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'edit'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form states
  const [templateForm, setTemplateForm] = useState<TemplateFormData>({
    name: '',
    description: '',
    category: '',
    is_public: false,
    tags: []
  });

  const [stepForm, setStepForm] = useState<StepFormData>({
    label: '',
    description: '',
    duration: 1,
    sequence: 1,
    is_milestone: false,
    dependencies: []
  });

  const [newTag, setNewTag] = useState('');

  // Load templates on mount
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  // Load template steps when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      loadTemplateSteps(selectedTemplate.id);
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await activityTemplatesService.getTemplates(userId);
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateSteps = async (templateId: string) => {
    try {
      const steps = await activityTemplatesService.getTemplateSteps(templateId);
      setTemplateSteps(steps);
    } catch (error) {
      console.error('Failed to load template steps:', error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setLoading(true);
      const newTemplate = await activityTemplatesService.createTemplate({
        ...templateForm,
        owner_id: userId
      });

      if (newTemplate) {
        setTemplates(prev => [...prev, newTemplate]);
        setActiveTab('browse');
        resetTemplateForm();
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      const updatedTemplate = await activityTemplatesService.updateTemplate(
        selectedTemplate.id,
        templateForm
      );

      if (updatedTemplate) {
        setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t));
        setSelectedTemplate(updatedTemplate);
        setActiveTab('browse');
        resetTemplateForm();
      }
    } catch (error) {
      console.error('Failed to update template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      setLoading(true);
      const success = await activityTemplatesService.deleteTemplate(templateId);

      if (success) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null);
          setTemplateSteps([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      const newStep = await activityTemplatesService.addTemplateStep({
        ...stepForm,
        template_id: selectedTemplate.id
      });

      if (newStep) {
        setTemplateSteps(prev => [...prev, newStep]);
        resetStepForm();
      }
    } catch (error) {
      console.error('Failed to add step:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return;

    try {
      setLoading(true);
      const success = await activityTemplatesService.deleteTemplateStep(stepId);

      if (success) {
        setTemplateSteps(prev => prev.filter(s => s.id !== stepId));
      }
    } catch (error) {
      console.error('Failed to delete step:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template: ActivityTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description || '',
      category: template.category || '',
      is_public: template.is_public,
      tags: template.tags
    });
    setActiveTab('edit');
  };

  const handleApplyTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      const activities = await activityTemplatesService.applyTemplateToTask(templateId, taskId, userId);
      
      if (activities.length > 0) {
        onApplyTemplate(templateId);
        onClose();
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      category: '',
      is_public: false,
      tags: []
    });
  };

  const resetStepForm = () => {
    setStepForm({
      label: '',
      description: '',
      duration: 1,
      sequence: 1,
      is_milestone: false,
      dependencies: []
    });
  };

  const addTag = () => {
    if (newTag.trim() && !templateForm.tags.includes(newTag.trim())) {
      setTemplateForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTemplateForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category).filter(Boolean)))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Activity Templates</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'browse' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Browse Templates
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'create' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Template
          </button>
          {activeTab === 'edit' && (
            <button
              onClick={() => setActiveTab('edit')}
              className="px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600"
            >
              Edit Template
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'browse' && (
            <div className="h-full flex">
              {/* Templates List */}
              <div className="w-1/2 border-r p-6 overflow-y-auto">
                {/* Search and Filters */}
                <div className="mb-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Templates */}
                <div className="space-y-3">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            {template.category && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                {template.category}
                              </span>
                            )}
                            {template.is_public ? (
                              <EyeIcon className="w-4 h-4 text-green-500" />
                            ) : (
                              <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTemplate(template);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template Details */}
              <div className="w-1/2 p-6 overflow-y-auto">
                {selectedTemplate ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedTemplate.name}
                      </h3>
                      <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          {/* UserIcon is not imported, so this will cause an error */}
                          {/* <UserIcon className="w-4 h-4 mr-1" /> */}
                          {/* Assuming owner_id is userId for now */}
                          {selectedTemplate.owner_id === userId ? 'You' : 'Other User'}
                        </span>
                        {selectedTemplate.category && (
                          <span className="flex items-center">
                            {/* TagIcon is not imported, so this will cause an error */}
                            {/* <TagIcon className="w-4 h-4 mr-1" /> */}
                            {selectedTemplate.category}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleApplyTemplate(selectedTemplate.id)}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? 'Applying...' : 'Apply Template to Task'}
                      </button>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Template Steps</h4>
                      <div className="space-y-2">
                        {templateSteps.map((step, index) => (
                          <div key={step.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-500">#{step.sequence}</span>
                                <span className="font-medium">{step.label}</span>
                                {step.is_milestone && (
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                    Milestone
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  {/* ClockIcon is not imported, so this will cause an error */}
                                  {/* <ClockIcon className="w-4 h-4 mr-1" /> */}
                                  {step.duration} day{step.duration !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteStep(step.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    Select a template to view details
                  </div>
                )}
              </div>
            </div>
          )}

          {(activeTab === 'create' || activeTab === 'edit') && (
            <div className="h-full flex">
              {/* Template Form */}
              <div className="w-1/2 border-r p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {activeTab === 'create' ? 'Create New Template' : 'Edit Template'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter template name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter template description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={templateForm.category}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter category"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={templateForm.is_public}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, is_public: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Make template public</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add tag"
                      />
                      <button
                        onClick={addTag}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {templateForm.tags.map(tag => (
                        <span
                          key={tag}
                          className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={activeTab === 'create' ? handleCreateTemplate : handleUpdateTemplate}
                    disabled={loading || !templateForm.name}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (activeTab === 'create' ? 'Create Template' : 'Update Template')}
                  </button>
                </div>
              </div>

              {/* Steps Form */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Steps</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Step Label *
                    </label>
                    <input
                      type="text"
                      value={stepForm.label}
                      onChange={(e) => setStepForm(prev => ({ ...prev, label: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter step label"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={stepForm.description}
                      onChange={(e) => setStepForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter step description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (days)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stepForm.duration}
                        onChange={(e) => setStepForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sequence
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={stepForm.sequence}
                        onChange={(e) => setStepForm(prev => ({ ...prev, sequence: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={stepForm.is_milestone}
                        onChange={(e) => setStepForm(prev => ({ ...prev, is_milestone: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Is milestone</span>
                    </label>
                  </div>

                  <button
                    onClick={handleAddStep}
                    disabled={loading || !stepForm.label || !selectedTemplate}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Step'}
                  </button>
                </div>

                {/* Current Steps */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Current Steps</h4>
                  <div className="space-y-2">
                    {templateSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-500">#{step.sequence}</span>
                            <span className="font-medium">{step.label}</span>
                            {step.is_milestone && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                Milestone
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              {/* ClockIcon is not imported, so this will cause an error */}
                              {/* <ClockIcon className="w-4 h-4 mr-1" /> */}
                              {step.duration} day{step.duration !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteStep(step.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTemplatesModal; 