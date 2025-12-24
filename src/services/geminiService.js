const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

export const callGemini = async (prompt, systemInstruction = "") => {
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const callGeminiVision = async (prompt, base64Image, mimeType = "image/jpeg") => {
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType, data: base64Image } } 
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return null;
  }
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

// Batch analyze multiple images
export const batchAnalyzeImages = async (images, prompt) => {
  try {
    const results = await Promise.all(
      images.map(async (img) => {
        try {
          const base64 = await fileToBase64(img.file);
          const result = await callGeminiVision(prompt, base64, img.file.type);
          return {
            id: img.id,
            success: true,
            data: result,
          };
        } catch (error) {
          return {
            id: img.id,
            success: false,
            error: error.message,
          };
        }
      })
    );
    return results;
  } catch (error) {
    console.error("Batch analysis error:", error);
    return [];
  }
};

// Analyze with confidence scores
export const analyzeWithConfidence = async (prompt, base64Image, mimeType = "image/jpeg") => {
  try {
    const enhancedPrompt = `${prompt}\n\nFor each detected item, provide a confidence score from 0-100.`;
    const response = await callGeminiVision(enhancedPrompt, base64Image, mimeType);
    
    if (response) {
      try {
        const parsed = JSON.parse(response);
        return parsed;
      } catch {
        return { result: response, confidence: null };
      }
    }
    return null;
  } catch (error) {
    console.error("Confidence analysis error:", error);
    return null;
  }
};

// Get AI-suggested corrective actions
export const getSuggestedActions = async (violations) => {
  const prompt = `Based on these violations: ${violations.join(', ')}, suggest specific corrective actions following SF Health Code Article 11. Provide actionable steps for each violation.`;
  
  try {
    const response = await callGemini(prompt, "You are an expert on SF DPH health code violations and corrective actions.");
    return response;
  } catch (error) {
    console.error("Error getting suggested actions:", error);
    return null;
  }
};
