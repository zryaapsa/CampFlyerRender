function FullScreenLoader({ message = "Sebentar bang..." }) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white border-opacity-60"></div>
      <p className="text-white mt-4 text-lg">{message}</p>
    </div>
  );
}

export default FullScreenLoader;
