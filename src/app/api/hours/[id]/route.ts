import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { status, comment } = body

  const entry = await prisma.timeEntry.update({
    where: { id: parseInt(id) },
    data: { status, comment },
  })

  await prisma.notification.create({
    data: {
      userId: entry.userId,
      message:
        status === 'APPROVED'
          ? 'Tu registro de horas ha sido aprobado'
          : 'Tu registro de horas ha sido rechazado',
    },
  })

  return NextResponse.json(entry)
}
