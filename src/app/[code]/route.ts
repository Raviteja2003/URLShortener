// src/app/[code]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.pathname.slice(1); // remove leading "/"

  if (!code || code.includes('/')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const link = await prisma.link.findUnique({
    where: { code },
    select: { targetUrl: true },
  });

  if (!link) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Increment clicks
  await prisma.link.update({
    where: { code },
    data: {
      clicks: { increment: 1 },
      lastClicked: new Date(),
    },
  });

  return NextResponse.redirect(link.targetUrl);
}