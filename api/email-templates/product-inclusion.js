// Product inclusion checkers

export function hasSDMAC(subscriptionList, productCode) {
  return productCode === 'SDMAC';
}

export function hasSDMACExpertAdvice(subscriptionList, productCode) {
  return productCode === 'SDMAC_EXPERT_ADVICE';
}

export function hasSDMACLicca(subscriptionList, productCode) {
  return productCode === 'SDMAC_LICCA';
}

export function hasRM360Pack(subscriptionList, productCode) {
  return productCode === 'RM360_PACK';
}

export function hasRM360Pack6SupervisedTraining(subscriptionList, productCode) {
  return productCode === 'RM360_PACK_6_SUPERVISED_TRAINING';
}
