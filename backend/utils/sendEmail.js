const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Basic fallback logic: if no SMTP configured, just log it.
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log("---------------------------------------------------------");
        console.log("No SMTP server configured. Printing email content instead:");
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: \n${options.message}`);
        console.log("---------------------------------------------------------");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
