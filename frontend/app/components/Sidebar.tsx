'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'EC2 Monitor', href: '/ec2', icon: '🖥️' },
  { label: 'S3 Buckets', href: '/s3', icon: '🪣' },
  { label: 'Cost Analytics', href: '/costs', icon: '💰' },
  { label: 'AI Optimizer', href: '/optimizer', icon: '🤖' },
  { label: 'Alerts', href: '/alerts', icon: '🔔' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-blue-400">☁️ NimbusIQ</h1>
        <p className="text-xs text-gray-400 mt-1">Cloud Infrastructure Monitor</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">NimbusIQ v1.0.0</p>
      </div>
    </div>
  )
}