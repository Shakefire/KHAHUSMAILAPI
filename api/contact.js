import { Resend } from 'resend';

const escapeHtml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

export default async function handler(req, res) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://khahusconsulting.com.ng');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Method check
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { fullName, email, phone = '', company = '', service, message } = req.body || {};

        // Input validation based on the frontend structure
        if (!fullName || !email || !service || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Simple spam protection
        if (message.trim().length < 10) {
            return res.status(400).json({ error: 'Message is too short. Please provide more details.' });
        }

        if (!process.env.RESEND_API_KEY) {
          return res.status(503).json({ error: 'Email service is not configured.' });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const safeName = escapeHtml(fullName.trim());
        const safeEmail = escapeHtml(email.trim());
        const safePhone = escapeHtml(phone.trim());
        const safeCompany = escapeHtml(company.trim());
        const safeService = escapeHtml(service.trim());
        const safeMessage = escapeHtml(message.trim()).replace(/\n/g, '<br>');

        // Generate a premium HTML email template
        const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAFAFA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #E5E5E5;">
        <!-- Header -->
          <div style="background: #1E2D5B; padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">KHAHUS Consulting Solutions</h1>
          <p style="color: #F2A23D; margin: 10px 0 0 0; font-size: 16px;">New enquiry: ${safeService}</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px; background-color: #ffffff;">
          <div style="margin-bottom: 25px;">
            <h2 style="color: #B9111F; font-size: 18px; border-bottom: 2px solid #F2A23D; padding-bottom: 8px; margin-bottom: 20px;">Contact Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Full Name:</strong></td>
                <td style="padding: 8px 0; color: #333;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                <td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #B9111F; text-decoration: none;">${safeEmail}</a></td>
              </tr>
              ${safePhone ? `
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0; color: #333;">${safePhone}</td>
              </tr>` : ''}
              ${safeCompany ? `
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Company:</strong></td>
                <td style="padding: 8px 0; color: #333;">${safeCompany}</td>
              </tr>` : ''}
            </table>
          </div>

          <div style="margin-top: 30px;">
            <h2 style="color: #B9111F; font-size: 18px; border-bottom: 2px solid #F2A23D; padding-bottom: 8px; margin-bottom: 15px;">Message</h2>
            <div style="background-color: #F6F3EE; padding: 20px; border-radius: 8px; border-left: 5px solid #B9111F; color: #444; line-height: 1.6;">
              ${safeMessage}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1A1A1A; padding: 20px; text-align: center; color: #ffffff; font-size: 13px;">
          <p style="margin: 0 0 10px 0;"><strong>KHAHUS Consulting Solutions</strong></p>
          <p style="margin: 0; color: rgba(255,255,255,0.7);">Professional consulting, training and business solutions.</p>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="margin: 0;">This inquiry was sent via the official contact form.</p>
            <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} KHAHUS Consulting Solutions. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

        // Send email via Resend
        const { data, error } = await resend.emails.send({
          from: process.env.CONTACT_FORM_FROM || 'KHAHUS Consulting Solutions <updates@updates.khahusconsulting.com.ng>',
          to: [process.env.CONTACT_FORM_TO || 'info@khahusconsulting.com.ng'],
          reply_to: email.trim(),
          subject: `New enquiry: ${service.trim()}`,
            html: emailHtml,
        });

        if (error) {
            console.error('Resend Error:', error);
            const errorMessage = typeof error === 'object' ? error.message : String(error);
            return res.status(500).json({ error: errorMessage || 'Failed to send email' });
        }

        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
}
