import styles from "../JSRefs/styles";
import ButtonComponent from "../Components/Button";
import { premadeStyles } from "../JSRefs/responsiveParameters";
import { useColorScheme } from "@mui/material/styles";

import heroLight from "../Assets/LightHero.png";
import heroDark from "../Assets/DarkHero.png";

export default function HeroComponent() {
  const style = premadeStyles.ProductCard;
  const { mode, systemMode } = useColorScheme();
  const activateMode = mode === "system" ? systemMode : mode;
  const heroImage = activateMode === "dark" ? heroDark : heroLight;
  return (
    <>
      <div
        id="HeroWrapper"
        className={`${styles.container} flex min-h-[360px] flex-col items-end justify-center bg-cover bg-center bg-no-repeat px-4 py-10 text-left sm:min-h-[420px] sm:px-8 md:px-12`}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="flex w-full max-w-md flex-col items-end justify-center gap-3">
          <h3 className="text-left text-3xl font-bold leading-tight sm:text-4xl">
            هر فنجان، <br />
            یک لحظه آرامش
          </h3>
          <p className="text-left text-sm leading-7 sm:text-base">
            بهترین قهوه ها و نوشیدنی ها با <br /> دانه های منتخب و عشق آماده
            می‌شود.
          </p>
          <ButtonComponent
            text={"مشاهده منو >"}
            style={`${style.button} mt-1 w-full max-w-56 sm:w-auto`}
          />
        </div>
      </div>
    </>
  );
}
