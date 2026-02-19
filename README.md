# Tot Fusta - Control de Horas

Sistema de control de horas para trabajadores.

---

## Credenciales de acceso

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| diogo | diogo123 | Administrador |
| damian | damian123 | Trabajador |
| elias | elias123 | Trabajador |
| luis | luis123 | Trabajador |

---

## Instalación local

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Abrir http://localhost:3000

---

## Despliegue en Vercel (Recomendado)

### Paso 1: Crear cuenta en Vercel
1. Ve a https://vercel.com
2. Regístrate con tu cuenta de GitHub

### Paso 2: Crear base de datos
1. En Vercel, ve a **Storage** > **Create Database**
2. Selecciona **Neon** (PostgreSQL)
3. Dale un nombre (ej: totfusta-db)
4. Copia las dos URLs que aparecen:
   - `DATABASE_URL`
   - `DIRECT_DATABASE_URL`

### Paso 3: Subir el código a GitHub
1. Crea un repositorio nuevo en GitHub
2. Sube esta carpeta:
```bash
git init
git add .
git commit -m "Primera versión"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/totfusta.git
git push -u origin main
```

### Paso 4: Importar en Vercel
1. En Vercel, pulsa **Add New** > **Project**
2. Importa tu repositorio de GitHub
3. Configura las variables de entorno:

| Variable | Valor |
|----------|-------|
| DATABASE_URL | (la URL que copiaste) |
| DIRECT_DATABASE_URL | (la URL que copiaste) |
| NEXTAUTH_SECRET | (ejecuta `openssl rand -base64 32` para generarlo) |
| NEXTAUTH_URL | https://tu-app.vercel.app |

4. Pulsa **Deploy**

### Paso 5: Configurar la base de datos

Después del deploy, ve a la terminal de tu ordenador:

```bash
# Descargar variables de entorno
vercel env pull .env.production

# Cambiar a schema de PostgreSQL
cp prisma/schema.postgres.prisma prisma/schema.prisma

# Crear tablas
npx prisma migrate deploy

# Crear usuarios iniciales
npx tsx prisma/seed.prod.ts
```

---

## Funcionalidades

### Para Trabajadores
- Registrar horas trabajadas (fecha, proyecto, horas, descripción del trabajo)
- Ver historial de registros
- Cambiar su contraseña

### Para el Administrador (Diogo)
- Ver todos los registros de horas
- Aprobar o rechazar registros (con comentario)
- Gestión de proyectos (crear, editar, eliminar)
- Gestión de trabajadores (crear nuevos usuarios)
- Ver estadísticas en el dashboard

---

## Soporte

Para cualquier duda o problema, contactar al desarrollador.

---

## Tecnologías

- **Frontend**: Next.js 16, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL (producción) / SQLite (desarrollo)
- **Autenticación**: NextAuth.js
