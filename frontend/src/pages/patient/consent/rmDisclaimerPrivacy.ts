export const FORM_1_TITLE =
  'Regain Memory 360 – Comprehensive Disclaimer & Privacy Notice';

export type ConsentContentBlock =
  | { type: 'subtitle'; text: string }
  | { type: 'section'; text: string }
  | { type: 'subsection'; text: string }
  | { type: 'p'; text: string }
  | { type: 'bullets'; items: string[] };

export const FORM_1_SUBTITLE = '(PDF-Ready Professional Version)';

// Preferred, structured version for clean UI rendering.
export const RM_DISCLAIMER_BLOCKS: ConsentContentBlock[] = [
  { type: 'subtitle', text: FORM_1_SUBTITLE },

  { type: 'section', text: 'SECTION 1 — PROGRAM OVERVIEW' },
  {
    type: 'p',
    text: 'Regain Memory 360 (RM360) is a multidisciplinary directed physical optimization and cognitive training online program designed to promote neuroplasticity through structured body optimization and brain exercises. RM360 online tools assist your licensed physician by creating awareness, who can diagnose and treat the underlying risk factor for memory loss and cognitive impairment.',
  },
  {
    type: 'p',
    text: 'RM360 may incorporate data from third-party sleep or activity tracking devices for biometric charting. Cognitive exercises are developed after 20 years of research and tried on hundreds of patients in the USA in the last 15 years by Dr siuresh Kumar MD, Diplomate ABPN-TBIM a triple board certified neurologist practice in USA. Brain exercises are selected after Dynamic cognitive test for individualized online cognitive training.',
  },
  {
    type: 'p',
    text: 'RM360 and associated platforms provide online portals for cognitive training. RM360, Regain Memory Inc., regainmemory.org, regainmemory360.com, and Suresh Kumar, M.D. assume no responsibility for emotional, physical, or financial damages resulting from program use.',
  },
  {
    type: 'p',
    text: 'RM360 does not guarantee reimbursement or refund, as acceptance varies by insurance provider. Documentation is generated only when the program is used in the recommended sequence. RM360 and its affiliates are not responsible for loss of documentation caused by failure to follow usage instructions or for any resulting financial losses.',
  },

  { type: 'section', text: 'SECTION 2 — LICCA, DMAC & RELATED APPLICATIONS' },
  { type: 'subsection', text: '2.1 Purpose and Scope' },
  {
    type: 'p',
    text: 'The Life Integrated Computerized Cognitive Application (LICCA) and Dynamic Mobile Assessment of Cognition (DMAC) are developed through extensive research and comparison with standardized cognitive assessments. These tools measure cognitive function to guide and assist therapeutic planning to practicing physicians.',
  },
  { type: 'subsection', text: '2.2 Non-Diagnostic Limitation' },
  {
    type: 'p',
    text: "DMAC scores do NOT diagnose Alzheimer's disease or any form of dementia. Users must consult a qualified provider for formal diagnosis of memory disorders, TBI, MTBI, or dementia.",
  },
  { type: 'subsection', text: '2.3 Research Background' },
  {
    type: 'p',
    text: 'RM360 cognitive systems and training tools have been developed at the Headache, TBI & Cognitive Institute and presented at peer-reviewed neurology and rehabilitation conferences. Early controlled research demonstrated 55–65% improvement in cognitive domains among acquired brain injury groups (excluding advanced dementia). Results may vary in home-based settings.',
  },
  { type: 'subsection', text: '2.4 Training Requirements' },
  {
    type: 'p',
    text: 'Cognitive training via LICCA typically requires 45–60 minutes of exercise every other day, along with recommended ACT use. Elderly users may require supervision, device support, or motivational assistance.',
  },
  { type: 'subsection', text: '2.5 No Guarantees' },
  {
    type: 'p',
    text: 'No guarantee of cognitive improvement is given, as RM360 cannot control remote training conditions. Physicians and therapists may access training history and scores to guide clinical decisions.',
  },

  { type: 'section', text: 'SECTION 3 — MEDICAL & DIAGNOSTIC DISCLAIMER' },
  {
    type: 'p',
    text: 'DMAC and related cognitive tools are intended for awareness and screening only. All information is provided without warranties of any kind, express or implied.',
  },
  {
    type: 'p',
    text: 'Users must not rely on RM360 or DMAC scores or website information as a substitute for medical advice. Do not delay or discontinue medical care based on information from RM360.',
  },
  {
    type: 'p',
    text: 'The expert advice given by qualified physicians enrolled in RM360 are to educate and answer questions and concerns about memory or cognitive impairment. They are not implied for treatment, some of the diagnostic tests or tools are designed to direct you to your physician to seek treatment of underlying treatable medical problems contributing to cognitive impairment.',
  },
  {
    type: 'p',
    text: 'Support features within the platform may provide incomplete or imprecise information due to limitations of online communication. RM360 and its affiliated entities do not guarantee accuracy, completeness, or timeliness of website content.',
  },
  {
    type: 'p',
    text: 'Access to the RM360 website and tools is at the user’s own risk. RM360 is not liable for direct, indirect, incidental, special, consequential, or punitive damages arising from use of the platform, including damage caused by malware or technical errors.',
  },
  {
    type: 'p',
    text: 'All RM360 content is for informational purposes only and should not be interpreted as medical advice.',
  },

  { type: 'section', text: 'SECTION 4 — HIPAA & PRIVACY COMPLIANCE ADD-ON' },
  { type: 'subsection', text: '4.1 Compliance Statement' },
  {
    type: 'p',
    text: 'RM360, Regain Memory LLC or Inc., affiliated websites, and Suresh Kumar, M.D. comply with the Health Insurance Portability and Accountability Act (HIPAA) and applicable state privacy laws. All Protected Health Information (PHI) is stored and handled according to HIPAA Privacy, Security, and Breach Notification Rules.',
  },
  { type: 'subsection', text: '4.2 Types of Information Collected' },
  { type: 'p', text: 'The platform may collect PHI including:' },
  {
    type: 'bullets',
    items: [
      'Personal identifiers (name, DOB, contact info)',
      'Cognitive assessment results',
      'Biometric, sleep, or activity data (if submitted)',
      'Medical diagnosis-related information',
      'System-generated reports and documentation',
    ],
  },
  { type: 'p', text: 'RM360 does not store credit card information.' },
  { type: 'subsection', text: '4.3 Data Storage and Protection' },
  {
    type: 'p',
    text: 'PHI is stored on Amazon Web Services (AWS) encrypted servers fully compliant with HIPAA standards. Safeguards include:',
  },
  {
    type: 'bullets',
    items: [
      'Encryption of PHI in transit and at rest',
      'Role-based access controls',
      'Secure authentication',
      'Continuous monitoring and auditing',
      'Regular security reviews',
    ],
  },
  { type: 'p', text: 'Users are responsible for keeping passwords confidential.' },
  { type: 'subsection', text: '4.4 Use of Information' },
  { type: 'p', text: 'PHI may be used for:' },
  {
    type: 'bullets',
    items: [
      'Cognitive therapy planning',
      'Clinical evaluation by your provider',
      'Insurance documentation (no guarantee of acceptance)',
      'De-identified research and quality improvement',
    ],
  },
  { type: 'p', text: 'PHI is never sold to third parties.' },
  { type: 'subsection', text: '4.5 Disclosure of PHI' },
  { type: 'p', text: 'PHI may be disclosed:' },
  {
    type: 'bullets',
    items: [
      'To your treating clinician',
      'With your written authorization',
      'As required by law',
      'To HIPAA-compliant business associates',
      'For internal administrative or security purposes',
    ],
  },
  { type: 'p', text: 'We follow a minimum necessary disclosure standard.' },
  { type: 'subsection', text: '4.6 Your HIPAA Rights' },
  { type: 'p', text: 'You have the right to:' },
  {
    type: 'bullets',
    items: [
      'Access your records',
      'Request corrections',
      'Receive an accounting of disclosures',
      'Request confidential communications',
      'Request restrictions on use/disclosure',
      'File a privacy complaint without retaliation',
    ],
  },
  { type: 'subsection', text: '4.7 Breach Notification Procedure' },
  { type: 'p', text: 'In case of a PHI breach, RM360 will:' },
  {
    type: 'bullets',
    items: [
      'Conduct a risk assessment',
      'Notify affected individuals following HIPAA guidelines',
      'Notify HHS when required',
      'Implement corrective actions',
    ],
  },
  { type: 'subsection', text: '4.8 User Responsibilities' },
  { type: 'p', text: 'Users must:' },
  {
    type: 'bullets',
    items: [
      'Keep login credentials confidential',
      'Log out after each session',
      'Use secure devices and networks',
      'Report suspicious account activity',
    ],
  },
  { type: 'subsection', text: '4.9 Limitations' },
  {
    type: 'p',
    text: 'While RM360 follows industry security standards, absolute security cannot be guaranteed.',
  },

  { type: 'section', text: 'SECTION 5 — SUBSCRIPTIONS & USER RESPONSIBILITIES' },
  { type: 'subsection', text: '5.1 Subscription Policy' },
  {
    type: 'p',
    text: 'All subscription fees paid online are non-refundable. RM360 does not store payment card data and does not auto-renew subscriptions.',
  },
  { type: 'subsection', text: '5.2 Security Recommendations' },
  { type: 'p', text: 'Users should not share passwords and should log out after each training session.' },
  { type: 'subsection', text: '5.3 User Waiver of Claims' },
  { type: 'p', text: 'By clicking ACCEPT, users waive all rights to claims against:' },
  {
    type: 'bullets',
    items: [
      'regainmemory.org',
      'regainmemorycenter.com',
      'retainmemory.com',
      'Regain Memory Inc.',
      'Suresh Kumar, M.D.',
      'Any affiliated companies or institutions',
    ],
  },
  {
    type: 'p',
    text: 'This waiver includes any damages or harm arising from the use of LICCA, MUST, ACT, PDS, or MCT programs.',
  },
];

export const FORM_1_CONTENT = `Regain Memory 360 – Comprehensive Disclaimer & Privacy Notice
(PDF-Ready Professional Version)

SECTION 1 — PROGRAM OVERVIEW
Regain Memory 360 (RM360) is a multidisciplinary directed physical optimization and cognitive training online program designed to promote neuroplasticity through structured body optimization and brain exercises. RM360 online tools assist your licensed physician by creating awareness,  who can diagnose and treat the underlying risk factor for memory loss and cognitive impairment.
RM360 may incorporate data from third-party sleep or activity tracking devices for biometric charting. Cognitive exercises are developed after 20 years of research and tried on hundreds of patients in the USA in the last 15 years by Dr siuresh Kumar MD, Diplomate ABPN-TBIM a triple board certified neurologist practice in USA. Brain exercises are selected after Dynamic cognitive test for individualized online cognitive training. 
RM360 and associated platforms provide online portals for cognitive training. RM360, Regain Memory Inc., regainmemory.org, regainmemory360.com, and Suresh Kumar, M.D. assume no responsibility for emotional, physical, or financial damages resulting from program use.
RM360 does not guarantee reimbursement or refund, as acceptance varies by insurance provider. Documentation is generated only when the program is used in the recommended sequence. RM360 and its affiliates are not responsible for loss of documentation caused by failure to follow usage instructions or for any resulting financial losses.

SECTION 2 — LICCA, DMAC & RELATED APPLICATIONS
2.1 Purpose and Scope
The Life Integrated Computerized Cognitive Application (LICCA) and Dynamic Mobile Assessment of Cognition (DMAC) are developed through extensive research and comparison with standardized cognitive assessments. These tools measure cognitive function to guide and assist therapeutic planning to practicing physicians.
2.2 Non-Diagnostic Limitation
DMAC scores do NOT diagnose Alzheimer's disease or any form of dementia.
 Users must consult a qualified provider for formal diagnosis of memory disorders, TBI, MTBI, or dementia.
2.3 Research Background
RM360 cognitive systems and training tools have been developed at the Headache, TBI & Cognitive Institute and presented at peer-reviewed neurology and rehabilitation conferences. Early controlled research demonstrated 55–65% improvement in cognitive domains among acquired brain injury groups (excluding advanced dementia). Results may vary in home-based settings.
2.4 Training Requirements
Cognitive training via LICCA typically requires 45–60 minutes of exercise every other day, along with recommended ACT use. Elderly users may require supervision, device support, or motivational assistance.
2.5 No Guarantees
No guarantee of cognitive improvement is given, as RM360 cannot control remote training conditions. Physicians and therapists may access training history and scores to guide clinical decisions.

SECTION 3 — MEDICAL & DIAGNOSTIC DISCLAIMER
DMAC and related cognitive tools are intended for awareness and screening only.
 All information is provided without warranties of any kind, express or implied.
Users must not rely on RM360 or DMAC scores or website information as a substitute for medical advice.
 Do not delay or discontinue medical care based on information from RM360.
The expert advice given by qualified physicians enrolled in RM360 are to educate and answer questions and concerns about memory or cognitive impairment. They are not implied for treatment, some of the diagnostic tests or tools are designed to direct you to your physician to seek treatment of underlying treatable medical problems contributing to cognitive impairment. 
Support features within the platform may provide incomplete or imprecise information due to limitations of online communication. RM360 and its affiliated entities do not guarantee accuracy, completeness, or timeliness of website content.
Access to the RM360 website and tools is at the user’s own risk. RM360 is not liable for direct, indirect, incidental, special, consequential, or punitive damages arising from use of the platform, including damage caused by malware or technical errors.
All RM360 content is for informational purposes only and should not be interpreted as medical advice.

SECTION 4 — HIPAA & PRIVACY COMPLIANCE ADD-ON
4.1 Compliance Statement
RM360, Regain Memory LLC or Inc., affiliated websites, and Suresh Kumar, M.D. comply with the Health Insurance Portability and Accountability Act (HIPAA) and applicable state privacy laws. All Protected Health Information (PHI) is stored and handled according to HIPAA Privacy, Security, and Breach Notification Rules.
4.2 Types of Information Collected
The platform may collect PHI including:
Personal identifiers (name, DOB, contact info)


Cognitive assessment results


Biometric, sleep, or activity data (if submitted)


Medical diagnosis-related information


System-generated reports and documentation


RM360 does not store credit card information.
4.3 Data Storage and Protection
PHI is stored on Amazon Web Services (AWS) encrypted servers fully compliant with HIPAA standards. Safeguards include:
Encryption of PHI in transit and at rest


Role-based access controls


Secure authentication


Continuous monitoring and auditing


Regular security reviews


Users are responsible for keeping passwords confidential.
4.4 Use of Information
PHI may be used for:
Cognitive therapy planning


Clinical evaluation by your provider


Insurance documentation (no guarantee of acceptance)


De-identified research and quality improvement


PHI is never sold to third parties.
4.5 Disclosure of PHI
PHI may be disclosed:
To your treating clinician


With your written authorization


As required by law


To HIPAA-compliant business associates


For internal administrative or security purposes


We follow a minimum necessary disclosure standard.
4.6 Your HIPAA Rights
You have the right to:
Access your records


Request corrections


Receive an accounting of disclosures


Request confidential communications


Request restrictions on use/disclosure


File a privacy complaint without retaliation


4.7 Breach Notification Procedure
In case of a PHI breach, RM360 will:
Conduct a risk assessment


Notify affected individuals following HIPAA guidelines


Notify HHS when required


Implement corrective actions


4.8 User Responsibilities
Users must:
Keep login credentials confidential


Log out after each session


Use secure devices and networks


Report suspicious account activity


4.9 Limitations
While RM360 follows industry security standards, absolute security cannot be guaranteed.

SECTION 5 — SUBSCRIPTIONS & USER RESPONSIBILITIES
5.1 Subscription Policy
All subscription fees paid online are non-refundable.
 RM360 does not store payment card data and does not auto-renew subscriptions.
5.2 Security Recommendations
Users should not share passwords and should log out after each training session.
5.3 User Waiver of Claims
By clicking ACCEPT, users waive all rights to claims against:
regainmemory.org


regainmemorycenter.com


retainmemory.com


Regain Memory Inc.


Suresh Kumar, M.D.


Any affiliated companies or institutions
This waiver includes any damages or harm arising from the use of LICCA, MUST, ACT, PDS, or MCT programs.`;
