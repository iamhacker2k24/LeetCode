const testCase = require("../model/testCase");
const RunCompiler = require("../runCode/onlinecompiler");


const runQues = async (req, res) => {   //this is  with default test case                             
    try {
        const { id } = req.params;
        const { code, language, timeTaken } = req.body
        // console.log(req.body, id)
        if (!code || !language || !timeTaken) {
            return res.status(400).json({
                sucess: false,
                msg: "pls fill all value "
            })
        }
        // console.log(req.body)
        const testCaseData = await testCase.find({ questionId: id }).select("input expectedOutput -_id")

        const data = await RunCompiler(code, testCaseData, language);

        // console.log(data)

        //here need to implement user meed to store user dataproperly ok 

        return res.status(200).json({
            sucess: true,
            data: {
                verdict: data.verdict,
                score: data.score,
                passed: data.passed,
                total: data.total,
                memory_limit: data.memory_limit,
                summary: data.summary,
                tests: data.tests
            }
        })

    } catch (error) {
        console.log("error from questionSubmition")
        console.log(error.message)
        return res.status(400).json({
            sucess: true,
            msg: "error from Question submition "
        })

    }
}

const runQuesWithTestCase = (req, res) => { // this works with coustom tets case 
    try {

    } catch (error) {
        console.log("error from questionSubmition")
        console.log(error.message)
        return resizeBy.status(400).josn({
            sucess: true,
            msg: "error from Question submition "
        })

    }
}
const subMitques = (req, res) => {  //this will submit question with checking test case again ok 
    try {

    } catch (error) {
        console.log("error from questionSubmition")
        console.log(error.message)
        return resizeBy.status(400).josn({
            sucess: true,
            msg: "error from Question submition "
        })

    }
}

const likeQues = (req, res) => { // by usong this user can like or dis like question 
    try {

    } catch (error) {
        console.log("error from questionSubmition")
        console.log(error.message)
        return resizeBy.status(400).josn({
            sucess: true,
            msg: "error from Question submition "
        })

    }
}


const isStar = (req, res) => { //by usong this user can star question 
    try {

    } catch (error) {
        console.log("error from questionSubmition")
        console.log(error.message)
        return resizeBy.status(400).josn({
            sucess: true,
            msg: "error from Question submition "
        })
    }
}

const Markquestion = (req, res) => {   //this will help to mark question 
    try {

    } catch (error) {
        console.log("error from questionSubmition")
        console.log(error.message)
        return resizeBy.status(400).josn({
            sucess: true,
            msg: "error from Question submition "
        })
    }
}

module.exports = { runQues, runQuesWithTestCase, subMitques, likeQues, isStar, Markquestion }                                                              