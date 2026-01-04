interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 80,
  xl: 120,
};

function Logo({ size = 'md', className = '' }: LogoProps) {
  const dimension = sizeMap[size];

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Owl Head (Circle) */}
      <circle
        cx="50"
        cy="45"
        r="35"
        fill="#2d2d2d"
        opacity="0.1"
      />

      {/* Left Ear (Triangle) */}
      <path
        d="M 20 20 L 15 35 L 30 30 Z"
        fill="#2d2d2d"
      />

      {/* Right Ear (Triangle) */}
      <path
        d="M 80 20 L 85 35 L 70 30 Z"
        fill="#2d2d2d"
      />

      {/* Left Eye Background (Circle) */}
      <circle
        cx="35"
        cy="42"
        r="12"
        fill="#6b6b6b"
      />

      {/* Right Eye Background (Circle) */}
      <circle
        cx="65"
        cy="42"
        r="12"
        fill="#6b6b6b"
      />

      {/* Left Eye Pupil (Circle) */}
      <circle
        cx="35"
        cy="42"
        r="6"
        fill="#2d2d2d"
      />

      {/* Right Eye Pupil (Circle) */}
      <circle
        cx="65"
        cy="42"
        r="6"
        fill="#2d2d2d"
      />

      {/* Left Eye Highlight */}
      <circle
        cx="37"
        cy="40"
        r="2"
        fill="#ffffff"
      />

      {/* Right Eye Highlight */}
      <circle
        cx="67"
        cy="40"
        r="2"
        fill="#ffffff"
      />

      {/* Beak (Triangle) */}
      <path
        d="M 50 48 L 45 58 L 55 58 Z"
        fill="#6b6b6b"
      />

      {/* Body (Circle) */}
      <circle
        cx="50"
        cy="75"
        r="20"
        fill="#2d2d2d"
        opacity="0.15"
      />

      {/* Left Wing (Triangle) */}
      <path
        d="M 30 70 L 20 80 L 32 82 Z"
        fill="#6b6b6b"
      />

      {/* Right Wing (Triangle) */}
      <path
        d="M 70 70 L 80 80 L 68 82 Z"
        fill="#6b6b6b"
      />

      {/* Chest Pattern (Small triangles for texture) */}
      <path
        d="M 50 65 L 47 70 L 53 70 Z"
        fill="#2d2d2d"
        opacity="0.3"
      />
      <path
        d="M 50 72 L 47 77 L 53 77 Z"
        fill="#2d2d2d"
        opacity="0.3"
      />
    </svg>
  );
}

export default Logo;
