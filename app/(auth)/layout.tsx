export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;  // Tidak ada wrapper, biarkan halaman mengatur layoutnya sendiri
}