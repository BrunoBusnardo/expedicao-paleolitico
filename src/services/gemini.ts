import { GoogleGenAI, Type } from "@google/genai";
import { GroupAnswers, ElderFeedback } from "../types";
import { QUESTIONS } from "../constants";

// Tenta ler a chave de diferentes fontes para garantir compatibilidade com Vercel/Vite
const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

/**
 * Gera um rascunho da história para uma fase específica com base nas respostas.
 * Se houver anacronismos, eles são marcados com [ERRO]...[/ERRO].
 */
export async function generatePhaseDraft(questionId: number, answer: string): Promise<{ draft: string; hasErrors: boolean }> {
  const question = QUESTIONS.find(q => q.id === questionId);
  
  const prompt = `
    Você é um historiador especializado no Paleolítico. 
    O aluno do 6º ano deu a seguinte resposta para a fase "${question?.title}": "${answer}".
    
    Sua tarefa:
    1. Escreva um parágrafo narrativo em 1ª pessoa do plural ("Nós") que transforme essa resposta em parte de uma história épica.
    2. Se a resposta do aluno contiver anacronismos (metais, agricultura, tecnologia moderna, etc) ou erros históricos, VOCÊ DEVE INCLUÍ-LOS na narrativa, mas marque-os EXATAMENTE assim: [ERRO]termo errado[/ERRO].
    3. Se houver apenas erros de digitação ou gramática simples, CORRIJA-OS silenciosamente no texto, mas mencione que houve correções de escrita.
    4. O texto deve soar como uma crônica de tribo.
    
    Retorne um JSON com:
    {
      "draft": "O texto da narrativa",
      "hasErrors": boolean (true se houver anacronismos marcados com [ERRO])
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            draft: { type: Type.STRING },
            hasErrors: { type: Type.BOOLEAN }
          },
          required: ["draft", "hasErrors"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Erro ao gerar rascunho:", error);
    return { draft: "Ocorreu um erro ao conectar com os ancestrais.", hasErrors: false };
  }
}

/**
 * Verifica se o rascunho editado pelo aluno ainda contém erros ou anacronismos.
 */
export async function verifyPhaseDraft(questionId: number, draft: string): Promise<{ isCorrect: boolean; feedback: string; typosFixed: string[] }> {
  const question = QUESTIONS.find(q => q.id === questionId);
  
  const prompt = `
    Você é um revisor histórico rigoroso.
    Analise o seguinte trecho de uma história sobre o Paleolítico (Fase: ${question?.title}):
    
    "${draft}"
    
    Sua tarefa:
    1. Verifique se ainda existem anacronismos ou erros históricos.
    2. Verifique se existem erros de digitação.
    
    Retorne um JSON com:
    {
      "isCorrect": boolean (true se NÃO houver anacronismos),
      "feedback": "Explicação pedagógica se houver erro histórico. Se houver erro de digitação, apenas mencione quais foram corrigidos.",
      "typosFixed": ["palavra1", "palavra2"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
            typosFixed: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["isCorrect", "feedback", "typosFixed"]
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Erro ao verificar rascunho:", error);
    return { isCorrect: false, feedback: "Não consegui verificar o texto agora.", typosFixed: [] };
  }
}

export async function getElderFeedback(questionId: number, draft: string, consultationCount: number): Promise<ElderFeedback> {
  const question = QUESTIONS.find(q => q.id === questionId);
  const isDirectHelp = consultationCount >= 4;
  
  const prompt = `
    Você é o "Ancião da Tribo", um guia sábio do período Paleolítico que fala em 1ª pessoa.
    Os alunos estão editando um texto sobre a fase "${question?.title}".
    
    Texto atual deles: "${draft}"
    Esta é a consulta número ${consultationCount} deles nesta fase.

    Sua tarefa:
    1. Identifique anacronismos ou erros históricos no texto.
    2. Fale como um ancião: "Meus jovens, sinto um cheiro estranho no ar...".
    3. Contextualize o erro historicamente (ensine sobre o período).
    
    ${isDirectHelp ? 
      `4. Como eles já tentaram várias vezes, SEJA DIRETO. Diga exatamente o que está errado e como eles devem escrever para ficar correto. Dê o exemplo de texto corrigido.` : 
      `4. Dê opções e caminhos para eles encontrarem uma resposta melhor, sem dar a resposta pronta. Leve-os à reflexão.`
    }
    
    5. Se houver erros de digitação, apenas mencione-os brevemente como "tropeços na fala".

    Retorne um JSON com:
    {
      "message": "Seu feedback pedagógico e contextualizado em markdown",
      "hasErrors": boolean,
      "suggestions": ["Opção de reflexão 1", "Opção de reflexão 2"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            hasErrors: { type: Type.BOOLEAN },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["message", "hasErrors", "suggestions"]
        }
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Erro no feedback do ancião:", error);
    return {
      message: "O vento sopra forte e não consigo ouvir vocês.",
      hasErrors: false,
      suggestions: []
    };
  }
}

export async function generateFinalStory(answers: GroupAnswers, verifiedDrafts: string[]) {
  const prompt = `
    Você é um historiador e contador de histórias. 
    Una os seguintes parágrafos verificados em uma narrativa épica e fluida sobre o Paleolítico.
    
    Parágrafos:
    ${verifiedDrafts.join('\n\n')}

    Diretrizes:
    - Crie uma introdução e uma conclusão que amarre tudo.
    - Título criativo para a tribo.
    - Narrativa em primeira pessoa do plural ("Nós").
    - Mantenha a coerência histórica rigorosa.

    Retorne a história em Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "A história se perdeu no tempo...";
  } catch (error) {
    console.error("Erro ao gerar história final:", error);
    return "Não foi possível registrar a história da sua tribo.";
  }
}
