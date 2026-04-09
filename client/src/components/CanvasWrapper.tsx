/**
 * CanvasWrapper - 解決 R3F Canvas 事件攔截問題
 * R3F 的 Canvas 會在內部建立 wrapper divs，這些 divs 會攔截 pointer events
 * 此組件在 Canvas 掛載後，將 wrapper divs 的 pointer-events 設為 none
 * 只保留 canvas 元素本身的 pointer-events: auto（用於 OrbitControls）
 */
import { useEffect, useRef, type ReactNode } from 'react';

interface CanvasWrapperProps {
  children: ReactNode;
}

export default function CanvasWrapper({ children }: CanvasWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    // R3F creates: our-div > div(position:relative) > div > canvas
    // We need to set pointer-events:none on the R3F internal divs
    // and pointer-events:auto only on the canvas
    const observer = new MutationObserver(() => {
      const canvas = wrapperRef.current?.querySelector('canvas');
      if (canvas) {
        // Walk up from canvas to our wrapper, setting pe:none on intermediary divs
        let el = canvas.parentElement;
        while (el && el !== wrapperRef.current) {
          el.style.pointerEvents = 'none';
          el = el.parentElement;
        }
        // Canvas itself needs pointer-events for OrbitControls
        canvas.style.pointerEvents = 'auto';
        observer.disconnect();
      }
    });

    observer.observe(wrapperRef.current, { childList: true, subtree: true });

    // Also try immediately in case canvas is already mounted
    const canvas = wrapperRef.current.querySelector('canvas');
    if (canvas) {
      let el = canvas.parentElement;
      while (el && el !== wrapperRef.current) {
        el.style.pointerEvents = 'none';
        el = el.parentElement;
      }
      canvas.style.pointerEvents = 'auto';
      observer.disconnect();
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      {children}
    </div>
  );
}
