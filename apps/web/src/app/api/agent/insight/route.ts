import { NextRequest } from 'next/server';
import { runAgent } from '@/lib/agent';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  try {
    const result = await runAgent(prompt);
    return Response.json({ ok: true, result });
  } catch (e:any) {
    return Response.json({ ok:false, error: e.message }, { status: 500 });
  }
}