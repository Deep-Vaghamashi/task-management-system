import nodemailer from 'nodemailer';

// Create the transporter using your environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your 16-character App Password
  },
});

export async function sendInvitationEmail(email: string, password: string, projectName: string) {
  const mailOptions = {
    from: `"Project Manager" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Invitation: Join ${projectName} on the Task Portal`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">You've Been Invited!</h2>
        <p>Hi there,</p>
        <p>A manager has invited you to collaborate on the project: <strong>${projectName}</strong>.</p>
        <p>You can log in to your account using the following credentials:</p>
        
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Login Email:</strong> ${email}</p>
          <p style="margin: 0; margin-top: 10px;"><strong>Temporary Password:</strong> <code style="background: #eef2ff; padding: 2px 5px; border-radius: 4px;">${password}</code></p>
        </div>

        <p style="color: #ef4444; font-size: 0.875rem;"><em>Note: For security, please change your password immediately after your first login.</em></p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.75rem; color: #9ca3af; text-align: center;">This is an automated message from your Task Management System.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}