// src/app/api/links/[code]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.pathname.split('/').pop();

  if (!code) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(link);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const code = url.pathname.split('/').pop();

  if (!code) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await prisma.link.delete({ where: { code } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}