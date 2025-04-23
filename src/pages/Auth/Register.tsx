import { SignupForm } from "@/components/signup-form";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6">
        <SignupForm />
      </div>
      <Button>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
