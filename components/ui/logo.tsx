import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-4 ${className}`}>
      <div className="relative h-8 w-8">
        <Image
          src="/logo.png"
          alt="Finiite AI Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <span className="text-[15px] font-medium tracking-tight">FINIITE AI</span>
    </Link>
  )
} 