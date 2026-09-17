import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: '欧尼士 ONIX | 专业箱包制造商',
  description: '广州欧尼士箱包有限公司 - 集研发、生产、销售为一体的专业箱包制造企业，专注于EVA、ABS、PC等特殊材料热压吸塑成型生产',
  generator: 'v0.app',
  keywords: ['箱包', '背包', '电脑包', '医疗包', 'EVA箱包', '欧尼士', 'ONIX'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
