const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "lareserveproject@gmail.com",
      pass: "cfzmkqfdjntfpuyw",
    },
  });

  await transporter.sendMail(
    {
      from: "lareserveproject@gmail.com",
      to: email,
      subject: subject,
      text: text,
    },
    function (error, info) {
      if (error) {
        return res.status(500).json(error);
      } else {
        return res.send(
          "<h1>Email sent successfully</h1> <a href='/report'>Go Back</a>"
        );
      }
    }
  );
};

module.exports = sendEmail;
