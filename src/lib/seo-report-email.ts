export function generateSEOReportEmail(data: {
  domain: string;
  reportDate: string;
  authorityScore: number;
  organicTraffic: number;
  trafficChange: number;
  organicKeywords: number;
  keywordsChange: number;
  backlinks: number;
  backlinksChange: number;
  aiVisibilityScore: number;
  aiMentions: number;
  topKeywords: { keyword: string; position: number; traffic: number; volume: number; change: number }[];
  trafficChannels: { direct: number; ai: number; organic: number; referral: number };
}): string {
  const arrow = (v: number) => v > 0 ? `<span style="color:#10b981">▲ ${v}%</span>` : v < 0 ? `<span style="color:#ef4444">▼ ${Math.abs(v)}%</span>` : '<span style="color:#9ca3af">—</span>';
  const posArrow = (v: number) => v > 0 ? `<span style="color:#10b981">▲${v}</span>` : v < 0 ? `<span style="color:#ef4444">▼${Math.abs(v)}</span>` : '—';
  const date = new Date(data.reportDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const keywordRows = data.topKeywords.map(kw => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #1f2937;color:#e5e7eb;font-size:14px">${kw.keyword}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1f2937;color:#fff;text-align:center;font-weight:600">#${kw.position}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1f2937;color:#e5e7eb;text-align:right">${kw.traffic.toLocaleString()}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1f2937;text-align:right">${posArrow(kw.change)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:640px;margin:0 auto;padding:20px">

  <!-- Header -->
  <div style="text-align:center;padding:30px 0;border-bottom:1px solid #1f2937">
    <h1 style="margin:0;color:#fff;font-size:24px">Agent<span style="color:#37b0c9">AI</span>Brief</h1>
    <p style="margin:8px 0 0;color:#9ca3af;font-size:14px">Weekly SEO Performance Report</p>
  </div>

  <!-- Domain Overview -->
  <div style="padding:24px 0;border-bottom:1px solid #1f2937">
    <h2 style="margin:0 0 4px;color:#37b0c9;font-size:18px">📊 Domain Overview</h2>
    <p style="margin:0 0 16px;color:#9ca3af;font-size:13px">${data.domain} • ${date}</p>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:12px;background:#111827;border-radius:8px;text-align:center;width:20%">
          <div style="color:#9ca3af;font-size:11px;margin-bottom:4px">Authority</div>
          <div style="color:#fff;font-size:22px;font-weight:700">${data.authorityScore}</div>
        </td>
        <td style="width:4px"></td>
        <td style="padding:12px;background:#111827;border-radius:8px;text-align:center;width:20%">
          <div style="color:#9ca3af;font-size:11px;margin-bottom:4px">Traffic</div>
          <div style="color:#fff;font-size:22px;font-weight:700">${data.organicTraffic.toLocaleString()}</div>
          <div style="font-size:12px">${arrow(data.trafficChange)}</div>
        </td>
        <td style="width:4px"></td>
        <td style="padding:12px;background:#111827;border-radius:8px;text-align:center;width:20%">
          <div style="color:#9ca3af;font-size:11px;margin-bottom:4px">Keywords</div>
          <div style="color:#fff;font-size:22px;font-weight:700">${data.organicKeywords.toLocaleString()}</div>
          <div style="font-size:12px">${arrow(data.keywordsChange)}</div>
        </td>
        <td style="width:4px"></td>
        <td style="padding:12px;background:#111827;border-radius:8px;text-align:center;width:20%">
          <div style="color:#9ca3af;font-size:11px;margin-bottom:4px">Backlinks</div>
          <div style="color:#fff;font-size:22px;font-weight:700">${data.backlinks.toLocaleString()}</div>
          <div style="font-size:12px">${arrow(data.backlinksChange)}</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- AI Search Visibility -->
  <div style="padding:24px 0;border-bottom:1px solid #1f2937">
    <h2 style="margin:0 0 16px;color:#37b0c9;font-size:18px">🤖 AI Search Visibility</h2>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:16px;background:#111827;border-radius:8px;text-align:center;width:50%">
          <div style="color:#9ca3af;font-size:12px;margin-bottom:4px">Visibility Score</div>
          <div style="color:#37b0c9;font-size:36px;font-weight:700">${data.aiVisibilityScore}<span style="font-size:16px;color:#9ca3af">/100</span></div>
        </td>
        <td style="width:8px"></td>
        <td style="padding:16px;background:#111827;border-radius:8px;text-align:center;width:50%">
          <div style="color:#9ca3af;font-size:12px;margin-bottom:4px">AI Mentions This Week</div>
          <div style="color:#fff;font-size:36px;font-weight:700">${data.aiMentions}</div>
          <div style="color:#9ca3af;font-size:11px">ChatGPT · Gemini · Perplexity</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Traffic Channels -->
  <div style="padding:24px 0;border-bottom:1px solid #1f2937">
    <h2 style="margin:0 0 16px;color:#37b0c9;font-size:18px">📈 Traffic Channels</h2>
    ${['Organic Search|organic|#10b981', 'Direct|direct|#3b82f6', 'AI Search|ai|#a855f7', 'Referral|referral|#f59e0b'].map(ch => {
      const [label, key, color] = ch.split('|');
      const val = data.trafficChannels[key as keyof typeof data.trafficChannels];
      return `<div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="color:#d1d5db;font-size:13px">${label}</span>
          <span style="color:#fff;font-size:13px;font-weight:600">${val}%</span>
        </div>
        <div style="background:#1f2937;border-radius:4px;height:8px;overflow:hidden">
          <div style="background:${color};height:8px;width:${val}%;border-radius:4px"></div>
        </div>
      </div>`;
    }).join('')}
  </div>

  <!-- Top Keywords -->
  <div style="padding:24px 0;border-bottom:1px solid #1f2937">
    <h2 style="margin:0 0 16px;color:#37b0c9;font-size:18px">🔑 Top Keywords</h2>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="border-bottom:1px solid #374151">
          <th style="padding:8px 12px;text-align:left;color:#9ca3af;font-size:12px;font-weight:500">Keyword</th>
          <th style="padding:8px 12px;text-align:center;color:#9ca3af;font-size:12px;font-weight:500">Pos</th>
          <th style="padding:8px 12px;text-align:right;color:#9ca3af;font-size:12px;font-weight:500">Traffic</th>
          <th style="padding:8px 12px;text-align:right;color:#9ca3af;font-size:12px;font-weight:500">Δ</th>
        </tr>
      </thead>
      <tbody>${keywordRows}</tbody>
    </table>
  </div>

  <!-- Takeaways -->
  <div style="padding:24px 0;border-bottom:1px solid #1f2937">
    <h2 style="margin:0 0 16px;color:#37b0c9;font-size:18px">💡 Key Takeaways</h2>
    <ul style="margin:0;padding:0 0 0 20px;color:#d1d5db;font-size:14px;line-height:1.8">
      <li>Organic traffic is <strong style="color:#10b981">up ${data.trafficChange}%</strong> week-over-week — your content strategy is working.</li>
      <li>AI search now drives <strong style="color:#a855f7">${data.trafficChannels.ai}%</strong> of your traffic. This channel is growing fast.</li>
      <li>Your AI Visibility Score of <strong style="color:#37b0c9">${data.aiVisibilityScore}/100</strong> means you appear in most relevant AI responses.</li>
      <li>Focus on keywords ranked #4-10 — small improvements here unlock significant traffic gains.</li>
    </ul>
  </div>

  <!-- Footer -->
  <div style="padding:24px 0;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0 0 8px">
      Powered by <strong style="color:#fff">AgentAIBrief</strong> × <strong style="color:#37b0c9">Fox Homes</strong>
    </p>
    <p style="color:#6b7280;font-size:11px;margin:0">
      You're receiving this because you're subscribed to the Inner Circle plan.<br>
      <a href="https://agentaibrief.com/preferences" style="color:#37b0c9;text-decoration:none">Manage preferences</a> · 
      <a href="https://agentaibrief.com/pro-dashboard" style="color:#37b0c9;text-decoration:none">View full dashboard</a>
    </p>
  </div>

</div>
</body>
</html>`;
}
