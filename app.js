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
{"step": "think", "content": "The user is asking for the weather of patiala."}
{"step": "think", "content": "From the available tools, I must call getWeatherInfo Tool for patiala as input."}
{"step": "action", "tool": "getWeatherInfo", "input: "Patiala"}
{"step": "observe", "content": "32 Degree C"}
{"step": "think", "content": " The output of getWeatherInfo for patiala is 32 Degree C"}
{"step": "output", "content": "Hey, The weather of Patiala is 32 Degree C which is quite Hot."}

Output Format: 
{"step": "string", "tool": "string", "input": "string", "content": "string"}

`;

function getWeatherInfo(cityName) {
  return `${cityName} has 43 Degree C`;
}

const TOOLS_MAP = {
  getWeatherInfo,
};

const messages = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
];
const userQuery = "";

while (true) {
  const response = await openai.chat.completions.create({
    model: "gemini-2.5-flash",
    response_format: { type: "json_object" },
    messages: messages,
  });

  messages.push({
    role: "assistant",
    content: response.choices[0].message.content,
  });
  const parsed_response = JSON.parse(response.choices[0].message.content);

  if ((parsed_response.step == parsed_response.step) == "think") {
    console.log(`${parsed_response.content}`);
    continue;
  }
  if ((parsed_response.step == parsed_response.step) == "output") {
    console.log(`${parsed_response.content}`);
    continue;
  }
  if ((parsed_response.step == parsed_response.step) == "action") {
    const tool = parsed_response.tool;
    const input = parsed_response.input;

    console.log(`🔨: Tool Call ${tool}: (${input})`);
    TOOLS_MAP[tool](input);

    messages.push({
      role: "assistant",
      content: JSON.stringify({ step: "observe", content: value }),
    });

    continue;
  }
}

const response = await openai.chat.completions.create({
  model: "gemini-2.5-flash",
  response_format: { type: "json_object" },
  messages: [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
  ],
});

console.log(response.choices[0].message.content);
