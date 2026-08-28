import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req, { params }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { action, reasoning } = await req.json();

  if (!action) {
    return NextResponse.json({ error: 'Resolution action is required' }, { status: 400 });
  }

  const exception = await prisma.exception.findUnique({
    where: { id },
    include: { reconciliation: true },
  });

  if (!exception) {
    return NextResponse.json({ error: 'Exception not found' }, { status: 404 });
  }

  const now = new Date();

  await prisma.exception.update({
    where: { id },
    data: { status: 'resolved', resolvedAt: now },
  });

  await prisma.reconciliation.update({
    where: { id: exception.reconciliationId },
    data: {
      status: 'resolved',            // ← naya — dashboard stats mein reflect hoga
      resolvedBy: session.user.email,
      resolutionAction: action,
      resolvedAt: now,
    },
  });

  await prisma.auditLog.create({
    data: {
      reconciliationId: exception.reconciliationId,
      action: 'EXCEPTION_RESOLVED',
      actor: session.user.email,
      details: {
        exceptionId: id,
        category: exception.category,
        resolutionAction: action,
        reasoning: reasoning || null,
        resolvedAt: now.toISOString(),
      },
    },
  });

  return NextResponse.json({ success: true, resolvedBy: session.user.email, resolvedAt: now });
}