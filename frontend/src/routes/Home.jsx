import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../styles/home.css";
import "../styles/footer.css";
import Hero from "../components/Hero";
import Sections from "../components/Sections";

const Home = () => {
  return (
    <>
      <NavBar />
      <Hero />
      <Sections/>
      <Footer />
    </>
  );
};

export default Home;
