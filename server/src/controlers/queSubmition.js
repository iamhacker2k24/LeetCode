const Question = require("../model/createQues");
const { solvedmap } = require("../model/solvedMap");
const { submission } = require("../model/Submission");
const testCase = require("../model/testCase");
const { userDetails } = require("../model/userDetails");
const RunCompiler = require("../runCode/onlinecompiler");


const runQues = async (req, res) => {   //this is  with default test case                             
    try {
        const { id } = req.params;
        const { code, language, timeTaken } = req.body
        // console.log(req.body, id)
        if (!code || !language) {
            return res.status(400).json({
                success: false,
                msg: "pls fill all value "
            })
        }
        // console.log(req.body)
        const testCaseData = await testCase.find({ questionId: id }).select("input expectedOutput -_id")

        const data = await RunCompiler(code, testCaseData, language);

        // console.log(data)

        //here need to implement user meed to store user dataproperly ok 
        if (data.verdict !== "accepted") {
            return res.status(400).json({
                success: false,
                msg: data.summary
            })
        }
        return res.status(200).json({
            success: true,
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
            success: false,
            msg: "error from Question submition "
        })

    }
}

const runQuesWithTestCase = (req, res) => { // this works with coustom tets case 
    try {

    } catch (error) {
        console.log("error from questionSubmition")
        console.log(error.message)
        return res.status(400).json({
            success: true,
            msg: "error from Question submition "
        })

    }
}


const subMitques = async (req, res) => {  // this submits solution, runs against all test cases, and updates stats
    try {
        const { id } = req.params;
        const userId = req.user;

        const { code, language, timeTaken } = req.body;
        if (!code || !language) {
            return res.status(400).json({
                success: false,
                msg: "Code and language are required"
            });
        }

        // 1. Find Question
        const query = !isNaN(Number(id)) ? { questionId: Number(id) } : { slug: id };
        const quesData = await Question.findOne(query);
        if (!quesData) {
            return res.status(404).json({
                success: false,
                msg: "Question not found"
            });
        }

        // 2. Fetch all test cases for judging
        const testCaseData = await testCase.find({ questionId: quesData.questionId }).select("input expectedOutput -_id");
        if (!testCaseData || testCaseData.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "No test cases found for this question"
            });
        }

        // 3. Run compiler
        const data = await RunCompiler(code, testCaseData, language);
        const isAccepted = data?.verdict === "accepted";
        const verdictStatus = isAccepted ? "Accepted" : (data?.verdict || "Wrong Answer");

        // 4. Save Submission Record (saved for both accepted and failed attempts)
        const newSubmission = await submission.create({
            userId: userId,
            questionId: quesData.questionId,
            solution: code,
            language: language,
            verdict: verdictStatus,
            score: data?.score || 0,
            passedTests: data?.passed || 0,
            totalTests: data?.total || testCaseData.length,
            timeTaken: typeof timeTaken === "number" ? timeTaken : 0,
            date: new Date()
        });

        // 5. Update Question Global Stats
        const totalSubs = (quesData.stats?.totalSubmissions || 0) + 1;
        const totalAcc = (quesData.stats?.totalAccepted || 0) + (isAccepted ? 1 : 0);
        const acceptanceRate = Number(((totalAcc / totalSubs) * 100).toFixed(2));

        await Question.findOneAndUpdate(
            { questionId: quesData.questionId },
            {
                $set: {
                    "stats.totalSubmissions": totalSubs,
                    "stats.totalAccepted": totalAcc,
                    "stats.acceptanceRate": acceptanceRate
                }
            }
        );

        // 6. Update User Solved Stats & SolvedMap
        const mapUpdate = {
            $inc: {
                totalSubmissions: 1,
                [`languageSolve.${language}`]: 1
            }
        };

        if (isAccepted) {
            // Check if user already solved this question previously
            const userProfile = await userDetails.findOne({ userId });
            const alreadySolved = userProfile?.solvedQuestions?.some(
                (qId) => Number(qId) === quesData.questionId
            );

            if (!alreadySolved) {
                // First-time solve for this question: add to userDetails
                await userDetails.findOneAndUpdate(
                    { userId },
                    { $addToSet: { solvedQuestions: quesData.questionId } },
                    { upsert: true }
                );

                mapUpdate.$inc.acceptedSolutions = 1;

                // Update difficulty counts
                const diff = (quesData.difficulty || "").toLowerCase();
                if (diff === "easy") {
                    mapUpdate.$inc.easySolved = 1;
                } else if (diff === "medium") {
                    mapUpdate.$inc.Medium = 1;
                } else if (diff === "hard") {
                    mapUpdate.$inc.Hard = 1;
                }

                // Dynamically update topic counts from question topics
                if (Array.isArray(quesData.topics)) {
                    for (const topic of quesData.topics) {
                        const cleanTopic = topic.trim().replace(/\./g, "_");
                        if (cleanTopic) {
                            mapUpdate.$inc[`TopicSolved.${cleanTopic}`] = 1;
                        }
                    }
                }
            }
        }

        // Apply stats updates to solvedmap
        await solvedmap.findOneAndUpdate(
            { userId },
            mapUpdate,
            { new: true, upsert: true }
        );

        // 7. Return Result
        if (!isAccepted) {
            return res.status(200).json({
                success: false,
                verdict: verdictStatus,
                msg: data?.summary || "Submission rejected",
                data: {
                    submissionId: newSubmission._id,
                    verdict: verdictStatus,
                    score: data?.score || 0,
                    passed: data?.passed || 0,
                    total: data?.total || testCaseData.length,
                    memory_limit: data?.memory_limit,
                    summary: data?.summary,
                    tests: data?.tests || []
                }
            });
        }

        return res.status(200).json({
            success: true,
            msg: "Accepted",
            data: {
                submissionId: newSubmission._id,
                verdict: "Accepted",
                score: data.score,
                passed: data.passed,
                total: data.total,
                memory_limit: data.memory_limit,
                summary: data.summary,
                tests: data.tests
            }
        });

    } catch (error) {
        console.error("Error from subMitques:", error);
        return res.status(500).json({
            success: false,
            msg: `Error from question submission: ${error.message}`
        });
    }
}

const likeQues = async (req, res) => { // by usong this user can like or dis like question 
    try {
        const userid = req.user
        const { id } = req.params;
        const { isLike, isDisLike } = req.body;
        if (isLike === isDisLike) {
            return res.status(400).json({
                success: false,
                msg: "Select either Like or Dislike"
            });
        }
        console.log(isLike, isDisLike)
        console.log(id)
        console.log(userid)


        // normall approach 
        // if (isLike) {
        //     await userDetails.findOneAndUpdate({ userid }, {
        //         $push: {
        //             likeQuestion: id
        //         }
        //     })
        // }
        // if (isDisLike) {
        //     await userDetails.findOneAndUpdate({ userid }, {
        //         $push: {
        //             likeQuestion: id
        //         }
        //     })
        // }

        //optimized approach 
        await userDetails.findOneAndUpdate(
            { userId: userid },
            {
                $addToSet: { [isLike ? "likeQuestion" : "dislikeQustion"]: id },
                //pull need to like user prevous liek any question now they dislike it 
                $pull: { [isLike ? "dislikeQustion" : "likeQuestion"]: id }
            }
        );
        return res.status(200).json({
            success: true,
            msg: isLike ? "Question liked" : "Question disliked"
        });

    } catch (error) {
        console.log("error from questionSubmition")
        console.log(error.message)
        return res.status(400).json({
            success: false,
            msg: "error from Question submition "
        })
    }
}


const isStar = async (req, res) => { //by usong this user can star question 
    try {
        const userid = req.user
        const { id } = req.params;
        // console.log(id)
        const findQues = await Question.findOne({ questionId: Number(id) })
        console.log(userid)
        if (!findQues) {
            return res.status(400).json({
                success: false,
                msg: "sorry qustion not found"
            })
        }
        await userDetails.findOneAndUpdate({ userid }, {
            $push: {
                starQues: id
            }
        })
        return res.status(200).json({
            success: true,
            msg: "question start marked "
        })

    } catch (error) {
        console.log("error from questionSubmition")
        console.log(error.message)
        return res.status(400).json({
            success: false,
            msg: "error from Question submition "
        })
    }
}

const Markquestion = (req, res) => {   //this will help to mark question 
    try {

    } catch (error) {
        console.log("error from questionSubmition")
        console.log(error.message)
        return res.status(400).json({
            success: true,
            msg: "error from Question submition "
        })
    }
}

module.exports = { runQues, runQuesWithTestCase, subMitques, likeQues, isStar, Markquestion }                                                              