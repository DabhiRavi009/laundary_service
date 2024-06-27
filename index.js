require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/send-email", async (req, res) => {
  const { fullName, email, phoneNumber, serviceDetails, totalPrice } = req.body;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: "dabhiravi369@gmail.com",
      pass: "dgcq sqdc zosm yfcn",
    },
  });

  const mailOptions = {
    // from: process.env.EMAIL_USER,
    from: "dabhiravi369@gmail.com",
    to: email,
    subject: "Booking Confirmation",
    text: `Hello ${fullName},\n\nThank you for your booking. Here are the details:\n\n${serviceDetails}\nTotal Price: ₹${totalPrice}\n\nRegards,\n DABHI RAVI`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
