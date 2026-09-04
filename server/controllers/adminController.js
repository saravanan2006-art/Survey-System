const Proposal  = require("../models/Proposal");
const User       = require("../models/User");
const Notification = require("../models/Notification");
const Report     = require("../models/Report");
const generateSurveyerId = require("../utils/generateSurveyerId");
const Survey = require("../models/Survey");
const Response = require("../models/Response");

// ── Get all proposals ──────────────────────────────────────────────
const getProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ proposals });
  } catch (error) {
    console.error("Get admin proposals error:", error);
    return res.status(500).json({ message: "Server error while fetching proposals" });
  }
};

// ── Get all users ──────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role surveyerId surveyerStatus authProvider createdAt")
      .sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ message: "Server error while fetching users" });
  }
};

// ── Get all submitted reports ──────────────────────────────────────
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate({ path: "surveyId", select: "title surveyId location startTime endTime status" })
      .populate({ path: "surveyerUserId", select: "name email surveyerId" })
      .sort({ createdAt: -1 });
    return res.status(200).json({ reports });
  } catch (error) {
    console.error("Get all reports error:", error);
    return res.status(500).json({ message: "Server error while fetching reports" });
  }
};

// ── Approve proposal ───────────────────────────────────────────────
const approveProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });
    if (proposal.status !== "PENDING")
      return res.status(400).json({ message: `Proposal is already ${proposal.status.toLowerCase()}` });

    const user = await User.findById(proposal.userId);
    if (!user) return res.status(404).json({ message: "Proposal owner not found" });
    if (user.role !== "USER")
      return res.status(400).json({ message: "This user is not eligible for Surveyer authorization" });

    const surveyerId = await generateSurveyerId(proposal.location.city);
    proposal.status     = "APPROVED";
    proposal.reviewedBy = req.user._id;
    proposal.reviewedAt = new Date();
    await proposal.save();

    user.role           = "SURVEYER";
    user.surveyerId     = surveyerId;
    user.surveyerStatus = "ACTIVE";
    user.proposalId     = proposal._id;
    user.surveyId       = null;
    await user.save();

    await Notification.create({
      userId:  user._id,
      title:   "Proposal Approved",
      message: `Your proposal has been approved. Your Surveyer ID is ${surveyerId}.`,
      type:    "PROPOSAL_APPROVED",
      isRead:  false,
    });

    return res.status(200).json({ message: "Proposal approved successfully", surveyerId, proposalId: proposal._id });
  } catch (error) {
    console.error("Approve proposal error:", error);
    return res.status(500).json({ message: "Server error while approving proposal" });
  }
};

// ── Reject proposal ────────────────────────────────────────────────
const rejectProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || reason.trim().length < 5)
      return res.status(400).json({ message: "A valid rejection reason is required" });

    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });
    if (proposal.status !== "PENDING")
      return res.status(400).json({ message: `Proposal is already ${proposal.status.toLowerCase()}` });

    proposal.status          = "REJECTED";
    proposal.rejectionReason = reason.trim();
    proposal.reviewedBy      = req.user._id;
    proposal.reviewedAt      = new Date();
    await proposal.save();

    await Notification.create({
      userId:  proposal.userId,
      title:   "Proposal Rejected",
      message: `Your proposal was rejected. Reason: ${reason.trim()}`,
      type:    "PROPOSAL_REJECTED",
      isRead:  false,
    });

    return res.status(200).json({ message: "Proposal rejected successfully" });
  } catch (error) {
    console.error("Reject proposal error:", error);
    return res.status(500).json({ message: "Server error while rejecting proposal" });
  }
};

const getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find()
      .populate("surveyerUserId", "name email")
      .populate("proposalId", "title status")
      .sort({ createdAt: -1 })
      .lean();

    const surveysWithStats = await Promise.all(
      surveys.map(async (survey) => {
        const responseCount = await Response.countDocuments({
          surveyId: survey._id,
        });

        const report = await Report.findOne({
          surveyId: survey._id,
        })
          .select("reportId status submittedAt")
          .lean();

        return {
          ...survey,

          responseCount,

          report: report || null,
        };
      })
    );

    return res.status(200).json({
      surveys: surveysWithStats,
    });
  } catch (error) {
    console.error("Get all surveys error:", error);

    return res.status(500).json({
      message: "Server error while fetching all surveys",
    });
  }
};

const getAdminSurveyById = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findById(id)
      .populate(
        "surveyerUserId",
        "name email role surveyerId surveyerStatus"
      )
      .populate(
        "proposalId",
        "title description purpose location startDate endDate status"
      )
      .lean();

    if (!survey) {
      return res.status(404).json({
        message: "Survey not found",
      });
    }

    const responseCount = await Response.countDocuments({
      surveyId: survey._id,
    });

    const report = await Report.findOne({
      surveyId: survey._id,
    })
      .select(
        "reportId status totalResponses submittedAt pdfUrl"
      )
      .lean();

    return res.status(200).json({
      survey: {
        ...survey,
        responseCount,
        report: report || null,
      },
    });
  } catch (error) {
    console.error("Get admin survey error:", error);

    return res.status(500).json({
      message: "Server error while fetching survey",
    });
  }
};

module.exports = {
  getProposals,
  approveProposal,
  rejectProposal,
  getAllReports,
  getAllUsers,
  getAllSurveys,
  getAdminSurveyById,
};