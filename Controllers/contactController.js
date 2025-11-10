const sendEmail = require("../Utils/email.js");

contactUs = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    // Validate
    if (!name || !email || !message) {
      return res.status(400).json({
        status: "fail",
        message: "Name, Email and Message are required.",
      });
    }

    // Compose message for admin
    const adminMessage = `
      New Contact Us Message:
      -----------------------
      Name: ${name}
      Email: ${email}

      Message:
      ${message}
    `;

    await sendEmail({
      email: process.env.ADMIN_EMAIL,
      subject: "New Contact Message from Cineflix",
      message: adminMessage,
    });

    res.status(200).json({
      status: "success",
      message: "Your message has been sent successfully!",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = contactUs;
