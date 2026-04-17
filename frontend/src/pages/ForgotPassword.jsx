import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const ForgotPassword = () => {
  const { backendUrl } = useContext(ShopContext);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/forgot-password`, {
        email,
      });
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t pt-14 max-w-md mx-auto px-4">
      <h1 className="prata-regular text-2xl text-center mb-2">Forgot password</h1>
      <p className="text-sm text-gray-600 text-center mb-8">
        Enter your email and we will send you a reset link if an account exists.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Email"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-primary-500 hover:bg-primary-600 text-white py-2 disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send reset link"}
        </button>
        <Link to="/login" className="text-center text-sm text-gray-600 hover:text-black">
          Back to login
        </Link>
      </form>
    </div>
  );
};

export default ForgotPassword;
