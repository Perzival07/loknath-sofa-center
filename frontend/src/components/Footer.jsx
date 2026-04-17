import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-10 text-sm">
        <div>
          <img src={assets.logo} alt="logo" className="mb-5 w-32" />
          <p className="w-full md:w-2/3 text-gray-600">
            Transforming your house into a home with thoughtfully designed furniture built to last a lifetime.
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li><Link to="/" className="hover:text-primary-500 transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-primary-500 transition-colors">About us</Link></li>
            <li><Link to="/contact" className="hover:text-primary-500 transition-colors">Contact</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-primary-500 transition-colors">Privacy policy</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+91 91239 24645</li>
            <li><a href="mailto:loknathsofacenter@gmail.com" className="hover:text-primary-500 transition-colors">loknathsofacenter@gmail.com</a></li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center">Designed by Koustav Das with ❤️</p>
      </div>
    </div>
  );
};

export default Footer;
