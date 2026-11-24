const express = require("express");
const quesRouter = express.Router();
const { createQues, editQues, deleteQues, getAllques, getOneques, getOnequesBySlug,
    CreateTestCse, editTestCase, deleteTestCase, getTestCaseByid, createCodeTemplate,
    editCodeTemplate, deleteCodeTemplate, getCodeTemplateByid } = require("../controlers/QuesControllers");
const { userMiddleWare } = require("../middleWare/userMiddleWare");
const { adminMiddleWare } = require("../middleWare/adminMiddleWare");


quesRouter.post("/createques", adminMiddleWare, createQues) //admin only 
quesRouter.post("/editques/:id", adminMiddleWare, editQues) //admin only 
quesRouter.delete("/deleteques", adminMiddleWare ,deleteQues)  //admin only 





quesRouter.get("/getallques", userMiddleWare, getAllques) //only get all quesions
quesRouter.get("/getOneques/:id", getOneques) //only specific question details ok
quesRouter.get("/getquesbyslung/:slug", getOnequesBySlug) //only specific question details ok




//create test case  
quesRouter.post("/createtestCse", adminMiddleWare, CreateTestCse);
quesRouter.post("/createtestcase", adminMiddleWare, CreateTestCse);
quesRouter.put("/edittestcase/:id", adminMiddleWare, editTestCase);
quesRouter.post("/edittestcase", adminMiddleWare, editTestCase);
quesRouter.delete("/deletetestcase/:id", adminMiddleWare, deleteTestCase);
quesRouter.delete("/deletetestcase", adminMiddleWare, deleteTestCase);
quesRouter.get("/gettestcasebyid/:id", adminMiddleWare, getTestCaseByid); //get testCase by question id 



//create code template
quesRouter.post("/createcodetemplate/:id", adminMiddleWare, createCodeTemplate);
quesRouter.post("/createcodetemplate", adminMiddleWare, createCodeTemplate);
quesRouter.put("/editcodetemplate/:id", adminMiddleWare, editCodeTemplate);
quesRouter.delete("/deletecodetemplate/:id", adminMiddleWare, deleteCodeTemplate);
quesRouter.get("/getcodetemplatebyid/:id", adminMiddleWare, getCodeTemplateByid);





module.exports = { quesRouter }