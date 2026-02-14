'use client';

interface TrendingBadgeProps {
  score: number;
}

export function TrendingBadge({ score }: TrendingBadgeProps) {
  // Determine heat level and visual
  const getHeatLevel = (score: number) => {
    if (score >= 80) return { flames: 5, color: 'text-red-500', bg: 'bg-red-500/10', label: 'HOT' };
    if (score >= 60) return { flames: 4, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'TRENDING' };
    if (score >= 40) return { flames: 3, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'WARM' };
    if (score >= 20) return { flames: 2, color: 'text-[#e85d26]', bg: 'bg-[#e85d26]/10', label: 'NEW' };
    return { flames: 1, color: 'text-[#666]', bg: 'bg-gray-400/10', label: '' };
  };

  const heat = getHeatLevel(score);
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${heat.bg}`}>
      <span className={heat.color}>
        {'🔥'.repeat(heat.flames)}
      </span>
      {heat.label && (
        <span className={`text-xs font-semibold ${heat.color}`}>
          {heat.label}
        </span>
      )}
      <span className="text-xs text-[#888] ml-1">{score}</span>
    </div>
  );
}
