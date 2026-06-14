const fs = require('fs');
let code = fs.readFileSync('src/actions/auth.ts', 'utf8');
const fn = `

export async function deleteBudget(id: number) {
  try {
    const res = await fetch(\`\${getDomain()}/api/v1/budgets/\${id}\`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    return handleApiResponse(res, 'Không thể xóa ngân sách');
  } catch (e) {
    console.error('Delete Budget Error:', e);
    return { success: false, error: 'Lỗi kết nối' };
  }
}
`;
code = code + fn;
fs.writeFileSync('src/actions/auth.ts', code, 'utf8');
