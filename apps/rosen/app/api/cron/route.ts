import { NextResponse } from 'next/server';

import { data, singletonInstance } from '../data';
import { getDatabaseClient } from '../databaseClient';

export async function GET() {
  data[Math.random()] = Date.now().toString();
  (globalThis as any)['fakedata'] ||= {};
  (globalThis as any)['fakedata'][Math.random()] = Date.now().toString();
  singletonInstance.setData({
    [Math.random()]: Date.now().toString(),
  });
  getDatabaseClient().instance.setData({
    [Math.random()]: Date.now().toString(),
  });
  return NextResponse.json({
    data,
    globalThis: (globalThis as any)['fakedata'],
    singletonData: singletonInstance.getData(),
    getDatabaseClient: getDatabaseClient().instance.getData(),
  });
}
