import { useAuth } from "@appjoint/react";
import { useConfetti } from "../hooks/use-confetti";

export default function Home() {
  useConfetti();
  let { signOut } = useAuth();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen relative z-10">
      <h1 className="font-extrabold text-5xl text-gray-900 mb-4">Success!</h1>
      <p>You are now signed into your account! 🎉</p>
      <div className="mt-4">
        <button onClick={signOut} className="underline">
          Logout
        </button>
      </div>
    </div>
  );
}
