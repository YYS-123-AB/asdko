const fs = require('fs');
const path = require('path');

console.log('=== style.css 行数 ===');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
console.log(css.split('\n').length, '行');

console.log('\n=== data.json 验证 ===');
const d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'data.json'), 'utf8'));
console.log('事件总数:', d.length);

const byMD = {};
d.forEach(e => {
  const k = e.month + '-' + e.day;
  if (!byMD[k]) byMD[k] = 0;
  byMD[k]++;
});

console.log('覆盖月日数:', Object.keys(byMD).length, '/366');
console.log('平均每日事件数:', (d.length / 366).toFixed(2));

const minPerDay = Math.min(...Object.values(byMD));
const maxPerDay = Math.max(...Object.values(byMD));
console.log('最少每日事件:', minPerDay, '条');
console.log('最多每日事件:', maxPerDay, '条');

const byCat = {};
d.forEach(e => {
  if (!byCat[e.category]) byCat[e.category] = 0;
  byCat[e.category]++;
});
console.log('\n分类统计:');
Object.entries(byCat).forEach(([k, v]) => {
  console.log('  ', k, ':', v, '条');
});

const hasBC = d.filter(e => e.isBC).length;
console.log('\n公元前事件数:', hasBC);

const hasPersons = d.filter(e => e.persons && e.persons.length > 0).length;
console.log('包含人物的事件:', hasPersons);

const hasImage = d.filter(e => e.image && e.image.length > 0).length;
console.log('包含自定义图片:', hasImage, '（其余使用 picsum 占位图）');

console.log('\n=== app.js 行数 ===');
const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
console.log(app.split('\n').length, '行');

console.log('\n=== index.html 行数 ===');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
console.log(html.split('\n').length, '行');
