
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
 * Sends an email. This is a simulation that logs to the console.
 * 
 * @param {EmailPayload} payload - The email details.
 * @returns {Promise<{ success: boolean; message: string }>} - The result of the operation.
 */
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; message:string }> {
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
    console.log("To send a real email, a third-party email service needs to be configured.");

    return {
      success: true,
      message: "Email sent successfully (simulated). Check the server console.",
    };
}
