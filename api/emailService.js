// emailService.js
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to: to,
    from: 'help.irbhub@gmail.com', // Your email (registered with SendGrid)
    subject: subject,
    text: text,
    html: html
  }

  try {
    const response = await sgMail.send(msg)
    // console.log('Email sent', response)
  } catch (error) {
    // console.error('Error sending email', error)
    throw new Error('Error sending email')
  }
}

export default sendEmail
