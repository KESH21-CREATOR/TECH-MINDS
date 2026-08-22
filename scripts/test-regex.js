const text1 = "Student Name: Aarav Sharma Register Number: NIT2026CS101\nProgramme: B.Tech Computer Science and Engineering\tAcademic Year: 2022 - 2026";
const nameRegex = /(?:Student Name|Candidate Name|Applicant Name|Name of the Candidate)\s*[:\-]\s*([^\t\n\r]+)/i;
const progRegex = /(?:Programme|Program|Branch|Course|Degree|Admitted to|Selected for)\s*[:\-]\s*([^\t\n\r]+)/i;

function clean(str, delimiters) {
  if (!str) return "";
  let res = str;
  for (const d of delimiters) {
    const idx = res.indexOf(d);
    if (idx !== -1) res = res.slice(0, idx);
  }
  return res.trim();
}

console.log("Name:", clean(text1.match(nameRegex)?.[1], ["Register", "Reg No", "Roll", "Programme", "\t"]));
console.log("Programme:", clean(text1.match(progRegex)?.[1], ["Academic", "Batch", "Campus", "Issue", "Date", "Cumulative", "\t"]));
