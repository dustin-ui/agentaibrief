export default function VideosLoading() {
  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-10 w-2/3 max-w-md bg-[#e0dcd4] rounded animate-pulse mb-4" />
        <div className="h-5 w-1/2 max-w-sm bg-[#e0dcd4] rounded animate-pulse mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-[#e0dcd4] bg-[#f0ece4]">
              <div className="aspect-video bg-[#e0dcd4] animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-[#e0dcd4] rounded animate-pulse" />
                <div className="h-3 w-full bg-[#e0dcd4] rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-[#e0dcd4] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
