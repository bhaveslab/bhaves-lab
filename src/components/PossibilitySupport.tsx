/**
 * Voluntary one-time contribution to ongoing consciousness research only. This is not a charitable donation
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
          <p className="lab-kicker">BHAVÉ’S LAB / CONSCIOUSNESS RESEARCH</p>
          <h2 id="support-heading">Researching <em>Possibilities.</em></h2>
          <p className="possibility-support-lead">
            An open-ended exploration of consciousness, awareness, perception,
            and lived experience.
          </p>
          <p className="possibility-support-description">
            Bhavé’s Lab investigates the nature of consciousness and the ways we
            experience reality. Your optional contribution supports this
            independent, ongoing inquiry.
          </p>
          <a className="possibility-support-button" href={tipUrl}
             target="_blank" rel="noopener noreferrer">
            Contribution to Ongoing Research <span aria-hidden="true">↗</span>
          </a>
          <p className="possibility-support-fineprint">
            Choose your own amount at secure Stripe checkout. This is a voluntary,
            one-time contribution toward consciousness research, not a charitable
            donation or tax-deductible gift. No publication, report,
            service, or specific outcome is promised.
          </p>
        </div>
        <div className="possibility-support-orbit" aria-hidden="true">
          <span>OBSERVE.<br />EXPLORE.<br />DISCOVER.</span>
        </div>
      </div>
    </section>
  );
}
