export default function ButtonComponent({ text, onClick, style = "" }) {
  const defaultStyle =
    "min-h-11 rounded-lg px-4 py-2 transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F4E37] hover:shadow-md hover:cursor-pointer hover:-translate-y-0.5 active:translate-y-0";

  return (
    <>
      <button onClick={onClick} className={`${defaultStyle} ${style} `}>
        {text}
      </button>
    </>
  );
}
