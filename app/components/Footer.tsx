import Link from "next/link";
import Image from "next/image";

export function PreFooterCTA() {
  return (
    <section className="bg-oa-grey-100 py-16" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 md:flex-row md:justify-between md:items-start">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/images/open-active-logo.svg"
              alt=""
              width={120}
              height={48}
              className="h-12 w-auto"
              aria-hidden="true"
            />
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-4 w-full sm:w-auto sm:flex-row sm:gap-6">
            <a
              href="https://www.linkedin.com/company/openactive/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center px-6 py-3 border-2 border-oa-navy text-oa-navy font-semibold text-sm uppercase tracking-wide hover:bg-oa-navy hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-oa-navy focus:ring-offset-2 rounded-sm"
            >
              Join us on LinkedIn
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <a
              href="mailto:hello@openactive.io"
              className="text-center px-6 py-3 border-2 border-oa-navy text-oa-navy font-semibold text-sm uppercase tracking-wide hover:bg-oa-navy hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-oa-navy focus:ring-offset-2 rounded-sm"
            >
              Email us
            </a>
            <a
              href="https://slack.openactive.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center px-6 py-3 border-2 border-oa-navy text-oa-navy font-semibold text-sm uppercase tracking-wide hover:bg-oa-navy hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-oa-navy focus:ring-offset-2 rounded-sm"
            >
              Join us on Slack
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>

          {/* Stewards & supporters */}
          <div className="flex flex-col gap-6 text-sm text-oa-grey-600 items-center md:items-start">
            <div>
              <p className="font-medium mb-2">Stewarded by</p>
              <Image
                src="/images/odi-logo-80px.svg"
                alt="Open Data Institute"
                width={80}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <div>
              <p className="font-medium mb-2">Supported by</p>
              <div className="flex items-center gap-6">
                <Image
                  src="/images/the-national-lottery-logo.svg"
                  alt="The National Lottery"
                  width={120}
                  height={80}
                  className="h-14 w-auto"
                />
                <Image
                  src="/images/sport_england.svg"
                  alt="Sport England"
                  width={100}
                  height={40}
                  className="h-10 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-oa-indigo text-white py-6 mt-auto" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <nav aria-label="Footer links">
            <ul className="flex gap-6 text-sm">
              <li>
                <Link
                  href="https://www.openactive.io/developers/"
                  className="text-white/70 hover:text-white transition-colors underline focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-oa-indigo rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  For developers
                  <span className="sr-only"> (opens in new tab)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.openactive.io/privacy-policy/"
                  className="text-white/70 hover:text-white transition-colors underline focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-oa-indigo rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                  <span className="sr-only"> (opens in new tab)</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
