import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "../../clerk-appearance";

export default function Page() {
  return <SignIn appearance={clerkAppearance} />;
}
