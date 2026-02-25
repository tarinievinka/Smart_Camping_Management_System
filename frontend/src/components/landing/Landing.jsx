import Section1 from "./section1/Section1";
import Section3 from "./section3/Section3";
import Section4 from "./section4/Section4";
import Section5 from "./section5/Section5";
import Navbar from "../../common/navbar/Navbar";
import Footer from "../../common/footer/Footer";


const Landing = () => {
    return (
        <div>
            <Navbar />
            <Section1 />
            <Section3 />
            <Section4 />
            <Section5 />
            <Footer />
        </div>
    );
};

export default Landing;