const Proposal = require("../models/Proposal");
const {
  createProposalSchema,
} = require("../Validators/proposalValidator");

const createProposal = async (req, res) => {
  try {
    const result = createProposalSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid proposal data",
        errors: result.error.issues,
      });
    }

    const {
      title,
      description,
      purpose,
      location,
      startDate,
      endDate,
    } = result.data;

    const proposal = await Proposal.create({
      userId: req.user._id,

      title,
      description,
      purpose,
      location,
      startDate,
      endDate,

      status: "PENDING",
    });

    return res.status(201).json({
      message: "Proposal submitted successfully",

      proposal: {
        id: proposal._id,
        title: proposal.title,
        status: proposal.status,
        createdAt: proposal.createdAt,
      },
    });
  } catch (error) {
    console.error("Create proposal error:", error);

    return res.status(500).json({
      message: "Server error while creating proposal",
    });
  }
};

const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      proposals,
    });
  } catch (error) {
    console.error("Get proposals error:", error);

    return res.status(500).json({
      message: "Server error while fetching proposals",
    });
  }
};

module.exports = {
  createProposal,
  getMyProposals,
};