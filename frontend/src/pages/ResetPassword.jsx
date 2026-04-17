import { useContext, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const ResetPassword = () => {
  const { backendUrl, navigate } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token") || "";
    setToken(t);
  }, [searchParams]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (!token) {
      toast.error("Invalid or missing reset link");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/reset-password`, {
        token,
        newPassword: password,
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
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
      <h1 className="prata-regular text-2xl text-center mb-8">Set new password</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="New password (min 8 characters)"
        />
        <input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Confirm password"
        />
        <button
          type="submit"
          disabled={submitting || !token}
          className="bg-primary-500 hover:bg-primary-600 text-white py-2 disabled:opacity-50"
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
        <Link to="/login" className="text-center text-sm text-gray-600 hover:text-black">
          Back to login
        </Link>
      </form>
    </div>
  );
};

export default ResetPassword;
