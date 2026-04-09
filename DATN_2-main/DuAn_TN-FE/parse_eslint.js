const fs = require('fs');

const data = JSON.parse(fs.readFileSync('eslint_report_clean.json', 'utf8'));

let totalWarnings = 0;
const fileWarnings = [];

data.forEach(file => {
    if (file.warningCount > 0) {
        totalWarnings += file.warningCount;
        const warnings = file.messages
            .filter(msg => msg.severity === 1)
            .map(msg => ({
                ruleId: msg.ruleId,
                line: msg.line,
                message: msg.message
            }));
        fileWarnings.push({
            filePath: file.filePath,
            warningCount: file.warningCount,
            warnings: warnings
        });
    }
});

console.log(`Total Warnings: ${totalWarnings}`);
fileWarnings.forEach(fw => {
    console.log(`\nFile: ${fw.filePath}`);
    console.log(`Count: ${fw.warningCount}`);
    fw.warnings.forEach(w => {
        console.log(`  Line ${w.line}: [${w.ruleId}] ${w.message}`);
    });
});
