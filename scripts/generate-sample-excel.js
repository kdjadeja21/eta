const ExcelJS = require("exceljs");
const fs = require("fs");

// Read sample data from JSON file
const sampleDataPath = "./public/sample-data.json";
const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, "utf-8"));

// Transform JSON data into array format for Excel
const data = [
  ["Date", "Amount", "Description", "Paid By", "Category", "Subcategory", "Tags", "Type"],
  ...sampleData.map((item) => [
    item.date,
    item.amount,
    item.description,
    item.paidBy,
    item.category,
    item.subcategory,
    item.tags.join(", "),
    item.type,
  ]),
];

// Create a new workbook and worksheet
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("Sample");
data.forEach((row) => worksheet.addRow(row));

// Write the workbook to a file
const filePath = "./public/sample-expenses.xlsx";
workbook.xlsx.writeFile(filePath).then(() => {
  console.log(`Sample Excel file generated at ${filePath}`);
});
