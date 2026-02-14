import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NOTIFY_TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) return NextResponse.json({ ok: true });

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `👤 <b>New Free Signup!</b>\n\n${name || 'Someone'} (${email}) just created an account on AgentAIBrief.`,
        parse_mode: 'HTML',
      }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // don't block signup on notification failure
  }
}
