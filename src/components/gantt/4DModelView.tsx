import React from 'react';
import { 
  CubeIcon, 
  PlayIcon, 
  StopIcon, 
  EyeIcon, 
  EyeSlashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ModelViewProps {
  isModelLinked?: boolean;
  isPlaybackActive?: boolean;
  linkedObjects?: string[];
  modelName?: string;
  playbackProgress?: number;
}

export const Model4DView: React.FC<ModelViewProps> = ({
  isModelLinked = false,
  isPlaybackActive = false,
  linkedObjects = [],
  modelName = 'No Model Linked',
  playbackProgress = 0
}) => {
  return (
    <div className="flex-1 bg-gray-100 border border-gray-300 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CubeIcon className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">4D Model Viewer</h3>
        </div>
        <div className="flex items-center space-x-2">
          <InformationCircleIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">Coming Soon</span>
        </div>
      </div>

      {!isModelLinked ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <CubeIcon className="h-16 w-16 text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">No IFC Model Linked</h4>
          <p className="text-sm text-gray-500 max-w-md">
            Link an IFC model to enable 4D construction sequencing visualization. 
            The model viewer will display building elements and their construction timeline.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Model Status */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">{modelName}</h4>
                <p className="text-sm text-gray-600">
                  {linkedObjects.length} objects linked to tasks
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isPlaybackActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-600">
                  {isPlaybackActive ? 'Playing' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Placeholder Model Viewer */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-48 flex items-center justify-center">
              <div className="text-center">
                <CubeIcon className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">IFC Model Viewer</h4>
                <p className="text-sm text-gray-600">
                  Three.js or xeokit integration coming soon
                </p>
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          {isPlaybackActive && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">4D Simulation Progress</span>
                <span className="text-sm text-gray-600">{playbackProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${playbackProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Object List */}
          {linkedObjects.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Linked Objects</h4>
              <div className="grid grid-cols-2 gap-2">
                {linkedObjects.slice(0, 6).map((obj, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <EyeIcon className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700 truncate">{obj}</span>
                  </div>
                ))}
                {linkedObjects.length > 6 && (
                  <div className="col-span-2 text-center p-2">
                    <span className="text-sm text-gray-500">
                      +{linkedObjects.length - 6} more objects
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Future Features Preview */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Upcoming Features</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <CubeIcon className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">IFC Model Parsing</span>
              </div>
              <div className="flex items-center space-x-2">
                <PlayIcon className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">4D Playback Engine</span>
              </div>
              <div className="flex items-center space-x-2">
                <EyeIcon className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">Object Visibility</span>
              </div>
              <div className="flex items-center space-x-2">
                <StopIcon className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">Animation Controls</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 