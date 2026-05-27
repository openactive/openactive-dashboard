"use client";

/**
 * HeroLottie — embedded Lottie animation as background decoration.
 * Uses an iframe embed from lottie.host — zero dependencies.
 */
export function HeroLottie() {
  return (
    <iframe
      src="https://lottie.host/embed/5768950f-8325-466b-8d58-83963c32ea55/z5Q02HvNrs.lottie"
      className="w-full h-full border-0"
      title="Background animation"
      loading="lazy"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
