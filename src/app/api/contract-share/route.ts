import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

const SHARE_DIR = path.join(process.cwd(), '.data', 'shared-comparisons');

async function ensureDir() {
  try {
    await fs.mkdir(SHARE_DIR, { recursive: true });
  } catch { /* exists */ }
}

// POST — save comparison and return shareable ID
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = uuidv4().slice(0, 12);
    
    await ensureDir();
    await fs.writeFile(
      path.join(SHARE_DIR, `${id}.json`),
      JSON.stringify({ ...body, createdAt: new Date().toISOString() }),
      'utf-8'
    );

    return NextResponse.json({ id, url: `/shared/${id}` });
  } catch (error) {
    console.error('Share error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

// GET — retrieve shared comparison
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id || !/^[a-z0-9-]+$/i.test(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await ensureDir();
    const filePath = path.join(SHARE_DIR, `${id}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
