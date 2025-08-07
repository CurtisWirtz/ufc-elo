import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface ScreenshotProps {
  srcLight: string;
  srcDark?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function Screenshot({
  srcLight,
  srcDark,
  alt,
  width,
  height,
  className,
}: ScreenshotProps) {
  const { resolvedTheme } = useTheme();
  const [src, setSrc] = useState<string | null>(null);

  // useEffect(() => {
  //   if (resolvedTheme) {
  //     setSrc(resolvedTheme === "light" ? srcLight : srcDark || srcLight);
  //   }
  // }, [resolvedTheme, srcLight, srcDark]);

  // if (!src) {
  //   return (
  //     <div
  //       style={{ width, height }}
  //       className={cn("bg-muted", className)}
  //       aria-label={alt}
  //     />
  //   );
  // }

  return (
    // <Image
    //   src={src}
    //   alt={alt}
    //   width={width}
    //   height={height}
    //   className={className}
    // />
    
    <img
      // src={src}
      src="/bones-alex.webp"
      alt={alt}
      // width={width}
      width="100%"
      height={height}
    />
  );
}