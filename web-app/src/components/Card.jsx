export const Card = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`card ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
