/**
 * Voluntary one-time creator tipping only. This is not a charitable donation
 * collection or a progress tracker for the fictional $100,000 storyline.
 * Do not point this at a book, session, or unrelated payment link.
 */
const tipUrl = (import.meta as ImportMeta & {
  readonly env?: { readonly VITE_POSSIBILITY_TIP_URL?: string };
}).env?.VITE_POSSIBILITY_TIP_URL?.trim();

export function PossibilitySupport() {
  // Hide the whole section until a real, separately verified creator-tip link
  // has been configured. Never render a decorative or non-functional CTA.
  if (!tipUrl || !/^https:\/\/buy\.stripe\.com\//i.test(tipUrl)) return null;

  return (
    <section id="support" className="possibility-support" aria-labelledby="support-heading">
      <div className="possibility-support-panel">
        <div>
          <p className="lab-kicker">AN OPEN POSSIBILITY</p>
          <h2 id="support-heading">Keep life <em>in motion.</em></h2>
          <p className="possibility-support-lead">
            Enjoying the Observatory and the creative stories shared here?
            Leave a little possibility behind.
          </p>
          <p className="possibility-support-description">
            A voluntary, one-time tip is a way to appreciate Bhavé’s published
            creative work and support his independent storytelling as the
            Gentleman of Possibility continues exploring life.
          </p>
          <a className="possibility-support-button" href={tipUrl}
             target="_blank" rel="noopener noreferrer">
            Fuel a Possibility <span aria-hidden="true">↗</span>
          </a>
          <p className="possibility-support-fineprint">
            Choose your own amount at secure Stripe checkout. This is a tip for
            creative content already provided, not a charitable donation or a
            tax-deductible gift. No rewards or specific results are promised.
          </p>
        </div>
        <div className="possibility-support-orbit" aria-hidden="true">
          <span>WHAT ELSE<br />IS POSSIBLE?</span>
        </div>
      </div>
    </section>
  );
}
