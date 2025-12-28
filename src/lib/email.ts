/**
 * Email utilities using Resend
 */

import { Resend } from "resend";

// Lazy initialization - only create client when first email is sent
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

const FROM_EMAIL = "WaitlistPro <noreply@updates.waitlistpro.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface WaitlistInfo {
  name: string;
  slug: string;
}

/**
 * Send verification email after signup
 */
export async function sendVerificationEmail(
  to: string,
  waitlist: WaitlistInfo,
  verifyToken: string
) {
  const verifyUrl = `${APP_URL}/w/${waitlist.slug}/verify?token=${verifyToken}`;

  const { data, error } = await getResendClient().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Verify your spot on ${waitlist.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">You're almost in!</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; margin-bottom: 24px;">
            Thanks for joining the <strong>${waitlist.name}</strong> waitlist!
          </p>
          <p style="font-size: 16px; margin-bottom: 24px;">
            Click the button below to verify your email and secure your spot:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}" style="background: #3B82F6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
              Verify My Email
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
            If you didn't sign up for this waitlist, you can safely ignore this email.
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>Powered by WaitlistPro</p>
        </div>
      </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }

  return data;
}

/**
 * Send welcome email with referral link after verification
 */
export async function sendWelcomeEmail(
  to: string,
  waitlist: WaitlistInfo,
  position: number,
  referralCode: string
) {
  const referralUrl = `${APP_URL}/w/${waitlist.slug}?ref=${referralCode}`;
  const positionUrl = `${APP_URL}/w/${waitlist.slug}/${referralCode}`;

  const { data, error } = await getResendClient().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `You're #${position} on ${waitlist.name}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">You're in!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 18px;">Position #${position}</p>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; margin-bottom: 24px;">
            Welcome to the <strong>${waitlist.name}</strong> waitlist! Your email is now verified.
          </p>

          <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px;">Want to move up the line?</h3>
            <p style="margin: 0 0 16px 0; font-size: 14px; color: #4b5563;">
              Share your unique referral link. For every friend who joins, you'll move up in line!
            </p>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; word-break: break-all; font-family: monospace; font-size: 13px;">
              ${referralUrl}
            </div>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${positionUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
              Check Your Position
            </a>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>Powered by WaitlistPro</p>
        </div>
      </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send welcome email:", error);
    throw new Error("Failed to send welcome email");
  }

  return data;
}

/**
 * Send "You're invited!" email on launch day
 */
export async function sendInviteEmail(
  to: string,
  waitlist: WaitlistInfo,
  customMessage?: string
) {
  const { data, error } = await getResendClient().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `You're invited! ${waitlist.name} is live!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">The wait is over!</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; margin-bottom: 24px;">
            Great news! <strong>${waitlist.name}</strong> is now live and you're one of the first to get access.
          </p>
          ${customMessage ? `<p style="font-size: 16px; margin-bottom: 24px;">${customMessage}</p>` : ""}
          <p style="font-size: 16px; margin-bottom: 24px;">
            Thanks for being part of our early community. We can't wait to see what you do with it!
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>Powered by WaitlistPro</p>
        </div>
      </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send invite email:", error);
    throw new Error("Failed to send invite email");
  }

  return data;
}

/**
 * Send referral reward notification
 */
export async function sendRewardEmail(
  to: string,
  waitlist: WaitlistInfo,
  rewardTitle: string,
  rewardDescription: string,
  referralCount: number
) {
  const { data, error } = await getResendClient().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `You unlocked: ${rewardTitle}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Reward Unlocked!</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: #FEF3C7; padding: 16px 32px; border-radius: 8px; border: 2px solid #F59E0B;">
              <h2 style="margin: 0; color: #92400E; font-size: 20px;">${rewardTitle}</h2>
            </div>
          </div>
          <p style="font-size: 16px; margin-bottom: 24px; text-align: center;">
            You referred <strong>${referralCount} friends</strong> to ${waitlist.name} and unlocked this reward:
          </p>
          <p style="font-size: 16px; color: #4b5563; text-align: center; margin-bottom: 24px;">
            ${rewardDescription}
          </p>
          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            Keep sharing to unlock even more rewards!
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>Powered by WaitlistPro</p>
        </div>
      </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send reward email:", error);
    throw new Error("Failed to send reward email");
  }

  return data;
}
