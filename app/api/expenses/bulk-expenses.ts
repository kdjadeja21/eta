import { NextApiRequest, NextApiResponse } from "next";
import { expenseService } from "@/lib/expense-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, expenses } = req.body;

  if (!userId || !Array.isArray(expenses)) {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  try {
    // Validate each expense record
    const validatedExpenses = expenses.map((expense) => {
      if (!expense.date || !expense.amount || !expense.description) {
        throw new Error(
          "Missing required fields: date, amount, or description"
        );
      }

      return {
        ...expense,
        date: new Date(expense.date), // Ensure date is in proper format
      };
    });

    // Insert expenses into the database
    await Promise.all(
      validatedExpenses.map((expense) =>
        expenseService.addExpense(userId, expense)
      )
    );

    res.status(200).json({ message: "Bulk expenses added successfully" });
  } catch (error) {
    console.error("Error adding bulk expenses:", error);
    res.status(500).json({ error: "Failed to add bulk expenses" });
  }
}
