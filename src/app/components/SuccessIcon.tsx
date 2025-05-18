const SuccessIcon = ({ label }: { label: string }) => {
    return (
      <div className="flex flex-row items-center justify-center p-4 gap-4">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-4 border-green-500 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="w-4 h-4 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="3" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
    );
  };

  export default SuccessIcon;