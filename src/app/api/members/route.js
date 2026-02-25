import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await getDb();
        const members = await db.all('SELECT * FROM Member ORDER BY createdAt DESC');
        return NextResponse.json(members);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        // Validate inputs
        if (!data.name || !data.phone || !data.paymentDate || !data.durationMonths) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDb();
        // generate simple random ID
        const id = Math.random().toString(36).substring(2, 10);
        const createdAt = new Date().toISOString();

        await db.run(`
      INSERT INTO Member (id, name, phone, paymentDate, durationMonths, imageUrl, trainer, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, data.name, data.phone, data.paymentDate, parseInt(data.durationMonths, 10), data.imageUrl || null, data.trainer || null, createdAt]);

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
    }
}
