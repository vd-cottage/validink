import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
    showText?: boolean
    className?: string
    textClassName?: string
}

// Keeping LogoIcon for compatibility, but it renders the image now
export function LogoIcon({ className, ...props }: any) {
    return (
        <div className={cn("relative w-8 h-8", className)} {...props}>
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

export function Logo({ className, ...props }: LogoProps) {
    return (
        <div className={cn("relative h-8 w-8", className)} {...props}>
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
