// SDMAC_EXPERT_ADVICE Email Content Generator

const memoryEvaluationFormText = `
RM360 Memory Evaluation Blood Test Order

Ordering Physician name: ________________________________________________

Physician Address: ______________________________________________________

Physician Phone: ____________________________  Fax: ______________________

Date of Order: ______________________

Pt Name: __________________________________________

DOB: ______________________________________________

Lab Test order on serum level

Homocysteine  
Vitamin B12  
Folate level  
Ferritin level  
Vitamin D Level /Vitamin D, 25-Hydroxy/  
ANA Titer & Type  
Magnesium Level  
TSH  
Comprehensive Metabolic Panel  
Hemoglobin A1C  
LDL  
C Reactive Protein  

Diagnosis: Memory loss R41.3,  Dementia F01.50, Thyroid deficiency E03.9, Anemia:D64.9, Prediabetic  RO37.3, Memory dysfunction as late effect of traumatic brain injury R41.3

Payer/Insurance___________________ Insured Name_______________

Plan# ______________________   Group#_______________________________

__________________
Physician Signature

Physician Name _____________________________ Date:____________
`;

const memoryEvaluationFormAttachment = {
  filename: 'RM360_Memory_Evaluation_Blood_Test_Order.txt',
  type: 'text/plain',
  disposition: 'attachment',
  content: Buffer.from(memoryEvaluationFormText, 'utf-8').toString('base64'),
};

export function getSDMACExpertAdviceEmailContent({ userName, link }) {
  return {
    subject: 'Thank you for ordering SDMAC & Expert Advice',
    html: `
      <p>Dear ${userName},</p>
      <h3>Thank you for ordering</h3>
      <ul>
        <li><b>Self Dynamic Mobile Assessment of Cognition (S-DMAC™) 5.0 AI</b> — a comprehensive cognitive assessment evaluating 10 key cognitive domains.</li>
      </ul>
      <b>SDMAC Smart AI-Integrated Testing</b>
      <ul>
        <li>SDMAC smart, AI-based cognitive assessments identify weaker cognitive domains and automatically generate personalized brain-training schedules within LICCA, tailored to your individual cognitive profile.</li>
      </ul>
      <b>Expert Advice : Personalized Medical Information Review with diagnostic test tools.</b>
      <ul>
        <li>An individualized collection of your medical history—including relevant laboratory and blood test information—is organized to help guide medical decision-making through our expert-guided process. This approach focuses on optimizing overall health to support brain function.</li>
        <li>Our expert guidance includes licensed physicians and/or trained clinicians who help identify cognitive concerns, identify underlying causes of accelerated memory loss by standardized approach and guide you to seek appropriate evaluation and treatment with your primary care physician, neurologist, or geriatric specialist in your local area.</li>
      </ul>
      <b>Before taking the SDMAC test please review the test guideline as below:</b>
      <h4>Self Dynamic Mobile Assessment of Cognition (DMAC) — Test Guidelines</h4>
      <ul>
        <li><b>Test Link Validity:</b> The DMAC test link is valid for 4 weeks from the date of issue.</li>
        <li><b>Expiration:</b> Once you complete the test, the link will automatically expire. Your test report will be emailed within 24 hours of completion.</li>
        <li><b>Test Attempts:</b> You may start and stop the test up to two times. On the third attempt, you must complete the test in one session.</li>
        <li><b>Timed Assessment:</b> The DMAC test is timed. If the test is interrupted for technical reasons, you will be able to resume from the point where it was stopped. If the time lapse is more than 15 minutes the test will be timed out, you are required to retake the entire test.</li>
        <li><b>Refund for DMAC:</b> There is no refund for the DMAC test or any of the online RM360 products.</li>
      </ul>
      <p>Ready to start the test? Click the link below.</p>
      <p><b>Link:</b> ${link || ''}</p>
      <h4>Recommended Upgrades</h4>
      <ul>
        <li>We have integrated expert guidance with the Life Integrated Computerized Cognitive Application (LICCA) to support individuals experiencing memory difficulties in daily life following traumatic brain injury (TBI), mild cognitive impairment, or dementia. You may choose to upgrade before or after completing your cognitive assessment.</li>
      </ul>
      <b>LICCA Brain Training & Progress Tracking</b>
      <ul>
        <li>LICCA provides structured brain-training exercises along with visual progress charts, allowing you to track improvements across multiple cognitive domains over time.</li>
      </ul>
      <b>Expected Outcomes</b>
      <ul>
        <li>With consistent participation over a 12-week (3-month) training period, many users experience improvements in memory, cognitive skills, and daily functioning. Individual results may vary.</li>
      </ul>
      <b>Neuroplasticity-Focused Approach</b>
      <ul>
        <li>Our program is designed to support neuroplasticity, the brain’s ability to adapt and form new neural connections, helping the brain reconnect or strengthen cognitive pathways.</li>
      </ul>
      <p>Please download the Blood memory panel in PDF format : You may email to your Primary care physician to order memory panel blood test</p>
      <p>Please schedule the expert advice only after you completed the RM360 questionnaire assessment tools and blood test report uploaded to the RM360 user portal.</p>
      <p>For any question email us <a href="mailto:help@regainmemory360.com">help@regainmemory360.com</a></p>
      <br/>
      <b>RM360 Administration</b>
      <h4>Important Disclaimer</h4>
      <p>DMAC™, RM360™, and LICCA™ are not medical diagnoses and do not replace professional medical evaluation or treatment. This program is designed to support understanding of cognitive function and guide discussions with qualified healthcare providers. Individual results may vary.</p>
    `,
    attachments: [memoryEvaluationFormAttachment],
  };
}
