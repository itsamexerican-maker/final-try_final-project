// app/api/notify/route.ts
// Sends an email to the admin when a new character is submitted.
// Uses Resend. Non-fatal — a failed email won't break the submission.
// Triggered by app/submit/page.tsx after a successful card insert.

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, race, className, age, bio } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Character name is required" },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL ?? "";
    const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    await resend.emails.send({
      from:    "Character Compendium <onboarding@resend.dev>",
      to:      adminEmail,
      subject: `⚔️ New Character Submission: ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto;
                    background: #f4e9d0; border: 2px solid #8b6520;
                    border-radius: 8px; padding: 32px; color: #2c1810;">

          <h1 style="font-size: 24px; margin-bottom: 4px; color: #2c1810;">
            ⚔️ New Character Awaits Your Judgement
          </h1>
          <p style="color: #7a5c42; margin-top: 0;">
            A new character has been submitted to the Compendium and requires approval.
          </p>

          <hr style="border: none; border-top: 1px solid #d4b896; margin: 20px 0;" />

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 120px;">Name</td>
              <td style="padding: 6px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Race</td>
              <td style="padding: 6px 0;">${race ?? "—"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Class</td>
              <td style="padding: 6px 0;">${className ?? "—"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Age</td>
              <td style="padding: 6px 0;">${age ?? "—"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Bio</td>
              <td style="padding: 6px 0; font-style: italic;">
                ${bio ? bio : "<em>No bio provided.</em>"}
              </td>
            </tr>
          </table>

          <hr style="border: none; border-top: 1px solid #d4b896; margin: 20px 0;" />

          <div style="display: flex; gap: 12px;">
            <a href="${siteUrl}/admin"
               style="display: inline-block; padding: 10px 24px; background: #2c1810;
                      color: #f4e9d0; border-radius: 4px; text-decoration: none;
                      font-weight: bold;">
              Review in Admin Panel
            </a>
          </div>

          <p style="color: #7a5c42; font-size: 12px; margin-top: 24px;">
            Starter Character Creator · TTRPG Aid
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    // Non-fatal — log but don't crash the submission flow
    console.error("Resend email error:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
