import axios from 'axios';

const NOTIFICATIONS_API_URL = import.meta.env.VITE_MS_NOTIFICATIONS as string;

// Interfaces
interface EmailPayload {
  subject: string;
  email: string;
  html: string;
  text: string;
}

interface EmailResponse {
  infoService: {
    appName: string;
    timeStamp: string;
    path: string;
    method: string;
    host: string;
  };
  status: {
    statusCode: number;
    message: string;
  };
  responsePayload: {
    result: boolean;
    data: boolean;
  };
}

// Email Template Generator
const generateNotificationTemplate = (reason: string, description: string): { html: string; text: string } => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px 40px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
          Nexus
        </h1>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
          Enterprise Collaboration Platform
        </p>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px;">
        <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 22px; font-weight: 600;">
          ${reason}
        </h2>
        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
          ${description}
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        
        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
          If you have any questions, please contact our support team.
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px;">
          © ${new Date().getFullYear()} Nexus. All rights reserved.
        </p>
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
NEXUS NOTIFICATION
==================

${reason}

${description}

---
If you have any questions, please contact our support team.

© ${new Date().getFullYear()} Nexus. All rights reserved.
This is an automated notification. Please do not reply to this email.
  `.trim();

  return { html, text };
};

// Email Service
export const emailService = {
  /**
   * Send a raw email with custom HTML and text content
   */
  sendEmail: async (payload: EmailPayload): Promise<EmailResponse> => {
    const response = await axios.post<EmailResponse>(
      `${NOTIFICATIONS_API_URL}/emails/send`,
      payload
    );
    return response.data;
  },

  /**
   * Send a notification email using the standard template
   * @param email - Recipient email address
   * @param reason - Main reason/title for the notification (e.g., "Account Update", "New Message")
   * @param description - Brief description of the notification
   * @param customSubject - Optional custom subject line (defaults to reason)
   */
  sendNotification: async (
    email: string,
    reason: string,
    description: string,
    customSubject?: string
  ): Promise<EmailResponse> => {
    const { html, text } = generateNotificationTemplate(reason, description);
    
    const payload: EmailPayload = {
      email,
      subject: customSubject || `Nexus: ${reason}`,
      html,
      text
    };

    return emailService.sendEmail(payload);
  },

  /**
   * Send a welcome email to a new user
   */
  sendWelcomeEmail: async (email: string, userName: string): Promise<EmailResponse> => {
    return emailService.sendNotification(
      email,
      'Welcome to Nexus! 🎉',
      `Hello ${userName}! We're excited to have you on board. Your account has been successfully created. Start exploring and collaborating with your team today!`,
      'Welcome to Nexus'
    );
  },

  /**
   * Send a password reset email
   */
  sendPasswordResetEmail: async (email: string, resetLink: string): Promise<EmailResponse> => {
    return emailService.sendNotification(
      email,
      'Password Reset Request',
      `We received a request to reset your password. Click the link below to set a new password: ${resetLink}. If you didn't request this, you can safely ignore this email.`,
      'Reset Your Nexus Password'
    );
  },

  /**
   * Send a join request approved notification
   */
  sendJoinRequestApproved: async (email: string, enterpriseName: string): Promise<EmailResponse> => {
    return emailService.sendNotification(
      email,
      'Join Request Approved ✅',
      `Great news! Your request to join "${enterpriseName}" has been approved. You now have full access to the enterprise workspace. Log in to start collaborating with your team.`,
      `You're now a member of ${enterpriseName}`
    );
  },

  /**
   * Send a join request rejected notification
   */
  sendJoinRequestRejected: async (email: string, enterpriseName: string): Promise<EmailResponse> => {
    return emailService.sendNotification(
      email,
      'Join Request Update',
      `Your request to join "${enterpriseName}" was not approved at this time. Please contact the enterprise administrator for more information.`,
      `Update on your ${enterpriseName} request`
    );
  },

  /**
   * Send a role assignment notification
   */
  sendRoleAssigned: async (email: string, roleName: string, enterpriseName: string): Promise<EmailResponse> => {
    return emailService.sendNotification(
      email,
      'New Role Assigned 🔑',
      `You have been assigned the "${roleName}" role in "${enterpriseName}". This may grant you additional permissions and access. Check your dashboard to see what's new.`,
      `New Role: ${roleName}`
    );
  }
};

export default emailService;
