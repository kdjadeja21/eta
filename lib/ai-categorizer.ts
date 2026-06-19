import "server-only";
import { Agent } from "@cursor/sdk";

export interface UncategorizedRecord {
  id: string;
  description?: string;
  amount: number;
}

export interface Categorization {
  id: string;
  category: string;
  subcategory: string;
}

export interface CategorizationResult {
  categorizations: Categorization[];
  insights: string;
}

export async function categorizeExpenses(
  records: UncategorizedRecord[],
  existingCategories: { name: string; subcategories: string[] }[],
  monthLabel: string
): Promise<CategorizationResult> {
  if (records.length === 0) {
    return { categorizations: [], insights: "" };
  }

  const categoryList =
    existingCategories.length > 0
      ? existingCategories
          .map(
            (c) =>
              `- ${c.name}${c.subcategories.length ? `: [${c.subcategories.join(", ")}]` : ""}`
          )
          .join("\n")
      : "No existing categories (create sensible ones)";

  const recordsJson = JSON.stringify(
    records.map((r) => ({
      id: r.id,
      description: r.description ?? "",
      amount: r.amount,
    }))
  );

  const prompt = `You are a financial data classifier. Your job is to categorize expense records and provide a short spending insight.

EXISTING CATEGORIES (use these when possible; you may create new ones if none fit):
${categoryList}

EXPENSE RECORDS TO CLASSIFY (${records.length} records):
${recordsJson}

MONTH: ${monthLabel}

INSTRUCTIONS:
1. For EACH record, assign a category and subcategory.
2. Prefer existing categories. Only create a new category if none of the existing ones fit.
3. Subcategory should be specific (e.g. "Groceries" → "Vegetables", "Dining" → "Restaurant").
4. Also write 2-3 sentences of financial insight about the overall spending patterns visible in ALL the records combined.
5. Do NOT modify any files. Respond with ONLY valid JSON, no markdown, no explanation outside JSON.

REQUIRED JSON FORMAT (respond with this exact structure):
{
  "categorizations": [
    { "id": "<record id>", "category": "<category name>", "subcategory": "<subcategory name>" }
  ],
  "insights": "<2-3 sentence spending insight for ${monthLabel}>"
}`;

  const result = await Agent.prompt(prompt, {
    apiKey: process.env.CURSOR_API_KEY!,
    model: { id: "composer-2.5" },
    local: { cwd: process.cwd() },
  });

  if (!result.result) {
    throw new Error("AI categorizer returned no result");
  }

  const jsonText = extractJson(result.result);
  const parsed = JSON.parse(jsonText) as CategorizationResult;

  if (!Array.isArray(parsed.categorizations)) {
    throw new Error("AI response missing categorizations array");
  }

  return parsed;
}

function extractJson(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const braceStart = text.indexOf("{");
  const braceEnd = text.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd !== -1) {
    return text.slice(braceStart, braceEnd + 1);
  }

  return text.trim();
}
