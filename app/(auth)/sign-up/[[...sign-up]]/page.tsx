import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "../../clerk-appearance";

export default function Page() {
  return <SignUp appearance={clerkAppearance} />;
}
