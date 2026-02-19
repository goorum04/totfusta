import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      active: true,
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { name, email, password, role } = body
  const username = body.username || name.toLowerCase().replace(/\s+/g, '')

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      username,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      active: true,
    },
  })

  return NextResponse.json(user)
}
