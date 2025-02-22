import React from 'react';
import { PhysicsConfig } from '../types';
import { Wind, Droplets, ArrowDown, Repeat } from 'lucide-react';

interface PhysicsControlsProps {
  config: PhysicsConfig;
  onConfigChange: (config: PhysicsConfig) => void;
  onReset: () => void;
}

export const PhysicsControls: React.FC<PhysicsControlsProps> = ({
  config,
  onConfigChange,
  onReset,
}) => {
  const handleChange = (key: keyof PhysicsConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({
      ...config,
      [key]: parseFloat(e.target.value),
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold mb-4">Physics Controls</h2>
      
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2">
            <ArrowDown className="w-4 h-4" />
            <span>Gravity</span>
          </label>
          <input
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={config.gravity}
            onChange={handleChange('gravity')}
            className="w-full"
          />
          <span className="text-sm text-gray-600">{config.gravity.toFixed(1)} m/s²</span>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            <span>Air Resistance</span>
          </label>
          <input
            type="range"
            min="0"
            max="0.1"
            step="0.001"
            value={config.airResistance}
            onChange={handleChange('airResistance')}
            className="w-full"
          />
          <span className="text-sm text-gray-600">{config.airResistance.toFixed(3)}</span>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <Wind className="w-4 h-4" />
            <span>Wind Speed</span>
          </label>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={config.windSpeed}
            onChange={handleChange('windSpeed')}
            className="w-full"
          />
          <span className="text-sm text-gray-600">{config.windSpeed.toFixed(1)} m/s</span>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <Repeat className="w-4 h-4" />
            <span>Elasticity</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={config.elasticity}
            onChange={handleChange('elasticity')}
            className="w-full"
          />
          <span className="text-sm text-gray-600">{config.elasticity.toFixed(2)}</span>
        </div>

        <button
          onClick={onReset}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Reset Ball
        </button>
      </div>
    </div>
  );
};