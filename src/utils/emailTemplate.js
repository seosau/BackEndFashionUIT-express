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
            <a href="http://localhost:8000/api/verify/${verificationToken}" style="background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p style="font-size: 14px; color: #888; margin-top: 20px; text-align: center;">Nếu người yêu cầu không phải là bạn, xin hãy bỏ qua email này.</p>
    </div>

</body>
</html>`;

module.exports = {
  verificationEmail,
};