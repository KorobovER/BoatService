

import React from 'react';

export type IconCategory = 'ui' | 'alerts' | 'boats' | 'services' | 'logos';

interface IconProps extends React.HTMLAttributes<HTMLImageElement> {
  name: string;
  category?: IconCategory;
  size?: number;
  color?: string;
  className?: string;
  stroke?: string;
  viewBox?: string;
}

/**
 * Icon component for displaying SVG icons from categorized folders
 * @param name - Icon name without extension
 * @param category - Category of the icon (ui, alerts, boats, services, logos)
 * @param size - Size of the icon in pixels
 * @param color - Color of the icon (CSS color)
 * @param className - Additional CSS classes
 * @param stroke - Stroke color (CSS color)
 * @param viewBox - Custom viewBox for the SVG
 */
const Icon = ({ 
  name, 
  category = 'ui', 
  size = 24, 
  color = 'currentColor', 
  className, 
  stroke, 
  viewBox = '0 0 24 24',
  ...props 
}: IconProps) => {
  // Формируем путь к иконке на основе категории
  const iconPath = `/assets/images/icons/${category}/${name}.svg`;
  
  // Для обратной совместимости - если иконка не найдена в категории, 
  // используем старый путь
  const [useFallback, setUseFallback] = React.useState(false);
  const fallbackPath = `/assets/images/${name}.svg`;
  
  // Обработчик ошибки загрузки SVG
  const handleError = () => {
    setUseFallback(true);
  };
  
  return (
    <img
      src={useFallback ? fallbackPath : iconPath}
      width={size}
      height={size}
      className={className}
      onError={handleError}
      style={{ 
        fill: color, 
        stroke: stroke,
        ...props.style
      }}
      alt={`${category}-${name}`}
      {...props}
    />
  );
};

export default Icon;