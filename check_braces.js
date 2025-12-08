const fs = require('fs');

const filePath = '/Users/dmsingh/Desktop/projects/email-validator/dashboard/src/app/(dashboard)/dashboard/settings/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let balance = 0;
let lineNum = 0;

for (const line of lines) {
    lineNum++;
    for (const char of line) {
        if (char === '{') balance++;
        if (char === '}') balance--;
    }
    
    // Check if we hit 0 balance (meaning all opened braces are closed)
    if (balance === 0 && lineNum > 17) { // Assuming line 17 opens SettingsContent
        console.log(`Input balanced (closed) at line: ${lineNum}`);
        console.log(`Line content: ${line}`);
    }
    
    if (balance < 0) {
        console.error(`Balance negative at line ${lineNum}! Extra closing brace.`);
        break;
    }

    if (lineNum >= 470) break; // Stop checking after expected error location
}
console.log(`Final balance at line ${lineNum}: ${balance}`);
