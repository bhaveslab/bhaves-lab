/**
 * Optional one-time support for independent consciousness research.
 * Only show the disclosure when a separately configured Stripe contribution URL is present.
 * This is not a book purchase, charitable donation, or financial-progress tracker.
 */
const tipUrl = (import.meta as ImportMeta & {
  readonly env?: { readonly VITE_POSSIBILITY_TIP_URL?: string };
}).env?.VITE_POSSIBILITY_TIP_URL?.trim();

export function PossibilitySupport() {
  if (!tipUrl || !/^https:\/\/buy\.stripe\.com\//i.test(tipUrl)) return null;

  return (
    <section id="support" className="possibility-support" aria-labelledby="support-heading">
      <details className="possibility-support-fold">
        <summary className="possibility-support-tab">
          <span className="possibility-support-eyebrow">BHAVÉ’S LAB / CONSCIOUSNESS RESEARCH</span>
          <span className="possibility-support-tab-title" id="support-heading">
            Contribute to Research
          </span>
          <span className="possibility-support-tab-subtitle">Optional support · Tap to explore</span>
          <span className="possibility-support-chevron" aria-hidden="true">+</span>
        </summary>
        <div className="possibility-support-panel">
          <p className="lab-kicker">INDEPENDENT RESEARCH</p>
          <h2>Researching <em>Possibilities.</em></h2>
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
      </details>
    </section>
  );
}
