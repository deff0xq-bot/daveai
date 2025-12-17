import React, { useRef, useEffect, useState } from 'react';

export default function InteractivePreview({ html, editMode, onElementSelect }) {
  const iframeRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);

  useEffect(() => {
    if (!iframeRef.current || !editMode) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    const handleClick = (e) => {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target;
      
      // Удаляем предыдущее выделение
      const prevSelected = iframeDoc.querySelector('.dave-selected');
      if (prevSelected) {
        prevSelected.classList.remove('dave-selected');
        prevSelected.style.outline = '';
      }

      // Добавляем выделение
      target.classList.add('dave-selected');
      target.style.outline = '2px solid #3b82f6';
      target.style.cursor = 'move';
      
      setSelectedElement(target);

      const elementInfo = {
        tag: target.tagName.toLowerCase(),
        text: target.innerText?.substring(0, 100) || '',
        src: target.src || '',
        styles: {
          fontSize: window.getComputedStyle(target).fontSize,
          color: window.getComputedStyle(target).color,
          backgroundColor: window.getComputedStyle(target).backgroundColor,
          width: target.offsetWidth,
          height: target.offsetHeight
        },
        element: target
      };

      onElementSelect(elementInfo);
    };

    // Добавляем стили для редактирования
    const style = iframeDoc.createElement('style');
    style.textContent = `
      body * {
        position: relative !important;
      }
      body *:hover {
        outline: 1px dashed #3b82f6 !important;
        cursor: pointer !important;
      }
      .dave-selected {
        outline: 2px solid #3b82f6 !important;
      }
    `;
    iframeDoc.head.appendChild(style);

    iframeDoc.addEventListener('click', handleClick, true);

    return () => {
      iframeDoc.removeEventListener('click', handleClick, true);
    };
  }, [editMode, onElementSelect]);

  return (
    <div className="w-full h-full bg-white">
      <iframe
        ref={iframeRef}
        srcDoc={html}
        className="w-full h-full border-0"
        title="Interactive Preview"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
      />
    </div>
  );
}