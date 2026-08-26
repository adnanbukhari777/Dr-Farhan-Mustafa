import React from 'react';

interface WhatsAppIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  'aria-hidden'?: boolean | 'true' | 'false';
  'aria-label'?: string;
}

/**
 * Authentic, recognizable WhatsApp logo SVG component.
 * Standardized with shared .button-icon sizing and preserveAspectRatio="xMidYMid meet"
 * to visually match Lucide button icons (Calendar, Phone, Bot, Arrow).
 */
export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  className = 'button-icon',
  size,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden={ariaHidden ?? (ariaLabel ? undefined : true)}
      aria-label={ariaLabel}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M17.472 14.382c-.301-.15-1.782-.88-2.058-.98-.277-.101-.479-.151-.68.15-.201.3-.779.98-1.005 1.181-.226.201-.453.226-.754.075-.301-.15-1.273-.469-2.425-1.498-.897-.801-1.503-1.79-1.68-2.091-.176-.301-.019-.465.132-.614.136-.135.301-.352.452-.527.15-.176.201-.301.301-.503.101-.201.05-.377-.025-.527-.075-.151-.68-1.638-.93-2.241-.244-.589-.493-.508-.68-.518-.176-.008-.377-.01-.578-.01-.201 0-.528.075-.804.377-.276.301-1.055 1.03-1.055 2.513 0 1.482 1.08 2.914 1.231 3.115.15.201 2.124 3.243 5.147 4.549.719.31 1.28.496 1.718.635.723.23 1.38.197 1.901.12.58-.087 1.782-.728 2.033-1.431.251-.703.251-1.306.176-1.431-.075-.126-.276-.201-.577-.352zm2.083-12.072A11.934 11.934 0 0 0 12.025 0C5.399 0 .007 5.393 0 12.022 0 14.14.553 16.207 1.604 18.028L.069 24l6.108-1.602a11.94 11.94 0 0 0 5.848 1.509h.005c6.623 0 12.018-5.394 12.023-12.024 0-3.21-1.25-6.227-3.52-8.497zm-7.53 20.088h-.004a9.95 9.95 0 0 1-5.071-1.391l-.364-.216-3.771.989.998-3.676-.237-.377a9.948 9.948 0 0 1-1.528-5.352c.005-5.508 4.485-9.988 9.996-9.988a9.932 9.932 0 0 1 7.07 2.932 9.937 9.937 0 0 1 2.929 7.067c-.005 5.509-4.49 9.99-9.997 9.99z" />
    </svg>
  );
};

export default WhatsAppIcon;
