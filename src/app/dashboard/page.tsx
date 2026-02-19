import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'

async function getDashboardData(userId: string, role: string) {
  if (role === 'ADMIN') {
    const [pendingCount, totalHours, workersCount, projectsCount] = await Promise.all([
      prisma.timeEntry.count({ where: { status: 'PENDING' } }),
      prisma.timeEntry.aggregate({
        where: { status: 'APPROVED' },
        _sum: { hours: true },
      }),
      prisma.user.count({ where: { active: true, role: 'WORKER' } }),
      prisma.project.count({ where: { active: true } }),
    ])

    const recentEntries = await prisma.timeEntry.findMany({
      where: { status: 'PENDING' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        project: { select: { name: true } },
      },
    })

    return {
      pendingCount,
      totalHours: totalHours._sum.hours || 0,
      workersCount,
      projectsCount,
      recentEntries,
    }
  } else {
    const [myHours, pendingCount, approvedHours] = await Promise.all([
      prisma.timeEntry.count({ where: { userId: parseInt(userId) } }),
      prisma.timeEntry.count({
        where: { userId: parseInt(userId), status: 'PENDING' },
      }),
      prisma.timeEntry.aggregate({
        where: { userId: parseInt(userId), status: 'APPROVED' },
        _sum: { hours: true },
      }),
    ])

    return {
      myHours,
      pendingCount,
      approvedHours: approvedHours._sum.hours || 0,
    }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const data = await getDashboardData(session.user.id, session.user.role)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {session.user.name}
        </h1>

        {session.user.role === 'ADMIN' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">
                  Horas Pendientes
                </h3>
                <p className="text-3xl font-bold text-orange-600">
                  {data.pendingCount}
                </p>
                <Link
                  href="/hours/pending"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver pendientes
                </Link>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Horas Aprobadas
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {data.totalHours}h
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">
                  Trabajadores Activos
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {data.workersCount}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">
                  Proyectos Activos
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  {data.projectsCount}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Últimos Registros Pendientes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Trabajador
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Proyecto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Horas
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Descripción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {'recentEntries' in data && data.recentEntries && data.recentEntries.length > 0 ? (
                      data.recentEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-4 py-3 text-sm">{entry.user.name}</td>
                          <td className="px-4 py-3 text-sm">{entry.project.name}</td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(entry.date).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-4 py-3 text-sm">{entry.hours}h</td>
                          <td className="px-4 py-3 text-sm max-w-xs truncate">
                            {entry.description}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          No hay registros pendientes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">
                Mis Registros
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {'myHours' in data ? data.myHours : 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">
                Pendientes de Aprobación
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {'pendingCount' in data ? data.pendingCount : 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">
                Total Horas Aprobadas
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {'approvedHours' in data ? data.approvedHours : 0}h
              </p>
            </div>
          </div>
        )}

        {session.user.role === 'WORKER' && (
          <div className="flex gap-4">
            <Link
              href="/hours/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Registrar Horas
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
