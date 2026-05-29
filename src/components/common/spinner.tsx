import React from 'react';

export interface SpinnerProps {
  /**
   * Size of the spinner.
   * - 'sm': Small spinner (default width/height: 1.2rem)
   * - 'md': Medium spinner (standard Bootstrap spinner-border)
   * - 'lg': Large spinner (default width/height: 3rem)
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Bootstrap/Tailwind text color class.
   * @default 'text-emerald-500'
   */
  color?: string;
  /**
   * Additional custom CSS classes.
   */
  className?: string;
  /**
   * Accessible description for screen readers.
   * @default 'Chargement...'
   */
  label?: string;
  /**
   * Additional inline styles.
   */
  style?: React.CSSProperties;
}

export default function Spinner({
  size = 'md',
  color = 'text-emerald-500',
  className = '',
  label = 'Chargement...',
  style,
}: SpinnerProps) {
  let sizeClass = '';
  const customStyle: React.CSSProperties = { ...style };

  if (size === 'sm') {
    sizeClass = 'spinner-border-sm';
    if (!customStyle.width && !customStyle.height) {
      customStyle.width = '1.2rem';
      customStyle.height = '1.2rem';
    }
  } else if (size === 'lg') {
    if (!customStyle.width && !customStyle.height) {
      customStyle.width = '3rem';
      customStyle.height = '3rem';
    }
  }

  return (
    <div
      className={`spinner-border ${sizeClass} ${color} ${className}`.trim()}
      role="status"
      style={customStyle}
    >
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
