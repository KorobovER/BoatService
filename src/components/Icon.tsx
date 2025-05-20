interface IconProps {
    name: string;
    size?: number;
    color?: string;
    className?: string;
    stroke?: string;
    viewBox?: string;
}

const Icon = ({ name, size = 24, color = 'currentColor', className, stroke, viewBox, ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      fill={color}
      stroke={stroke}
      viewBox={viewBox}
      {...props}
    >
      <use xlinkHref={`/assets/images/allIcons.svg#${name}`} />
    </svg>
  );
};

export default Icon;