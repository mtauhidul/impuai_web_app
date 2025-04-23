import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  function onReturn() {
    navigate("/auth/login");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6">
        <ForgotPasswordForm onReturn={onReturn} />
      </div>
      <Button>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
