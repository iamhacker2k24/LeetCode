const express = require("express");
const { runQues, runQuesWithTestCase, subMitques, likeQues, isStar,Markquestion } = require("../controlers/queSubmition");
const submittionRouter = express.Router();

submittionRouter.post("/runques/:id", runQues)
submittionRouter.post("/runquesWithtestCase/:id", runQuesWithTestCase)
submittionRouter.post("/submitques/:id", subMitques)
submittionRouter.post("/likeques/:id", likeQues)
submittionRouter.post("/isstar/:id", isStar)
submittionRouter.post("/markquestion/:id",Markquestion)



module.exports = { submittionRouter }
