export default function Loading() {
  return (
    <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-[#e0dcd4] border-t-[#e85d26] animate-spin" />
        <p className="text-sm text-[#888]">Loading…</p>
      </div>
    </div>
  );
}
