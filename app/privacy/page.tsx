// app/privacy/page.tsx
// Privacy policy page — publicly accessible.
// Linked from the footer on every page.

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">

      <h1
        className="text-4xl font-bold text-center mb-4"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
      >
        Privacy Policy
      </h1>

      <div className="divider mb-8">
        <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-display)" }}>⚔</span>
      </div>

      <div
        className="flex flex-col gap-6 text-base leading-relaxed"
        style={{ fontFamily: "var(--font-body)", color: "var(--color-ink-light)" }}
      >
        <section>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            About This Site
          </h2>
          <p>
            The Starter Character Creator is a hobby project and TTRPG aid
            intended for personal use among friends. It allows visitors to
            browse, submit, and randomize fantasy characters for use in
            tabletop roleplaying games such as Dungeons &amp; Dragons and
            Pathfinder.
          </p>
        </section>

        <section>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Information We Collect
          </h2>
          <p>
            This site does not require visitors to create an account or
            provide personal information. When you submit a character, the
            following data is stored:
          </p>
          <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
            <li>Character name, race, class, age, and bio</li>
            <li>An optional portrait image you choose to upload</li>
          </ul>
          <p className="mt-2">
            No names, email addresses, or identifying information about the
            submitter are collected or stored.
          </p>
        </section>

        <section>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            How Data Is Used
          </h2>
          <p>
            Submitted character data is stored in a Supabase database and
            displayed publicly on this site after admin approval. Uploaded
            images are stored in Supabase Storage and served publicly.
            Character data is not sold, shared with third parties, or used
            for advertising.
          </p>
        </section>

        <section>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Third-Party Services
          </h2>
          <p>This site uses the following third-party services:</p>
          <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
            <li>
              <strong>Supabase</strong> — database and file storage
            </li>
            <li>
              <strong>Vercel</strong> — hosting and deployment
            </li>
            <li>
              <strong>RoboHash</strong> — default avatar generation
            </li>
            <li>
              <strong>DeepSeek</strong> — AI-powered character and bio generation
            </li>
            <li>
              <strong>Resend</strong> — admin email notifications
            </li>
          </ul>
        </section>

        <section>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Cookies &amp; Authentication
          </h2>
          <p>
            This site uses cookies only for admin authentication via Google
            OAuth through Supabase. Public visitors do not receive any
            tracking or analytics cookies.
          </p>
        </section>

        <section>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Contact
          </h2>
          <p>
            This is a student project. If you have questions or concerns
            about data stored on this site, please reach out to the site
            administrator directly.
          </p>
        </section>

      </div>

      {/* Back home */}
      <div className="text-center mt-12">
        <a
          href="/"
          className="inline-block px-6 py-2 rounded border font-semibold text-sm transition-colors hover:opacity-80"
          style={{
            fontFamily:  "var(--font-display)",
            borderColor: "var(--color-gold-dark)",
            color:       "var(--color-gold-dark)",
          }}
        >
          ← Return to the Compendium
        </a>
      </div>

    </div>
  );
}
