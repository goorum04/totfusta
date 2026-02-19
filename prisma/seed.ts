import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Creando usuarios...')

  const users = [
    { username: 'diogo', email: 'diogo@empresa.com', password: 'diogo123', name: 'Diogo', role: 'ADMIN' },
    { username: 'damian', email: 'damian@empresa.com', password: 'damian123', name: 'Damian', role: 'WORKER' },
    { username: 'elias', email: 'elias@empresa.com', password: 'elias123', name: 'Elias', role: 'WORKER' },
    { username: 'luis', email: 'luis@empresa.com', password: 'luis123', name: 'Luis', role: 'WORKER' },
  ]

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10)
    await prisma.user.create({
      data: { 
        username: u.username,
        email: u.email, 
        password: hash, 
        name: u.name, 
        role: u.role 
      },
    })
    console.log(`✓ ${u.username} - ${u.password}`)
  }

  console.log('\nCreando proyectos...')

  const projects = [
    { name: 'Obra Centro Comercial', description: 'Reforma del centro comercial principal' },
    { name: 'Edificio Residencial', description: 'Construcción de edificio de viviendas' },
    { name: 'Oficinas Empresariales', description: 'Remodelación de oficinas' },
  ]

  for (const p of projects) {
    await prisma.project.create({ data: p })
    console.log(`✓ ${p.name}`)
  }

  console.log('\n✅ Seed completado!')
  console.log('\n📋 Credenciales de acceso:')
  console.log('═'.repeat(50))
  console.log('ADMIN: diogo / diogo123')
  console.log('─'.repeat(50))
  console.log('TRABAJADORES:')
  console.log('  damian / damian123')
  console.log('  elias / elias123')
  console.log('  luis / luis123')
  console.log('═'.repeat(50))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
