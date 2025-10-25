const express = require("express");
const router = express.Router();
const draftController = require("../controllers/draftOrderController");
const upload = require("../utils/fileUpload");

// Draft routes
router.post("/save-draft", upload.fields([
  { name: "drawing", maxCount: 1 },
  { name: "poCopy", maxCount: 1 }
]), draftController.saveDraft);

router.get("/user-drafts", draftController.getUserDrafts);
router.get("/:draftId", draftController.getDraft);
router.delete("/:draftId", draftController.deleteDraft);

router.post("/:draftId/convert-to-order", upload.fields([
  { name: "drawing", maxCount: 1 },
  { name: "poCopy", maxCount: 1 }
]), draftController.convertDraftToOrder);

// File download route
router.get("/files/:draftId/:filename", draftController.downloadDraftFile);

module.exports = router;