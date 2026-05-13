import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Helmet } from "react-helmet-async";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Terms of Service | Jawafdehi Nepal</title>
        <meta name="description" content="Jawafdehi's terms of service — guidelines for using Nepal's open corruption accountability platform and public case archive." />
        <link rel="canonical" href="https://jawafdehi.org/terms" />
        <meta property="og:site_name" content="Jawafdehi Nepal" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jawafdehi.org/terms" />
        <meta property="og:title" content="Terms of Service | Jawafdehi Nepal" />
        <meta property="og:description" content="Jawafdehi's terms of service — guidelines for using Nepal's open corruption accountability platform and public case archive." />
        <meta property="og:image" content="https://jawafdehi.org/og-favicon.png" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terms of Service | Jawafdehi Nepal" />
        <meta name="twitter:description" content="Jawafdehi's terms of service — guidelines for using Nepal's open corruption accountability platform and public case archive." />
        <meta name="twitter:image" content="https://jawafdehi.org/og-favicon.png" />
      </Helmet>
      <Header />

      <main id="main-content" className="flex-1">
        <section className="bg-gradient-to-br from-primary via-navy-dark to-slate-800 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Terms of Service
              </h1>
              <p className="text-xl text-primary-foreground/80 leading-relaxed">
                Last updated: May 2026
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using jawafdehi.org ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.
              </p>

              <h2>2. About Jawafdehi</h2>
              <p>
                Jawafdehi is Nepal's open corruption accountability platform. We document, simplify, and permanently archive CIAA (Commission for the Investigation of Abuse of Authority) corruption cases. All published case data is in the public domain and is provided for public interest, transparency, and accountability purposes.
              </p>
              <p>
                Jawafdehi is a volunteer-run, open-source project. We are not a government entity, law firm, or legal authority. We do not provide legal advice.
              </p>

              <h2>3. Use of the Platform</h2>

              <h3>3.1 Permitted Use</h3>
              <p>You may use the Platform to:</p>
              <ul>
                <li>Browse and search public corruption case records</li>
                <li>Submit feedback through our designated forms</li>
                <li>Report allegations through our designated submission forms</li>
                <li>Volunteer and contribute to the project</li>
                <li>Share and reference public case information with proper attribution</li>
              </ul>

              <h3>3.2 Prohibited Conduct</h3>
              <p>You agree not to:</p>
              <ul>
                <li>Submit false, misleading, or fraudulent information through any Platform form</li>
                <li>Use the Platform to harass, defame, or threaten any individual or entity</li>
                <li>Attempt to gain unauthorized access to any part of the Platform or its systems</li>
                <li>Use automated tools to scrape, crawl, or overload the Platform in a way that degrades service for other users</li>
                <li>Impersonate any person or entity, or misrepresent your affiliation</li>
                <li>Use the Platform for any unlawful purpose</li>
              </ul>

              <h2>4. Public Domain Data</h2>
              <p>
                All published case records, summaries, and related data on the Platform are in the public domain. You may freely use, share, and reference this information. We encourage attribution to Jawafdehi.org when using our data, but it is not required.
              </p>
              <p>
                User-submitted information (feedback, allegations, volunteer applications) is handled according to our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
              </p>

              <h2>5. Content Accuracy</h2>
              <p>
                We strive for accuracy through rigorous sourcing from official documents and human review. However:
              </p>
              <ul>
                <li>Case information is based on publicly available records and may not reflect the most current legal status</li>
                <li>We do not guarantee the completeness or accuracy of all content</li>
                <li>Information on the Platform should not be treated as legal fact or used as the sole basis for legal decisions</li>
              </ul>
              <p>
                If you believe any information is inaccurate, please use our <a href="/feedback" className="text-primary hover:underline">Feedback page</a>.
              </p>

              <h2>6. Intellectual Property</h2>
              <p>
                The Jawafdehi platform codebase is open source and available on <a href="https://github.com/Jawafdehi" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub</a>. The Jawafdehi name, logo, and branding are property of the Jawafdehi project. Case data published on the platform is in the public domain.
              </p>

              <h2>7. Disclaimer of Warranties</h2>
              <p>
                The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free of harmful components.
              </p>

              <h2>8. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by applicable law, Jawafdehi, its volunteers, and contributors shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of or inability to use the Platform.
              </p>

              <h2>9. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Jawafdehi, its volunteers, and contributors from any claims, damages, or expenses arising from your use of the Platform or violation of these Terms.
              </p>

              <h2>10. Third-Party Links</h2>
              <p>
                The Platform may contain links to third-party websites (e.g., CIAA, Nepali government portals, GitHub, social media). We are not responsible for the content or practices of these external sites.
              </p>

              <h2>11. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of the Platform after changes constitutes acceptance of the modified Terms.
              </p>

              <h2>12. Governing Law</h2>
              <p>
                These Terms are governed by the laws of Nepal. Any disputes arising from these Terms shall be subject to the jurisdiction of Nepali courts.
              </p>

              <h2>13. Contact</h2>
              <p>
                For questions about these Terms, please use our <a href="/feedback" className="text-primary hover:underline">Feedback page</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
