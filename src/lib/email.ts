import { APP_CONFIG } from "@/lib/constants";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // Fallback if parsing fails
  }
  return "#";
}

export async function sendReportUnlockEmail({
  toEmail,
  reportUrl,
  archetypeTitle,
}: {
  toEmail: string;
  reportUrl: string;
  archetypeTitle: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes("placeholder") || apiKey === "re_...") {
    console.log(`[Email Mock] Skipping actual Resend dispatch. Report URL for ${toEmail}: ${reportUrl}`);
    return { success: true, mocked: true };
  }

  const isProduction = process.env.NODE_ENV === "production";
  const rawFrom = process.env.RESEND_FROM_EMAIL?.trim();
  const isPlaceholderDomain =
    !rawFrom ||
    rawFrom.includes("yourdomain.com") ||
    rawFrom.includes("example.com") ||
    !rawFrom.includes("@");

  if (isProduction && isPlaceholderDomain) {
    console.error(
      "[Resend Configuration Error] RESEND_FROM_EMAIL is unconfigured or using a placeholder domain in production. Email dispatch aborted to prevent Resend 403 Forbidden errors."
    );
    return {
      success: false,
      error: "RESEND_FROM_EMAIL must be configured with a verified custom domain in production",
    };
  }

  // In non-production environments, fallback to Resend verified sandbox address
  const fromEmail = isPlaceholderDomain ? "onboarding@resend.dev" : rawFrom;

  // Prevent email header injection by removing newlines from subject
  const safeSubjectTitle = archetypeTitle.replace(/[\r\n]+/g, " ").trim();
  const safeHtmlArchetype = escapeHtml(archetypeTitle);
  const safeReportUrl = sanitizeUrl(reportUrl);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf8f5; color: #292524; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; padding: 36px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
        .badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
        h1 { font-size: 26px; line-height: 1.3; color: #1c1917; margin-top: 0; }
        p { font-size: 16px; line-height: 1.6; color: #44403c; }
        .cta-btn { display: inline-block; background: #b91c1c; color: #ffffff !important; font-weight: bold; font-size: 16px; padding: 14px 28px; text-decoration: none; border-radius: 10px; margin: 24px 0; text-align: center; }
        .box { background: #fdfaf7; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .footer { font-size: 12px; color: #78716c; margin-top: 32px; border-top: 1px solid #e7e5e4; padding-top: 20px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="badge">Official Confirmation</span>
        <h1>Your Psychological Blueprint Has Been Unlocked</h1>
        <p>Thank you for your purchase. Your comprehensive 12-page <strong>Attachment Style & Shadow Analysis</strong> report is now permanently accessible in your private portal.</p>
        
        <div class="box">
          <p style="margin: 0; font-weight: 600; color: #9a3412;">Primary Archetype: ${safeHtmlArchetype}</p>
          <p style="margin: 6px 0 0; font-size: 14px; color: #78716c;">Includes: The 30-Day Subconscious Rewiring Action Plan, Childhood Wound Blueprint, and Compatibility Matrix.</p>
        </div>

        <p style="text-align: center;">
          <a href="${safeReportUrl}" class="cta-btn" target="_blank">Access Your Premium Report &rarr;</a>
        </p>

        <p style="font-size: 14px; color: #57534e;">Bookmark this link for future reference. You can view, save, or print your report at any time.</p>

        <div class="footer">
          <p>Attachment Style & Relationship Shadow Assessment &copy; ${new Date().getFullYear()}. All rights reserved.</p>
          <p>Disclaimer: This assessment is for educational and self-reflection purposes only and does not constitute psychiatric or medical diagnosis.</p>
          <p>Questions or need support? Reply directly to this email or contact ${APP_CONFIG.supportEmail} for 14-day hassle-free refunds.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Attachment & Shadow Lab <${fromEmail}>`,
        to: [toEmail],
        subject: `Your Full Assessment & Shadow Analysis Report is Ready (${safeSubjectTitle})`,
        html,
      }),
    });

    const data = (await response.json()) as { id?: string; message?: string; name?: string };

    if (!response.ok) {
      console.error("[Email Error] Resend API returned error:", data);
      return { success: false, error: data.message || "Failed to send email" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send Resend email:", error);
    return { success: false, error };
  }
}
