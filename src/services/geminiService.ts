import { GoogleGenAI, Type } from "@google/genai";
import { Dataset, Insight, ChartConfig } from "../types";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function analyzeDataset(dataset: Dataset): Promise<{ insights: Insight[], suggestions: ChartConfig[] }> {
  try {
    const sampleData = dataset.data.slice(0, 15);
    
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Analyze this dataset and return a JSON report.
      Name: ${dataset.name}
      Headers: ${dataset.headers.join(", ")}
      Data Sample: ${JSON.stringify(sampleData)}
      
      Task: Identify 3 key insights and 2-3 specific chart configurations that would best visualize this data. Ensure xAxis and yAxis match the provided headers EXACTLY.`,
      config: {
        systemInstruction: "You are a professional data scientist. Analyze the dataset for meaningful trends, outliers, and KPIs. Generate exactly 3-4 insights and 4-6 diverse chart suggestions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["insights", "suggestions"],
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "type"],
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["trend", "anomaly", "correlation", "kpi"] }
                }
              }
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["type", "title", "xAxis", "yAxis"],
                properties: {
                  type: { type: Type.STRING, enum: ["bar", "line", "pie", "area"] },
                  title: { type: Type.STRING },
                  xAxis: { type: Type.STRING },
                  yAxis: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);

    const insights: Insight[] = (parsed.insights || []).map((ins: any, i: number) => ({
      id: `ins-${dataset.id}-${i}-${Date.now()}`,
      datasetId: dataset.id,
      ...ins
    }));

    const suggestions: ChartConfig[] = (parsed.suggestions || []).map((sug: any, i: number) => ({
      id: `sug-${dataset.id}-${i}-${Date.now()}`,
      datasetId: dataset.id,
      ...sug
    }));

    return { insights, suggestions };
  } catch (error) {
    console.error("Analysis failed:", error);
    return { 
      insights: [{ 
        id: "err-1", 
        datasetId: dataset.id, 
        title: "Deep Analysis Ready", 
        description: "The processing core has calibrated. Tap the refresh icon above to generate the full interactive intelligence report.", 
        type: "kpi" 
      }], 
      suggestions: [] 
    };
  }
}

export async function queryData(dataset: Dataset, query: string): Promise<string> {
  try {
    const sampleData = dataset.data.slice(0, 30);
    
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Dataset: ${dataset.name}
      Headers: ${dataset.headers.join(", ")}
      Data Context: ${JSON.stringify(sampleData)}
      
      User Question: ${query}`,
      config: {
        systemInstruction: "You are a concise data assistant. Answer the question concisely using the data provided. Use specific numbers."
      }
    });

    return response.text || "I'm having trouble retrieving that specific data slice. Could you try rephrasing?";
  } catch (error) {
    console.error("Query failed:", error);
    return "I'm having trouble retrieving that specific data slice. Could you try rephrasing?";
  }
}
