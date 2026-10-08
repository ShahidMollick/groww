import Script from "next/script";
import { markup } from "./prototype-markup";

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: markup }} />
      <Script src="/prototype.js" />
    </>
  );
}
