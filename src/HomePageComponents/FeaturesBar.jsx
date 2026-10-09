import {
  CreditCard,
  BikeIcon,
  Calendar,
  PlaneIcon,
} from "lucide-react";

import FeatureUnit from "./FeaturesUnitComp";

const featureUnits = [
  {
    id: 1,
    title: "پرداخت امن",
    description: "درگاه آنلاین پرداخت",
    Icon: CreditCard,
  },
  {
    id: 2,
    title: "ارسال سریع",
    description: "سریع و سالم با پیک",
    Icon: BikeIcon,
  },
  {
    id: 3,
    title: "کافی روزانه",
    description: "هرروز با قهوه های تازه",
    Icon: Calendar,
  },
  {
    id: 4,
    title: "دانه های با کیفیت",
    description: "دانه های وارداتی درجه یک",
    Icon: PlaneIcon,
  },
];

export default function FeaturesBar() {
  return (
    <section
      className="
        relative
        z-10
        mx-auto
        -mt-8
        w-[92%]
        max-w-6xl
        rounded-2xl
        border
        p-4
        text-[var(--mui-palette-text-primary)]
        shadow-lg
        backdrop-blur-sm

        sm:-mt-10
        sm:w-[90%]
        sm:p-5

        md:-mt-12
        md:w-[85%]

        lg:w-[80%]
        lg:px-6
      "
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--mui-palette-background-paper) 90%, transparent)",
        borderColor: "var(--mui-palette-divider)",
      }}
    >
      <div
        className="
          grid
          grid-cols-2
          gap-2
          min-[680px]:grid-cols-4
          min-[680px]:gap-4
          lg:gap-6
        "
      >
        {featureUnits.map((unit) => (
          <FeatureUnit
            key={unit.id}
            title={unit.title}
            description={unit.description}
            Icon={unit.Icon}
          />
        ))}
      </div>
    </section>
  );
}