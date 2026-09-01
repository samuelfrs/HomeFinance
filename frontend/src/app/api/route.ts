import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    name: 'HomeFinance Full-Stack Next.js API',
    message: 'API do HomeFinance está ativa e operando com sucesso no Next.js!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
