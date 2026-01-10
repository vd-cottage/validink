import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
    showText?: boolean
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-base' },
    md: { icon: 'w-8 h-8', text: 'text-lg' },
    lg: { icon: 'w-10 h-10', text: 'text-xl' },
}

// Icon-only version for compact spaces
export function LogoIcon({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("relative w-8 h-8 flex-shrink-0", className)} {...props}>
            <Image
                src="/icon.png"
                alt="ValidInk"
                fill
                className="object-contain"
                priority
            />
        </div>
    )
}

// Full logo with V icon + ValidInk text
export function Logo({
    className,
    showText = true,
    size = 'md',
    ...props
}: LogoProps) {
    const sizes = sizeMap[size]

    return (
        <div className={cn("flex items-center gap-2", className)} {...props}>
            {/* V Icon */}
            <div className={cn("relative flex-shrink-0", sizes.icon)}>
                <Image
                    src="/icon.png"
                    alt="ValidInk"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            {/* Brand Name */}
            {showText && (
                <span className={cn(
                    "font-bold tracking-tight",
                    sizes.text
                )}>
                    <span className="text-foreground">Valid</span>
                    <span className="text-primary">Ink</span>
                </span>
            )}
        </div>
    )
}
