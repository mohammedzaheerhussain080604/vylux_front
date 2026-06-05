import { transporter } from "./mailer.js";

// ================================
// VYLUX LIGHTING - OTP EMAIL
// ================================
export const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"VYLUX LIGHTING" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "VYLUX LIGHTING - Password Reset OTP",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        background: #f5f7fb;
        padding: 30px;
      ">

        <div style="
          max-width: 500px;
          margin: auto;
          background: #ffffff;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        ">

          <!-- BRAND HEADER -->
          <h2 style="
            text-align: center;
            color: #000;
            margin-bottom: 10px;
          ">
            VYLUX LIGHTING
          </h2>

          <p style="
            text-align: center;
            color: #666;
            margin-bottom: 25px;
            font-size: 14px;
          ">
            Premium Lighting Solutions for Wholesale Partners
          </p>

          <hr style="border: none; border-top: 1px solid #eee;" />

          <!-- OTP SECTION -->
          <p style="
            font-size: 15px;
            color: #333;
            margin-top: 20px;
          ">
            Hello,
          </p>

          <p style="
            font-size: 15px;
            color: #333;
          ">
            Use the following OTP to reset your password. This OTP is valid for <b>10 minutes</b>.
          </p>

          <div style="
            text-align: center;
            margin: 30px 0;
          ">
            <span style="
              display: inline-block;
              font-size: 28px;
              letter-spacing: 6px;
              font-weight: bold;
              background: #f9be00;
              color: #000;
              padding: 12px 25px;
              border-radius: 8px;
            ">
              ${otp}
            </span>
          </div>

          <p style="
            font-size: 13px;
            color: #888;
            text-align: center;
          ">
            If you did not request this, please ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin-top: 25px;" />

          <p style="
            text-align: center;
            font-size: 12px;
            color: #aaa;
          ">
            © ${new Date().getFullYear()} VYLUX LIGHTING. All rights reserved.
          </p>

        </div>
      </div>
    `,
  });
};