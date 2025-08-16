export default function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00437f] to-[#003366]">
      {children}
    </div>
  )
} 