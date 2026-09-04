const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const authorize    = require("../middleware/roleMiddleware");
const {
  getProposals,
  getAllUsers,
  getAllReports,
  approveProposal,
  getAllSurveys,
  getAdminSurveyById,
  rejectProposal,
} = require("../controllers/adminController");

const router = express.Router();

// Proposals
router.get("/proposals",              authenticate, authorize("ADMIN"), getProposals);
router.patch("/proposals/:id/approve",authenticate, authorize("ADMIN"), approveProposal);
router.patch("/proposals/:id/reject", authenticate, authorize("ADMIN"), rejectProposal);

// Manage Accounts
router.get("/users",                  authenticate, authorize("ADMIN"), getAllUsers);

// Report History
router.get("/reports",                authenticate, authorize("ADMIN"), getAllReports);

router.get(
  "/surveys",
  authenticate,
  authorize("ADMIN"),
  getAllSurveys
);

router.get(
  "/surveys/:id",
  authenticate,
  authorize("ADMIN"),
  getAdminSurveyById
);

module.exports = router;