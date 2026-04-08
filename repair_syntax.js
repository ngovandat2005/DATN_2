const fs = require('fs');
const path = require('path');

const replacements = {
    'ọ': 'o',
    'ạ': 'a',
    'ặ': 'a',
    'ệ': 'e',
    'ớ': 'o',
    'ứ': 'u',
    'ị': 'i',
    'ụ': 'u',
    'ẹ': 'e',
    'ả': 'a',
    'ờ': 'o',
    'ổ': 'o',
    'ữ': 'u',
    'ỷ': 'y',
};

// Keywords that definitely should not have these characters
const keywords = [
    'slice', 'application', 'onClick', 'map', 'forEach', 'localStorage', 
    'item', 'console', 'function', 'italic', 'for', 'const', 'export', 
    'import', 'return', 'error', 'response', 'status', 'message', 'data', 
    'params', 'headers', 'images', 'length', 'toLocaleString', 'includes', 
    'fetch', 'window', 'location', 'reload', 'json', 'parse', 'stringify', 
    'axios', 'promise', 'await', 'async', 'props', 'type', 'name', 'value',
    'id', 'key', 'index', 'true', 'false', 'null', 'undefined', 'set', 'get',
    'update', 'delete', 'add', 'remove', 'find', 'filter', 'reduce', 'some',
    'every', 'push', 'pop', 'shift', 'unshift', 'join', 'split', 'replace',
    'match', 'test', 'search', 'sort', 'reverse', 'concat', 'entries', 'keys',
    'values', 'from', 'of', 'in', 'if', 'else', 'switch', 'case', 'break',
    'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super',
    'class', 'extends', 'static', 'private', 'public', 'protected', 'async',
    'await', 'yield', 'next', 'done', 'return', 'typeof', 'instanceof', 'void',
    'delete', 'in', 'of', 'as', 'any', 'boolean', 'string', 'number', 'symbol',
    'bigint', 'object', 'function', 'void', 'never', 'unknown', 'readonly',
    'namespace', 'module', 'type', 'interface', 'enum', 'abstract', 'implements',
];

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach( f => {
        let dirPath = path.join(dir, f);
        try {
            let stats = fs.statSync(dirPath);
            if (stats.isDirectory()) {
                walkDir(dirPath, callback);
            } else {
                callback(dirPath);
            }
        } catch (e) {}
    });
}

const targetDir = path.join(__dirname, 'DuAn_TN-FE', 'src');

walkDir(targetDir, (filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let originalContent = content;
            
            // Regex to find words containing corrupted characters but NOT inside quotes (minimal attempt)
            // Actually, let's just use a more aggressive approach for syntax
            
            // 1. Fix specific known corrupted words first
            const corruptedMap = {
                'slọce': 'slice',
                'applọcation': 'application',
                'onClọck': 'onClick',
                'clọck': 'click',
                'mạp': 'map',
                'fọrEach': 'forEach',
                'lọcalStorage': 'localStorage',
                'itẹm': 'item',
                'cọnsole': 'console',
                'functiọn': 'function',
                'italọc': 'italic',
                'fọr': 'for',
                'cọnst': 'const',
                'expọrt': 'export',
                'impọrt': 'import',
                'retuṛn': 'return',
                'errọr': 'error',
                'respọnse': 'response',
                'stạtus': 'status',
                'mẹssage': 'message',
                'daṭa': 'data',
                'pạrams': 'params',
                'heạders': 'headers',
                'imanges': 'images',
                'lẹngth': 'length',
                'tọLocaleString': 'toLocaleString',
                'inclụdes': 'includes',
                'fẹtch': 'fetch',
                'wịndow': 'window',
                'lọcation': 'location',
                'reloạd': 'reload',
                'jsọn': 'json',
                'pạrse': 'parse',
                'axiọs': 'axios',
                'awạit': 'await',
                'asyṇc': 'async',
                'ọffset': 'offset',
                'lọc': 'log',
            };
            
            for (let key in corruptedMap) {
                // Case insensitive replacement for these definite corruptions
                let regex = new RegExp(key, 'gi');
                content = content.replace(regex, (match) => {
                    // Try to preserve case if it's all upper or capitalized
                    if (match === match.toUpperCase()) return corruptedMap[key].toUpperCase();
                    if (match[0] === match[0].toUpperCase()) return corruptedMap[key][0].toUpperCase() + corruptedMap[key].slice(1);
                    return corruptedMap[key];
                });
            }
            
            if (content !== originalContent) {
                console.log(`Phase 1 fixed: ${filePath}`);
                fs.writeFileSync(filePath, content, 'utf8');
            }
        } catch (e) {
            console.error(`Error processing ${filePath}: ${e.message}`);
        }
    }
});
