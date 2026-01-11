function AccountVerificationTemplate(link) {
  return `
      <template>
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            color: #333;
            text-align: center;
            margin: 0;
            padding: 0;
          }
  
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
  
          h1 {
            color: #3498db;
          }
  
          p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
  
          a {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            text-decoration: none;
            background-color: #3498db;
            color: #fff;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>ERP Verification</h1>
          <p>Welcome to ERP Verification! To activate your account, please click the link below:</p>
          <a href=${link} target="_blank">Activate Your Account</a>
          <p>If the button above does not work, you can also copy and paste the following URL into your browser:</p>
          <p>${link}</p>
          <p>Thank you for choosing ERP Verification!</p>
        </div>
      </body>
    </html>
  </template>
  
    `;
}

module.exports.AccountVerificationTemplate = AccountVerificationTemplate;
