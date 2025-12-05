import htmlTemplates from './html-templates.js'

const ContinuingReviewPdfTemplate = (
  continuinReviewDetailObj,
  protocolIdObj
) => {
  const { protocolId, researchType } = protocolIdObj
  const templatePayload = {
    headerText: 'Continuin Review Details',
    protocolId,
    researchType,
    risk_assessment: continuinReviewDetailObj.risk_assessment,
    informed_consent_process: continuinReviewDetailObj.informed_consent_process,
    investigator_instuation_info:
      continuinReviewDetailObj.investigator_instuation_info,
    research_progress_info: continuinReviewDetailObj.research_progress_info
    // protocol_details: continuinReviewDetailObj.protocol_details
  }
  const template = {
    content: `${htmlTemplates.continuingReviewHTMLTemplate(templatePayload)}`
  }
  return template
}

const ClinicalSitePdfTemplate = (clinicalSiteDetailObj, protocolIdObj) => {
  const { protocolId, protocolType } = protocolIdObj
  const {
    protocol_information,
    investigator_information,
    study_information,
    informed_consent,
    protocol_procedure,
    protocol_details
  } = clinicalSiteDetailObj
  const templatePayload = {
    headerText: 'Clinical Site Details',
    protocolId,
    protocolType,
    protocol_information,
    investigator_information,
    study_information,
    informed_consent,
    protocol_procedure,
    protocol_details
  }
  const template = {
    content: `${htmlTemplates.protocolAmendmentRequestHTMLTemplate.ClinicalSiteHTMLTemplate(
      templatePayload
    )}`
  }
  return template
}

const MultiSiteSponsorPdfTemplate = (
  multiSiteSponsorDetailObj,
  protocolIdObj
) => {
  const { protocolId, protocolType } = protocolIdObj
  const {
    protocol_information,
    contact_information,
    study_information,
    informed_consent,
    protocol_procedure,
    protocol_details
  } = multiSiteSponsorDetailObj
  const templatePayload = {
    headerText: 'Multi-Site Sponsor Details',
    protocolId,
    protocolType,
    protocol_information,
    contact_information,
    study_information,
    informed_consent,
    protocol_procedure,
    protocol_details
  }
  const template = {
    content: `${htmlTemplates.protocolAmendmentRequestHTMLTemplate.MultiSiteSponsorHTMLTemplate(
      templatePayload
    )}`
  }
  return template
}

const PrincipalInvestigatorPdfTemplate = (
  principalInvestigatorDetailObj,
  protocolIdObj
) => {
  const { protocolId, protocolType } = protocolIdObj
  const {
    investigator_protocol_information,
    consent_information,
    protocol_details
  } = principalInvestigatorDetailObj
  const templatePayload = {
    headerText: 'Principal Investigator Details',
    protocolId,
    protocolType,
    investigator_protocol_information,
    consent_information,
    protocol_details
  }
  const template = {
    content: `${htmlTemplates.protocolAmendmentRequestHTMLTemplate.PrincipalInvestigatorHTMLTemplate(
      templatePayload
    )}`
  }
  return template
}

const DocumentReviewPdfTemplate = (clinicalSiteDetailObj, protocolIdObj) => {
  const { protocolId, protocolType } = protocolIdObj
  const {
    protocol_information,
    investigator_information,
    informed_consent,
    protocol_details
  } = clinicalSiteDetailObj
  const templatePayload = {
    headerText: 'Document Review Details',
    protocolId,
    protocolType,
    protocol_information,
    investigator_information,
    informed_consent,
    protocol_details
  }
  const template = {
    content: `${htmlTemplates.protocolAmendmentRequestHTMLTemplate.DocumentReviewHTMLTemplate(
      templatePayload
    )}`
  }
  return template
}

const protocolAmendmentRequestPdfTemplate = {
  ClinicalSitePdfTemplate,
  MultiSiteSponsorPdfTemplate,
  PrincipalInvestigatorPdfTemplate,
  DocumentReviewPdfTemplate
}

const PdfTemplates = {
  ContinuingReviewPdfTemplate,
  protocolAmendmentRequestPdfTemplate
}

export default PdfTemplates
