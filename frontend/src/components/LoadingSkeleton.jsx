import PropTypes from "prop-types";

const LoadingSkeleton = ({ type = "product" }) => {
  if (type === "product") {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 rounded-lg w-full aspect-[3/4] max-h-64" />
        <div className="h-4 bg-gray-200 rounded mt-3 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mt-2 w-1/2" />
      </div>
    );
  }
  return <div className="animate-pulse bg-gray-200 rounded h-20 w-full" />;
};

LoadingSkeleton.propTypes = {
  type: PropTypes.string,
};

export default LoadingSkeleton;
