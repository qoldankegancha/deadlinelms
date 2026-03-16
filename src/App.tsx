/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Minus, 
  Plus, 
  Download, 
  Printer, 
  RotateCw, 
  MoreVertical,
  ArrowUpToLine,
  Maximize
} from 'lucide-react';

// Import all images from the src/img folder
const imageModules = import.meta.glob('./img/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
const imageUrls = Object.values(imageModules) as string[];

export default function App() {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const pages = imageUrls.length > 0 ? imageUrls : [];

  const handleZoomOut = () => setZoom(z => Math.max(10, z - 10));
  const handleZoomIn = () => setZoom(z => Math.min(500, z + 10));
  const handleRotate = () => setRotation(r => (r + 90) % 360);

  // Handle scroll to update current page
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    
    const pageElements = containerRef.current.querySelectorAll('.pdf-page');
    let current = 1;
    pageElements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      // If the top of the page is above the middle of the viewport
      if (rect.top < clientHeight / 2 && rect.bottom > clientHeight / 2) {
        current = index + 1;
      }
    });
    setCurrentPage(current);
  };

  const scrollToPage = (pageNumber: number) => {
    if (!containerRef.current) return;
    const pageElements = containerRef.current.querySelectorAll('.pdf-page');
    const targetPage = pageElements[pageNumber - 1];
    if (targetPage) {
      targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setCurrentPage(val);
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      let target = currentPage;
      if (target < 1) target = 1;
      if (target > Math.max(1, pages.length)) target = Math.max(1, pages.length);
      setCurrentPage(target);
      scrollToPage(target);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#525659] overflow-hidden font-sans selection:bg-blue-200">
      {/* Toolbar - matches Chrome PDF viewer */}
      <div className="h-14 bg-[#323639] text-[#f1f3f4] flex items-center justify-between px-4 shadow-md z-10 shrink-0">
        <div className="flex items-center gap-4 w-1/3">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Sidebar">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="truncate text-[15px] font-medium tracking-wide">document.pdf</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 w-1/3">
          <div className="flex items-center gap-2 bg-[#171717] rounded px-2 py-1 border border-transparent focus-within:border-blue-500 transition-colors">
            <input 
              type="number" 
              value={currentPage}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputKeyDown}
              className="w-8 bg-transparent text-right outline-none text-[13px] text-white"
              min={1}
              max={Math.max(1, pages.length)}
            />
            <span className="text-[13px] text-[#9aa0a6] pr-1">/ {Math.max(1, pages.length)}</span>
          </div>
          
          <div className="w-px h-5 bg-[#5f6368] mx-2"></div>
          
          <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Zoom out">
            <Minus size={18} />
          </button>
          <span className="text-[13px] w-12 text-center font-medium">{zoom}%</span>
          <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Zoom in">
            <Plus size={18} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-1 w-1/3">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block" title="Fit to screen">
            <Maximize size={20} />
          </button>
          <button onClick={handleRotate} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Rotate">
            <RotateCw size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Download">
            <Download size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Print">
            <Printer size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors ml-2" title="More actions">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-auto relative custom-scrollbar"
        onScroll={handleScroll}
      >
        <div className="flex flex-col items-center py-6 min-h-full w-full">
          {pages.length > 0 ? (
            pages.map((src, index) => (
              <div 
                key={index} 
                className="pdf-page mb-4 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.3),0_0_40px_rgba(0,0,0,0.1)_inset] relative flex-shrink-0"
                style={{ 
                  width: `${800 * (zoom / 100)}px`,
                  minHeight: `${1131 * (zoom / 100)}px`, // A4 aspect ratio roughly
                  transition: 'width 0.2s ease-out, min-height 0.2s ease-out',
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                <img 
                  src={src} 
                  alt={`Page ${index + 1}`} 
                  className="w-full h-full object-contain block pointer-events-none"
                  draggable={false}
                />
              </div>
            ))
          ) : (
            <div 
              className="pdf-page bg-white shadow-[0_1px_4px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center text-[#5f6368] p-12 text-center relative"
              style={{ 
                width: `${800 * (zoom / 100)}px`,
                height: `${1131 * (zoom / 100)}px`,
                transition: 'width 0.2s ease-out, height 0.2s ease-out'
              }}
            >
              <div className="max-w-md border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50">
                <h2 className="text-2xl font-bold mb-4 text-[#202124]">No pages found</h2>
                <p className="mb-6 text-[15px]">To display pages in this PDF viewer:</p>
                <ol className="text-left list-decimal pl-6 space-y-3 mb-8 text-[14px]">
                  <li>Open the file explorer on the left side of AI Studio</li>
                  <li>Upload your images to the <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800 font-mono text-xs">src/img</code> folder</li>
                  <li>The viewer will automatically display them as PDF pages</li>
                </ol>
                <p className="text-xs text-[#80868b] uppercase tracking-wider font-semibold">Supported formats: JPG, PNG, WEBP</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

