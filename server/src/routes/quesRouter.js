const express = require("express");
const { createQues, editQues, deleteQues, getAllques, getOneques, getOnequesBySlug,
    CreateTestCse, editTestCase, deleteTestCase, getTestCaseByid, createCodeTemplate,
    editCodeTemplate, deleteCodeTemplate, getCodeTemplateByid } = require("../controlers/QuesControllers");
const quesRouter = express.Router();

quesRouter.post("/createques", createQues) //admin only 
quesRouter.post("/editques/:id", editQues) //admin only 
quesRouter.delete("/deleteques", deleteQues)  //admin only 





quesRouter.get("/getallques", getAllques) //only get all quesions
quesRouter.get("/getOneques/:id", getOneques) //only specific question details ok
quesRouter.get("/getquesbyslung/:slug", getOnequesBySlug) //only specific question details ok




//create test case  
quesRouter.post("/createtestCse", CreateTestCse);
quesRouter.post("/edittestcase", editTestCase); //later impl
quesRouter.get("/deletetestcase", deleteTestCase); //later impl
quesRouter.post("/gettestcasebyid", getTestCaseByid); //get testCase by question id 



//create code temple
quesRouter.post("/createcodetemplate/:id", createCodeTemplate); 
quesRouter.post("/editcodetemplate/:id", editCodeTemplate);//later impl
quesRouter.post("/deletecodetemplate/:id", deleteCodeTemplate);//later impl
quesRouter.post("/getcodetemplatebyid", getCodeTemplateByid);//later impl





module.exports = { quesRouter }