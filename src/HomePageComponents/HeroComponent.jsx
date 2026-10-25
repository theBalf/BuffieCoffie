import { useEffect, useRef } from "react";
import styles from "../JSRefs/styles";
import ButtonComponent from "../Components/Button";
import { premadeStyles } from "../JSRefs/responsiveParameters";
import { useColorScheme } from "@mui/material/styles";

import heroLight from "../Assets/LightHero.png";
import heroDark from "../Assets/DarkHero.png";

export default function HeroComponent() {
  const style = premadeStyles.ProductCard;
  const heroRef = useRef(null);
  const { mode, systemMode } = useColorScheme();
  const activateMode = mode === "system" ? systemMode : mode;
  const heroImage = activateMode === "dark" ? heroDark : heroLight;

  useEffect(() => {
    const hero = heroRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!hero || reduceMotion.matches) {
      return undefined;
    }

    const initialTop = hero.getBoundingClientRect().top + window.scrollY;
    const featureBar = hero.nextElementSibling;
    const button = hero.querySelector(".hero-content button");
    let currentTextOffset = 0;
    let animationFrameId = null;

    const updateFloat = () => {
      const scrollDistance = initialTop - hero.getBoundingClientRect().top;
      const clearance = featureBar && button
        ? featureBar.getBoundingClientRect().top -
          button.getBoundingClientRect().bottom +
          currentTextOffset
        : 120;
      const textOffset = Math.max(
        -120,
        Math.min(scrollDistance * 0.65, clearance)
      );
      const imageOffset = Math.max(
        -80,
        Math.min(80, scrollDistance * 0.3)
      );
      currentTextOffset = textOffset;
      hero.style.setProperty("--hero-text-offset", `${textOffset}px`);
      hero.style.setProperty("--hero-image-offset", `${imageOffset}px`);
      animationFrameId = null;
    };

    const handleScroll = () => {
      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(updateFloat);
      }
    };

    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(hero);
    if (featureBar) {
      resizeObserver.observe(featureBar);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateFloat();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <section
      id="HeroWrapper"
      ref={heroRef}
      dir="rtl"
      className={`${styles.container} hero-section relative flex min-h-[360px] flex-col justify-center px-4 py-10 sm:min-h-[420px] sm:px-8 md:px-12`}
      style={{ "--hero-image": `url(${heroImage})` }}
    >
      <div className="hero-content relative z-10 flex w-full max-w-md flex-col items-start justify-center gap-3 text-right">
        <h3 className="text-right text-3xl font-bold leading-tight sm:text-4xl">
          هر فنجان، <br />
          یک لحظه آرامش
        </h3>
        <p className="text-right text-sm leading-7 sm:text-base">
          بهترین قهوه ها و نوشیدنی ها با <br /> دانه های منتخب و عشق آماده
          می‌شود.
        </p>
        <ButtonComponent
          text={"مشاهده منو >"}
          style={`${style.button} mt-1 w-full max-w-56 sm:w-auto`}
        />
      </div>
    </section>
  );
}
