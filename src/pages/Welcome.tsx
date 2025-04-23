import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">Welcome to Our App!</h1>
      <p className="text-lg">Please login or register to continue.</p>
      <Button className="w-[200px]">
        <Link to="/auth/login">Login</Link>
      </Button>
      <Button className="w-[200px]">
        <Link to="/auth/register">Register</Link>
      </Button>
      <Button className="w-[200px]">
        <Link to="/onboarding">Onboarding</Link>
      </Button>
      <Button className="w-[200px]">
        <Link to="/admin/dashboard">Admin Dashboard</Link>
      </Button>
      <Button className="w-[200px]">
        <Link to="/terms">Terms and Conditions</Link>
      </Button>
      <Button className="w-[200px]">
        <Link to="/privacy">Privacy Policy</Link>
      </Button>
    </div>
  );
}
