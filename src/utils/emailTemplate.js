const verificationEmail = (verificationToken) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác thực Email</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

    <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="text-align: center; color: #333;">Xác thực Email</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">Bấm vào đây để xác thực email của bạn:</p>
        <div style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:8000/api/auth/verify/${verificationToken}" style="background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p style="font-size: 14px; color: #888; margin-top: 20px; text-align: center;">Nếu người yêu cầu không phải là bạn, xin hãy bỏ qua email này.</p>
    </div>

</body>
</html>`;
const otpEmail = (otp) =>
  `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Email</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
                
            }
            .header h2 {
                color: #01567f;
            }
            .otp {
                padding: 20px;
                text-align: center;
                background-color: #f9f9f9;
                border-radius: 5px;
            }
            .otp h3 {
                margin: 0;
                color: #333;
            }
            .otp p {
                margin-top: 10px;
                font-size: 18px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>OTP Verification</h2>
            </div>
            <div class="otp">
                <h3>Your OTP Code:</h3>
                <p style="font-size:24px; font-weight:bold; color: red">${otp}</p>
            </div>
            <div class="footer">
                <p>This OTP is valid for five minutes.</p>
            </div>
        </div>
    </body>
    </html>
    `;
module.exports = {
  verificationEmail,
  otpEmail,
};
