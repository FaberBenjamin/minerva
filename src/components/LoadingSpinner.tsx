interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

function LoadingSpinner({ size = 'md', text = 'Betöltés...' }: LoadingSpinnerProps) {
  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="text-center py-12">
      <div className="inline-block">
        <div
          className={`${sizeClasses[size]} border-4 border-minerva-gray-200 border-t-minerva-gray-600 rounded-full animate-spin`}
        ></div>
      </div>
      {text && (
        <p className="text-minerva-gray-600 mt-4 font-medium">{text}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;
