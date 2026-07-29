import { OpenAI } from "openai";
import { config } from "./config";

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export async function extractMenuFromImage(imageUrl: string) {
  const response = await openai.responses.create({
    model: "gpt-5",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `
  Extract all menu items.
  
  Return ONLY valid JSON.
  
  Format:
  {
    "categories": [
      {
        "name": "Burgers",
        "items": [
          {
            "name": "Classic Burger",
            "price": 10.99,
            "description": ""
          }
        ]
      }
    ]
  }
  `,
          },
          {
            type: "input_image",
            image_url: imageUrl,
            detail: "auto",
          },
        ],
      },
    ],
  });

  return response.output_text;
}

export default openai;
