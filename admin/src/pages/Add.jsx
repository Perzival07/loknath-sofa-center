import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { cmToFeetInches, cmToMeters, feetInchesToCm, metersToCm } from "../utils/dimensionsConverter";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [image5, setImage5] = useState(false);
  const [image6, setImage6] = useState(false);
  const [image7, setImage7] = useState(false);
  const [image8, setImage8] = useState(false);
  const [image9, setImage9] = useState(false);
  const [image10, setImage10] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [category, setCategory] = useState("Living Room");
  const [subCategory, setSubCategory] = useState("Sofas");
  const [bestseller, setBestseller] = useState(false);
  const [length, setLength] = useState("");
  const [breadth, setBreadth] = useState("");
  const [height, setHeight] = useState("");
  const [unitSystem, setUnitSystem] = useState("cm"); // "cm" or "ft"
  
  // Feet/Inches states for input
  const [lengthFt, setLengthFt] = useState("");
  const [lengthIn, setLengthIn] = useState("");
  const [breadthFt, setBreadthFt] = useState("");
  const [breadthIn, setBreadthIn] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      
      // Convert to cm if input is in feet/inches
      let lengthCm, breadthCm, heightCm;
      if (unitSystem === "ft") {
        lengthCm = feetInchesToCm(Number(lengthFt || 0), Number(lengthIn || 0));
        breadthCm = feetInchesToCm(Number(breadthFt || 0), Number(breadthIn || 0));
        heightCm = feetInchesToCm(Number(heightFt || 0), Number(heightIn || 0));
      } else {
        lengthCm = Number(length);
        breadthCm = Number(breadth);
        heightCm = Number(height);
      }

      formData.append("length", lengthCm);
      formData.append("breadth", breadthCm);
      formData.append("height", heightCm);
      formData.append("stock", stock);

      // Validate at least one image is uploaded
      if (!image1 && !image2 && !image3 && !image4 && !image5 && !image6 && !image7 && !image8 && !image9 && !image10) {
        toast.error("Please upload at least one image");
        return;
      }

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);
      image5 && formData.append("image5", image5);
      image6 && formData.append("image6", image6);
      image7 && formData.append("image7", image7);
      image8 && formData.append("image8", image8);
      image9 && formData.append("image9", image9);
      image10 && formData.append("image10", image10);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        setDescription('');
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setImage5(false);
        setImage6(false);
        setImage7(false);
        setImage8(false);
        setImage9(false);
        setImage10(false);
        setPrice('');
        setStock("0");
        setLength('');
        setBreadth('');
        setHeight('');
        setLengthFt('');
        setLengthIn('');
        setBreadthFt('');
        setBreadthIn('');
        setHeightFt('');
        setHeightIn('');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      <div>
        <p className="mb-2">Upload Images (Minimum 1, Maximum 10)</p>
        <div className="flex gap-2 flex-wrap">
          <label htmlFor="image1">
            <img
              className="w-20"
              src={!image1 ? assets.upload_area : URL.createObjectURL(image1)}
              alt="upload_area_image"
            />
            <input
              onChange={(e) => setImage1(e.target.files[0])}
              type="file"
              id="image1"
              accept="image/*"
              hidden
            />
          </label>

          <label htmlFor="image2">
            <img
              className="w-20"
              src={!image2 ? assets.upload_area : URL.createObjectURL(image2)}
              alt="upload_area_image"
            />
            <input
              onChange={(e) => setImage2(e.target.files[0])}
              type="file"
              id="image2"
              accept="image/*"
              hidden
            />
          </label>

          <label htmlFor="image3">
            <img
              className="w-20"
              src={!image3 ? assets.upload_area : URL.createObjectURL(image3)}
              alt="upload_area_image"
            />
            <input
              onChange={(e) => setImage3(e.target.files[0])}
              type="file"
              id="image3"
              accept="image/*"
              hidden
            />
          </label>

          <label htmlFor="image4">
            <img
              className="w-20"
              src={!image4 ? assets.upload_area : URL.createObjectURL(image4)}
              alt="upload_area_image"
            />
            <input
              onChange={(e) => setImage4(e.target.files[0])}
              type="file"
              id="image4"
              accept="image/*"
              hidden
            />
          </label>

          <label htmlFor="image5">
            <img
              className="w-20"
              src={!image5 ? assets.upload_area : URL.createObjectURL(image5)}
              alt="upload_area_image"
            />
            <input
              onChange={(e) => setImage5(e.target.files[0])}
              type="file"
              id="image5"
              accept="image/*"
              hidden
            />
          </label>

          <label htmlFor="image6">
            <img
              className="w-20"
              src={!image6 ? assets.upload_area : URL.createObjectURL(image6)}
              alt="upload_area_image"
            />
            <input
              onChange={(e) => setImage6(e.target.files[0])}
              type="file"
              id="image6"
              accept="image/*"
              hidden
            />
          </label>

          <label htmlFor="image7">
            <img
              className="w-20"
              src={!image7 ? assets.upload_area : URL.createObjectURL(image7)}
              alt="upload_area_image"
            />
            <input
              onChange={(e) => setImage7(e.target.files[0])}
              type="file"
              id="image7"
              accept="image/*"
              hidden
            />
          </label>

          <label htmlFor="image8">
            <img
              className="w-20"
              src={!image8 ? assets.upload_area : URL.createObjectURL(image8)}
              alt="upload_area_image"
            />
            <input
              onChange={(e) => setImage8(e.target.files[0])}
              type="file"
              id="image8"
              accept="image/*"
              hidden
            />
          </label>

          <label htmlFor="image9">
            <img
              className="w-20"
              src={!image9 ? assets.upload_area : URL.createObjectURL(image9)}
              alt="upload_area_image"
            />
            <input
              onChange={(e) => setImage9(e.target.files[0])}
              type="file"
              id="image9"
              accept="image/*"
              hidden
            />
          </label>

          <label htmlFor="image10">
            <img
              className="w-20"
              src={!image10 ? assets.upload_area : URL.createObjectURL(image10)}
              alt="upload_area_image"
            />
            <input
              onChange={(e) => setImage10(e.target.files[0])}
              type="file"
              id="image10"
              accept="image/*"
              hidden
            />
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">Upload 1-10 images (minimum 1 required)</p>
      </div>

      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Type here"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Product Description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="write content here"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product Category</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2"
          >
            <option value="Living Room">Living Room</option>
            <option value="Bedroom">Bedroom</option>
            <option value="Dining Room">Dining Room</option>
            <option value="Office">Office</option>
            <option value="Outdoor">Outdoor</option>
            <option value="Storage">Storage</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Sub Category</p>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full px-3 py-2"
          >
            <option value="Sofas">Sofas</option>
            <option value="Tables">Tables</option>
            <option value="Chairs">Chairs</option>
            <option value="Beds">Beds</option>
            <option value="Wardrobes">Wardrobes</option>
            <option value="Desks">Desks</option>
            <option value="Shelving">Shelving</option>
            <option value="Storage">Storage</option>
            <option value="Lighting">Lighting</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="number"
            placeholder="25"
            required
          />
        </div>

        <div>
          <p className="mb-2">Stock Quantity</p>
          <input
            onChange={(e) => setStock(e.target.value)}
            value={stock}
            className="w-full max-w-[500px] px-3 py-2 sm:w-[120px]"
            type="number"
            min="0"
            placeholder="Available quantity"
            required
          />
        </div>
      </div>

      <div className="w-full">
        <div className="mb-3">
          <p className="mb-2">Unit System</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="unitSystem"
                value="cm"
                checked={unitSystem === "cm"}
                onChange={(e) => setUnitSystem(e.target.value)}
              />
              <span>Centimeters / Meters</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="unitSystem"
                value="ft"
                checked={unitSystem === "ft"}
                onChange={(e) => setUnitSystem(e.target.value)}
              />
              <span>Feet / Inches</span>
            </label>
          </div>
          </div>

        {unitSystem === "cm" ? (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
            <div>
              <p className="mb-2">Length (cm)</p>
              <input
                onChange={(e) => setLength(e.target.value)}
                value={length}
                className="w-full px-3 py-2 sm:w-[120px]"
                type="number"
                placeholder="100"
                min="1"
                step="0.1"
                required
              />
              {length && (
                <p className="text-xs text-gray-500 mt-1">
                  {cmToMeters(Number(length))} m ({cmToFeetInches(Number(length)).feet}' {cmToFeetInches(Number(length)).inches}")
                </p>
              )}
          </div>

            <div>
              <p className="mb-2">Breadth (cm)</p>
              <input
                onChange={(e) => setBreadth(e.target.value)}
                value={breadth}
                className="w-full px-3 py-2 sm:w-[120px]"
                type="number"
                placeholder="50"
                min="1"
                step="0.1"
                required
              />
              {breadth && (
                <p className="text-xs text-gray-500 mt-1">
                  {cmToMeters(Number(breadth))} m ({cmToFeetInches(Number(breadth)).feet}' {cmToFeetInches(Number(breadth)).inches}")
                </p>
              )}
          </div>

            <div>
              <p className="mb-2">Height (cm)</p>
              <input
                onChange={(e) => setHeight(e.target.value)}
                value={height}
                className="w-full px-3 py-2 sm:w-[120px]"
                type="number"
                placeholder="75"
                min="1"
                step="0.1"
                required
              />
              {height && (
                <p className="text-xs text-gray-500 mt-1">
                  {cmToMeters(Number(height))} m ({cmToFeetInches(Number(height)).feet}' {cmToFeetInches(Number(height)).inches}")
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-4">
              <div>
                <p className="mb-2">Length</p>
                <div className="flex gap-2">
                  <input
                    onChange={(e) => setLengthFt(e.target.value)}
                    value={lengthFt}
                    className="w-full px-3 py-2 sm:w-[80px]"
                    type="number"
                    placeholder="Feet"
                    min="0"
                    step="1"
                    required
                  />
                  <input
                    onChange={(e) => setLengthIn(e.target.value)}
                    value={lengthIn}
                    className="w-full px-3 py-2 sm:w-[80px]"
                    type="number"
                    placeholder="Inches"
                    min="0"
                    max="11.9"
                    step="0.1"
                    required
                  />
                </div>
                {(lengthFt || lengthIn) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {feetInchesToCm(Number(lengthFt || 0), Number(lengthIn || 0))} cm ({cmToMeters(feetInchesToCm(Number(lengthFt || 0), Number(lengthIn || 0)))} m)
                  </p>
                )}
              </div>

              <div>
                <p className="mb-2">Breadth</p>
                <div className="flex gap-2">
                  <input
                    onChange={(e) => setBreadthFt(e.target.value)}
                    value={breadthFt}
                    className="w-full px-3 py-2 sm:w-[80px]"
                    type="number"
                    placeholder="Feet"
                    min="0"
                    step="1"
                    required
                  />
                  <input
                    onChange={(e) => setBreadthIn(e.target.value)}
                    value={breadthIn}
                    className="w-full px-3 py-2 sm:w-[80px]"
                    type="number"
                    placeholder="Inches"
                    min="0"
                    max="11.9"
                    step="0.1"
                    required
                  />
                </div>
                {(breadthFt || breadthIn) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {feetInchesToCm(Number(breadthFt || 0), Number(breadthIn || 0))} cm ({cmToMeters(feetInchesToCm(Number(breadthFt || 0), Number(breadthIn || 0)))} m)
                  </p>
                )}
          </div>

              <div>
                <p className="mb-2">Height</p>
                <div className="flex gap-2">
                  <input
                    onChange={(e) => setHeightFt(e.target.value)}
                    value={heightFt}
                    className="w-full px-3 py-2 sm:w-[80px]"
                    type="number"
                    placeholder="Feet"
                    min="0"
                    step="1"
                    required
                  />
                  <input
                    onChange={(e) => setHeightIn(e.target.value)}
                    value={heightIn}
                    className="w-full px-3 py-2 sm:w-[80px]"
                    type="number"
                    placeholder="Inches"
                    min="0"
                    max="11.9"
                    step="0.1"
                    required
                  />
                </div>
                {(heightFt || heightIn) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {feetInchesToCm(Number(heightFt || 0), Number(heightIn || 0))} cm ({cmToMeters(feetInchesToCm(Number(heightFt || 0), Number(heightIn || 0)))} m)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>




      <div className="flex gap-2 mt-2">
        <input
          onChange={() => setBestseller(prev => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
        />
        <label className="cursor-pointer" htmlFor="bestseller">
          Add to bestseller
        </label>
      </div>

      <button
        className="w-28 py-3 mt-4 bg-[#8B4513] hover:bg-[#7a3d11] text-white cursor-pointer transition-colors"
        type="submit"
      >
        ADD
      </button>
    </form>
  );
};

export default Add;
