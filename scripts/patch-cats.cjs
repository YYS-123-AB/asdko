const fs = require('fs');
const path = require('path');

const categories = ['politics', 'military', 'tech', 'culture', 'sports', 'economy', 'birth', 'death', 'disaster', 'society'];
const categoryNames = {
  politics: '政治', military: '军事', tech: '科技', culture: '文化',
  sports: '体育', economy: '经济', birth: '名人诞辰', death: '名人逝世',
  disaster: '重大灾害', society: '社会事件'
};
const personFirstNames = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧'];
const personLastNames = ['渊', '世民', '隆基', '白', '甫', '轼', '辙', '安石', '居正', '斯', '中山', '介石', '泽东', '恩来', '小平', '稼先', '学森', '景润', '罗敷', '昭君', '玉环', '清照', '则天', '弃疾', '游', '飞', '羽', '备', '操', '权'];
const eventTitleTemplates = {
  death: [
    '{}在{}因病逝世享年{}岁',
    '一代伟人{}与世长辞',
    '{}国前总统{}病逝家中',
    '著名科学家{}不幸去世',
    '文学巨匠{}辞世享年{}岁',
    '艺术大师{}在{}去世',
    '开国元勋{}永远离开我们',
    '民族英雄{}壮烈牺牲',
    '革命先驱{}因病去世',
    '体坛传奇{}永远离开了我们',
    '商界富豪{}去世留下遗产{}亿',
    '哲学大师{}在{}逝世',
    '教育家{}辞世桃李满天下',
    '医学专家{}因病不幸逝世',
    '人民艺术家{}永远活在心中',
    '将军{}在{}病逝',
    '爱国诗人{}与世长辞',
    '音乐泰斗{}撒手人寰',
    '建筑大师{}在{}去世',
    '慈善家{}辞世捐全部财产'
  ],
  disaster: [
    '{}发生里氏{}级特大地震',
    '{}超强台风袭击{}',
    '{}爆发百年一遇大洪水',
    '{}地区遭遇罕见特大旱灾',
    '{}超级火山大爆发',
    '{}巨大海啸席卷沿岸',
    '{}国爆发大规模传染病',
    '{}发生重大煤矿爆炸事故',
    '{}重大空难全部遇难',
    '{}豪华邮轮沉没失踪',
    '{}特大森林火灾蔓延',
    '{}发生连环大爆炸',
    '{}重大恐怖袭击事件',
    '{}核电站泄漏事故',
    '{}化工厂爆炸污染严重',
    '{}特大山体滑坡',
    '{}泥石流灾害损失惨重',
    '{}暴雪灾害冻死数百人',
    '{}蝗灾席卷{}省庄稼绝收',
    '{}大饥荒席卷多国'
  ],
  society: [
    '{}国总人口突破{}亿大关',
    '{}法律正式生效实施',
    '{}宣布废除{}旧制度',
    '{}同性婚姻正式合法化',
    '{}国实行全民免费医疗',
    '{}成为首个禁止{}国家',
    '{}大学招生突破{}万人',
    '{}国人均寿命达{}岁',
    '{}确定{}为法定节假日',
    '{}市地铁系统正式运营',
    '{}全民公投通过{}法案',
    '{}国文盲率降至历史新低',
    '{}举办国际峰会多国参加',
    '{}社会福利全面改革',
    '{}开展全国扫盲运动',
    '{}实现义务教育全覆盖',
    '{}网民数量突破{}亿',
    '{}市人口突破{}千万',
    '{}国女性获得选举权',
    '{}新劳动法保护工人权益'
  ]
};
const placeNames = ['北京', '上海', '广州', '深圳', '西安', '南京', '洛阳', '开封', '杭州', '成都', '武汉', '长沙', '郑州', '济南', '沈阳', '哈尔滨', '长春', '石家庄', '太原', '合肥', '南昌', '福州', '厦门', '昆明', '贵阳', '拉萨', '兰州', '西宁', '银川', '乌鲁木齐', '香港', '澳门', '台北', '东京', '首尔', '新加坡', '纽约', '伦敦', '巴黎', '柏林', '莫斯科', '华盛顿', '悉尼', '罗马', '雅典', '开罗', '新德里', '曼谷', '吉隆坡', '迪拜'];
const countryNames = ['中国', '美国', '俄罗斯', '英国', '法国', '德国', '日本', '印度', '巴西', '加拿大', '澳大利亚', '意大利', '西班牙', '韩国', '墨西哥', '南非', '埃及', '土耳其', '伊朗', '沙特阿拉伯', '阿根廷', '荷兰', '瑞士', '瑞典', '挪威', '丹麦', '芬兰', '波兰', '泰国', '越南'];
const commonNouns = ['蒸汽机', '电灯', '电话', '飞机', '汽车', '火车', '轮船', '计算机', '互联网', '人工智能', '量子力学', '相对论', '进化论', '万有引力', '电磁感应', '核裂变', '核聚变', '基因工程', '细胞学说', '航天技术', '红楼梦', '西游记', '三国演义', '水浒传', '本草纲目', '史记', '资治通鉴', '论语', '道德经', '诗经', '蒙娜丽莎', '最后的晚餐', '向日葵', '星月夜', '呐喊', '思想者', '自由女神像', '埃菲尔铁塔', '万里长城', '故宫博物院', '悉尼歌剧院', '泰坦尼克号', '阿波罗计划', '神舟飞船', '北斗导航', '天宫空间站', '蛟龙号', '天眼FAST', '墨子号量子卫星', '嫦娥探月'];
const personNames = ['孔子', '孟子', '老子', '庄子', '荀子', '韩非子', '墨子', '孙子', '屈原', '司马迁', '李白', '杜甫', '白居易', '苏轼', '辛弃疾', '李清照', '关汉卿', '曹雪芹', '罗贯中', '施耐庵', '吴承恩', '李时珍', '张衡', '祖冲之', '蔡伦', '毕昇', '华佗', '张仲景', '孙思邈', '鲁班', '秦始皇', '汉武帝', '唐太宗', '宋太祖', '成吉思汗', '康熙皇帝', '乾隆皇帝', '孙中山', '毛泽东', '周恩来', '邓小平', '鲁迅', '郭沫若', '茅盾', '巴金', '老舍', '曹禺', '钱学森', '邓稼先', '华罗庚'];

function random(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function fillTitle(template, category) {
  const pools = category === 'death'
    ? [...personNames, ...(function(){ const arr=[]; for(let k=0;k<50;k++) arr.push(randomItem(personFirstNames)+randomItem(personLastNames)); return arr;})(), ...countryNames, ...placeNames]
    : [...countryNames, ...placeNames, ...personNames, ...commonNouns, String(random(1,300)), String(random(1,20000))];
  let result = template;
  while (result.includes('{}')) result = result.replace('{}', randomItem(pools));
  return result;
}
function generatePerson() {
  const name = randomItem(personFirstNames) + randomItem(personLastNames);
  const birthYear = random(-500, 1950);
  const deathYear = birthYear + random(30, 90);
  const domains = ['思想', '文学', '军事', '政治', '科学', '医学', '教育', '艺术', '哲学', '历史'];
  return {
    name, avatar: '',
    birthYear: Math.abs(birthYear), birthIsBC: birthYear < 0,
    deathYear: Math.max(1, deathYear), deathIsBC: deathYear < 0,
    intro: `${randomItem(domains)}家，${randomItem(['春秋','战国','秦','汉','唐','宋','元','明','清','近代'])}时期人。`
  };
}
function generateImpact() {
  const impacts = [
    '推动了{}领域的快速发展。',
    '改变了{}历史的进程。',
    '为后世{}发展奠定重要基础。',
    '对整个{}产生了极其深远的影响。',
    '标志着{}进入了一个新时代。'
  ];
  const pools = [...countryNames, ...placeNames, ...commonNouns, '世界', '人类社会', '科学技术', '人类文明', '社会进步', '经济发展', '文化繁荣', '政治格局'];
  const count = random(2, 4);
  const result = [];
  for (let i = 0; i < count; i++) {
    let imp = impacts[random(0, impacts.length - 1)];
    while (imp.includes('{}')) imp = imp.replace('{}', randomItem(pools));
    result.push(imp);
  }
  return result;
}
function generateHistoricalMeaning(category) {
  const templates = [
    '这一事件标志着{}历史上{}的开端，具有里程碑式的意义。',
    '该事件深刻影响了后来{}的发展方向，成为研究{}的重要课题。',
    '作为{}的标志性事件，承载着丰富的历史内涵。'
  ];
  const pools = [...countryNames, [categoryNames[category]].flat(), '世界', '人类', '科学', '文明', '社会', '经济', '文化', '政治', '军事', '中国', '世界', '近代', '古代', '现代'];
  let result = templates[random(0, templates.length - 1)];
  while (result.includes('{}')) result = result.replace('{}', randomItem(pools));
  return result;
}

const INPUT_PATH = path.join(__dirname, '..', 'data', 'data.json');
const data = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));
let idCounter = Math.max(...data.map(e => e.id)) + 1;

const missingCats = ['death', 'disaster', 'society'];
console.log('当前数据量:', data.length);

const monthCatCount = {};
for (let m = 1; m <= 12; m++) {
  const d = [31,29,31,30,31,30,31,31,30,31,30,31][m-1];
  monthCatCount[m] = {};
  missingCats.forEach(c => monthCatCount[m][c] = Array(d + 1).fill(0));
}
data.forEach(e => {
  if (missingCats.includes(e.category)) {
    monthCatCount[e.month][e.category][e.day]++;
  }
});

const TARGET_PER_MONTH_DAY_CAT = 1;
const addedByCat = { death: 0, disaster: 0, society: 0 };

for (let month = 1; month <= 12; month++) {
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  for (let day = 1; day <= daysInMonth; day++) {
    missingCats.forEach(cat => {
      const current = monthCatCount[month][cat][day];
      const need = Math.max(0, TARGET_PER_MONTH_DAY_CAT - current);
      for (let i = 0; i < need; i++) {
        const isBC = Math.random() < 0.12;
        const year = isBC ? random(1, 2000) : random(1, 2024);
        const templates = eventTitleTemplates[cat];
        const title = fillTitle(templates[random(0, templates.length - 1)], cat);
        const summary = `${randomItem(placeNames)}发生的${title}，让${randomItem(countryNames)}陷入了沉思。`;
        const content = `【事件背景】\n${summary}\n\n【详细经过】\n${title}事件在${randomItem(placeNames)}引发广泛关注。\n\n【最终结果】\n事件最终以${randomItem(['和平解决', '人员获救', '灾后重建', '社会反思', '改革推动'])}告终。`;
        const personsCount = cat === 'death' ? random(1, 3) : random(0, 3);
        const persons = [];
        for (let p = 0; p < personsCount; p++) persons.push(generatePerson());
        const tagsCount = random(2, 5);
        const tagPool = [...Object.values(categoryNames), ...commonNouns.slice(0, 30), '重要', '历史', '里程碑', '转折', '改革', '纪念'];
        const tags = [];
        const usedTags = new Set();
        while (tags.length < tagsCount) {
          const t = randomItem(tagPool);
          if (!usedTags.has(t)) { tags.push(t); usedTags.add(t); }
        }
        const importance = random(1, 5);
        const relatedIds = [];
        const relCount = random(0, 2);
        for (let r = 0; r < relCount; r++) {
          const rid = random(1, idCounter - 1);
          if (!relatedIds.includes(rid)) relatedIds.push(rid);
        }
        data.push({
          id: idCounter++,
          month, day, year, isBC, title, category: cat, persons,
          location: randomItem(placeNames), importance, image: '', summary, content,
          impact: generateImpact(), historicalMeaning: generateHistoricalMeaning(cat),
          relatedIds, sourceUrl: '', tags,
          isBirthday: cat === 'birth', isAnniversary: cat !== 'birth' && cat !== 'death' && Math.random() > 0.7
        });
        addedByCat[cat]++;
      }
    });
  }
}

console.log('补充后数据量:', data.length);
console.log('新增分类数据量:', addedByCat);

const byCat = {};
data.forEach(e => { if (!byCat[e.category]) byCat[e.category] = 0; byCat[e.category]++; });
console.log('\n最终分类统计:');
Object.entries(byCat).forEach(([k, v]) => console.log('  ', k, ':', v, '条'));

fs.writeFileSync(INPUT_PATH, JSON.stringify(data), 'utf8');
console.log('\n已保存到:', INPUT_PATH);
