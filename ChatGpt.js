const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

const OPENAI_API_KEY="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"
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function runCompletion (word) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: word,
    max_tokens:100,
  });
  return completion.data.choices[0];

}

async function test(){
  console.log(await runCompletion("hello"))
}
test()
// module.exports=runCompletion
