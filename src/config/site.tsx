import type { ReactNode } from "react";

export const siteConfig = {
  topicWord: "Compliance",
  sourceLine: (
    <>
      Compliance-data baseret på{" "}
      <a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noopener noreferrer">EU AI Act (2024/1689)</a>,{" "}
      <a href="https://digst.dk/tilsyn/ai-forordningen/" target="_blank" rel="noopener noreferrer">Digitaliseringsstyrelsen</a>,{" "}
      <a href="https://www.datatilsynet.dk/regler-og-vejledning/kunstig-intelligens" target="_blank" rel="noopener noreferrer">Datatilsynet</a>,{" "}
      <a href="https://www.iso.org/standard/81230.html" target="_blank" rel="noopener noreferrer">ISO/IEC 42001</a> og{" "}
      <a href="https://www.nist.gov/itl/ai-risk-management-framework" target="_blank" rel="noopener noreferrer">NIST AI RMF</a>. Opdateret maj 2026.
    </>
  ) as ReactNode,
};
