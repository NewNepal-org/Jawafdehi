import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Helmet } from "react-helmet-async";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Privacy Policy | Jawafdehi Nepal</title>
        <meta name="description" content="Jawafdehi's privacy policy — how we handle data, cookies, and user information on Nepal's open corruption accountability platform." />
        <link rel="canonical" href="https://jawafdehi.org/privacy" />
        <meta property="og:site_name" content="Jawafdehi Nepal" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jawafdehi.org/privacy" />
        <meta property="og:title" content="Privacy Policy | Jawafdehi Nepal" />
        <meta property="og:description" content="Jawafdehi's privacy policy — how we handle data, cookies, and user information on Nepal's open corruption accountability platform." />
        <meta property="og:image" content="https://jawafdehi.org/og-favicon.png" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Privacy Policy | Jawafdehi Nepal" />
        <meta name="twitter:description" content="Jawafdehi's privacy policy — how we handle data, cookies, and user information on Nepal's open corruption accountability platform." />
        <meta name="twitter:image" content="https://jawafdehi.org/og-favicon.png" />
      </Helmet>
      <Header />

      <main id="main-content" className="flex-1">
        <section className="bg-gradient-to-br from-primary via-navy-dark to-slate-800 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Privacy Policy
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
              <h2>1. Overview</h2>
              <p>
                Jawafdehi ("we", "our", or "us") operates the jawafdehi.org website. This Privacy Policy explains how we collect, use, and protect information when you use our platform. We believe in minimal data collection and maximum transparency — consistent with our mission as Nepal's open corruption accountability platform.
              </p>

              <h2>2. Information We Collect</h2>

              <h3>2.1 Information You Provide</h3>
              <p>
                When you submit feedback, report an allegation, or volunteer through our platform, you may provide:
              </p>
              <ul>
                <li>Your name (optional)</li>
                <li>Email address (optional)</li>
                <li>Any information you choose to include in your submission</li>
              </ul>
              <p>
                All submissions are voluntary. You may submit feedback or reports anonymously.
              </p>

              <h3>2.2 Automatically Collected Information</h3>
              <p>
                When you visit jawafdehi.org, our hosting infrastructure automatically collects standard server logs that may include:
              </p>
              <ul>
                <li>IP address (temporarily logged for security and debugging)</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Referring URL</li>
              </ul>
              <p>
                We use Cloudflare for DNS, CDN, and security. Cloudflare may process visitor data according to their privacy policy. We do not use any third-party analytics trackers, advertising networks, or tracking cookies.
              </p>

              <h2>3. Cookies</h2>
              <p>
                Jawafdehi.org uses minimal cookies:
              </p>
              <ul>
                <li><strong>Language preference</strong>: We store your chosen language (English or Nepali) in a cookie so you don't have to select it on every visit.</li>
                <li><strong>Session cookies</strong>: If you access the caseworker portal, we use session cookies for authentication.</li>
              </ul>
              <p>
                We do not use tracking cookies, advertising cookies, or third-party analytics cookies.
              </p>

              <h2>4. How We Use Information</h2>
              <p>We use collected information only for:</p>
              <ul>
                <li>Processing feedback, allegations, and volunteer submissions</li>
                <li>Operating and improving the website</li>
                <li>Security monitoring and abuse prevention</li>
                <li>Responding to inquiries</li>
              </ul>
              <p>
                We never sell, rent, or share personal information with third parties for commercial purposes.
              </p>

              <h2>5. Data Storage and Security</h2>
              <p>
                Jawafdehi operates on Cloudflare infrastructure. Submission data and server logs are stored securely. We take reasonable technical and organizational measures to protect data against unauthorized access, alteration, or destruction.
              </p>
              <p>
                Server logs are retained for a limited period for operational purposes and are not used for user profiling.
              </p>

              <h2>6. Third-Party Services</h2>
              <p>
                We use the following third-party services that may process visitor data:
              </p>
              <ul>
                <li><strong>Cloudflare</strong>: DNS, CDN, DDoS protection, and hosting infrastructure.</li>
                <li><strong>UptimeRobot</strong>: External uptime monitoring (linked from our status page).</li>
              </ul>
              <p>
                Links to external websites (e.g., GitHub, social media, Let's Build Nepal) are governed by their respective privacy policies.
              </p>

              <h2>7. Children's Privacy</h2>
              <p>
                Our platform is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will delete it.
              </p>

              <h2>8. Your Rights</h2>
              <p>
                You may request:
              </p>
              <ul>
                <li>Access to any personal data we hold about you</li>
                <li>Correction or deletion of your personal data</li>
                <li>Information about how your data is processed</li>
              </ul>
              <p>
                To exercise these rights, contact us through the Feedback page.
              </p>

              <h2>9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. We encourage you to review this policy periodically.
              </p>

              <h2>10. Contact</h2>
              <p>
                For questions about this Privacy Policy, please use our <a href="/feedback" className="text-primary hover:underline">Feedback page</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
