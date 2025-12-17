import React from 'react';

export default function AppPreview({ html }) {
  return (
    <div className="w-full h-full bg-white">
      <iframe
        srcDoc={html}
        className="w-full h-full border-0"
        title="App Preview"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}