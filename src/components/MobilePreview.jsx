import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

export default function MobilePreview({ html }) {
  const [device, setDevice] = useState('desktop');

  const deviceSizes = {
    mobile: { width: '375px', height: '667px', icon: Smartphone },
    tablet: { width: '768px', height: '1024px', icon: Tablet },
    desktop: { width: '100%', height: '100%', icon: Monitor }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d0d0d]">
      <div className="flex items-center justify-center gap-2 py-2 border-b border-[#1a1a1a]">
        {Object.keys(deviceSizes).map((key) => {
          const Icon = deviceSizes[key].icon;
          return (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className={`p-2 rounded-md transition-colors ${
                device === key
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
              title={key}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div
          className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
          style={{
            width: deviceSizes[device].width,
            height: deviceSizes[device].height,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
          <iframe
            srcDoc={html}
            className="w-full h-full border-0"
            title="Mobile Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          />
        </div>
      </div>
    </div>
  );
}