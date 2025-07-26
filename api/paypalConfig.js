// const paypal = require('@paypal/checkout-server-sdk')
import paypal from '@paypal/checkout-server-sdk'

const environment = () => {
  const clientId =
    'AUJ2ExPRI7HOoaNHIxWP-3wngxA-Bk_Bxew7RpIUxlLBkJDEyCiSBruQntP3BCYxP3rxMxlm6UZg0zMs'
  const clientSecret =
    'EAcOk_vWjo09ZHefdq1xnfbNcdG--0jh60s9qlPNPL40O9RAk9ZYbkl-kXzDGM_5q2tQwhG1w1L8Bzt8'

  return new paypal.core.SandboxEnvironment(clientId, clientSecret) // Use ProductionEnvironment for live mode
}

export const client = () => {
  return new paypal.core.PayPalHttpClient(environment())
}
