import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Creando usuarios iniciales...')

  const users = [
    { username: 'diogo', email: 'diogo@totfusta.com', password: 'diogo123', name: 'Diogo', role: 'ADMIN' },
    { username: 'damian', email: 'damian@totfusta.com', password: 'damian123', name: 'Damian', role: 'WORKER' },
    { username: 'elias', email: 'elias@totfusta.com', password: 'elias123', name: 'Elias', role: 'WORKER' },
    { username: 'luis', email: 'luis@totfusta.com', password: 'luis123', name: 'Luis', role: 'WORKER' },
  ]

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10)
    await prisma.user.upsert({
      where: { username: u.username },
      update: { password: hash },
      create: { 
        username: u.username,
        email: u.email, 
        password: hash, 
        name: u.name, 
        role: u.role 
      },
    })
    console.log(`✓ ${u.username}`)
  }

  console.log('\n✅ Usuarios creados correctamente!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
