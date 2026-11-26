'use strict';
/* 润色打补丁器：node scripts/agent-design/apply-polish.cjs <篇号> <映射.json>
 *
 * 映射形如 { "字段路径": ["原文里的这一段", "换成的这一段"] }。
 * 每条必须在源码里命中且仅命中一次，否则报错退出——宁可失败也不猜。
 * 只做字面替换，不重新序列化 plan 文件，格式保持原样。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const no = process.argv[2];
const mapFile = process.argv[3];
if (!no || !mapFile) throw new Error('用法：node scripts/agent-design/apply-polish.cjs <篇号> <映射.json>');

const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
const file = path.join(ROOT, 'scripts/agent-design/plan-' + no + '.cjs');
let src = fs.readFileSync(file, 'utf8');

/* JS 单引号字符串里出现的转义 */
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

let done = 0;
Object.keys(map).forEach((k) => {
  const [from, to] = map[k];
  const needle = esc(from);
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(no + ' · ' + k + '：命中 ' + n + ' 次（应恰好 1 次）→ ' + from);
  src = src.split(needle).join(esc(to));
  done += 1;
});

fs.writeFileSync(file, src);
console.log(no + '：改了 ' + done + ' 处');
