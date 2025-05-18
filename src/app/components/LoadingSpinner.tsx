const LoadingSpinner = ({ label }: { label: string }) => {
    return (
        <div className="flex flex-row items-center justify-center p-4 gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-sm text-gray-400">{label}...</span>
        </div>
    );
}

export default LoadingSpinner