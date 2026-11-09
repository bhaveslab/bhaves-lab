import { useEffect } from "react";
import { Link } from "../router";
import "../styles/observatory.css";
import "../styles/contact-card.css";

// This is a static, offline-generated vCard QR matrix; no third-party QR
// endpoint or visitor tracking is involved. Four-module quiet zone included.
const QR_ROWS = `
00000000000000000000 00000000000000000000 00000000000000000000 00000000000000000000 01fc1a0f0c91da4ff7f0
0104e8971bdfda838410 01753be16db0c55cc5d0 017448f377193c9a95d0 01758307f3ff6b5dd5d0 010558ab631781d94410
01fd55555555555557f0 0000bfff631fce39a000 0095e055effe31414b40 01710bdf1965eb65b5f0 016c87f4590695efd6c0
01d9e4a1913ad435e460 00c7e06802ce31e59a40 00c046cca225eb7d3670 017cdbab37b436e47aa0 00c14f716d42aed3aa30
00c549d7ab069f258a40 00f38be058efc865b610 0136ac5aa65b7a74f530 000175e1098f3334d200 01b630dcecfadd711c30
00c9443d69c3435a1670 0177b661f6716b49c6f0 006bbf5802ca9a32ff10 00165a894fde15214a40 01c05b946eaa5b5ebda0
006c5503ee1ecd19a120 01701dc7f1520f26c0a0 00957211b1ee91630460 0021c363a8f0f8e59d20 01ddc28b56aa4b94daa0
01328f5ee66235202b20 001fa83719fa53a11f20 01d157240310c37a91e0 01950377235ebc3b95e0 00118cfbf714b0093110
00ff05b5b5fc77a19f30 0021ab2f0e1fde4536a0 005dcf73d046ef58da60 018bcb9edae77be94330 01cd9ac4a6ee356d5c00
01ab36f324cf88cda350 01f5ad901827a42c8220 0162193d51fb94b534b0 01843cd07ecbe7ed01c0 012a5be171694f6e2820
00852b82f7640f3922a0 010a7969b01d8ee83c10 00aee73ecbe817013570 01723393254ee85ca0a0 01cd5d9aaab32f4f89c0
01a1f6956f46e3f0eda0 00d6c4cbeda2b3c50390 00019307a68e59ee8a00 016e9fa3af8c4fc599e0 018be02706108ea55f20
01f5edfd97e431918470 019bcb50b436d97d9c70 015d4298ef1df87ed940 0101ec07fc0e1a091cf0 0134d5e273f05a015f20
00014dd3ab1fd8dff1f0 01fc22a58751d5eff560 010450efef1280fd1120 017592462dfe93615f20 0174e6d3d09debff3bb0
0174b28d5620fa310b80 010575a4fbb571980800 01fc26230a1edfcfb910 00000000000000000000 00000000000000000000
00000000000000000000 00000000000000000000
`.trim().split(/\s+/);
const QR_SIZE = 77;
const QR_PATH = QR_ROWS.flatMap((row, y) => {
  const mask = BigInt("0x" + row);
  const spans: string[] = [];
  for (let x = 0; x < QR_SIZE; x++) {
    if ((mask & (1n << BigInt(QR_SIZE - 1 - x))) !== 0n) {
      spans.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  return spans;
}).join("");

export function ContactCard() {
  useEffect(() => {
    document.title = "Bhavé — Contact Card | Bhavé’s Lab";
    const existingIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    const oldHref = existingIcon?.href;
    if (existingIcon) existingIcon.href = "/contact-icon.png";

    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = "/contact.webmanifest";
    manifest.setAttribute("data-contact-manifest", "true");
    document.head.appendChild(manifest);

    const mobileTitle = document.createElement("meta");
    mobileTitle.name = "apple-mobile-web-app-title";
    mobileTitle.content = "Bhavé Contact";
    document.head.appendChild(mobileTitle);

    const theme = document.createElement("meta");
    theme.name = "theme-color";
    theme.content = "#05151b";
    document.head.appendChild(theme);

    return () => {
      if (existingIcon && oldHref) existingIcon.href = oldHref;
      manifest.remove();
      mobileTitle.remove();
      theme.remove();
    };
  }, []);

  return (
    <div className="observatory contact-world">
      <a className="lab-skip" href="#main">Skip to contact card</a>
      <header className="contact-header">
        <Link to="/" className="lab-brand">BHAVÉ’S LAB</Link>
        <Link to="/">← The Observatory</Link>
      </header>
      <main id="main" className="contact-main">
        <div className="contact-eyebrow">CONTACT / THE GENTLEMAN OF POSSIBILITY</div>
        <article className="contact-glass-card" aria-labelledby="contact-name">
          <div className="contact-identity">
            <div className="contact-orbit" aria-hidden="true">◌</div>
            <h1 id="contact-name">Bhavé</h1>
            <p className="contact-title">The Gentleman of Possibility</p>
            <p className="contact-quote">Life is already in motion.</p>
            <div className="contact-details">
              <a href="mailto:info@bhaveslab.com">info@bhaveslab.com</a>
              <a href="https://www.bhaveslab.com/">bhaveslab.com</a>
            </div>
          </div>
          <div className="contact-qr-side">
            <svg
              className="contact-qr"
              viewBox="0 0 77 77"
              role="img"
              aria-label="Scannable QR code to save Bhavé’s public contact information"
            >
              <rect width={QR_SIZE} height={QR_SIZE} fill="#eef8f5" />
              <path d={QR_PATH} fill="#071a1e" />
            </svg>
            <p>SCAN TO SAVE CONTACT</p>
          </div>
        </article>
        <div className="contact-actions">
          <a className="contact-action-primary" href="/Bhave_Contact.vcf" download="Bhave_Contact.vcf">
            Save Contact <span aria-hidden="true">↗</span>
          </a>
          <a className="contact-action-secondary" href="mailto:info@bhaveslab.com">
            Send Email <span aria-hidden="true">↗</span>
          </a>
        </div>
        <section className="contact-install" aria-labelledby="contact-install-heading">
          <p className="lab-kicker">YOUR CONTACT CARD / ONE TAP AWAY</p>
          <h2 id="contact-install-heading">Keep it on your <em>Home Screen.</em></h2>
          <p>
            On iPhone, open this page in Safari, choose Share → Add to Home Screen,
            then turn on “Open as Web App” and tap Add. Your Bhavé Contact icon
            will open this scannable card.
          </p>
        </section>
        <p className="contact-return"><Link to="/">Return to the Observatory ↑</Link></p>
      </main>
    </div>
  );
}
