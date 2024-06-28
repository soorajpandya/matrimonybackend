const CandidatesPreferenceRouter = require("express").Router()
const candidatesController = require("../Candidatespreference/CandidatesPreferenceController")

CandidatesPreferenceRouter.post("/add", candidatesController.addCandidatePreference)
CandidatesPreferenceRouter.post("/match", candidatesController.filterCandidatesByPreference)
CandidatesPreferenceRouter.put("/update-adminapproved", candidatesController.UpdateAdminApproval)
CandidatesPreferenceRouter.put("/update-adminrejected", candidatesController.UpdateAdminRejection)
CandidatesPreferenceRouter.put("/update-paymentapproval" , candidatesController.UpdatePaymentApprovalStatus)
CandidatesPreferenceRouter.put("/update-paymentrejected" , candidatesController.UpdatePaymentRejectionStatus)
CandidatesPreferenceRouter.post("/update-candidateprofile", candidatesController.UpdateCandidateProfile)
CandidatesPreferenceRouter.get("/getpreferencebyid" , candidatesController.GetCandidatePreferenceById)
CandidatesPreferenceRouter.get("/pendingcandidate", candidatesController.GetCandidatePreference)
CandidatesPreferenceRouter.get("/Approvedcandidate", candidatesController.GetApprovedCandidatePreference)
CandidatesPreferenceRouter.get("/male-preference" , candidatesController.GetMaleCandidatePreference)
CandidatesPreferenceRouter.get("/female-preference", candidatesController.GetFemaleCandidatePreference)

module.exports = CandidatesPreferenceRouter