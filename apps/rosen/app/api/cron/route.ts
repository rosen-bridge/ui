import { NextResponse } from 'next/server';

import { data, singletonInstance } from '../data';

export async function GET() {
  data[Math.random()] = Date.now().toString();
  (globalThis as any)['fakedata'] ||= {};
  (globalThis as any)['fakedata'][Math.random()] = Date.now().toString();
  singletonInstance.setData({
    [Math.random()]: Date.now().toString(),
  });
  return NextResponse.json({ data: 'Helo, World! This is CRON route.' });
}
