export const APP_CONFIG = {
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "zhuxiangjv+support@gmail.com",
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "zhuxiangjv+support@gmail.com",
  brandName: "Attachment & Relationship Shadow Assessment",
  appName: "Attachment & Shadow Lab",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://relationship-assessment-apv.pages.dev",
} as const;
