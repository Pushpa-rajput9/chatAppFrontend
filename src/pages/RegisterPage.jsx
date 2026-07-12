import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    identifier: "",
    password: "",
    confirm: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      await register({
        username: form.username.trim(),
        identifier: form.identifier.trim(),
        password: form.password,
        phone: form.phone.trim(),
      });
      navigate("/chat");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join ConvoSphere and start chatting in seconds."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          name="username"
          placeholder="Jane Doe"
          value={form.username}
          onChange={handleChange}
          required
        />
        <Input
          label="Email or phone"
          name="identifier"
          placeholder="you@example.com"
          value={form.identifier}
          onChange={handleChange}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={handleChange}
          minLength={6}
          required
        />
        <Input
          label="Confirm password"
          name="confirm"
          type="password"
          placeholder="Repeat your password"
          value={form.confirm}
          onChange={handleChange}
          required
        />
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand-600 hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
