import { Link } from "react-router-dom";
import Title from "../components/Title";

const NotFound = () => {
  return (
    <div className="text-center py-24 border-t min-h-[50vh]">
      <div className="text-2xl sm:text-3xl mb-4">
        <Title text1={"404"} text2={"NOT FOUND"} />
      </div>
      <p className="text-gray-500 max-w-md mx-auto px-4">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-block mt-8 bg-primary-500 text-white px-6 py-2 rounded-sm hover:bg-primary-600 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
};

export default NotFound;
