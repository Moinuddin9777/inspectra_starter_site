import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const record = {
      email,
      timestamp: new Date().toISOString(),
    };

    const filePath = path.join(process.cwd(), 'waitlist.json');
    
    let waitlist = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      if (fileData) {
        waitlist = JSON.parse(fileData);
      }
    }

    waitlist.push(record);
    fs.writeFileSync(filePath, JSON.stringify(waitlist, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Successfully joined the waitlist' });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
