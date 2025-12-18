
// Use correct import for GoogleGenAI
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Retrieve API key from localStorage (user input) or environment variable (deployed/dev)
const getApiKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_api_key') || process.env.API_KEY || '';
  }
  return process.env.API_KEY || '';
};

// Ensure AI instance is created right before call with the latest key
const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

export const generateTopics = async (categories: string[]) => {
  const ai = getAI();
  const prompt = `사용자가 선택한 카테고리: ${categories.join(", ")}. 
  이 카테고리들을 창의적으로 융합하여 유튜브 조회수가 잘 나올만한 '후킹한 제목'의 주제 10가지를 제안해줘.
  반드시 JSON 배열 형태로 응답해줘.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              title: { type: Type.STRING }
            },
            required: ["id", "title"]
          }
        }
      }
    });
    // Use .text property directly
    return JSON.parse(response.text || "[]");
  } catch (e: any) {
    console.error("Failed to generate topics", e);
    throw e;
  }
};

export const generateOutline = async (topic: string, feedback?: string) => {
  const ai = getAI();
  const prompt = `주제: "${topic}"에 대한 유튜브 스크립트 개요를 작성해줘. 
  ${feedback ? `추가 요청 사항: "${feedback}"를 반영해서 더 구체적으로 작성해줘.` : ""}
  다음 구조를 따라야 해:
  1. 도입부: 후킹 및 기대효과
  2. 문제제기: 공감대 형성
  3. 본론 1~3: 핵심 정보와 구체적인 근거/사례 (Depth 2 구조로 상세하게)
  4. 결론: 요약 및 CTA
  5. 클로징: 구독과 좋아요 유도
  반드시 JSON 형태로 응답해줘.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intro: { type: Type.STRING },
            problem: { type: Type.STRING },
            points: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  details: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "details"]
              }
            },
            conclusion: { type: Type.STRING },
            closing: { type: Type.STRING }
          },
          required: ["intro", "problem", "points", "conclusion", "closing"]
        }
      }
    });
    // Use .text property directly
    return JSON.parse(response.text || "{}");
  } catch (e: any) {
    console.error("Failed to generate outline", e);
    throw e;
  }
};

export const streamFullScript = async (
  topic: string, 
  outline: any, 
  onChunk: (text: string) => void,
  existingScript?: string,
  feedback?: string
) => {
  const ai = getAI();
  const prompt = feedback && existingScript 
    ? `주제: "${topic}"
       기존 스크립트: "${existingScript}"
       사용자 피드백: "${feedback}"
       위 피드백을 반영하여 기존 대본을 더 구체화하고 다듬어서 새 대본을 작성해줘. 
       - 분량은 2,000자 내외로 유지
       - 말투는 자연스러운 구어체 (~해요, ~입니다)
       - 이전 대본의 흐름을 유지하되 피드백 내용을 강력하게 반영해줘.`
    : `주제: "${topic}"
       개요: ${JSON.stringify(outline)}
       위 개요를 바탕으로 약 2,000자 내외의 유튜브 대본을 작성해줘.
       - 말투: 자연스러운 구어체 (~해요, ~입니다)
       - 내용: 정보의 깊이와 재미를 동시에 확보
       - 구성: 오프닝부터 클로징까지 흐름이 끊기지 않게 작성`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      // Chunk has .text property
      const text = chunk.text || "";
      if (text) {
        fullText += text;
        onChunk(fullText);
      }
    }
  } catch (e: any) {
    console.error("Streaming error", e);
    throw e;
  }
};
