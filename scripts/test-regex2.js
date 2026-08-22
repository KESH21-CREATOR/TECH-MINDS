const text = `
Programme: B.Tech Computer Science and Engineering (Specialization in AI and ML)
Batch: 2025 - 2029
`;

const progMatch = text.match(/(?:Programme|Program|Branch|Course|Degree)\s*[:\-]\s*([^\t\n\r]+)/i);
console.log("Extracted:", progMatch?.[1].trim());
