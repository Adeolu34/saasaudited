export const metadata = {
  title: { default: "Admin", template: "%s | SaasAudited Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
