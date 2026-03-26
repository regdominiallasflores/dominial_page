import Header from '@/components/Header'
import Navbar from '@/components/Navbar'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Header />
      <Navbar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
    </>
  )
}
