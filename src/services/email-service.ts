
'use server';

/**
 * @fileOverview A placeholder service for sending emails.
 * In a real-world application, this file would contain the logic to send emails
 * using a third-party service like Resend, SendGrid, or Nodemailer.
 * 
 * This service is designed to be called from server-side code (e.g., Genkit flows).
 */

interface EmailPayload {
  to: string;
  subject: string;
  body: string; // Can be simple text or HTML content
}

/**
 * Sends an email using Resend.
 * 
 * @param {EmailPayload} payload - The email details.
 * @returns {Promise<{ success: boolean; message: string }>} - The result of the operation.
 */
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; message:string }> {

  // To enable real email sending, set this to true and add RESEND_API_KEY to your .env file
  const USE_REAL_EMAIL_SERVICE = false;

  if (USE_REAL_EMAIL_SERVICE) {
    // =================================================================================
    // REAL EMAIL IMPLEMENTATION (using Resend)
    // =================================================================================
    try {
      const { Resend } = await import('resend');
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        console.error("Resend API key is not set in environment variables.");
        return { success: false, message: "Server is not configured for sending emails." };
      }

      const resend = new Resend(resendApiKey);
      
      const { data, error } = await resend.emails.send({
        from: 'Content Ally <onboarding@resend.dev>', // See docs to use a custom domain
        to: [payload.to],
        subject: payload.subject,
        html: payload.body,
      });

      if (error) {
        console.error("Resend API Error:", error);
        return { success: false, message: `Failed to send email: ${error.message}` };
      }

      console.log("Email sent successfully via Resend:", data);
      return { success: true, message: "Email sent successfully." };

    } catch (exception) {
      console.error("Exception occurred while sending email:", exception);
      const message = exception instanceof Error ? exception.message : "An unknown error occurred.";
      return { success: false, message };
    }
  } else {
    // =================================================================================
    // SIMULATED EMAIL SENDING (Placeholder)
    // =================================================================================
    console.log("===================================");
    console.log("== SIMULATING EMAIL SENDING... ==");
    console.log("===================================");
    console.log(`Recipient: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log("Body (HTML):");
    console.log(payload.body);
    console.log("===================================");
    console.log("To send a real email, edit src/services/email-service.ts and add your API key to .env");

    return {
      success: true,
      message: "Email sent successfully (simulated). Check the server console.",
    };
  }
}
