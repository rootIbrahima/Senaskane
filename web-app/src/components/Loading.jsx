export const Loading = ({ text = 'Chargement...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-600">{text}</p>
    </div>
  );
};
