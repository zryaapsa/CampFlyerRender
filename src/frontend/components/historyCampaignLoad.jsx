const HistoryCampaignLoad = () => (
    
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-gray-700/50 h-full flex flex-col shimmer-effect">
        {/* p : Setiap elemen placeholder diberi warna dasar */}
        <div className="bg-gray-700 h-48"></div>
        <div className="p-6 flex-1 flex flex-col">
            <div className="h-16 mb-4">
                <div className="h-6 bg-gray-700 rounded w-3/4"></div>
            </div>
            <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="flex justify-between">
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                </div>
            </div>
            <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-gray-700 rounded w-1/4"></div>
                <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            </div>
            <div className="flex justify-center mb-4">
                <div className="bg-gray-700 p-2 rounded-lg w-24 h-24"></div>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-700/50">
                <div className="h-5 bg-gray-700 rounded w-1/3"></div>
            </div>
        </div>
    </div>
);

export default HistoryCampaignLoad;