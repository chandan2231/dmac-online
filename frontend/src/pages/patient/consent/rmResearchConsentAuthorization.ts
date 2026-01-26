import type { ConsentContentBlock } from './rmDisclaimerPrivacy';

export const FORM_2_TITLE =
  'Consent for Research Study & Authorization to Share Protected Health Information';

export const RM_RESEARCH_CONSENT_BLOCKS: ConsentContentBlock[] = [
  { type: 'subtitle', text: 'RegainMemory.org / RegainMemory360.com' },
  { type: 'subtitle', text: 'Neuro-Headache, TBI & Cognitive Research Institute' },
  { type: 'subtitle', text: '3010 Legacy Drive, Frisco, TX, 75034' },
  { type: 'subtitle', text: 'Email: research@regainmemory360.com' },
  { type: 'subtitle', text: 'Web: regainmemory.org | regainmemory360.com' },

  { type: 'section', text: '1. Background and Purpose' },
  {
    type: 'p',
    text: 'LICCA / RegainMemory.org / Neuro-Headache, TBI & Cognitive Research Institute / Regain Memory Center is a research-based clinical program led by Dr. Suresh Kumar, who is dedicated to advancing medical and cognitive treatment through research.',
  },
  {
    type: 'p',
    text: 'You are being asked to participate—or to permit the use of your health information—in our research studies. Your decision will not affect your clinical care, medical care, or cognitive therapy.',
  },
  {
    type: 'p',
    text: 'Active participation requires approximately 3 hours per week. Please take your time to decide and ask any questions you may have.',
  },
  {
    type: 'p',
    text: 'All cognitive training conducted on RegainMemory.org, RegainMemory360.com, and LICCA portals is protected by SSL-secured servers, using security comparable to online banking systems.',
  },

  { type: 'section', text: '2. Background Information' },
  {
    type: 'p',
    text: 'Mild to Moderate memory loss remains a major clinical challenge. Attention deficits in dementia often limit the effectiveness of typical cognitive stimulation strategies.',
  },
  {
    type: 'p',
    text: 'Memory loss often presents without clear clinical or radiological markers. Advances in neuroplasticity and neuroimaging continue to refine our understanding of cognitive disorders. Our focus includes cognitive decline related to aging, dementia, stroke, and acquired traumatic brain injuries. Our mission is to continually improve treatment based on patient care and research insights.',
  },

  { type: 'section', text: '3. Risks and Discomforts' },
  {
    type: 'p',
    text: 'There are no known risks or discomforts involved in participating in this research. Your treatment and cognitive therapy remain unchanged. If future experimental treatments are offered, they will require a separate consent form.',
  },

  { type: 'section', text: '4. Benefits' },
  {
    type: 'p',
    text: 'The information learned from patient care and research helps improve clinical outcomes and guide future treatment strategies.',
  },

  { type: 'section', text: '5. Voluntary Participation' },
  {
    type: 'p',
    text: 'Participation is voluntary. You may withdraw at any time without penalty and without loss of benefits.',
  },

  { type: 'section', text: '6. Costs and Payments' },
  {
    type: 'p',
    text: 'There is no cost to you and no reimbursement provided, as all services are part of routine care or online cognitive therapy.',
  },

  { type: 'section', text: '7. Research-Related Injury or Questions' },
  { type: 'p', text: 'Study Coordinator: 2143009967' },
  {
    type: 'p',
    text: 'For questions about participant rights, contact Regainmemory360.com',
  },

  {
    type: 'section',
    text: '8. Confidentiality & Authorization to Use/Share Health Information',
  },
  {
    type: 'p',
    text: 'If you participate, your medical information may be used for current and future research. Federal law protects your privacy. By signing this form, you authorize the use and sharing of Protected Health Information (PHI) for research.',
  },
  {
    type: 'p',
    text: 'You also authorize Regainmemory360.com / Suresh Kumar and its affiliate companies and its employees, and contracted data management and companies to access your medical information for research and machine learning.',
  },
  {
    type: 'p',
    text: 'Your identity will not be disclosed in any publications or presentations.',
  },

  { type: 'section', text: '9. Consent & Authorization' },
  {
    type: 'p',
    text: 'I have read and understood the information above. The purpose and nature of this research study have been explained to me. I voluntarily consent—or consent on behalf of my dependent—to participate.',
  },
  { type: 'p', text: 'I understand that I may print a copy of this form for my records.' },
];
