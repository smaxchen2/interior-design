import { type ReactNode } from 'react';

interface CanvasWrapperProps {
  children: ReactNode;
}

export default function CanvasWrapper({ children }: CanvasWrapperProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
}
