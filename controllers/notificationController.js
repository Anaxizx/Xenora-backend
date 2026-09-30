const nodemailer = require("nodemailer");

async function sendNotification(req, res) {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const user = req.user;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: process.env.OWNER_EMAIL,
            subject: "New XENORA Customer Enquiry",
            text: `
New customer enquiry from XENORA

Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone || "Not provided"}

Message:
${message}
            `.trim()
        });

        return res.status(200).json({
            success: true,
            message: "Enquiry sent successfully"
        });

    } catch (error) {
        console.error("Notification error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send enquiry"
        });
    }
}

module.exports = { sendNotification };
