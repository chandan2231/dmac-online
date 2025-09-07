import express from 'express'
import {
  getAllUsersByRole,
  changeUserStatus,
  createUsersByRole,
  getProductList,
  updateProductDetails,
  changeProductStatus,

  getApprovedProtocolList,
  getContinuinDetailsById,
  getProtocolDetailsById,
  getStudyCloseoutRequestList,
  getPromptlyReportableEventList,
  getAdverseEventList,
  getProtocolAmendmentRequestList,
  getStudyCloseoutDetailsById,
  getPromptlyReportableEventById,
  getAdverseEventById,
  getProtocolAmendmentRequestById,
  allowProtocolEdit,
  getMemberList,
  changeMemberStatus,
  changeMemberPassword,
  changeUserPassword,
  getUnderReviewProtocolList,
  getRejectedProtocolList,
  getCreatedProtocolList,
  allowProtocolWaiveFee,
  getEventPriceList,
  createEventPrice,
  changeEventPrice,
  changeEventPriceStatus,
  getActiveVotingMemberList,
  createMemberEvent,
  memberEventList,
  assignProtocolToMembers,
  assignedMembersList,
  assignedMembersProtocolList,
  votingMemberApprovalProtocol,
  approvedProtocolsByMembersList,
  chairCommitteeApprovalProtocol,
  getContinueinProtocolList,
  getAllProtocolList,
  getMasterDataListByType,
  getUnderReviewProtocolAllList,
  getMemberListForSuperAdmin,
  allowVoteForMember,
  getVotingDetailsByProtocolNumber
} from '../controllers/admin.js'
import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.post('/users/list', getAllUsersByRole)
router.post('/user/status/change', changeUserStatus)
router.post('/user/create', createUsersByRole)
router.post('/user/update', updateUsersDetails)
router.get('/products/list', getProductList)
router.post('/products/update', updateProductDetails)
router.post('/products/status/change', changeProductStatus)

router.post(
  '/member/chairCommitteeApprovalProtocol',
  authenticateUser,
  chairCommitteeApprovalProtocol
)
router.post(
  '/member/approvedProtocolsByMembersList',
  authenticateUser,
  approvedProtocolsByMembersList
)
router.post(
  '/member/votingMemberApprovalProtocol',
  authenticateUser,
  votingMemberApprovalProtocol
)
router.get(
  '/continuein/protocol/list',
  authenticateUser,
  getContinueinProtocolList
)
router.post(
  '/member/assignedMembersProtocolList',
  authenticateUser,
  assignedMembersProtocolList
)
router.post('/member/assignedMembers', authenticateUser, assignedMembersList)
router.post(
  '/member/assignProtocolToMembers',
  authenticateUser,
  assignProtocolToMembers
)
router.get('/member/eventList', authenticateUser, memberEventList)
router.post('/member/createEvent', authenticateUser, createMemberEvent)
router.get(
  '/active/votingmember/list',
  authenticateUser,
  getActiveVotingMemberList
)
router.post(
  '/eventprice/status/change',
  authenticateUser,
  changeEventPriceStatus
)
router.post('/eventprice/update', authenticateUser, changeEventPrice)
router.post('/eventprice/create', authenticateUser, createEventPrice)
router.get('/eventprice/list', authenticateUser, getEventPriceList)
router.post('/user/reset/password', authenticateUser, changeUserPassword)
router.post('/member/reset/password', authenticateUser, changeMemberPassword)

router.post('/member/status/change', authenticateUser, changeMemberStatus)

router.get('/member/list', authenticateUser, getMemberList)
router.get('/super/member/list', authenticateUser, getMemberListForSuperAdmin)
router.post('/member/allowVoteForMember', authenticateUser, allowVoteForMember)
router.get('/all-protocol/list', authenticateUser, getAllProtocolList)
router.post(
  '/approved-protocol/list',
  authenticateUser,
  getApprovedProtocolList
)
router.post(
  '/under-review/protocol/list',
  authenticateUser,
  getUnderReviewProtocolList
)
router.post(
  '/rejected/protocol/list',
  authenticateUser,
  getRejectedProtocolList
)
router.post('/created/protocol/list', authenticateUser, getCreatedProtocolList)
router.post('/protocol/allowEdit', authenticateUser, allowProtocolEdit)
router.post('/protocol/waiveFee', authenticateUser, allowProtocolWaiveFee)

router.post('/continuinDetailsById', authenticateUser, getContinuinDetailsById)
router.post('/protocolDetailsById', authenticateUser, getProtocolDetailsById)
router.post(
  '/eventAndRequest/getStudyCloseoutRequest',
  authenticateUser,
  getStudyCloseoutRequestList
)
router.post(
  '/studyCloseoutDetailsById',
  authenticateUser,
  getStudyCloseoutDetailsById
)
router.post(
  '/eventAndRequest/getPromptlyReportableEvent',
  authenticateUser,
  getPromptlyReportableEventList
)
router.post(
  '/promptlyReportableEventById',
  authenticateUser,
  getPromptlyReportableEventById
)
router.post(
  '/eventAndRequest/getAdverseEvent',
  authenticateUser,
  getAdverseEventList
)
router.post('/adverseEventById', authenticateUser, getAdverseEventById)
router.post(
  '/eventAndRequest/getProtocolAmendmentRequest',
  authenticateUser,
  getProtocolAmendmentRequestList
)
router.post(
  '/protocolAmendmentRequestById',
  authenticateUser,
  getProtocolAmendmentRequestById
)
router.post('/master/list', authenticateUser, getMasterDataListByType)
router.get(
  '/under-review/protocol/all/list',
  authenticateUser,
  getUnderReviewProtocolAllList
)
router.post(
  '/protocol/voting/details',
  authenticateUser,
  getVotingDetailsByProtocolNumber
)

export default router
