import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const SYSTEM_PROMPT = `
You are an helpfull AI assistant who is designed to resolve user query.
You work on START, THINK, ACTION, OBSERVE and OUTPUT Mode.

In the start phase, user gives a query to you.
Then, you THINK how to resolve that query atleast 3-4 times and make sure that all is clear.
If there is a need to call a tool, you call an ACTION event with tool and input parameters.
If there is an action call, wait for the OBSERVE that is output of the tool.
Based on the OBSERVE from previous steps, you either output or repeat the loop.

Rules: 
- Always wait for next step
- Always output a single step and wait for the next step
- Output must be strictly JSON
- Only call tool action from Available tools only.
- Strictly follow the output format in JSON

Available Tools: 
- getWeatherInfo(city: string): string

Example: 
START: what is weather of patiala?
THINK: The user is asking for the weather of patiala.
THINK: From the available tools, I must call getWeatherInfo Tool for patiala as input.
ACTION: Call the Tool getWeatherInfo(patiala)
OBSERVE: 32 Degree C
THINK: The output of getWeatherInfo for patiala is 32 Degree C
OUTPUT: Hey, The weather of Patiala is 32 Degree C which is quite Hot.

Output Example: 
{"role": "user", "content": "what is the weather of Patiala?"}
{"role": "think", "content": "The user is asking for the weather of patiala."}
{"role": "think", "content": "From the available tools, I must call getWeatherInfo Tool for patiala as input."}
{"role": "action", "tool": "getWeatherInfo", "input: "Patiala"}
{"role": "observe", "content": "32 Degree C"}
{"role": "think", "content": " The output of getWeatherInfo for patiala is 32 Degree C"}
{"role": "output", "content": "Hey, The weather of Patiala is 32 Degree C which is quite Hot."}

Output Format: 
{"step": "string", "tool": "string", "input": "string", "content": "string"}

`;

const response = await openai.chat.completions.create({
  model: "gemini-2.5-flash",
  response_format: { type: "json_object" },
  messages: [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: `{"step": "start", "content": "what is weather of Delhi?"}`,
    },
    {
      role: "user",
      content: `{"step": "think", "content": "The user is asking for the weather of Delhi."}`,
    },
    {
      role: "user",
      content: `{"step": "action", "tool": "getWeatherInfo", "input": "Delhi"}`,
    },
    {
      role: "user",
      content: `{"step": "observe", "content": "28 Degree C"}`,
    },
    {
      role: "user",
      content: `{
       "step": "think",
       "content": "The output of getWeatherInfo for Delhi is 28 Degree C"
       `
    },
    {
      role: "user",
      content: `{
      "step": "output",
      "content": "Hey, The weather of Delhi is 28 Degree C."
      `
    },
  ],
});

console.log(response.choices[0].message.content);
