const fs = require('fs');

const path = 'src/actions/auth.ts';
let code = fs.readFileSync(path, 'utf8');

// Match simple ones returning json data:
// if (!res.ok) { ... extractErrorMessage(..., "Default error") }; } ... json = await res.json(); return { success: true, data: json..., error: null };
code = code.replace(/if \(!res\.ok\) \{[\s\S]*?extractErrorMessage\([a-zA-Z]+(?:Json)?,\s*("[^"]+")\)[\s\S]*?\}\s*const json = await res\.json\(\);\s*return \{ success: true, data: [^\}]+, error: null \};/g, 
  (match, msg) => `return await handleApiResponse(res, ${msg});`);

// Match simple ones returning only success: true
// if (!res.ok) { ... extractErrorMessage(..., "Default error") }; } return { success: true, error: null };
code = code.replace(/if \(!res\.ok\) \{[\s\S]*?extractErrorMessage\([a-zA-Z]+(?:Json)?,\s*("[^"]+")\)[\s\S]*?\}\s*return \{ success: true, error: null \};/g, 
  (match, msg) => `const result = await handleApiResponse(res, ${msg});\n    return { success: result.success, error: result.error };`);

// Handle those that don't use extractErrorMessage (like login or registerSendOtp)
// login:
code = code.replace(/if \(!res\.ok\) \{\s*const errJson = await res\.json\(\)\.catch\(\(\) => \(\{\}\)\);\s*return \{ success: false, error: errJson\?\.message \|\| ("[^"]+") \};\s*\}\s*const json = await res\.json\(\);\s*const data = json\.data;/g,
  (match, msg) => `const apiRes = await handleApiResponse(res, ${msg});\n    if (!apiRes.success) return apiRes;\n    const data = apiRes.data;`);

// registerSendOtp and others returning error: errJson?.message || ...
code = code.replace(/if \(!res\.ok\) \{\s*const errJson = await res\.json\(\)\.catch\(\(\) => \(\{\}\)\);\s*return \{ success: false, error: errJson\?\.message \|\| ("[^"]+") \};\s*\}\s*return \{ success: true, error: null \};/g,
  (match, msg) => `const result = await handleApiResponse(res, ${msg});\n    return { success: result.success, error: result.error };`);

// registerVerifyOtp and others returning errJson?.message || ... and data: json.data
code = code.replace(/if \(!res\.ok\) \{\s*const errJson = await res\.json\(\)\.catch\(\(\) => \(\{\}\)\);\s*return \{ success: false, error: errJson\?\.message \|\| ("[^"]+") \};\s*\}\s*const json = await res\.json\(\);\s*return \{ success: true, data: [^\}]+, error: null \};/g,
  (match, msg) => `return await handleApiResponse(res, ${msg});`);

fs.writeFileSync(path, code, 'utf8');
console.log("Refactored auth.ts pass 2");
