
import { GoogleGenAI, Type } from "@google/genai";
import { Question, DifficultyLevel } from "../types";

// Fixed: Initialize GoogleGenAI with a direct reference to process.env.API_KEY as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getExplanationFromAI = async (question: string, correctAnswer: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `તમે ગુજરાત પોલીસ (LRD/PSI) પરીક્ષાના નિષ્ણાત છો. આ પ્રશ્નનો સાચો જવાબ શા માટે '${correctAnswer}' છે તે ગુજરાતીમાં ટૂંકમાં સમજાવો. પ્રશ્ન: "${question}"`,
    });
    // Fix: Access .text property directly (not a function call)
    return response.text || "માફ કરશો, અત્યારે સમજૂતી ઉપલબ્ધ નથી.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "સમજૂતી મેળવવામાં ભૂલ આવી છે.";
  }
};

export const generateDynamicQuestions = async (
  category: string, 
  level: DifficultyLevel, 
  part: number
): Promise<Question[]> => {
  // STRICTLY REQUESTING 47 QUESTIONS AND 100 PARTS
  const prompt = `તમે ગુજરાત પોલીસ LRD/PSI પરીક્ષાના મુખ્ય પ્રશ્નપત્ર સેટર છો.
તમારે નીચેની વિગતો મુજબ પ્રશ્નો તૈયાર કરવાના છે:
- વિષય: ${category}
- મુશ્કેલીનું સ્તર: ${level}
- ભાગ નંબર: ${part} (કુલ ૧૦૦ ભાગમાંથી આ ભાગ ${part} છે)
- કુલ પ્રશ્નો: પૂરા ૪૭ (47) પ્રશ્નો (MCQ)

નિયમો:
૧. કોઈ પણ પ્રશ્ન અગાઉના ભાગોમાં (૧ થી ૧૦૦) પૂછાયેલો હોવો જોઈએ નહીં. દરેક ભાગમાં તદ્દન નવા પ્રશ્નો હોવા જોઈએ.
૨. દરેક પ્રશ્ન માટે ૪ વિકલ્પો અને એક સાચો જવાબ હોવો જોઈએ. બધું જ લખાણ ગુજરાતીમાં હોવું જોઈએ.
૩. પ્રશ્નોનું લેવલ ${level} મુજબ રાખવું. 
૪. પ્રશ્નો ગુણવત્તાયુક્ત અને પરીક્ષાલક્ષી હોવા જોઈએ.
૫. જો 'કરંટ અફેર્સ' હોય તો ૨૦૨૪ની લેટેસ્ટ ઘટનાઓ લેવી.
૬. જો 'PYQ' હોય તો જૂના વર્ષો (૨૦૧૨-૨૦૨૨) ના પ્રશ્નોનો ઉપયોગ કરવો.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: category.includes('Current Affairs') ? [{ googleSearch: {} }] : undefined,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                minItems: 4,
                maxItems: 4
              },
              correctAnswer: { 
                type: Type.INTEGER,
                description: "0 થી 3 વચ્ચેનો સાચો ઇન્ડેક્સ"
              },
              explanation: { type: Type.STRING }
            },
            required: ["id", "category", "question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    // Fix: Use .text property directly and trim.
    const jsonStr = response.text?.trim() || "[]";
    const questions = JSON.parse(jsonStr) as Question[];
    return questions;
  } catch (error) {
    console.error("Failed to generate questions:", error);
    throw error;
  }
};
