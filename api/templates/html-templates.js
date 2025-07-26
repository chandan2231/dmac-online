import questionsToRender from './constant.js'

const getMappedStatus = (status) => {
  const statusType = Number(status)

  if (statusType === 1) return 'Created'
  if (statusType === 2) return 'Under Review'
  if (statusType === 3) return 'Approved'
  if (statusType === 4) return 'Approved'

  return ''
}

// const getCreatedData = (createDate) => {
//   if (createDate) {
//     const date = new Date(createDate)
//     return date.toDateString()
//   }
//   return ''
// }

const getCreatedData = (createDate) => {
  if (createDate) {
    const date = new Date(createDate)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }
  return ''
}

// base template
const renderHeader = (props) => {
  const { title } = props
  return `<div><h3>${title}</h3></div>`
}

const RenderBody = (children) => {
  return `<body style="padding:25">${children}</body>`
}

const RenderTextOnly = (text) => {
  return `<div>
      <p>${text}</p>
    </div>`
}

const RenderSubTextAnswer = (answer, answerObject) => {
  return `<div>
          ${
            answerObject[answer]
              ? `<span>${answerObject[answer]}</span>`
              : `<h4>N/A</h4>`
          }
      </div>`
}

const RenderQuestion = (sequence, text) => {
  return `<div>
      <h3>Question ${sequence}</h3>${text ? `<span>${text}</span>` : ``}
    </div>`
}

const RenderSubOptions = (subOptions) => {
  return `<div>
      ${
        subOptions
          ? `<ul>
        ${Object.keys(subOptions)
          .map((key) => {
            return `<li>${subOptions[key]}</li>`
          })
          .join('')}
      </ul>`
          : ''
      }
    </div>`
}

const RenderAnswer = (answerObject, answer) => {
  return `<div>
      <h4>Answer</h4>
      <div>
        ${
          answerObject[answer]
            ? `<span>${answerObject[answer]}</span>`
            : `<h4>N/A</h4>`
        }
      </div>
    </div>`
}

const RenderAnswerPro = (answerObject, answer) => {
  return `<div>
      <p>
        ${
          answerObject[answer]
            ? `<span>${answerObject[answer]}</span>`
            : `<h4>N/A</h4>`
        }
      </p>
    </div>`
}

const RenderCheckboxAnswer = (checkBoxObject, answerObject) => {
  const { header, options, answer } = checkBoxObject
  if (!options) return ''
  return `
    <div>
      <h4>${header}</h4>
      ${options
        .map((option) => {
          const isChecked = answerObject[answer]?.includes(option.value)
          if (!isChecked) return ''
          return `
            <div>
              <input
                type="checkbox"
                id="${option.value}"
                name="${option.value}"
                value="${option.value}"
                checked
                disabled
              />
              <label for="${option.value}">${option.label}</label>
            </div>
          `
        })
        .join('')}
    </div>`
}

const RenderElplanation = (answerObject, explanation) => {
  return `<div>
      <h4>Explanation</h4>
      ${
        answerObject[explanation]
          ? `<p>${answerObject[explanation]}</p>`
          : `N/A`
      }
    </div>`
}

const RenderDocuments = (answerObject, documentHeader, documentName) => {
  return `<div>
      ${
        documentHeader && answerObject['documents']?.length > 0
          ? `<h4>${documentHeader}</h4>
        ${answerObject['documents']
          ?.map((docListItem) => {
            if (docListItem['document_name'] === documentName) {
              return `<div><a href=${docListItem[documentName]} target='_blank'>${docListItem['file_url']}</a></div>`
            }
          })
          .join('')}`
          : `<h4>No Documents Uploaded</h4>`
      }
    </div>`
}

const RenderSingleCheckboxAnswer = (answerObject, checkBoxObject) => {
  const { label, value } = checkBoxObject || {}
  const isChecked = answerObject[value] === 'Yes' ? true : false
  return `
    <div>
      <input type="checkbox" ${isChecked ? 'checked' : 'disabled'} />
      <label>${label}</label>
    </div>`
}

const RenderSingleCheckboxAnswerPro = (answerObject, checkBoxObject) => {
  const { label, value } = checkBoxObject || {}
  const isChecked = Number(answerObject[value]) === 1 ? true : false
  return `
    <div>
      <input type="checkbox" ${isChecked ? 'checked' : 'disabled'} />
      <label>${label}</label>
    </div>`
}

// Render functions for each question
const RenderRiskAssessmentFirstQuestion = (questionObject, answerObject) => {
  const { question1 } = questionObject
  const { text, answer, explanation, documentHeader, documentName } = question1
  const sequence = 1
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  ${RenderElplanation(answerObject, explanation)}
  ${RenderDocuments(answerObject, documentHeader, documentName)}
  </div>`
}

const RenderRiskAssessmentSecondQuestion = (questionObject, answerObject) => {
  const { question2 } = questionObject
  const { text, answer, subOptions, explanation } = question2
  const sequence = 2
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderSubOptions(subOptions)}
  ${RenderAnswer(answerObject, answer)}
  ${RenderElplanation(answerObject, explanation)}
  </div>`
}

const RenderInformedConsentProcessFirstQuestion = (
  questionObject,
  answerObject
) => {
  const { question1 } = questionObject
  const { text, answer, documentHeader, documentName } = question1
  const sequence = 1
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  ${RenderDocuments(answerObject, documentHeader, documentName)}
  </div>`
}

const RenderInformedConsentProcessSecondQuestion = (
  questionObject,
  answerObject
) => {
  const { question2 } = questionObject
  const { text, answer } = question2
  const sequence = 2
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  </div>`
}

const RenderInformedConsentThirdQuestion = (questionObject, answerObject) => {
  const { question3 } = questionObject
  const { text, answer, explanation } = question3
  const sequence = 3
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  ${RenderElplanation(answerObject, explanation)}
  </div>`
}

const RenderInformedConsentProcessFourthQuestion = (
  questionObject,
  answerObject
) => {
  const { question4 } = questionObject
  const { text, answer, explanation } = question4
  const sequence = 4
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  ${RenderElplanation(answerObject, explanation)}
  </div>`
}

const RenderInformedConsentFifthQuestion = (questionObject, answerObject) => {
  const { question5 } = questionObject
  const {
    text,
    subOptions,
    answer,
    explanation,
    documentHeader,
    documentName
  } = question5
  const sequence = 5
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderSubOptions(subOptions)}
  ${RenderAnswer(answerObject, answer)}
  ${RenderElplanation(answerObject, explanation)}
  ${RenderDocuments(answerObject, documentHeader, documentName)}
  </div>`
}

const RenderInvestigatorInstuationInfoFirstQuestion = (
  questionObject,
  answerObject
) => {
  const { question1 } = questionObject
  const { text, answer, checkboxes, documentHeader, documentName } = question1
  const sequence = 1
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  ${RenderCheckboxAnswer(answerObject, checkboxes)}
  ${RenderDocuments(answerObject, documentHeader, documentName)}
  </div>`
}

const RenderInvestigatorInstuationInfoSecondQuestion = (
  questionObject,
  answerObject
) => {
  const { question2 } = questionObject
  const { text, answer, explanation, documentHeader, documentName } = question2
  const sequence = 2
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  ${RenderElplanation(answerObject, explanation)}
  ${RenderDocuments(answerObject, documentHeader, documentName)}
  </div>`
}

const RenderInvestigatorInstuationInfoThirdQuestion = (
  questionObject,
  answerObject
) => {
  const { question3 } = questionObject
  const { text, answer, documentHeader, documentName, subTexts, checkboxes } =
    question3
  const firstSubText = subTexts[0]
  const secoundSubText = subTexts[1]
  const sequence = 3
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  ${RenderCheckboxAnswer(answerObject, checkboxes)}
  ${RenderTextOnly(secoundSubText.text)}
  ${RenderSubTextAnswer(answerObject, secoundSubText.answer)}
  ${RenderDocuments(answerObject, documentHeader, documentName)}
  ${RenderTextOnly(firstSubText.text)}
  ${RenderSubTextAnswer(answerObject, firstSubText.answer)}
  ${RenderElplanation(answerObject, firstSubText.explanation)}
  </div>`
}

const RenderInvestigatorInstuationInfoFourthQuestion = (
  questionObject,
  answerObject
) => {
  const { question4 } = questionObject
  const { text, answer, explanation, documentHeader, documentName } = question4
  const sequence = 4
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  ${RenderElplanation(answerObject, explanation)}
  ${RenderDocuments(answerObject, documentHeader, documentName)}
  </div>`
}

const RenderInvestigatorInstuationInfoFifthQuestion = (
  questionObject,
  answerObject
) => {
  const { question5 } = questionObject
  const { text, answer, explanation } = question5
  const sequence = 5
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  ${RenderElplanation(answerObject, explanation)}
  </div>`
}

const RenderResearchProgressInfoFirstQuestion = (
  questionObject,
  answerObject
) => {
  const { question1 } = questionObject
  const { text, answer } = question1
  const sequence = 1
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  </div>`
}

const RenderResearchProgressInfoSecondQuestion = (
  questionObject,
  answerObject
) => {
  const { question2 } = questionObject
  const { text, answer, subTexts } = question2
  const firstSubText = subTexts[0]
  const secoundSubText = subTexts[1]
  const thirstSubtext = subTexts[2]
  const fourthSubText = subTexts[3]
  const sequence = 2
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  ${RenderTextOnly(firstSubText.text)}
  ${RenderSubTextAnswer(answerObject, firstSubText.answer)}
  ${
    answerObject['sub_withdrew'] >= 1 &&
    `<div>
     ${RenderTextOnly(secoundSubText.text)}
     ${RenderSubTextAnswer(answerObject, secoundSubText.answer)}
    </div>`
  }
  ${RenderTextOnly(thirstSubtext.text)}
  ${RenderSubTextAnswer(answerObject, thirstSubtext.answer)}
  ${
    answerObject['sub_terminated_before_completion'] >= 1 &&
    `<div>
     ${RenderTextOnly(fourthSubText.text)}
     ${RenderSubTextAnswer(answerObject, fourthSubText.answer)}
    </div>`
  }
  </div>`
}

const RenderResearchProgressInfoThirdQuestion = (
  questionObject,
  answerObject
) => {
  const { question3 } = questionObject
  const { text, answer, subTexts, documentHeader, documentName } = question3
  const sequence = 3
  const firstSubText = subTexts[0]
  const secoundSubText = subTexts[1]
  const thirdSubText = subTexts[2]
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}

  ${RenderTextOnly(firstSubText.text)}
  ${RenderSubTextAnswer(answerObject, firstSubText.answer)}

  ${
    answerObject['adverse_event_submission'] === 'No' &&
    `<div>
    ${RenderTextOnly(secoundSubText.text)}
    ${RenderSubTextAnswer(answerObject, secoundSubText.answer)}

    ${RenderTextOnly(thirdSubText.text)}
    ${RenderSubTextAnswer(answerObject, thirdSubText.answer)}

    ${RenderDocuments(answerObject, documentHeader, documentName)}
  </div>`
  }

  </div>`
}

const RenderResearchProgressInfoFourthQuestion = (
  questionObject,
  answerObject
) => {
  const { question4 } = questionObject
  const { text, answer } = question4
  const sequence = 4
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  </div>`
}

const RenderResearchProgressInfoFifthQuestion = (
  questionObject,
  answerObject
) => {
  const { question5 } = questionObject
  const { text, answer, explanation, subTexts } = question5
  const firstSubText = subTexts[0]
  const sequence = 5
  return `<div>
  ${RenderQuestion(sequence, text)}
  ${RenderAnswer(answerObject, answer)}
  ${
    answerObject['last_approval_change'] === 'Yes' &&
    `<div>
     ${RenderTextOnly(firstSubText.text)}
     ${RenderSubTextAnswer(answerObject, firstSubText.answer)}
    </div>`
  }
  ${RenderElplanation(answerObject, explanation)}
  </div>`
}

const continuingReviewHTMLTemplate = (templateProps) => {
  const { continuingReviewQuestions } = questionsToRender
  const {
    riskAssessment,
    informedConsentProcess,
    investigatorInstuationInfo,
    researchProgressInfo
    // submissionAdditionalInfo
  } = continuingReviewQuestions
  const {
    risk_assessment,
    informed_consent_process,
    investigator_instuation_info,
    research_progress_info
    // protocol_details
  } = templateProps
  const children = `
      <main>
        <h1>
          ${templateProps.headerText} (${templateProps.protocolId})
        </h1>
        <div style="page-break-after: always;">
          ${renderHeader(riskAssessment)}
          ${RenderRiskAssessmentFirstQuestion(riskAssessment, risk_assessment)}
          ${RenderRiskAssessmentSecondQuestion(riskAssessment, risk_assessment)}
        </div>

        <div style="page-break-after: always;">
          ${renderHeader(informedConsentProcess)}
          ${RenderInformedConsentProcessFirstQuestion(
            informedConsentProcess,
            informed_consent_process
          )}
          ${RenderInformedConsentProcessSecondQuestion(
            informedConsentProcess,
            informed_consent_process
          )}
          ${RenderInformedConsentThirdQuestion(
            informedConsentProcess,
            informed_consent_process
          )}
          ${RenderInformedConsentProcessFourthQuestion(
            informedConsentProcess,
            informed_consent_process
          )}
          ${RenderInformedConsentFifthQuestion(
            informedConsentProcess,
            informed_consent_process
          )}
        </div>

        <div style="page-break-after: always;">
          ${renderHeader(investigatorInstuationInfo)}
          ${RenderInvestigatorInstuationInfoFirstQuestion(
            investigatorInstuationInfo,
            investigator_instuation_info
          )}
          ${RenderInvestigatorInstuationInfoSecondQuestion(
            investigatorInstuationInfo,
            investigator_instuation_info
          )}
          ${RenderInvestigatorInstuationInfoThirdQuestion(
            investigatorInstuationInfo,
            investigator_instuation_info
          )}
          ${RenderInvestigatorInstuationInfoFourthQuestion(
            investigatorInstuationInfo,
            investigator_instuation_info
          )}
          ${RenderInvestigatorInstuationInfoFifthQuestion(
            investigatorInstuationInfo,
            investigator_instuation_info
          )}
        </div>

        <div style="page-break-after: always;">
          ${renderHeader(researchProgressInfo)}
          ${RenderResearchProgressInfoFirstQuestion(
            researchProgressInfo,
            research_progress_info
          )}
          ${RenderResearchProgressInfoSecondQuestion(
            researchProgressInfo,
            research_progress_info
          )}
          ${RenderResearchProgressInfoThirdQuestion(
            researchProgressInfo,
            research_progress_info
          )}
          ${RenderResearchProgressInfoFourthQuestion(
            researchProgressInfo,
            research_progress_info
          )}
          ${RenderResearchProgressInfoFifthQuestion(
            researchProgressInfo,
            research_progress_info
          )}
        </div>
      </main>
   `
  return RenderBody(children)
}

// Protocol Amendment Request

// Clinical Site
const ClinicalSiteHTMLTemplate = (templateProps) => {
  const { protocolDetails } = questionsToRender
  const { clinicalReviewQuestions } = protocolDetails
  const {
    headerText,
    protocolId,
    protocolType,
    protocol_information,
    investigator_information,
    study_information,
    informed_consent,
    protocol_procedure,
    protocol_details
  } = templateProps
  const {
    informedConsentForm,
    investigatorInformation,
    protocolInformation,
    protocolProcedure,
    studyInformation,
    submissinForm,
    submissionAdditionalInfo
  } = clinicalReviewQuestions

  // additional details
  const { created_at, status } = protocol_details

  const statusToRender = getMappedStatus(status)
  const createdDateToRender = getCreatedData(created_at)

  const children = `<main>
        <h2 style="text-align: center;">${headerText}</h2>
        <h3 style="text-align: center;">Protocol Number : ${protocolId}</h3>
      <h4 style="text-align: center;">Status : ${statusToRender} | Created Date : ${createdDateToRender}</h4>
         <div style="page-break-after: always;">
         ${renderHeader(protocolInformation)}
         ${RenderQuestion(1, protocolInformation.question1.text)}
         ${RenderAnswer(
           protocol_information,
           protocolInformation.question1.answer
         )}
          ${protocolInformation.question1.subTexts
            ?.map((subText, index) => {
              return `<div>
              ${subText?.text ? RenderQuestion(index + 2, subText.text) : ''}
              ${
                subText?.answer
                  ? RenderAnswer(protocol_information, subText.answer)
                  : ''
              }
              ${
                subText?.explanation
                  ? RenderElplanation(protocol_information, subText.explanation)
                  : ''
              }
            </div>`
            })
            .join('')}
          ${RenderDocuments(
            protocol_information,
            protocolInformation.question1.documentHeader,
            protocolInformation.question1.documentName
          )}
        </div>

         <div style="page-break-after: always;">
          ${renderHeader(investigatorInformation)}
           ${investigatorInformation.subTexts
             ?.map((subText) => {
               return `<div>
              ${
                subText?.text
                  ? RenderQuestion(subText.sequence, subText.text)
                  : ''
              }
              ${
                subText?.answer
                  ? RenderAnswer(investigator_information, subText.answer)
                  : ''
              }
              ${
                subText?.explanation
                  ? RenderElplanation(
                      investigator_information,
                      subText.explanation
                    )
                  : ''
              }
              ${
                subText?.checkboxes
                  ? RenderCheckboxAnswer(
                      investigator_information,
                      subText.checkboxes
                    )
                  : ''
              }
            </div>`
             })
             .join('')}
            ${investigatorInformation?.documentsUploadedList
              ?.map((docListItem) => {
                return `${RenderDocuments(
                  investigator_information,
                  docListItem.documentHeader,
                  docListItem.documentName
                )}`
              })
              .join('')}
        </div>

        <div style="page-break-after: always;">
          ${renderHeader(studyInformation)}
          ${RenderQuestion(1, studyInformation.question1.text)}
          ${RenderAnswer(study_information, studyInformation.question1.answer)}
          ${RenderElplanation(
            study_information,
            studyInformation.question1.explanation
          )}
          ${RenderDocuments(
            study_information,
            studyInformation.documentsUploadedList[0].documentHeader,
            studyInformation.documentsUploadedList[0].documentName
          )}
        </div>

        <div style="page-break-after: always;">
        ${renderHeader(informedConsentForm)}
        ${RenderCheckboxAnswer(
          informed_consent,
          informedConsentForm.checkboxes
        )}
        ${informedConsentForm.subTexts
          ?.map((subText) => {
            return `<div>
          ${subText?.text ? RenderQuestion(subText.sequence, subText.text) : ''}
          ${
            subText?.answer
              ? RenderAnswer(informed_consent, subText.answer)
              : ''
          }
          ${
            subText?.explanation
              ? RenderElplanation(informed_consent, subText.explanation)
              : ''
          }
        </div>`
          })
          .join('')}
        ${informedConsentForm.documentsUploadedList
          ?.map((docListItem) => {
            return `${RenderDocuments(
              informed_consent,
              docListItem.documentHeader,
              docListItem.documentName
            )}`
          })
          .join('')}
          ${RenderTextOnly(informedConsentForm.declaration.header)}
          ${RenderSingleCheckboxAnswer(
            informed_consent,
            informedConsentForm.declaration.checkBox
          )}
        </div>

        <div style="page-break-after: always;">
        ${renderHeader(protocolProcedure)}
        ${RenderCheckboxAnswer(
          protocol_procedure,
          protocolProcedure.checkboxes
        )}
        ${RenderCheckboxAnswer(
          protocol_procedure,
          protocolProcedure.checkboxes2
        )}
        ${protocolProcedure.subTexts
          ?.map((subText) => {
            return `<div>
          ${subText?.text ? RenderQuestion(subText.sequence, subText.text) : ''}
          ${
            subText?.answer
              ? RenderAnswer(protocol_procedure, subText.answer)
              : ''
          }
          ${
            subText?.explanation
              ? RenderElplanation(protocol_procedure, subText.explanation)
              : ''
          }
            </div>`
          })
          .join('')}
          ${RenderCheckboxAnswer(
            protocol_procedure,
            protocolProcedure.checkboxes3
          )}
          ${RenderQuestion(
            protocolProcedure.question3.sequence,
            protocolProcedure.question3.text
          )}
          ${RenderAnswer(
            protocol_procedure,
            protocolProcedure.question3.answer
          )}
          ${RenderQuestion(
            protocolProcedure.question4.sequence,
            protocolProcedure.question4.text
          )}
          ${RenderAnswer(
            protocol_procedure,
            protocolProcedure.question4.answer
          )}
          ${RenderTextOnly(protocolProcedure.question4.explanation.header)}
          ${RenderElplanation(
            protocol_procedure,
            protocolProcedure.question4.explanation.answer
          )}
          ${RenderDocuments(
            protocol_procedure,
            protocolProcedure.documentHeader,
            protocolProcedure.documentName
          )}
          ${RenderSingleCheckboxAnswer(
            protocol_procedure,
            protocolProcedure.checkBox
          )}
        </div>

        <div style="page-break-after: always;">
         ${renderHeader(submissinForm)}
         ${RenderTextOnly(submissinForm.text)}

         ${RenderSingleCheckboxAnswerPro(protocol_details, submissionAdditionalInfo.checkBox1)}
         ${RenderSingleCheckboxAnswerPro(protocol_details, submissionAdditionalInfo.checkBox2)}

         ${RenderTextOnly(submissionAdditionalInfo.text)}
         ${RenderAnswerPro(protocol_details, submissionAdditionalInfo.answer)}
        </div>
    </main>`
  return RenderBody(children)
}

// Multi-Site Sponsor
const MultiSiteSponsorHTMLTemplate = (templateProps) => {
  const { protocolDetails } = questionsToRender
  const { multiSiteSponsorQuestions } = protocolDetails
  const {
    headerText,
    protocolId,
    protocolType,
    protocol_information,
    contact_information,
    study_information,
    informed_consent,
    protocol_procedure,
    protocol_details
  } = templateProps
  const {
    contactInformation,
    informedConsentForm,
    protocolInformation,
    protocolProcedure,
    studyInformation,
    submissinForm,
    submissionAdditionalInfo
  } = multiSiteSponsorQuestions

  // additional details
  const { created_at, status } = protocol_details

  const statusToRender = getMappedStatus(status)
  const createdDateToRender = getCreatedData(created_at)

  const children = `<main>
      <h2 style="text-align: center;">${headerText}</h2>
      <h3 style="text-align: center;">Protocol Number : ${protocolId}</h3>
      <h4 style="text-align: center;">Status : ${statusToRender} | Created Date : ${createdDateToRender}</h4>
      <div style="page-break-after: always;">
        ${renderHeader(protocolInformation)}
        ${RenderQuestion(1, protocolInformation.question1.text)}
        ${RenderAnswer(
          protocol_information,
          protocolInformation.question1.answer
        )}
        ${protocolInformation.subTexts
          ?.map((subText) => {
            return `<div>
          ${RenderQuestion(subText.sequence, subText.text)}
          ${RenderAnswer(protocol_information, subText.answer)}
          ${
            subText.explanation
              ? RenderElplanation(protocol_information, subText.explanation)
              : ''
          }
        </div>`
          })
          .join('')}
        ${RenderDocuments(
          protocol_information,
          protocolInformation.documentHeader,
          protocolInformation.documentName
        )}
      </div>

       <div style="page-break-after: always;">
        ${renderHeader(contactInformation)}
        ${contactInformation.subQuestions
          ?.map((subTexts) => {
            return `<div> 
          ${subTexts.header ? RenderTextOnly(subTexts.header) : ''}
          ${
            subTexts.text
              ? RenderQuestion(subTexts.sequence, subTexts.text)
              : ''
          }
          ${
            subTexts.answer
              ? RenderAnswer(contact_information, subTexts.answer)
              : ''
          }
        </div>`
          })
          .join('')}
       ${contactInformation.subQuestions2
         ?.map((subText) => {
           return `<div> 
          ${subText.header ? RenderTextOnly(subText.header) : ''}
          ${subText.text ? RenderQuestion(subText.sequence, subText.text) : ''}
          ${
            subText.answer
              ? RenderAnswer(contact_information, subText.answer)
              : ''
          }
        </div>`
         })
         .join('')}
      </div>

       <div style="page-break-after: always;">
        ${renderHeader(studyInformation)}
        ${RenderQuestion(1, studyInformation.question1.text)}
        ${RenderAnswer(study_information, studyInformation.question1.answer)}
        ${RenderElplanation(
          study_information,
          studyInformation.question1.explanation
        )}
        ${RenderDocuments(
          study_information,
          studyInformation.documentsUploadedList[0].documentHeader,
          studyInformation.documentsUploadedList[0].documentName
        )}
      </div>

       <div style="page-break-after: always;">
        ${renderHeader(informedConsentForm)}
        ${RenderCheckboxAnswer(
          informed_consent,
          informedConsentForm.checkboxes
        )}
        ${informedConsentForm.subTexts
          ?.map((subText) => {
            return `<div>
          ${subText.text ? RenderQuestion(subText.sequence, subText.text) : ''}
          ${
            subText.answer ? RenderAnswer(informed_consent, subText.answer) : ''
          }
          ${
            subText.explanation
              ? RenderElplanation(informed_consent, subText.explanation)
              : ''
          }
        </div>`
          })
          .join('')}
        ${RenderDocuments(
          informed_consent,
          informedConsentForm.documentHeader,
          informedConsentForm.documentName
        )}
        ${RenderTextOnly(informedConsentForm.declaration.header)}
        ${RenderSingleCheckboxAnswer(
          informed_consent,
          informedConsentForm.declaration.checkBox
        )}
      </div>

      <div style="page-break-after: always;">
        ${renderHeader(protocolProcedure)}
        ${RenderCheckboxAnswer(
          protocol_procedure,
          protocolProcedure.checkboxes
        )}
        ${RenderCheckboxAnswer(
          protocol_procedure,
          protocolProcedure.checkboxes2
        )}
        ${protocolProcedure.subTexts
          ?.map((subText) => {
            return `<div>
          ${subText.text ? RenderQuestion(subText.sequence, subText.text) : ''}
          ${
            subText.answer
              ? RenderAnswer(protocol_procedure, subText.answer)
              : ''
          }
          ${
            subText.explanation
              ? RenderElplanation(protocol_procedure, subText.explanation)
              : ''
          }
        </div>`
          })
          .join('')}
        ${RenderCheckboxAnswer(
          protocol_procedure,
          protocolProcedure.checkboxes3
        )}
         ${protocolProcedure.subTexts2
           ?.map((subText) => {
             return `<div>
          ${subText.text ? RenderQuestion(subText.sequence, subText.text) : ''}
          ${
            subText.answer
              ? RenderAnswer(protocol_procedure, subText.answer)
              : ''
          }
          ${
            subText.explanation
              ? `${RenderTextOnly(subText.explanation.header)}
              ${RenderElplanation(
                protocol_procedure,
                subText.explanation.answer
              )}`
              : ''
          }
        </div>`
           })
           .join('')}
        ${RenderDocuments(
          protocol_procedure,
          protocolProcedure.documentHeader,
          protocolProcedure.documentName
        )}
        ${RenderSingleCheckboxAnswer(
          protocol_procedure,
          protocolProcedure.checkBox
        )}
        
      </div>

      <div style="page-break-after: always;">
       ${renderHeader(submissinForm)}
       ${RenderTextOnly(submissinForm.text)}
        
        ${RenderSingleCheckboxAnswerPro(protocol_details, submissionAdditionalInfo.checkBox1)}
        ${RenderSingleCheckboxAnswerPro(protocol_details, submissionAdditionalInfo.checkBox2)}

         ${RenderTextOnly(submissionAdditionalInfo.text)}
         ${RenderAnswerPro(protocol_details, submissionAdditionalInfo.answer)}
      </div>
    </main>`
  return RenderBody(children)
}

// Principal Investigator
const PrincipalInvestigatorHTMLTemplate = (templateProps) => {
  const { protocolDetails } = questionsToRender
  const { principalInvestigatorQuestions } = protocolDetails
  const {
    headerText,
    protocolId,
    protocolType,
    investigator_protocol_information,
    consent_information,
    protocol_details
  } = templateProps
  const {
    informedConsentForm,
    investigatorInformation,
    submissinForm,
    submissionAdditionalInfo
  } = principalInvestigatorQuestions

  // additional details
  const { created_at, status, protocol_user_type } = protocol_details

  const statusToRender = getMappedStatus(status)
  const createdDateToRender = getCreatedData(created_at)

  const children = `<main>
      <h2 style="text-align: center;">${headerText} (${protocol_user_type})</h2>
      <h3 style="text-align: center;">Protocol Number : ${protocolId}</h3>
      <h4 style="text-align: center;">Status : ${statusToRender} | Created Date : ${createdDateToRender}</h4>
      <div style="page-break-after: always;">
        ${renderHeader(investigatorInformation)}
        ${investigatorInformation.subQuestions
          ?.map((subQuestion) => {
            return `<div>
          ${RenderQuestion(subQuestion.sequence, subQuestion.text)}
          ${RenderAnswer(investigator_protocol_information, subQuestion.answer)}
            </div>`
          })
          .join('')}
          ${RenderTextOnly(investigatorInformation.question1.text)}
          ${investigatorInformation.question1.subTexts
            ?.map((subText) => {
              return `<div>
            ${RenderQuestion(subText.sequence, subText.text)}
            ${RenderAnswer(investigator_protocol_information, subText.answer)}
            </div>`
            })
            .join('')}
         
          ${RenderQuestion(
            investigatorInformation.question2.sequence,
            investigatorInformation.question2.text
          )}
          ${RenderAnswer(
            investigator_protocol_information,
            investigatorInformation.question2.answer
          )}
          ${RenderQuestion(
            investigatorInformation.question3.sequence,
            investigatorInformation.question3.text
          )}
          ${RenderAnswer(
            investigator_protocol_information,
            investigatorInformation.question3.answer
          )}
          ${RenderElplanation(
            investigator_protocol_information,
            investigatorInformation.question3.explanation
          )}

          ${investigatorInformation.documentsUploadedList
            ?.map((docListItem) => {
              return `${RenderDocuments(
                investigator_protocol_information,
                docListItem.documentHeader,
                docListItem.documentName
              )}`
            })
            .join('')}
        </div>

        <div style="page-break-after: always;">
        ${renderHeader(informedConsentForm)}
        ${RenderQuestion(1, informedConsentForm.question1.text)}
        ${informedConsentForm.question1.subTexts
          ?.map((subText) => {
            return `<div>
          ${RenderQuestion(subText.sequence, subText.text)}
          ${RenderAnswer(consent_information, subText.answer)}
          </div>`
          })
          .join('')}
          ${RenderTextOnly(informedConsentForm.declaration.header)}
          ${RenderSingleCheckboxAnswer(
            consent_information,
            informedConsentForm.checkBox
          )}
        </div>

        <div style="page-break-after: always;">
        ${renderHeader(submissinForm)}
        ${RenderTextOnly(submissinForm.text)}
        
        ${RenderSingleCheckboxAnswerPro(protocol_details, submissionAdditionalInfo.checkBox1)}
        ${RenderSingleCheckboxAnswerPro(protocol_details, submissionAdditionalInfo.checkBox2)}

         ${RenderTextOnly(submissionAdditionalInfo.text)}
         ${RenderAnswerPro(protocol_details, submissionAdditionalInfo.answer)}
       </div>
          
    </main>`
  return RenderBody(children)
}

// Document Review
const DocumentReviewHTMLTemplate = (templateProps) => {
  const { protocolDetails } = questionsToRender
  const { documentReviewQuestions } = protocolDetails
  const {
    headerText,
    protocolId,
    protocolType,
    protocol_information,
    investigator_information,
    informed_consent,
    protocol_details
  } = templateProps
  const {
    informedConsentForm,
    investigatorInformation,
    protocolInformation,
    submissinForm,
    submissionAdditionalInfo
  } = documentReviewQuestions

  // additional details
  const { created_at, status } = protocol_details

  const statusToRender = getMappedStatus(status)
  const createdDateToRender = getCreatedData(created_at)

  const children = `<main>
        <h2 style="text-align: center;">${headerText}</h2>
        <h3 style="text-align: center;">Protocol Number : ${protocolId}</h3>
      <h4 style="text-align: center;">Status : ${statusToRender} | Created Date : ${createdDateToRender}</h4>
         <div style="page-break-after: always;">
         ${renderHeader(protocolInformation)}
         ${RenderQuestion(1, protocolInformation.question1.text)}
         ${RenderAnswer(
           protocol_information,
           protocolInformation.question1.answer
         )}
          ${protocolInformation.question1.subTexts
            ?.map((subText, index) => {
              return `<div>
              ${subText?.text ? RenderQuestion(index + 2, subText.text) : ''}
              ${
                subText?.answer
                  ? RenderAnswer(protocol_information, subText.answer)
                  : ''
              }
              ${
                subText?.explanation
                  ? RenderElplanation(protocol_information, subText.explanation)
                  : ''
              }
            </div>`
            })
            .join('')}
          ${RenderDocuments(
            protocol_information,
            protocolInformation.question1.documentHeader,
            protocolInformation.question1.documentName
          )}
        </div>

          <div style="page-break-after: always;">
            ${renderHeader(investigatorInformation)}
            ${investigatorInformation.subTexts
              ?.map((subText) => {
                return `<div>
              ${
                subText?.text
                  ? RenderQuestion(subText.sequence, subText.text)
                  : ''
              }
              ${
                subText?.answer
                  ? RenderAnswer(investigator_information, subText.answer)
                  : ''
              }
              ${
                subText?.explanation
                  ? RenderElplanation(
                      investigator_information,
                      subText.explanation
                    )
                  : ''
              }
              ${
                subText?.checkboxes
                  ? RenderCheckboxAnswer(
                      investigator_information,
                      subText.checkboxes
                    )
                  : ''
              }
            </div>`
              })
              .join('')}
            ${investigatorInformation?.documentsUploadedList
              ?.map((docListItem) => {
                return `${RenderDocuments(
                  investigator_information,
                  docListItem.documentHeader,
                  docListItem.documentName
                )}`
              })
              .join('')}
          </div>
        <div style="page-break-after: always;">
        ${renderHeader(informedConsentForm)}
        ${RenderCheckboxAnswer(
          informed_consent,
          informedConsentForm.checkboxes
        )}
        ${informedConsentForm.subTexts
          ?.map((subText) => {
            return `<div>
          ${subText?.text ? RenderQuestion(subText.sequence, subText.text) : ''}
          ${
            subText?.answer
              ? RenderAnswer(informed_consent, subText.answer)
              : ''
          }
          ${
            subText?.explanation
              ? RenderElplanation(informed_consent, subText.explanation)
              : ''
          }
        </div>`
          })
          .join('')}
        ${informedConsentForm.documentsUploadedList
          ?.map((docListItem) => {
            return `${RenderDocuments(
              informed_consent,
              docListItem.documentHeader,
              docListItem.documentName
            )}`
          })
          .join('')}
          ${RenderTextOnly(informedConsentForm.declaration.header)}
          ${RenderSingleCheckboxAnswer(
            informed_consent,
            informedConsentForm.declaration.checkBox
          )}
        </div>
        <div style="page-break-after: always;">
        ${renderHeader(submissinForm)}
        ${RenderTextOnly(submissinForm.text)}

         ${RenderTextOnly(submissionAdditionalInfo.checkBox1.label)}
         ${RenderSingleCheckboxAnswerPro(protocol_details, submissionAdditionalInfo.checkBox1)}

        ${RenderSingleCheckboxAnswerPro(protocol_details, submissionAdditionalInfo.checkBox1)}
        ${RenderSingleCheckboxAnswerPro(protocol_details, submissionAdditionalInfo.checkBox2)}

         ${RenderTextOnly(submissionAdditionalInfo.text)}
         ${RenderAnswerPro(protocol_details, submissionAdditionalInfo.answer)}
         </div>
    </main>`
  return RenderBody(children)
}

const protocolAmendmentRequestHTMLTemplate = {
  ClinicalSiteHTMLTemplate,
  MultiSiteSponsorHTMLTemplate,
  PrincipalInvestigatorHTMLTemplate,
  DocumentReviewHTMLTemplate
}

const htmlTemplates = {
  continuingReviewHTMLTemplate,
  protocolAmendmentRequestHTMLTemplate
}

export default htmlTemplates
