// SDMAC_LICCA Email Content Generator
export function getSDMACLiccaEmailContent({ userName, link }) {
  return {
    subject: 'Thank you for ordering SDMAC LICCA',
    html: `
      <p>Dear ${userName},</p>
      <h3>Thank you for ordering SDMAC LICCA.</h3>
      <p>Your order includes access to LICCA, our Life Integrated Computerized Cognitive Application, which provides structured brain-training exercises and visual progress tracking across multiple cognitive domains.</p>
      <p>LICCA is designed to support neuroplasticity and help you improve memory, cognitive skills, and daily functioning over a 12-week training period.</p>
      <p>For any question email us <a href="mailto:help@regainmemory360.com">help@regainmemory360.com</a></p>
      <br/>
      <b>RM360 Administration</b>
      <h4>Important Disclaimer</h4>
      <p>DMAC™, RM360™, and LICCA™ are not medical diagnoses and do not replace professional medical evaluation or treatment. This program is designed to support understanding of cognitive function and guide discussions with qualified healthcare providers. Individual results may vary.</p>
    `
  };
}
