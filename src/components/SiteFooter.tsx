import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <>
      <div className="footer-source">{siteConfig.sourceLine}</div>
      <footer className="site-footer">
        <div className="footer-cols">
          <div className="fcol footer-brand">
            <p className="footer-wordmark">SOLUTION8<span className="brand-dot" aria-hidden="true">.ai</span></p>
            <p className="footer-dict mono-data">solution8 (so-lu-shu-nate) - verbum - at skabe innovative løsninger hurtigt og effektivt, med avanceret teknologi og kreativ problemløsning.</p>
            <div className="footer-contrib">
              <span className="footer-contrib-label mono-label">Bidrager til:</span>
              <span className="footer-pill">IT-Branchen</span>
              <span className="footer-pill">IAMCP</span>
              <span className="footer-pill">Dansk Standards AI-udvalg</span>
              <span className="footer-pill">Dansk IT</span>
            </div>
          </div>
          <div className="footer-right">
            <div className="fcol">
              <p className="footer-h mono-label">Kontakt</p>
              <ul className="footer-contact">
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg><span>Njalsgade 76, 4., 2300 København S</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.6 6.6 8.4 6 8.4-6"/></svg><a href="mailto:kontakt@solution8.ai">kontakt@solution8.ai</a></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false"><path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/></svg><a href="tel:+4591413403">+45 91 41 34 03</a></li>
              </ul>
            </div>
            <div className="fcol">
              <p className="footer-h mono-label">Videnssites</p>
              <ul className="footer-nav">
                <li><a href="https://ai-sikkerhed.dk">AI Sikkerhed</a></li>
                <li><a href="https://ai-compliance.dk">AI Compliance</a></li>
                <li><a href="https://ai-governance.dk">AI Governance</a></li>
                <li><a href="https://ai-uddannelse.dk">AI Uddannelse</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-base">
          <p className="footer-links mono-label"><a href="https://solution8.ai/privatliv.html">Privatlivspolitik</a> · <a href="https://solution8.ai/handelsbetingelser.html">Handelsbetingelser</a> · <a href="https://solution8.ai/ai-politik.html">AI-politik</a></p>
          <p className="mono-label">SOLUTION8<span className="brand-dot" aria-hidden="true">.ai</span> · CVR DK-44715082</p>
        </div>
      </footer>
    </>
  );
}
