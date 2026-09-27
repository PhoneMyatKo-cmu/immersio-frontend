// Brand mark from /public/immersio-logo.svg (also used as the favicon).

interface BrandLogoProps {
    size?: number;
    className?: string;
    // Pass alt="" when the "Immersio" wordmark is already rendered next to it.
    alt?: string;
}

export function BrandLogo({ size = 36, className = '', alt = 'Immersio' }: BrandLogoProps) {
    return (
        <img
            src="/immersio-logo.svg"
            width={size}
            height={size}
            alt={alt}
            draggable={false}
            className={`shrink-0 select-none ${className}`}
        />
    );
}

// Full-screen loading state: the logo breathing gently instead of a bare spinner.
export function BrandLoader({ label = 'Loading', className = '' }: { label?: string; className?: string }) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={`flex h-screen flex-col items-center justify-center gap-4 ${className}`}
        >
            <div className="relative">
                <span className="absolute inset-0 animate-ping rounded-2xl bg-teal-500/25 [animation-duration:1.6s]" />
                <BrandLogo size={56} alt="" className="relative animate-pulse" />
            </div>
            <p className="text-sm tracking-wide text-white/40">{label}</p>
        </div>
    );
}
