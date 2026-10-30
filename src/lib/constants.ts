export const APP_CONFIG = {
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@attachmentshadow.com",
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "privacy@attachmentshadow.com",
  brandName: "Attachment & Relationship Shadow Assessment",
  appName: "Attachment & Shadow Lab",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://attachmentshadow.com",
} as const;
