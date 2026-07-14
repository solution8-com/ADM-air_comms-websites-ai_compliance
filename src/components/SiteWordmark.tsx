import { siteConfig } from "@/config/site";

/** SIGNAL wordmark: "AI" in Signalrød + topic word in white, Archivo 800. */
export function SiteWordmark() {
  return (
    <span
      className="font-display text-2xl font-extrabold"
      style={{ letterSpacing: "-0.015em" }}
    >
      <span style={{ color: "#E3241B" }}>AI</span>{" "}
      <span className="text-foreground">{siteConfig.topicWord}</span>
    </span>
  );
}
