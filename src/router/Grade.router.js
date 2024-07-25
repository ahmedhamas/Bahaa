const express = require("express");
const router = express.Router();
const { ValidateTeacher } = require("../middleware/vaildateUser");
const { GetAll, Delete, Add } = require("../controller/Grade.controller");

router.get("/", ValidateTeacher, GetAll);
router.delete("/:id", ValidateTeacher, Delete);
router.post("/add", ValidateTeacher, Add);

module.exports = router;
