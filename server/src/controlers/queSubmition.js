const runQues = (req,res) => {   //this is  with default test case                             
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
const runQuesWithTestCase = (req,res) => { // this works with coustom tets case 
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
const subMitques = (req,res) => {  //this will submit question with checking test case again ok 
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

const likeQues = (req,res) => { // by usong this user can like or dis like question 
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


const isStar = (req,res) => { //by usong this user can star question 
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

module.exports = { subMitques, runQues, runQuesWithTestCase, likeQues, isStar }