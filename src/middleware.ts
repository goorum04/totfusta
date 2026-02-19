import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/hours/:path*', '/projects/:path*', '/workers/:path*', '/profile/:path*'],
}
