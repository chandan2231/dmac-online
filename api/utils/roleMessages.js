// utils/roleMessages.js
export const getRoleMessage = (
  role,
  action = 'created',
  success = true,
  emailSent = true
) => {
  let roleText = ''
  switch (role) {
    case 'USER':
      roleText = 'User'
      break
    case 'EXPERT':
      roleText = 'Expert'
      break
    case 'THERAPIST':
      roleText = 'Therapist'
      break
    case 'ADMIN':
      roleText = 'Admin'
      break
    case 'COUNTRY_ADMIN':
      roleText = 'Country Admin'
      break
    default:
      roleText = 'User'
  }

  if (success) {
    if (emailSent) {
      return `${roleText} has been ${action} successfully and email sent.`
    } else {
      return `${roleText} has been ${action} successfully but email failed to send.`
    }
  } else {
    return `${roleText} ${action} failed.`
  }
}
