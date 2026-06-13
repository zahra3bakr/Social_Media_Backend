const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (options) => {
    // If we have SendGrid API Key, use HTTP API to bypass Railway SMTP block
    if (process.env.SENDGRID_API_KEY) {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [{
                    to: [{ email: options.email }],
                    subject: options.subject
                }],
                from: { 
                    email: process.env.EMAIL_USER || "zahraabobakr3@gmail.com", 
                    name: "ConnectHub App" 
                },
                content: [{
                    type: "text/html",
                    value: `<div style="font-family: Arial; padding: 20px; text-align: center;">
                        <h2>ConnectHub Password Reset</h2>
                        <p>${options.message.replace(/\n/g, '<br>')}</p>
                    </div>`
                }]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error('Failed to send via SendGrid: ' + err);
        }
        return; // Success
    }

    /*
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    await transporter.sendMail({
        from: `ConnectHub App <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    });
    */
};

module.exports = sendEmail;
