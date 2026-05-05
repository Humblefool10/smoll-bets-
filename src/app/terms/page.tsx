import Link from "next/link";

export const metadata = {
  title: "terms — smoll bets",
};

export default function TermsPage() {
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

      <div
        style={{
          marginTop: 16,
          marginBottom: 24,
          padding: "10px 14px",
          border: "2px dashed #f34e4e",
          borderRadius: 8,
          fontSize: 13,
          color: "#7a5a3a",
          background: "#fff3ea",
        }}
      >
        draft. plain english version of what using the alpha means. needs lawyer review before public launch.
      </div>

      <h1
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 4,
          lineHeight: 1.1,
        }}
      >
        terms
      </h1>
      <div style={{ fontSize: 13, color: "#7a5a3a", marginBottom: 24 }}>
        last updated 2026-05-05
      </div>

      <Section title="what this is">
        <p>
          smoll bets is an alpha-stage web app for small groups to commit to a habit together with stakes attached. it is currently free to use.
        </p>
      </Section>

      <Section title="how to use it">
        <ul>
          <li>sign up with an email or google account</li>
          <li>create or join circles with people you actually know</li>
          <li>log your habit honestly, react warmly, hold each other accountable</li>
          <li>do not use the app to harass, bully, or shame anyone</li>
        </ul>
      </Section>

      <Section title="stakes are between you and your friends">
        <p>
          the app records what is owed at the end of a circle. it does not enforce stakes, transfer money, or guarantee anyone follows through. that part is on you and your circle. losing a bet on smoll bets does not create a legal obligation; it creates a social one.
        </p>
      </Section>

      <Section title="content you create">
        <p>
          your captions, photos, reactions, and circle setups belong to you. you grant us a limited license to host them so the app can show them to your circle members. we will not use your content for advertising or train models on it.
        </p>
        <p>
          you are responsible for what you post. do not upload photos of people who have not consented, copyrighted material you do not have rights to, or anything illegal.
        </p>
      </Section>

      <Section title="account closure">
        <p>
          you can delete your account at any time from the profile screen. we may suspend or remove an account if it is being used to abuse, harass, or break the law.
        </p>
      </Section>

      <Section title="alpha software disclaimer">
        <p>
          smoll bets is in alpha. things will break, change, and occasionally lose data. it is provided as-is, with no warranty of any kind. do not use it for anything where data loss would be a problem.
        </p>
      </Section>

      <Section title="changes to these terms">
        <p>
          if these change, we update the date at the top. material changes get an in-app notice before they take effect.
        </p>
      </Section>

      <Section title="contact">
        <p>
          questions: open the app, go to your profile, and tap <strong>send feedback</strong>.
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
