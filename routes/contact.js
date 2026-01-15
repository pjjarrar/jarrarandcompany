const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { createMessage } = require('../database');

// POST /api/contact
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        // 1. Save to Database
        const newMessage = await createMessage({
            name,
            email,
            phone,
            message
        });

        // 2. Send Email (if configured)
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT || 587,
                    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });

                const mailOptions = {
                    from: process.env.SMTP_FROM || process.env.SMTP_USER,
                    to: process.env.CONTACT_EMAIL || 'info@jarrarandcompany.com', // Where to send inquiries
                    subject: `New Contact Form Submission from ${name}`,
                    text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}
                    `,
                    html: `
<h3>New Contact Form Submission</h3>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
<hr>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log('Contact email sent successfully');
            } catch (emailError) {
                console.error('Failed to send contact email:', emailError);
                // We don't fail the request here, as the DB save was successful
            }
        } else {
            console.log('SMTP not configured, skipping email send.');
        }

        res.status(201).json({
            message: 'Message received successfully',
            data: newMessage
        });
    } catch (error) {
        console.error('Error handling contact form submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
