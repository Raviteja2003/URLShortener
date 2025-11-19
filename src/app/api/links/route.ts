// src/app/api/links/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  targetUrl: z.string().url(),
  code: z
    .string()
    .regex(/^[A-Za-z0-9]{6,8}$/)
    .optional(),
});

function randomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export async function GET() {
  const links = await prisma.link.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(links);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    // This is the only line that changed
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { targetUrl, code } = parsed.data;
  const finalCode = code || randomCode();

  try {
    const link = await prisma.link.create({
      data: { code: finalCode, targetUrl },
    });
    return NextResponse.json(link, { status: 201 });
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'This short code is already taken' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}