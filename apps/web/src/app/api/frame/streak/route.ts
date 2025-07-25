import { FrameRequest, getFrameHtmlResponse } from '@farcaster/frame-sdk';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as FrameRequest;
  // Simple call-to-action frame that opens dapp for now
  const html = getFrameHtmlResponse({
    buttons: [
      {
        label: 'Claim daily streak',
        action: {
          type: 'link',
          url: `${process.env.NEXT_PUBLIC_APP_URL}/?streakClaim=true`
        }
      }
    ],
    image: `${process.env.NEXT_PUBLIC_APP_URL}/streak.png`,
    postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/streak`
  });
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}