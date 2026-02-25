import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (!body.durationMonths) {
            return NextResponse.json({ error: 'Duration is required' }, { status: 400 });
        }

        const db = await getDb();

        // 1. Fetch current member to understand their current expiry
        const member = await db.get('SELECT * FROM Member WHERE id = ?', [id]);
        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        const addedDuration = parseInt(body.durationMonths, 10);

        // Calculate current expiry date
        const start = new Date(member.paymentDate);
        const currentExpiry = new Date(start);
        currentExpiry.setMonth(currentExpiry.getMonth() + member.durationMonths);
        const now = new Date();

        let newPaymentDate;
        let newDuration;

        // If they are already expired, the new subscription starts today
        if (currentExpiry < now) {
            newPaymentDate = now.toISOString().split('T')[0];
            newDuration = addedDuration;
        }
        // If they are active, we keep their original payment date and just add to the duration
        else {
            newPaymentDate = member.paymentDate;
            newDuration = member.durationMonths + addedDuration;
        }

        await db.run(`
            UPDATE Member 
            SET paymentDate = ?, durationMonths = ?
            WHERE id = ?
        `, [newPaymentDate, newDuration, id]);

        return NextResponse.json({ success: true, newExpiry: newDuration });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to renew member' }, { status: 500 });
    }
}
