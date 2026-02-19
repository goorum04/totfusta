import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user')
  const project = searchParams.get('project')
  const status = searchParams.get('status')

  const where: any = {}

  if (session.user.role === 'WORKER') {
    where.userId = parseInt(session.user.id)
  }

  if (user) {
    where.user = { name: { contains: user } }
  }

  if (project) {
    where.project = { name: { contains: project } }
  }

  if (status) {
    where.status = status
  }

  const entries = await prisma.timeEntry.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      user: { select: { name: true } },
      project: { select: { name: true } },
    },
  })

  return NextResponse.json(entries)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'WORKER') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { projectId, date, hours, description } = body

  const entry = await prisma.timeEntry.create({
    data: {
      userId: parseInt(session.user.id),
      projectId,
      date: new Date(date),
      hours,
      description,
    },
  })

  await prisma.notification.create({
    data: {
      userId: 1,
      message: `${session.user.name} ha registrado ${hours}h en ${date}`,
    },
  })

  return NextResponse.json(entry)
}
