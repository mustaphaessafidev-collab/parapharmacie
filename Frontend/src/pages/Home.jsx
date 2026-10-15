import Advantages from "../components/home/Advantages";
import Categories from "../components/home/Categories";
import Footer from "../components/home/Footer";
import Header from "../components/home/Header";
import Hero from "../components/home/Hero";

function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Header />
      <main>
        <Hero />
        <Categories />
        <Advantages />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
