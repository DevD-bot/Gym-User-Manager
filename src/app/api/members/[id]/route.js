import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (!body.name || !body.phone) {
            return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
        }

        const db = await getDb();

        const member = await db.get('SELECT * FROM Member WHERE id = ?', [id]);
        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        await db.run(`
            UPDATE Member 
            SET name = ?, phone = ?, trainer = ?
            WHERE id = ?
        `, [body.name, body.phone, body.trainer || null, id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const db = await getDb();

        const member = await db.get('SELECT * FROM Member WHERE id = ?', [id]);
        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        await db.run('DELETE FROM Member WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
    }
}
