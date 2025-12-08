const continuingReviewQuestions = {
  riskAssessment: {
    title: `Risk Assessment yash`,
    question1: {
      text: `Since the date of the last approval, has any regulatory agency
                including, but not limited to, the sponsor, statistical agency,
                medical monitor, data safety monitoring board (DSMB), or a data
                monitoring committee (DMC) provided any correspondence that has
                not yet been reported to the IRB?`,
      answer: 'irb_report',
      explanation: 'irb_report_explain',
      documentHeader: 'Uploaded supporting documents',
      documentName: 'supporting_document'
    },
    question2: {
      text: `Since the date of the last approval, have you encountered any
                unanticipated problems? Unanticipated problems involve risks to
                subjects or others and include any incident, experience, or
                outcome that meets all of the following criteria:`,
      subOptions: {
        option1: `1. is unexpected (in terms of nature, severity, or frequency)
                  given (a) the research procedures that are described in the
                  protocol-related documents, such as the IRB-approved research
                  protocol and informed consent document; and (b) the
                  characteristics of the subject population being studied:`,
        option2: `2. is related or possibly related to a subject’s participation
                  in the research; and`,
        option3: `3. suggests that the research places subjects or others at a
                  greater risk of harm (including physical, psychological,
                  economic, or social harm) related to the research than was
                  previously known or recognized.`
      },
      answer: 'criteria_report',
      explanation: 'criteria_report_explain'
    }
  },
  informedConsentProcess: {
    title: `Informed Consent Process`,
    question1: {
      text: `Which version of the ICF are you currently using?`,
      answer: 'icf_version',
      documentHeader: 'Uploaded the most recent ICF',
      documentName: 'icf_file'
    },
    question2: {
      text: `Who is performing the informed consent at your site?`,
      answer: 'performing_consent'
    },
    question3: {
      text: `Have there been any challenges faced to the consenting process?`,
      answer: 'challenges_faced',
      explanation: 'challenges_faced_explain'
    },
    question4: {
      text: `Have there been any changes to the consent form that have not been
                reported to the IRB?`,
      answer: 'changes_consent',
      explanation: 'changes_consent_explain'
    },
    question5: {
      text: `Are you ensuring that:`,
      subOptions: {
        option1: `1. The participants are made aware that their participation is
                  voluntary and that they may choose to withdraw at any time?`,
        option2: `2. The participants are provided with a copy of the informed
                  consent form to take home?`,
        option3: `3. The participants are provided with the most up-to-date
                  contact information for study staff?`,
        option4: `4. The investigator is providing the most current information
                  regarding the study that may affect the participants’
                  willingness to participate in the study?`,
        option5: `5. All participants have been consented or re-consented, where
                  necessary, with the most current approved informed consent form?`
      },
      answer: 'ensuring_list',
      explanation: 'ensuring_list_explain',
      documentHeader: 'Uploaded new informed consent form',
      documentName: 'consent_form'
    }
  },
  investigatorInstuationInfo: {
    title: `Investigator and Institution Information`,
    question1: {
      text: `Have there been any changes in the investigator’s situation or
                qualifications?`,
      answer: 'inv_sit_quali',
      checkboxes: {
        header: 'Mark all that apply',
        answer: 'investigator_changes',
        options: [
          { label: 'suspension of hospital privileges', value: '1' },
          { label: 'change in medical license status', value: '2' },
          {
            label:
              'increase in number of research studies conducted by the investigator',
            value: '3'
          },
          {
            label: 'expired or updated human research protections training',
            value: '4'
          }
        ]
      },
      documentHeader: 'Uploaded supporting documents here',
      documentName: 'q1_supporting_documents'
    },
    question2: {
      text: `Have there been any investigation of or complaints related to the
                investigator’s conduct of research?`,
      answer: 'inv_or_comp',
      explanation: 'inv_or_comp_explain',
      documentHeader: 'Uploaded supporting documents here',
      documentName: 'q2_supporting_documents'
    },
    question3: {
      text: `Have there been any changes in the facility’s ability to
                adequately support the research protocol?`,
      answer: 'facility_changes',
      checkboxes: {
        header: 'Mark all that apply',
        answer: 'facility_change_item',
        options: [
          { label: 'Personnel changes', value: '1' },
          { label: 'Financial resource changes', value: '2' },
          { label: 'Change in facility address', value: '3' },
          {
            label:
              'Change in facility resources (ie: loss of laboratory space or licensure, loss of adequate storage space, structural damage or changes to the physical facility)',
            value: '4'
          },
          { label: 'Other', value: '5' }
        ]
      },
      documentHeader: `Uploaded supporting documents here if applicable
(ie: new informed consent with facility address change, updated protocol to reflect facility changes, updated delegation of authority log, etc.)`,
      documentName: 'q3_supporting_documents',
      subTexts: [
        {
          text: 'Have these changes been reported to the IRB?',
          answer: 'changes_reported',
          explanation: 'changes_reported_explain'
        },
        {
          text: 'Please describe the changes and explain in as much detail as possible. Please provide any solutions, whether temporary or permanent, work-arounds, and/or protocol adjustments',
          answer: 'changes_explain'
        }
      ]
    },
    question4: {
      text: `Have there been any changes in facility regulations, standard
                operating procedures, or standards of professional conduct?`,
      answer: 'facility_any_changes',
      explanation: 'facility_any_changes_explain',
      documentHeader: 'Uploaded supporting documents here',
      documentName: 'q4_supporting_documents'
    },
    question5: {
      text: `Have there been any changes to state or local law regarding
                research that affects the conduct of research?`,
      answer: 'changes_law',
      explanation: 'changes_law_explain'
    }
  },
  researchProgressInfo: {
    title: `Research Progress`,
    question1: {
      text: `Total Subjects Enrolled`,
      answer: 'subjects_enrolled'
    },
    question2: {
      text: `How many subjects have discontinued their participation?`,
      answer: 'discontinued_subjects',
      subTexts: [
        {
          text: 'Out of that number, how many subjects withdrew of their own accord',
          answer: 'sub_withdrew'
        },
        {
          text: 'Describe the reasons for withdrawal',
          answer: 'withdrawal_reason_explain'
        },
        {
          text: 'how many subjects were terminated before completion of the protocol by the decision of the PI, Sponsor, or other contracted research personnel',
          answer: 'sub_terminated_before_completion'
        },
        {
          text: 'Describe the reasons for termination ',
          answer: 'termination_reason_explain'
        }
      ]
    },
    question3: {
      text: `How many adverse events have occurred since the last approval?`,
      answer: 'occured_adverse_event',
      subTexts: [
        {
          text: 'Have these events been reported to the IRB?',
          answer: 'adverse_event_submission'
        },
        {
          text: 'What was the reason the adverse events were not reported to the IRB?',
          answer: 'adverse_event_not_reported_explain'
        },
        {
          text: 'Please describe the adverse events including what occurred, the timeline in which it occurred, and the time at which the study personnel became aware of the adverse event',
          answer: 'adverse_event_explain'
        }
      ],
      documentHeader: 'Uploaded any supporting documents',
      documentName: 'q3_supporting_documents'
    },
    question4: {
      text: `How many subject have completed the study per protocol?`,
      answer: 'subjecte_completed'
    },
    question5: {
      text: `Have there been any updates/changes to the protocol since the last
                approval?`,
      answer: 'last_approval_change',
      subTexts: [
        {
          text: 'Have these changes been reported to the IRB?',
          answer: 'last_approval_change_report'
        }
      ],
      explanation: 'changes_not_reported_to_irb'
    }
  }
  // submission form does not exist in this, so i am not adding submissionAdditionalInfo here...
  // submissionAdditionalInfo: {
  //   checkBox1: {
  //     label:
  //       'Electronic Signature below certifies that you have read and agree to the research compliance terms listed in above protocol application.',
  //     value: 'applicant_terms'
  //   },
  //   checkBox2: {
  //     label:
  //       'I acknowledge that processed payment for protocol approval submission is non-refundable.',
  //     value: 'applicant_acknowledge'
  //   },
  //   text: `Electronic Signature`,
  //   answer: 'applicant_acknowledge_name'
  // }
}

const clinicalReviewQuestions = {
  protocolInformation: {
    title: 'Protocol Information',
    question1: {
      text: `Are you submitting this protocol for the first time?`,
      answer: 'first_time_protocol',
      subTexts: [
        {
          text: `Has this study been disapproved or withdrawn from another IRB?`,
          answer: 'disapproved_or_withdrawn',
          explanation: 'disapproved_or_withdrawn_explain'
        },
        {
          text: `Are you transferring oversight from another IRB?`,
          answer: 'oversite',
          explanation: 'oversite_explain'
        },
        {
          text: `Title of Protocol`,
          answer: 'protocol_title'
        },
        {
          text: `Protocol Number`,
          answer: 'protocol_number'
        },
        {
          text: `Study Duration`,
          answer: 'study_duration'
        },
        {
          text: `Sponsor`,
          answer: 'sponsor'
        },
        {
          text: `Funding Source`,
          answer: 'funding_source'
        }
      ],
      documentHeader: 'Uploaded Protocol',
      documentName: 'protocol_file'
    }
  },
  investigatorInformation: {
    title: 'Investigator Information',
    subTexts: [
      {
        sequence: 1,
        text: `Investigator Name`,
        answer: 'investigator_name'
      },
      {
        sequence: 2,
        text: `Investigator Email`,
        answer: 'investigator_email'
      },
      {
        sequence: 3,
        text: `Sub Investigator Name`,
        answer: 'sub_investigator_name'
      },
      {
        sequence: 4,
        text: `Sub Investigator Email`,
        answer: 'sub_investigator_email'
      },
      {
        sequence: 5,
        text: `Primary point of contact if different from above`,
        answer: 'primary_contact'
      },
      {
        sequence: 6,
        text: `Primary point of contact email address`,
        answer: 'primary_contact_email'
      },
      {
        sequence: 7,
        text: `Has the investigator ever had an FDA audit?`,
        answer: 'fda_audit',
        explanation: 'fda_audit_explain'
      },
      {
        sequence: 8,
        text: `How long has the investigator been involved in research?`,
        answer: 'involved_years'
      },
      {
        sequence: 9,
        text: `What is the investigator's NPI if applicable`,
        answer: 'investigators_npi'
      },
      {
        sequence: 10,
        checkboxes: {
          header:
            'What training in the field of human subjects protection has the investigator completed?',
          answer: 'training_completed',
          options: [
            { label: 'OHRP Human Subject Assurance Training', value: '1' },
            { label: 'CITI Program Training', value: '2' },
            { label: 'Certified Physician Investigator Training', value: '3' },
            { label: 'ACRP training (CCRC, CCRA)', value: '4' },
            { label: 'SOCRA (CCRP)', value: '5' },
            {
              label: 'Graduate or undergraduate research studies or degrees',
              value: '6'
            },
            { label: 'Academy of Physicians in Clinical Research', value: '7' },
            { label: 'Other', value: '8' }
          ],
          explanation: 'training_completed_explain'
        }
      },
      {
        sequence: 11,
        text: `What is the current number of research studies supervised by the investigator?`,
        answer: 'investigator_research_number'
      },
      {
        sequence: 12,
        text: `Do you have any pending or active restrictions related to research or the practice of medicine?`,
        answer: 'pending_or_active_research',
        explanation: 'pending_or_active_research_explain'
      },
      {
        sequence: 13,
        text: `Does your site have an FWA?`,
        answer: 'site_fwp'
      },
      {
        sequence: 14,
        text: `Please provide FWA number`,
        answer: 'fwa_number'
      }
    ],
    documentsUploadedList: [
      {
        documentHeader: 'Upload investigator and sub-investigator CV here',
        documentName: 'cv_files'
      },
      {
        documentHeader: 'Upload copy of medical license (if applicable) here',
        documentName: 'medical_license'
      },
      {
        documentHeader:
          'Upload copies of training certificates (if applicable) here',
        documentName: 'training_certificates'
      }
    ]
  },
  studyInformation: {
    title: 'Study Information',
    question1: {
      text: `What type of research is being conducted?`,
      answer: 'research_type',
      explanation: 'research_type_explain'
    },
    documentsUploadedList: [
      {
        documentHeader:
          'Upload drug/biologic profile, device profile, food/dietary supplement ingredient list, or cosmetic ingredient list',
        documentName: 'ingredient_list'
      }
    ]
  },
  informedConsentForm: {
    title: 'Informed Consent Form',
    checkboxes: {
      header: 'What type of consent is required for this study?',
      answer: 'consent_type',
      options: [
        { label: 'No consent (requesting waiver of consent)', value: '1' },
        { lavel: 'Verbal consent', value: '2' },
        { label: 'Written, signed consent by subject', value: '3' },
        {
          label: 'Written, signed consent by legally authorized representative',
          value: '4'
        },
        { label: 'Written, signed assent by minor', value: '5' },
        { label: 'HIPAA authorization agreement', value: '6' },
        { label: 'Waiver of HIPAA agreement', value: '7' },
        { label: 'Online/website/electronic signature consent', value: '8' }
      ],
      explanation: 'no_consent_explain'
    },
    subTexts: [
      {
        sequence: 2,
        text: `Will HIPAA authorization language be included in the ICF (informed consent form)?`,
        answer: 'include_icf'
      },
      {
        sequence: 3,
        text: `Will the participants be compensated for participation in the study?`,
        answer: 'participation_compensated'
      },
      {
        sequence: 4,
        text: `Will the consent forms be offered in languages other than English?`,
        answer: 'other_language_selection'
      },
      {
        sequence: 5,
        text: `Have the dcument been translated by a professional translator?`,
        answer: 'professional_translator',
        explanation: 'professional_translator_explain'
      }
    ],
    documentsUploadedList: [
      {
        documentHeader: `Upload all consent documents, including translated consents, if applicable
(if applying for waiver of consent, document explaining reasoning must be uploaded)`,
        documentName: 'consent_file'
      }
    ],
    declaration: {
      header: ` <p>The informed consent process is a continuous process and the IRB expects that
                            proper subject consent is ensured by the investigator throughout the research
                            study. To comply with the terms set forth by this IRB, the investigator must
                            ensure that:
                        </p>
                        <ul>
                            <li>No study procedures shall be conducted prior to completion of the informed consent forms which include subject or legally authorized representative (LAR) signatures and date, investigator or person obtaining consent signature and date, and providing a copy of the signed consent to the study participant.</li>
                            <li>The identified research participant is given plenty of time to consider their participation in the study and all questions are answered. The identified research participant must be told that their participation in the study is voluntary and that they are under no obligation to participate. The potential participant must voice understanding before proceeding.</li>
                            <li>The consent discussion must be in language understandable to the potential research participant’s comprehension level.</li>
                            <li>The informed consent discussion must be performed in a private setting free from other people who may overhear the discussion, such as a private exam room or other closed-door setting.</li>
                            <li>Only the most current, IRB-approved consent forms may be used for enrollment. </li>
                            <li>All efforts must be taken to ensure participant anonymity including:
                                  <ul style="margin-top: 0;"> 
                                    <li>Safe storage of subject identifiers-all subject identifiers must be coded and de-identified</li>
                                    <li>Safe storage of subject identifiers-all subject identifiers must be coded and de-identified</li>
                                    <li>All paper-based records will be stored in a double-locked area such as a locking filing cabinet inside of a locking door and only accessible to authorized staff.</li>
                                    <li>All electronic-based records will only be accessed by authorized staff using secure login credentials.</li>
                                </ul>
                            </li>
                        </ul>`,
      checkBox: {
        label:
          'You have read the term and agree with the above research compliance.',
        value: 'consent_declaration'
      }
    }
  },
  protocolProcedure: {
    title: 'Protocol Subject',
    checkboxes: {
      header: 'Which subject populations will be enrolled in the study?',
      answer: 'enrolled_type',
      options: [
        {
          label: 'Adults',
          value: '1'
        },
        {
          label: 'Children (17 years and under)',
          value: '2'
        },
        {
          label: 'Blind/Visually Impaired',
          value: '3'
        },
        {
          label: 'Deaf/Hard of Hearing (including sign language communicators)',
          value: '4'
        },
        {
          label:
            'Individuals with impaired decision-making (requiring a LAR, including those with impaired or diminished mental capacity, dementia, and those suffering from mental health disorders)',
          value: '5'
        },
        {
          label: 'Educationally Disadvantaged/Impaired or no reading skills',
          value: '6'
        },
        {
          label: 'Economically disadvantaged',
          value: '7'
        },
        {
          label: 'Healthy individuals',
          value: '8'
        },
        {
          label: 'Terminally ill individuals',
          value: '9'
        },
        {
          label: 'HIV positive',
          value: '10'
        },
        {
          label: 'Hospitalized',
          value: '11'
        },
        {
          label:
            'Institutionalized (including nursing home, LTAC, assisted living, residential facility, mental hospital)',
          value: '12'
        },
        {
          label: 'Prisoners',
          value: '13'
        },
        {
          label: 'Military Personnel',
          value: '14'
        },
        {
          label: 'Pregnant women',
          value: '15'
        },
        {
          label: 'Human fetuses/neonates',
          value: '16'
        },
        {
          label: 'Non-English speakers',
          value: '17'
        },
        {
          label: 'Women only',
          value: '18'
        },
        {
          label: 'Men only',
          value: '19'
        },
        {
          label: 'Other',
          value: '20'
        }
      ],
      explanation: 'enrolled_type_explain'
    },
    checkboxes2: {
      header: 'Which race and ethnic groups will be enrolled in the study?',
      answer: 'enrolled_group',
      options: [
        { label: 'White, not of Hispanic origin', value: '1' },
        { label: 'White, of Hispanic origin', value: '2' },
        { label: 'Black, not of Hispanic origin', value: '3' },
        { label: 'Black, of Hispanic origin', value: '4' },
        { label: 'American Indian/Alaskan Native', value: '5' },
        { label: 'Asian', value: '6' },
        { label: 'Native Hawaiian/Pacific Islander', value: '7' },
        { label: 'Multiracial', value: '8' },
        { label: 'Other', value: '9' }
      ],
      explanation: 'enrolled_group_explain'
    },
    subTexts: [
      {
        sequence: 1,
        text: `Will any subject populations be excluded from the study?`,
        answer: 'excluded_study_type',
        explanation: 'excluded_study_type_explain'
      },
      {
        sequence: 2,
        text: `How many subjects will be enrolled in the study?`,
        answer: 'enrolled_subjects'
      }
    ],
    checkboxes3: {
      header: 'What recruitment methods will be used in the study?',
      answer: 'recruitment_method',
      options: [
        {
          label: 'In-person conversation during routine office visits',
          value: '1'
        },
        {
          label: 'Recruiting participants from previous research studies',
          value: '2'
        },
        {
          label:
            'Mass print advertisements such as a newspaper, magazine, or billboard',
          value: '3'
        },
        {
          label: 'Flyer, poster, or bulletin board in office',
          value: '4'
        },
        {
          label: 'Radio or television ads',
          value: '5'
        },
        {
          label: 'Direct mail to potential subjects',
          value: '6'
        },
        {
          label: 'Internet including social media recruiting',
          value: '7'
        },
        {
          label: 'Chart review',
          value: '8'
        },
        {
          label: 'Telephone screening',
          value: '9'
        },
        {
          label: 'Other',
          value: '10'
        }
      ],
      explanation: 'recruitment_method_explain'
    },
    question3: {
      sequence: 3,
      text: `What is the location(s) name and address where the research procedures will take place?`,
      answer: 'research_place_name_address'
    },
    question4: {
      sequence: 4,
      text: `Will any samples or data collected in this study be retained for future research?`,
      answer: 'future_research',
      explanation: {
        header: `Please explain how the data and/or samples will be stored, secured, and de-identified. Include information on how the data and/or samples might be used for future research *`,
        answer: 'future_research_explain'
      }
    },
    documentHeader: 'Upload all recruitment and subject-facing materials *',
    documentName: 'facing_materials',
    checkBox: {
      label: 'You acknowledge that you read the term and agree with them.',
      value: 'terms_acknowledgement'
    }
  },
  submissinForm: {
    title: 'Submission Form',
    text: `<p>By submitting this application you attest to the following:</p>
						<ul>
							<li>Research will not commence prior to receiving the IRB approval letter.</li>
							<li>The principal investigator will personally supervise and/or conduct the study.</li>
							<li>The principal investigator ensures that all persons involved in conducting the study are trained and have proper credentialing for conducting research.</li>
							<li>Only the most current IRB-approved consent form will be used to enroll subjects.</li>
							<li>No changes will be made to the research protocol, consents forms, and all patient-facing materials without the approval of the IRB </li>
							<li>The study procedures will comply with all applicable laws and regulations regarding the conduct of research</li>
							<li>All findings from the study that directly affect subject safety will be communicated to subjects and to this IRB</li>
							<li>All serious adverse events (SAEs), whether related to the study procedures or not, will be reported to this IRB within 2 business days of the investigator becoming aware of the event for IRB safety review</li>
							<li>The sponsor agrees to submit and provide payment to this IRB for annual review yearly</li>
						</ul>`
    // checkBox: {
    //   label:
    //     'Electronic Signature below certifies that you have read and agree to the research compliance terms listed in above protocol application.',
    //   value: 'terms_selected'
    // }
  },
  submissionAdditionalInfo: {
    checkBox1: {
      label:
        'Electronic Signature below certifies that you have read and agree to the research compliance terms listed in above protocol application.',
      value: 'applicant_terms'
    },
    checkBox2: {
      label:
        'I acknowledge that processed payment for protocol approval submission is non-refundable.',
      value: 'applicant_acknowledge'
    },
    text: `Electronic Signature`,
    answer: 'applicant_acknowledge_name'
  }
}

const multiSiteSponsorQuestions = {
  protocolInformation: {
    title: 'Protocol Information',
    question1: {
      text: `Are you submitting this protocol for the first time?`,
      answer: 'first_time_protocol'
    },
    subTexts: [
      {
        sequence: 2,
        text: `Has this study been disapproved or withdrawn from another IRB?`,
        answer: 'disapproved_or_withdrawn',
        explanation: 'disapproved_or_withdrawn_explain'
      },
      {
        sequence: 3,
        text: `Are you transferring oversight from another IRB?`,
        answer: 'oversite',
        explanation: 'oversite_explain'
      },
      {
        sequence: 4,
        text: `Title of Protocol`,
        answer: 'protocol_title'
      },
      {
        sequence: 5,
        text: `Protocol Number`,
        answer: 'protocol_number'
      },
      {
        sequence: 6,
        text: `Sponsor`,
        answer: 'sponsor'
      },
      {
        sequence: 7,
        text: `Study Duration`,
        answer: 'study_duration'
      },
      {
        sequence: 8,
        text: `Funding Source`,
        answer: 'funding_source'
      }
    ],
    documentHeader: 'Uploaded Protocol',
    documentName: 'protocol_file'
  },
  contactInformation: {
    title: 'Contact Information',
    subQuestions: [
      {
        header: 'Who is the primary point of contact for this study?'
      },
      {
        sequence: 1,
        text: 'Name',
        answer: 'name'
      },
      {
        sequence: 2,
        text: 'Title',
        answer: 'title'
      },
      {
        sequence: 3,
        text: 'Company Name',
        answer: 'company_name'
      },
      {
        sequence: 4,
        text: 'Address',
        answer: 'address'
      },
      {
        sequence: 5,
        text: 'City',
        answer: 'city'
      },
      {
        sequence: 6,
        text: 'State',
        answer: 'state'
      },
      {
        sequence: 7,
        text: 'Zip code',
        answer: 'zip_code'
      },
      {
        sequence: 8,
        text: 'Country',
        answer: 'country'
      },
      {
        sequence: 9,
        text: 'Phone Number',
        answer: 'phone_number'
      },
      {
        sequence: 10,
        text: 'Email',
        answer: 'email'
      }
    ],
    subQuestions2: [
      {
        header: 'Who is the secondary point of contact for this study?'
      },
      {
        sequence: 11,
        text: 'Name',
        answer: 'secondary_contact_name'
      },
      {
        sequence: 12,
        text: 'Title',
        answer: 'secondary_contact_title'
      },
      {
        sequence: 13,
        text: 'Phone Number',
        answer: 'secondary_contact_phone_number'
      },
      {
        sequence: 14,
        text: 'Email',
        answer: 'secondary_contact_email'
      }
    ]
  },
  studyInformation: {
    title: 'Study Information',
    question1: {
      text: `What type of research study are you submitting?`,
      answer: 'research_type',
      explanation: 'research_type_explain'
    },
    documentsUploadedList: [
      {
        documentHeader:
          'Upload drug/biologic profile, device profile, food/dietary supplement ingredient list, or cosmetic ingredient list',
        documentName: 'ingredient_list'
      }
    ]
  },
  informedConsentForm: {
    title: 'Informed Consent',
    checkboxes: {
      header: 'What type of consent is required for this study?',
      answer: 'consent_type',
      options: [
        { label: 'No consent (requesting waiver of consent)', value: '1' },
        { lavel: 'Verbal consent', value: '2' },
        { label: 'Written, signed consent by subject', value: '3' },
        {
          label: 'Written, signed consent by legally authorized representative',
          value: '4'
        },
        { label: 'Written, signed assent by minor', value: '5' },
        { label: 'HIPAA authorization agreement', value: '6' },
        { label: 'Waiver of HIPAA agreement', value: '7' },
        { label: 'Online/website/electronic signature consent', value: '8' }
      ],
      explanation: 'no_consent_explain'
    },
    subTexts: [
      {
        sequence: 1,
        text: `Will HIPAA authorization language be included in the ICF (informed consent form)?`,
        answer: 'include_icf'
      },
      {
        sequence: 2,
        text: `Will the participants be compensated for participation in the study?`,
        answer: 'participation_compensated'
      },
      {
        sequence: 3,
        text: `Will the consent forms be offered in languages other than English?`,
        answer: 'other_language_selection'
      },
      {
        sequence: 4,
        text: `Have the dcument been translated by a professional translator?`,
        answer: 'professional_translator',
        explanation: 'professional_translator_explain'
      }
    ],
    documentHeader: `Upload all consent document templates, including translated consents, if applicable,
here (if applying for waiver of consent, document explaining reasoning must be uploaded here)`,
    documentName: 'consent_file',
    declaration: {
      header: `<p>The informed consent process is a continuous process and the IRB expects that
                            proper subject consent is ensured by the investigator throughout the research
                            study. To comply with the terms set forth by this IRB, the investigator must
                            ensure that:
                        </p>
                        <ul>
                            <li>No study procedures shall be conducted prior to completion of the informed consent forms which include subject or legally authorized representative (LAR) signatures and date, investigator or person obtaining consent signature and date, and providing a copy of the signed consent to the study participant.</li>
                            <li>The identified research participant is given plenty of time to consider their participation in the study and all questions are answered. The identified research participant must be told that their participation in the study is voluntary and that they are under no obligation to participate. The potential participant must voice understanding before proceeding.</li>
                            <li>The consent discussion must be in language understandable to the potential research participant’s comprehension level.</li>
                            <li>The informed consent discussion must be performed in a private setting free from other people who may overhear the discussion, such as a private exam room or other closed-door setting.</li>
                            <li>Only the most current, IRB-approved consent forms may be used for enrollment. </li>
                            <li>All efforts must be taken to ensure participant anonymity including:
                                <ul style="margin-top: 0;">                                    
                                <li>Safe storage of subject identifiers-all subject identifiers must be coded and de-identified</li>
                                    <li>Safe storage of subject identifiers-all subject identifiers must be coded and de-identified</li>
                                    <li>All paper-based records will be stored in a double-locked area such as a locking filing cabinet inside of a locking door and only accessible to authorized staff.</li>
                                    <li>All electronic-based records will only be accessed by authorized staff using secure login credentials.</li>
                                </ul>
                            </li>
                            <li>It is the responsibility of the sponsor to enforce these terms with the site investigators.</li>
                        </ul>`,
      checkBox: {
        label:
          'You have read the term and agree with the above research compliance.',
        value: 'consent_declaration'
      }
    }
  },
  protocolProcedure: {
    title: 'Protocol Subject',
    checkboxes: {
      header: 'Which subject populations will be enrolled in the study?',
      answer: 'enrolled_study_type',
      options: [
        {
          label: 'Adults',
          value: '1'
        },
        {
          label: 'Children (17 years and under)',
          value: '2'
        },
        {
          label: 'Blind/Visually Impaired',
          value: '3'
        },
        {
          label: 'Deaf/Hard of Hearing (including sign language communicators)',
          value: '4'
        },
        {
          label:
            'Individuals with impaired decision-making (requiring a LAR, including those with impaired or diminished mental capacity, dementia, and those suffering from mental health disorders)',
          value: '5'
        },
        {
          label: 'Educationally Disadvantaged/Impaired or no reading skills',
          value: '6'
        },
        {
          label: 'Economically disadvantaged',
          value: '7'
        },
        {
          label: 'Healthy individuals',
          value: '8'
        },
        {
          label: 'Terminally ill individuals',
          value: '9'
        },
        {
          label: 'HIV positive',
          value: '10'
        },
        {
          label: 'Hospitalized',
          value: '11'
        },
        {
          label:
            'Institutionalized (including nursing home, LTAC, assisted living, residential facility, mental hospital)',
          value: '12'
        },
        {
          label: 'Prisoners',
          value: '13'
        },
        {
          label: 'Military Personnel',
          value: '14'
        },
        {
          label: 'Pregnant women',
          value: '15'
        },
        {
          label: 'Human fetuses/neonates',
          value: '16'
        },
        {
          label: 'Non-English speakers',
          value: '17'
        },
        {
          label: 'Women only',
          value: '18'
        },
        {
          label: 'Men only',
          value: '19'
        },
        {
          label: 'Other',
          value: '20'
        }
      ],
      explanation: 'enrolled_type_explain'
    },
    checkboxes2: {
      header: 'Which race and ethnic groups will be enrolled in the study?',
      answer: 'enrolled_group',
      options: [
        { label: 'White, not of Hispanic origin', value: '1' },
        { label: 'White, of Hispanic origin', value: '2' },
        { label: 'Black, not of Hispanic origin', value: '3' },
        { label: 'Black, of Hispanic origin', value: '4' },
        { label: 'American Indian/Alaskan Native', value: '5' },
        { label: 'Asian', value: '6' },
        { label: 'Native Hawaiian/Pacific Islander', value: '7' },
        { label: 'Multiracial', value: '8' },
        { label: 'Other', value: '9' }
      ],
      explanation: 'enrolled_group_explain'
    },
    subTexts: [
      {
        sequence: 1,
        text: `Will any subject populations be excluded from the study?`,
        answer: 'excluded_study_type',
        explanation: 'excluded_study_type_explain'
      },
      {
        sequence: 2,
        text: `How many subjects will be enrolled in the study?`,
        answer: 'enrolled_subjects'
      }
    ],
    checkboxes3: {
      header: 'What recruitment methods will be used in the study?',
      answer: 'recruitment_method',
      options: [
        {
          label: 'In-person conversation during routine office visits',
          value: '1'
        },
        {
          label: 'Recruiting participants from previous research studies',
          value: '2'
        },
        {
          label:
            'Mass print advertisements such as a newspaper, magazine, or billboard',
          value: '3'
        },
        {
          label: 'Flyer, poster, or bulletin board in office',
          value: '4'
        },
        {
          label: 'Radio or television ads',
          value: '5'
        },
        {
          label: 'Direct mail to potential subjects',
          value: '6'
        },
        {
          label: 'Internet including social media recruiting',
          value: '7'
        },
        {
          label: 'Chart review',
          value: '8'
        },
        {
          label: 'Telephone screening',
          value: '9'
        },
        {
          label: 'Other',
          value: '10'
        }
      ],
      explanation: 'recruitment_method_explain'
    },
    subTexts2: [
      {
        sequence: 3,
        text: `Will the sponsor require IRB approval of site-specific templates prior to use?`,
        answer: 'irb_approval'
      },
      {
        sequence: 4,
        text: `What is the expected number of sites to participate in this study that will be submitted to this IRB?`,
        answer: 'expected_number_sites'
      },
      {
        sequence: 5,
        text: `Will any samples or data collected in this study be retained for future research?`,
        answer: 'future_research',
        explanation: {
          header: `Please explain how the data and/or samples will be stored, secured, and de-identified. Include information on how the data and/or samples might be used for future research *`,
          answer: 'future_research_explain'
        }
      }
    ],
    documentHeader: 'Upload all recruitment and subject-facing materials *',
    documentName: 'facing_materials',
    checkBox: {
      label:
        'You have read the term and agree with the above research compliance.',
      value: 'protocol_declaration'
    }
  },
  submissinForm: {
    title: 'Submission Form',
    text: `<p>By submitting this application you attest to the following:</p>
            <ul>
              <li>Research will not commence prior to receiving the IRB approval letter.</li>
              <li>The principal investigator will personally supervise and/or conduct the study.</li>
              <li>The principal investigator ensures that all persons involved in conducting the study are trained and have proper credentialing for conducting research.</li>
              <li>Only the most current IRB-approved consent form will be used to enroll subjects.</li>
              <li>No changes will be made to the research protocol, consents forms, and all patient-facing materials without the approval of the IRB </li>
              <li>The study procedures will comply with all applicable laws and regulations regarding the conduct of research</li>
              <li>All findings from the study that directly affect subject safety will be communicated to subjects and to this IRB</li>
              <li>All serious adverse events (SAEs), whether related to the study procedures or not, will be reported to this IRB within 2 business days of the investigator becoming aware of the event for IRB safety review</li>
              <li>The sponsor agrees to submit and provide payment to this IRB for annual review yearly</li>
            </ul>`
    // checkBox: {
    //   label:
    //     'Electronic Signature below certifies that you have read and agree to the research compliance terms listed in above protocol application.',
    //   value: 'terms_selected'
    // }
  },
  submissionAdditionalInfo: {
    checkBox1: {
      label:
        'Electronic Signature below certifies that you have read and agree to the research compliance terms listed in above protocol application.',
      value: 'applicant_terms'
    },
    checkBox2: {
      label:
        'I acknowledge that processed payment for protocol approval submission is non-refundable.',
      value: 'applicant_acknowledge'
    },
    text: `Electronic Signature`,
    answer: 'applicant_acknowledge_name'
  }
}

const principalInvestigatorQuestions = {
  investigatorInformation: {
    title: 'Principal Investigator Information',
    subQuestions: [
      {
        sequence: 1,
        text: 'Investigator Name *',
        answer: 'investigator_name'
      },
      {
        sequence: 2,
        text: 'Investigator Email *',
        answer: 'investigator_email'
      },
      {
        sequence: 3,
        text: 'Sub-Investigator Name',
        answer: 'sub_investigator_name'
      },
      {
        sequence: 4,
        text: 'Sub-Investigator Email',
        answer: 'sub_investigator_email'
      },
      {
        sequence: 5,
        text: 'Additional Study personnel name',
        answer: 'additional_study_name'
      },
      {
        sequence: 6,
        text: 'Additional Study personnel email address',
        answer: 'additional_study_email'
      }
    ],
    question1: {
      text: 'Investigational/Research Location:',
      subTexts: [
        {
          sequence: 7,
          text: 'Name of the site *',
          answer: 'site_name'
        },
        {
          sequence: 8,
          text: 'Address of site *',
          answer: 'site_address'
        },
        {
          sequence: 9,
          text: 'Do you have more than one site where research will be conducted?',
          answer: 'more_site'
        },
        {
          sequence: 10,
          text: 'Full protocol title *',
          answer: 'protocol_title'
        },
        {
          sequence: 11,
          text: 'Protocol number *',
          answer: 'protocol_number'
        },
        {
          sequence: 12,
          text: 'Your initials below confirm that your site will only enroll subjects that meet criteria for inclusion in the study *',
          answer: 'study_criteria'
        },
        {
          sequence: 13,
          text: 'How many subjects do you expect to enroll at your site(s) *',
          answer: 'subject_number'
        },
        {
          sequence: 14,
          text: 'What is your site number assigned by the sponsor',
          answer: 'site_number'
        },
        {
          sequence: 15,
          text: 'Has this study been disapproved or withdrawn from another IRB?',
          answer: 'disapproved_or_withdrawn'
        },
        {
          sequence: 16,
          text: 'Are you transferring oversight from another IRB?',
          answer: 'oversite'
        },
        {
          sequence: 17,
          text: 'Have any individuals or immediate family members at this site received compensation from the sponsor of this study in the past 12 months that amounts to $5,000 or greater?',
          answer: 'immediate_family'
        },
        {
          sequence: 18,
          text: 'Do any individuals or immediate family members at this site own interest in the form of stock or other ownership in the sponsor company of this study in the last 12 months that amounts to $5,000 or greater?',
          answer: 'stock_ownership'
        },
        {
          sequence: 19,
          text: 'Do any individuals at this site have proprietary interests being investigated in this study such as, but not limited to, patents, investigational products, or licensing agreements?',
          answer: 'property_interest'
        },
        {
          sequence: 20,
          text: 'Do any individuals at this site have a financial agreement with the sponsor for which they will receive compensation that is linked to the outcome of the study?',
          answer: 'financial_agreement'
        },
        {
          sequence: 21,
          text: 'Do any individuals at this site serve in any executive position or on a board of directors for the sponsor of this study?',
          answer: 'server_position'
        },
        {
          sequence: 22,
          text: 'Do any individuals at this site have any interests that may influence the conduct, outcome, or safety of this study?',
          answer: 'influence_conduct'
        },
        {
          sequence: 23,
          text: 'Is there a Conflict of Interest Committee that has made any determinations related to the potential conflicts and is there a management plan in place?',
          answer: 'interest_conflict'
        },
        {
          sequence: 24,
          text: 'Has the investigator ever had an FDA audit?',
          answer: 'fda_audit'
        },
        {
          sequence: 25,
          text: 'How long has the investigator been involved in research?',
          answer: 'involved_years'
        },
        {
          sequence: 26,
          text: "What is the investigator's NPI if applicable",
          answer: 'investigators_npi'
        }
      ]
    },
    checkboxes: {
      header:
        'What training in the field of human subjects protection has the investigator completed?',
      answer: 'training_completed',
      options: [
        {
          value: '1',
          label: 'OHRP Human Subject Assurance Training'
        },
        {
          value: '2',
          label: 'CITI Program Training'
        },
        {
          value: '3',
          label: 'Certified Physician Investigator Training'
        },
        {
          value: '4',
          label: 'ACRP training (CCRC, CCRA)'
        },
        {
          value: '5',
          label: 'SOCRA (CCRP)'
        },
        {
          value: '6',
          label: 'Graduate or undergraduate research studies or degrees'
        },
        {
          value: '7',
          label: 'Academy of Physicians in Clinical Research'
        },
        {
          value: '8',
          label: 'Other'
        }
      ],
      explanation: 'training_completed_explain'
    },
    question2: {
      sequence: 28,
      text: 'What is the current number of research studies supervised by the investigator?',
      answer: 'investigator_research_number'
    },
    question3: {
      sequence: 29,
      text: 'Do you have any pending or active restrictions related to research or the practice of medicine?',
      answer: 'pending_or_active_research',
      explanation: 'pending_or_active_research_explain'
    },
    documentsUploadedList: [
      {
        documentHeader:
          'Upload investigator and sub-investigator (if applicable) CV here *',
        documentName: 'investigator_cv' // prev key -> cv_files
      },
      {
        documentHeader: 'Upload copy of medical license (if applicable) here',
        documentName: 'medical_license'
      },
      {
        documentHeader:
          'Upload copies of training certificates (if applicable) here',
        documentName: 'training_certificates'
      }
    ]
  },
  informedConsentForm: {
    title: 'Informed Consent Document Information',
    question1: {
      text: `The IRB will provide your site with an informed consent form formatted with your information. Please answer the questions below so that we may include it in the document`,
      subTexts: [
        {
          sequence: 1,
          text: 'Principal Investigator name *',
          answer: 'principal_investigator_name'
        },
        {
          sequence: 2,
          text: 'Site Name *',
          answer: 'site_name'
        },
        {
          sequence: 3,
          text: 'Site Address *',
          answer: 'site_address'
        },
        {
          sequence: 4,
          text: 'Additional Site Address',
          answer: 'additional_site_address'
        },
        {
          sequence: 5,
          text: 'Primary phone number to be listed on the ICF (include the area code) *',
          answer: 'primary_phone'
        },
        {
          sequence: 6,
          text: '24-hour phone number to be listed on the ICF (include the area code) *',
          answer: 'always_primary_phone'
        },
        {
          sequence: 7,
          text: 'Will your site(s) use electronic consent?',
          answer: 'site_electronic_consent'
        }
      ]
    },
    declaration: {
      header: `<p>Mandatory message to end users, must be initialed before moving on to the next step:</p>
              <p>The informed consent process is a continuous process and the IRB expects that proper subject consent is ensured by the investigator throughout the research study. To comply with the terms set forth by this IRB, the investigator must ensure that:</p>
              <ul>
                  <li>No study procedures shall be conducted prior to completion of the informed consent forms which include subject or legally authorized representative (LAR) signatures and date, investigator or person obtaining consent signature and date, and providing a copy of the signed consent to the study participant.</li>
                  <li>The identified research participant is given plenty of time to consider their participation in the study and all questions are answered. The identified research participant must be told that their participation in the study is voluntary and that they are under no obligation to participate. The potential participant must voice understanding before proceeding.</li>
                  <li>The consent discussion must be in language understandable to the potential research participant’s comprehension level.</li>
                  <li>The informed consent discussion must be performed in a private setting free from other people who may overhear the discussion, such as a private exam room or other closed-door setting.</li>
                  <li>Only the most current, IRB-approved consent forms may be used for enrollment.</li>
                  <li>All efforts must be taken to ensure participant anonymity including:
                   <ul style="margin-top: 0;">                                    
                   <li>Safe storage of subject identifiers-all subject identifiers must be coded and de-identified</li>
                          <li>Safe storage of subject identifiers-all subject identifiers must be coded and de-identified</li>
                          <li>All paper-based records will be stored in a double-locked area such as a locking filing cabinet inside of a locking door and only accessible to authorized staff.</li>
                          <li>All electronic-based records will only be accessed by authorized staff using secure login credentials.</li>
                      </ul>
                  </li>
              </ul>`
    },
    checkBox: {
      label:
        'You have read the term and agree with the above research compliance.',
      value: 'terms_selected'
    }
  },
  submissinForm: {
    title: 'Submission',
    text: `<p>By submitting this application you attest to the following:</p>
						<ul>
							<li>Research will not commence prior to receiving the IRB approval letter</li>
							<li>The principal investigator will personally supervise and/or conduct the study</li>
							<li>The principal investigator ensures that all persons involved in conducting the study are trained and have proper credentialing for conducting research</li>
							<li>Only the most current IRB-approved consent form will be used to enroll subjects</li>
							<li>No changes will be made to the research protocol, consents forms, and all patient-facing materials without the approval of the IRB</li>
							<li>The study procedures will comply with all applicable laws and regulations regarding the conduct of research</li>
							<li>All findings from the study that directly affect subject safety will be communicated to subjects, the sponsor, and to this IRB</li>
							<li>All serious adverse events (SAEs), whether related to the study procedures or not, will be reported to this IRB within 2 business days of the investigator becoming aware of the event for IRB safety review</li>
							<li>The investigator will submit annual review and reviews in compliance with sponsor</li>
						</ul>`
    // checkBox: {
    //   label:
    //     'Electronic Signature below certifies that you have read and agree to the research compliance terms listed in above protocol application.',
    //   value: 'terms_selected'
    // }
  },
  submissionAdditionalInfo: {
    checkBox1: {
      label:
        'Electronic Signature below certifies that you have read and agree to the research compliance terms listed in above protocol application.',
      value: 'applicant_terms'
    },
    checkBox2: {
      label:
        'I acknowledge that processed payment for protocol approval submission is non-refundable.',
      value: 'applicant_acknowledge'
    },
    text: `Electronic Signature`,
    answer: 'applicant_acknowledge_name'
  }
}

const documentReviewQuestions = {
  protocolInformation: {
    title: 'Protocol Information',
    question1: {
      text: `Are you submitting the document for the first time?`,
      answer: 'first_time_protocol',
      subTexts: [
        {
          text: `Has this study been disapproved or withdrawn from another IRB?`,
          answer: 'disapproved_or_withdrawn',
          explanation: 'disapproved_or_withdrawn_explain'
        },
        {
          text: `Are you transferring oversight from another IRB?`,
          answer: 'oversite',
          explanation: 'oversite_explain'
        },
        {
          text: `Title of Protocol`,
          answer: 'protocol_title'
        },
        {
          text: `Protocol Number`,
          answer: 'protocol_number'
        },
        {
          text: `Study Duration`,
          answer: 'study_duration'
        },
        {
          text: `Sponsor`,
          answer: 'sponsor'
        },
        {
          text: `Funding Source`,
          answer: 'funding_source'
        }
      ],
      documentHeader: 'Uploaded Protocol',
      documentName: 'protocol_file'
    }
  },
  investigatorInformation: {
    title: 'Investigator Information',
    subTexts: [
      {
        sequence: 1,
        text: `Investigator Name`,
        answer: 'investigator_name'
      },
      {
        sequence: 2,
        text: `Investigator Email`,
        answer: 'investigator_email'
      },
      {
        sequence: 3,
        text: `Sub Investigator Name`,
        answer: 'sub_investigator_name'
      },
      {
        sequence: 4,
        text: `Sub Investigator Email`,
        answer: 'sub_investigator_email'
      },
      {
        sequence: 5,
        text: `Primary point of contact if different from above`,
        answer: 'primary_contact'
      },
      {
        sequence: 6,
        text: `Primary point of contact email address`,
        answer: 'primary_contact_email'
      }
    ]
  },
  informedConsentForm: {
    title: 'Informed Consent Form',
    checkboxes: {
      header: 'What types of documents to be reviewed please select below',
      answer: 'consent_type',
      options: [
        { label: 'Pre study consent', value: '1' },
        { label: 'Consent revision', value: '2' },
        { label: 'Research study questionnaire review', value: '3' },
        { label: 'Protocol revision', value: '4' },
        { label: 'Post Study questionnaire', value: '5' },
        { label: 'Post market questionnaire', value: '6' },
        { label: 'HIPAA authorization agreement', value: '7' },
        { label: 'Waiver of HIPAA agreement', value: '8' },
        { label: 'Advertising documents review', value: '9' },
        { label: 'Research subject compensation review ', value: '10' }
      ]
      // explanation: 'no_consent_explain'
    },
    subTexts: [
      {
        sequence: 2,
        text: `Will HIPAA authorization language be included in the ICF (informed consent form)?`,
        answer: 'include_icf'
      },
      {
        sequence: 3,
        text: `Will the participants be compensated for participation in the study?`,
        answer: 'participation_compensated'
      },
      {
        sequence: 4,
        text: `Will the consent forms be offered in languages other than English?`,
        answer: 'other_language_selection'
      },
      {
        sequence: 5,
        text: `Have the dcument been translated by a professional translator?`,
        answer: 'professional_translator',
        explanation: 'professional_translator_explain'
      }
    ],
    documentsUploadedList: [
      {
        documentHeader: `Upload all consent documents, including translated consents, if applicable
(if applying for waiver of consent, document explaining reasoning must be uploaded)`,
        documentName: 'consent_file'
      }
    ],
    declaration: {
      header: ` <p>The informed consent process is a continuous process and the IRB expects that
                            proper subject consent is ensured by the investigator throughout the research
                            study. To comply with the terms set forth by this IRB, the investigator must
                            ensure that:
                        </p>
                        <ul>
                            <li>No study procedures shall be conducted prior to completion of the informed consent forms which include subject or legally authorized representative (LAR) signatures and date, investigator or person obtaining consent signature and date, and providing a copy of the signed consent to the study participant.</li>
                            <li>The identified research participant is given plenty of time to consider their participation in the study and all questions are answered. The identified research participant must be told that their participation in the study is voluntary and that they are under no obligation to participate. The potential participant must voice understanding before proceeding.</li>
                            <li>The consent discussion must be in language understandable to the potential research participant’s comprehension level.</li>
                            <li>The informed consent discussion must be performed in a private setting free from other people who may overhear the discussion, such as a private exam room or other closed-door setting.</li>
                            <li>Only the most current, IRB-approved consent forms may be used for enrollment. </li>
                            <li>All efforts must be taken to ensure participant anonymity including:
                                  <ul style="margin-top: 0;"> 
                                    <li>Safe storage of subject identifiers-all subject identifiers must be coded and de-identified</li>
                                    <li>Safe storage of subject identifiers-all subject identifiers must be coded and de-identified</li>
                                    <li>All paper-based records will be stored in a double-locked area such as a locking filing cabinet inside of a locking door and only accessible to authorized staff.</li>
                                    <li>All electronic-based records will only be accessed by authorized staff using secure login credentials.</li>
                                </ul>
                            </li>
                        </ul>`,
      checkBox: {
        label:
          'You have read the term and agree with the above research compliance.',
        value: 'consent_declaration'
      }
    }
  },
  submissinForm: {
    title: 'Submission Form',
    text: `<p>By submitting this application you attest to the following:</p>
						<ul>
              <li>IRBHUB provides qualified reviewers with expertise in the relevant subject matter that is crucial for your research. Our experts review the document to meet your present or future research needs.</li>
              <li>The expert reviews of documents doesn't give an approval for research study, it only provides ethical and or research needs or guidance in the context of research.</li>
              <li>Providing us more detail on research protocol does help our experts to give you more relevant suggestions or guidance.</li>
              <li>If your request for documents review about informed Consent for a research subject please follow some required rules on consent as below.</li>
              <li>The informed consent discussion must be performed in a private setting free from other people who may overhear the discussion, such as a private exam room or other closed-door setting.</li>
              <li>The consent discussion must be in language understandable to the potential research participant’s comprehension level.</li>
              <li>Only the most current, IRB-approved consent forms may be used for enrollment.</li>
              <li>All efforts must be taken to ensure participant anonymity including.</li>
              <li>Safe storage of subject identifiers-all subject identifiers must be coded and de-identified.</li>
              <li>All paper-based records will be stored in a double-locked area such as a locking filing cabinet inside of a locking door and only accessible to authorized staff.</li>
              <li>All electronic-based records will only be accessed by authorized staff using secure login credentials.</li>
              <li>You acknowledge that you read the term and agree with them.</li>
            </ul>`
    // checkBox: {
    //   label:
    //     'Electronic Signature below certifies that you have read and agree to the research compliance terms listed in above protocol application.',
    //   value: 'terms_selected'
    // }
  },
  submissionAdditionalInfo: {
    checkBox1: {
      label:
        'Electronic Signature below certifies that you have read and agree to the research compliance terms listed in above protocol application.',
      value: 'applicant_terms'
    },
    checkBox2: {
      label:
        'I acknowledge that processed payment for protocol approval submission is non-refundable.',
      value: 'applicant_acknowledge'
    },
    text: `Electronic Signature`,
    answer: 'applicant_acknowledge_name'
  }
}

const protocolDetails = {
  clinicalReviewQuestions,
  multiSiteSponsorQuestions,
  principalInvestigatorQuestions,
  documentReviewQuestions
}

const questionsToRender = {
  continuingReviewQuestions,
  protocolDetails
}

export default questionsToRender
