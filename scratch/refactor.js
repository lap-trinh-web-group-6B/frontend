const fs = require('fs');

const path = 'src/actions/auth.ts';
let code = fs.readFileSync(path, 'utf8');

const helper = `

async function handleApiResponse(res: Response, defaultErrorMsg: string) {
  let json: any = {};
  try {
    json = await res.json();
  } catch (e) {
    if (!res.ok) return { success: false, error: defaultErrorMsg };
    return { success: true, data: null, error: null };
  }
  
  if (!res.ok || (json.status !== undefined && json.status >= 400)) {
    return { success: false, error: extractErrorMessage(json, defaultErrorMsg) };
  }
  
  return { success: true, data: json.data !== undefined ? json.data : json, error: null };
}
`;

if (!code.includes('async function handleApiResponse')) {
  code = code.replace(/function extractErrorMessage[\s\S]*?return errorMessage;\r?\n\}/, match => match + helper);
}

// 1. Refactor standard endpoints
code = code.replace(/if \(!res\.ok\) \{\s*const err(?:Json)? = await res\.json\(\)\.catch\(\(\) => \(\{\}\)\);\s*return \{ success: false, error: extractErrorMessage\(err(?:Json)?, ("[^"]+")\) \};\s*\}\s*const json = await res\.json\(\);\s*return \{ success: true, data: json(?:\.data)?, error: null \};/g, 
  (match, p1) => `return await handleApiResponse(res, ${p1});`);

// 2. Refactor endpoints returning just { success: true, error: null }
code = code.replace(/if \(!res\.ok\) \{\s*const err(?:Json)? = await res\.json\(\)\.catch\(\(\) => \(\{\}\)\);\s*return \{ success: false, error: extractErrorMessage\(err(?:Json)?, ("[^"]+")\) \};\s*\}\s*return \{ success: true, error: null \};/g, 
  (match, p1) => `const result = await handleApiResponse(res, ${p1});\n    return { success: result.success, error: result.error };`);

// 3. Login specific
code = code.replace(/if \(!res\.ok\) \{\s*const errJson = await res\.json\(\)\.catch\(\(\) => \(\{\}\)\);\s*return \{ success: false, error: extractErrorMessage\(errJson, ("[^"]+")\) \};\s*\}\s*const json = await res\.json\(\);\s*const data = json\.data;/g, 
  (match, p1) => `const apiRes = await handleApiResponse(res, ${p1});\n    if (!apiRes.success) return apiRes;\n    const data = apiRes.data;`);

fs.writeFileSync(path, code, 'utf8');
console.log("Refactored auth.ts");
