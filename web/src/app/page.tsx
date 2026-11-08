import type { Metadata } from "next";
import { Landing } from "../landing/Landing";

export const metadata: Metadata = {
  title: { absolute: "vinda · admissão que se resolve sozinha" },
};

export default function Home() {
  return <Landing />;
}
