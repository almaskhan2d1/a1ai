import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are a helpful AI assistant. Provide accurate, concise, and helpful responses.",
      },
    });

    return response.text || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error("Failed to generate text response");
  }
}

export async function analyzeImage(imageData: string, mimeType: string, prompt?: string): Promise<string> {
  try {
    const textPrompt = prompt || "Analyze this image in detail and describe its key elements, context, and any notable aspects.";

    const contents = [
      {
        inlineData: {
          data: imageData,
          mimeType: mimeType,
        },
      },
      textPrompt,
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: contents,
    });

    return response.text || "I couldn't analyze this image. Please try uploading a different image.";
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image");
  }
}

export async function generateHeadline(): Promise<string> {
  try {
    const headlines = [
      "Transform Ideas into Intelligent Insights",
      "Unlock the Power of AI Conversation", 
      "Experience Next-Generation AI Analysis",
      "Revolutionize Your Creative Process",
      "Discover AI That Understands You"
    ];
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Write 1 catchy headline for an AI assistant that does text generation and image analysis.",
      config: {
        systemInstruction: "You write ultra-short punchy product headlines for an AI assistant website. Max 8 words. Be creative and engaging.",
      },
    });

    const generatedHeadline = response.text?.trim();
    
    // Fallback to predefined headlines if generation fails
    return generatedHeadline || headlines[Math.floor(Math.random() * headlines.length)];
  } catch (error) {
    console.error("Error generating headline:", error);
    const fallbacks = [
      "Transform Ideas into Intelligent Insights",
      "Unlock the Power of AI Conversation",
      "Experience Next-Generation AI Analysis"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
