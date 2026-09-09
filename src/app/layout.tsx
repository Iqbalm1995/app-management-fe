import { Providers } from "./providers";
import { defaultMetadata } from "./metadata";
import type { Metadata } from 'next'
import { ColorModeScript } from "@chakra-ui/react";

export const metadata: Metadata = {
  ...defaultMetadata,
  title: {
    default: 'bjb aPPs - Project Management Apps',
    template: 'bjb aPPs - Project Management Apps | %s'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ColorModeScript initialColorMode="system" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
