import Link from "next/link";

// plain-english privacy disclosure for the alpha. honest about what is
// collected, why, and how to make it go away. should be lawyer-reviewed
// before public launch (the DRAFT banner says so).

export const metadata = {
  title: "privacy — smoll bets",
};

export default function PrivacyPage() {
  return (
    <main
      style={{
        background: "#fff8f2",
        color: "#1a0a00",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        padding: "24px 20px 48px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "#7a5a3a",
          textDecoration: "none",
        }}
      >
        ← back to smoll bets
      </Link>

      <h1
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 32,
          fontWeight: 700,
          marginTop: 24,
          marginBottom: 4,
          lineHeight: 1.1,
        }}
      >
        privacy
      </h1>
      <div style={{ fontSize: 13, color: "#7a5a3a", marginBottom: 24 }}>
        last updated 2026-05-05
      </div>

      <Section title="what we collect">
        <ul>
          <li>your email address (so we can sign you in)</li>
          <li>a display name (whatever you tell us when you sign in with google, or the local part of your email if you used magic link)</li>
          <li>the circles you create or join, the habits, targets, durations, and stakes you write into them</li>
          <li>each log you submit (date, optional caption, optional photo)</li>
          <li>each reaction you give to a friend's log</li>
          <li>basic technical data when something breaks (browser, page url, error stack), routed through sentry for debugging</li>
        </ul>
      </Section>

      <Section title="why we collect it">
        <p>to run the app. that is it. there is no ad targeting, no marketing list, no profile sold to third parties.</p>
      </Section>

      <Section title="where it lives">
        <p>
          on supabase (postgres database, file storage, auth) and vercel (hosting). both are us-based. we do not move your data anywhere else. error data goes to sentry.io for the purpose of fixing bugs.
        </p>
      </Section>

      <Section title="who sees it">
        <p>
          your circles members see your logs, reactions, and captions in those specific circles. nobody outside a circle can see what is in it. no public discovery, no global feed.
        </p>
        <p>we (the maintainers) can technically see your data for support and debugging. we do not look unless you ask us to or unless we are investigating an abuse report.</p>
      </Section>

      <Section title="cookies and tracking">
        <p>
          we use a single cookie to keep you signed in (the supabase auth cookie). no analytics cookies, no advertising cookies, no third-party trackers.
        </p>
      </Section>

      <Section title="your rights">
        <ul>
          <li><strong>see your data:</strong> ask us by email and we will send you a copy.</li>
          <li><strong>delete everything:</strong> profile screen → delete account. permanent and immediate. all your logs, reactions, and circle memberships disappear. anything friends owe you in real life is between you and them; the app cannot help once the data is gone.</li>
          <li><strong>correct your data:</strong> most things are editable in the app. for anything that is not, email us.</li>
        </ul>
      </Section>

      <Section title="age">
        <p>smoll bets is not for anyone under 13. if you are under 13, do not sign up.</p>
      </Section>

      <Section title="changes">
        <p>
          if this policy changes, we update the date at the top. material changes get an in-app notice before they take effect.
        </p>
      </Section>

      <Section title="contact">
        <p>
          questions, requests, or anything else: open the app, go to your profile, and tap <strong>send feedback</strong>. it lands in the maintainer&apos;s inbox.
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.55,
        }}
      >
        {children}
      </div>
    </section>
  );
}
