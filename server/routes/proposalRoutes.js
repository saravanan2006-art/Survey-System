const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createProposal,
  getMyProposals,
} = require("../controllers/proposalController");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("USER"),
  createProposal
);

router.get(
  "/my",
  authenticate,
  authorize("USER"),
  getMyProposals
);

module.exports = router;