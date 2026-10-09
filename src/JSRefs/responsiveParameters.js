const productCardStyles = {
  grid: `
    grid
    grid-cols-1
    justify-items-stretch
    gap-3

    min-[360px]:grid-cols-2
    sm:grid-cols-3
    sm:gap-4

    md:grid-cols-4

    lg:grid-cols-5

    xl:grid-cols-6
  `,

  card: `
    flex
    min-h-[19rem]
    w-full
    flex-col
    overflow-hidden
    rounded-2xl

    bg-white
    shadow-sm

    transition-all
    duration-300

    hover:-translate-y-1
    hover:shadow-lg

    dark:bg-[#2A1C15]
    dark:text-white
  `,

  imageWrapper: `
    h-[clamp(7rem,38vw,10rem)]
    w-full
    shrink-0
    overflow-hidden

    bg-[#EFE5D8]

    dark:bg-[#3A281F]
  `,

  image: `
    h-full
    w-full
    object-cover

    transition-transform
    duration-500

    hover:scale-105
  `,

  content: `
  flex
  min-h-[7rem]
  w-full
  min-w-0
  flex-1
  flex-col
  items-center
  px-3
  py-2
`,

  title: `
    truncate
    text-center
    text-[clamp(0.75rem,2.6vw,0.875rem)]
    font-bold
    leading-5

    text-[var(--mui-palette-text-primary)]
  `,

  price: `
    text-center
    text-[clamp(0.7rem,2.4vw,0.8rem)]
    font-bold

    text-[var(--mui-palette-primary-main)]
  `,

  footer: `
  flex
  w-full
  items-center
  justify-between
  px-3
  pb-3
  text-xs

  text-[var(--mui-palette-text-secondary)]
`,

  button: `
    flex
    min-h-11
    h-11
    w-full
    items-center
    justify-center

    rounded-xl

    bg-[#6F4E37]

    text-xs
    font-bold
    text-[#F8F3EC]

    transition-all

    hover:bg-[#4B2E20]

    active:scale-95


    dark:bg-[#D7B08A]

    dark:text-[#2B1B12]

    dark:hover:bg-[#B98B60]
  `,
};

export const premadeStyles = {
  ProductCard: productCardStyles,
};
