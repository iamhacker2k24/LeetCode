
const { OnlineCompiler } = require("onlinecompiler")

const client = new OnlineCompiler({
    apiKey: process.env.ONLINECOMPILER_API_KEY
}); // reads ONLINECOMPILER_API_KEY

const RunCompiler = async (code, result,language) => {
    // console.log(result);

    // Map to the format the API expects
    const formattedTests = result.map(tc => ({
        input: tc.input,
        expected_output: tc.expectedOutput
    }));
    console.log(formattedTests)

    const judged = await client.runTests({
        compiler: language,
        code: code,
        tests: formattedTests
    });

    // console.log(judged);
    return judged;
}

module.exports = RunCompiler;
// RunCompiler()