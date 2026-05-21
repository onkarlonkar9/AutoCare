import { cn } from '@/lib/utils';

type AnimatedBrandLogoProps = {
  className?: string;
};

export function AnimatedBrandLogo({ className }: AnimatedBrandLogoProps) {
  return (
    <div className={cn('overflow-hidden bg-black/10', className)}>
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label="AutoCare AI animated logo"
      >
        <source src="/Logo_Animation_Video_Generated.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
