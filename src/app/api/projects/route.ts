import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const projects = await prisma.project.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description } = body

  const project = await prisma.project.create({
    data: { name, description },
  })

  return NextResponse.json(project)
}
