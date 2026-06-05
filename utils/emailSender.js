const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (options) => {
    // If we are on Railway and have the Brevo API Key, use HTTP API to bypass SMTP block
    if (process.env.BREVO_API_KEY) {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: "ConnectHub App", email: process.env.EMAIL_USER || "zahraabobakr3@gmail.com" },
                to: [{ email: options.email }],
                subject: options.subject,
                htmlContent: `<div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                    <h2>ConnectHub Password Reset</h2>
                    <p style="font-size: 16px;">${options.message.replace(/\n/g, '<br>')}</p>
                </div>`
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error('Failed to send email via Brevo API: ' + err);
        }
        return; // Success
    }

    // Create a transporter using Nodemailer
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 5000, // timeout if connection takes longer than 5 seconds
        greetingTimeout: 5000,
        socketTimeout: 5000,
    });

    // 2) Define the email options
    const mailOptions = {
        from: `Social Media App <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
