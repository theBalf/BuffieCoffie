import ButtonComponent from "../Components/Button"; /* { text, onClick, style = "" } */
import ShelfCard from "../Components/ShelfCard"; /* {  image,title,description,price,rate,isStock = true,isAvailable = true, } */
import { premadeStyles } from "../JSRefs/responsiveParameters.js";
import HeroComponent from "../HomePageComponents/HeroComponent.jsx";
import FeaturesBar from "../HomePageComponents/FeaturesBar.jsx";
import FeaturesProductsSection from "../HomePageComponents/FeaturesProductsBar.jsx";
import CategoryBar from "../HomePageComponents/CategoiesBar.jsx";
import FooterHero from "../HomePageComponents/FooterHero.jsx";
import FooterBar from "../HomePageComponents/Footer.jsx";

export default function HomePage() {
  const Resp = premadeStyles.ProductCard;
  return (
    <>
      <div id="homePageWrapper">
        <HeroComponent />
        <FeaturesBar />
        <FeaturesProductsSection />
        <CategoryBar />
        <FooterHero />
        <FooterBar />
      </div>
    </>
  );
}
// Slideable menu       in swiperJS for ham menu
