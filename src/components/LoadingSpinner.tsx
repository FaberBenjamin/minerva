import Logo from './Logo';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

function LoadingSpinner({ size = 'md', text = 'Betöltés...' }: LoadingSpinnerProps) {
  const logoSizeMap: Record<'sm' | 'md' | 'lg', 'sm' | 'md' | 'lg'> = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  };

  return (
    <div className="text-center py-12">
      <div className="inline-block animate-pulse">
        <Logo size={logoSizeMap[size]} />
      </div>
      {text && (
        <p className="text-minerva-gray-600 mt-4 font-medium">{text}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;
