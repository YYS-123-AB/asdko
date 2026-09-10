import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categories = ['politics', 'military', 'tech', 'culture', 'sports', 'economy', 'birth', 'death', 'disaster', 'society'];
const categoryNames = {
  politics: '政治', military: '军事', tech: '科技', culture: '文化',
  sports: '体育', economy: '经济', birth: '名人诞辰', death: '名人逝世',
  disaster: '重大灾害', society: '社会事件'
};

const personFirstNames = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧'];
const personLastNames = ['渊', '世民', '隆基', '白', '甫', '轼', '辙', '安石', '居正', '斯', '中山', '介石', '泽东', '恩来', '小平', '稼先', '学森', '景润', '罗敷', '昭君', '玉环', '清照', '则天', '弃疾', '游', '飞', '羽', '备', '操', '权'];

const eventTitleTemplates = {
  politics: [
    '{}年{}国{}登基称帝',
    '{}政府正式成立',
    '{}宣布独立建国',
    '{}国与{}国建立外交关系',
    '{}宪法正式颁布实施',
    '{}总统选举结果揭晓',
    '{}国迁都至{}',
    '{}联盟正式成立',
    '{}签署和平协议',
    '{}届国会召开首次会议',
    '{}国宣布废除奴隶制度',
    '{}实行改革开放重大政策',
    '{}地区举行全民公投',
    '{}国恢复行使主权',
    '{}政党在全国大选中获胜',
    '{}政府改组内阁成员',
    '{}国与{}国断绝外交关系',
    '{}新经济政策正式出台',
    '{}国签署{}国际条约',
    '{}届联合国大会隆重开幕'
  ],
  military: [
    '{}战役正式打响',
    '{}国对{}国宣战',
    '{}将军率军攻克{}',
    '{}战争全面爆发',
    '{}签订停战协定',
    '{}武装起义爆发',
    '{}国入侵{}地区',
    '{}大海战爆发',
    '{}无条件投降',
    '{}军事政变发生',
    '{}革命军誓师北伐',
    '{}保卫战历时{}天',
    '{}国进行地下核试验',
    '{}军事政变推翻政府',
    '{}国宣布裁军{}万',
    '{}多国联合军演开始',
    '{}地区武装冲突升级',
    '{}特种部队突袭成功',
    '{}新型武器首次实战',
    '{}国独立战争取得胜利'
  ],
  tech: [
    '{}发明{}获得专利',
    '{}实验室成功合成{}',
    '{}人造卫星成功发射',
    '{}首次实现载人航天飞行',
    '{}超级计算机研制成功',
    '{}计算机网络全球连通',
    '{}团队完成{}基因测序',
    '{}号探测器成功登陆{}',
    '{}实现核聚变重大突破',
    '{}公司发布{}新产品',
    '{}发明实用蒸汽机',
    '{}发现{}物理定律',
    '{}创立{}科学学说',
    '{}成功分离出{}元素',
    '{}建立{}数学理论',
    '{}号飞机首飞获得成功',
    '{}研制成功青霉素',
    '{}发明半导体晶体管',
    '{}首台个人电脑问世',
    '{}实现量子通信突破'
  ],
  culture: [
    '{}的文学名著《{}》正式出版',
    '{}画作《{}》创作完成',
    '{}诞辰{}周年全球纪念',
    '{}奥林匹克运动会隆重开幕',
    '{}世界博览会盛大开幕',
    '{}国际电影节首次举办',
    '{}入选世界文化遗产名录',
    '{}歌剧首演轰动全城',
    '{}荣获诺贝尔文学奖',
    '{}诗集《{}》正式问世',
    '{}先生创办{}大学',
    '{}国家级博物馆正式开馆',
    '{}语言被列为官方语言',
    '{}举办万国博览会',
    '{}雕塑《{}》正式揭幕',
    '{}电影节颁奖典礼举行',
    '{}创立{}学术流派',
    '{}史书《{}》编纂完成',
    '{}荣获奥斯卡最佳影片',
    '{}建成通车世界瞩目'
  ],
  sports: [
    '{}年夏季奥运会盛大开幕',
    '{}队勇夺世界杯足球冠军',
    '{}打破田径世界纪录',
    '{}获得{}项目奥运金牌',
    '{}网球公开赛{}夺冠',
    '{}NBA总决赛{}夺冠',
    '{}马拉松赛创历史最佳',
    '{}届亚洲运动会开幕',
    '{}正式宣布退役',
    '{}创立{}运动项目',
    '{}首次举办国际赛事',
    '{}获得网球大满贯',
    '{}拳击世纪大战{}胜',
    '{}F1大奖赛{}夺冠',
    '{}高尔夫大师赛夺冠',
    '{}游泳锦标赛{}枚金牌',
    '{}体操全能冠军诞生',
    '{}乒乓球世锦赛包揽全部金牌',
    '{}羽毛球世锦赛夺冠军',
    '{}电竞世界赛{}战队夺冠'
  ],
  economy: [
    '{}国GDP突破{}万亿美元',
    '{}证券交易所正式成立',
    '{}新货币开始正式流通',
    '{}国正式加入世界贸易组织',
    '{}全球金融危机爆发',
    '{}公司上市市值破{}亿',
    '{}自贸协定正式签署',
    '{}通胀率创历史新高',
    '{}央行宣布大幅降息',
    '{}自由贸易试验区设立',
    '{}高速铁路全线开工建设',
    '{}国际油价创历史新高',
    '{}国推出{}万亿刺激计划',
    '{}宣布本币大幅贬值',
    '{}公司并购{}公司',
    '{}股市暴跌创纪录',
    '{}房地产泡沫破裂',
    '{}国申请加入经济联盟',
    '{}新能源投资超{}亿元',
    '{}电商单日交易额破{}亿'
  ],
  birth: [
    '{}出生于{}一个普通家庭',
    '伟大思想家{}诞生于{}',
    '著名科学家{}在{}出生',
    '伟大政治家{}诞辰纪念日',
    '艺术大师{}来到人间',
    '文学巨匠{}降生人世',
    '音乐天才{}出生',
    '伟大发明家{}诞生',
    '体育巨星{}出生于{}',
    '商业大亨{}降生{}',
    '哲学泰斗{}诞生',
    '著名教育家{}出生',
    '杰出军事家{}诞辰',
    '知名医学家{}降生{}',
    '数学大师{}出生于{}',
    '物理巨匠{}诞生',
    '化学泰斗{}降生',
    '天文大师{}出生',
    '建筑大师{}诞生于{}',
    '设计奇才{}来到世上'
  ],
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

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePerson() {
  const name = randomItem(personFirstNames) + randomItem(personLastNames);
  const birthYear = random(-500, 1950);
  const deathYear = birthYear + random(30, 90);
  const introTemplates = [
    '中国古代著名{}家，{}学派代表人物，著有《{}》等作品。',
    '{}时期杰出的{}家，在{}领域有重要贡献。',
    '历史上著名的{}，一生致力于{}事业。',
    '被誉为\"{}\"的{}代{}家。',
    '{}出身的著名{}，影响深远。'
  ];
  const domains = ['思想', '文学', '军事', '政治', '科学', '医学', '教育', '艺术', '哲学', '历史'];
  const intro = introTemplates[random(0, introTemplates.length - 1)]
    .replace('{}', randomItem(domains))
    .replace('{}', randomItem(['儒家', '道家', '法家', '墨家', '名家', '纵横家', '阴阳家', '农家', '杂家']))
    .replace('{}', randomItem(commonNouns))
    .replace('{}', randomItem(['春秋', '战国', '秦朝', '汉朝', '唐朝', '宋朝', '元朝', '明朝', '清朝', '近代']))
    .replace('{}', randomItem(domains))
    .replace('{}', randomItem(commonNouns))
    .replace('{}', randomItem(['思想家', '军事家', '政治家', '文学家', '科学家']))
    .replace('{}', randomItem(commonNouns))
    .replace('{}', randomItem(['至圣先师', '诗仙', '诗圣', '词中之帝', '书圣', '画圣', '医圣', '茶圣', '武圣']))
    .replace('{}', randomItem(['古', '汉', '唐', '宋', '明', '清', '近']))
    .replace('{}', randomItem(domains))
    .replace('{}', randomItem(['寒门', '士族', '皇族', '书香门第', '平民']))
    .replace('{}', randomItem(domains));
  return {
    name,
    avatar: '',
    birthYear: Math.abs(birthYear),
    birthIsBC: birthYear < 0,
    deathYear: Math.max(1, deathYear),
    deathIsBC: deathYear < 0,
    intro
  };
}

function generateImpact() {
  const impacts = [
    '推动了{}领域的快速发展。',
    '改变了{}历史的进程。',
    '为后世{}发展奠定重要基础。',
    '对整个{}产生了极其深远的影响。',
    '标志着{}进入了一个新时代。',
    '促进了{}与{}的交流与融合。',
    '加速了{}的发展进程。',
    '成为了{}史上的重要转折点。',
    '极大提升了{}的综合实力。',
    '使{}成为世界{}的中心。'
  ];
  const count = random(2, 4);
  const result = [];
  const pools = [...countryNames, ...placeNames, ...commonNouns, '世界', '人类社会', '科学技术', '人类文明', '社会进步', '经济发展', '文化繁荣', '政治格局', '军事力量'];
  for (let i = 0; i < count; i++) {
    let imp = impacts[random(0, impacts.length - 1)];
    while (imp.includes('{}')) {
      imp = imp.replace('{}', randomItem(pools));
    }
    result.push(imp);
  }
  return result;
}

function generateHistoricalMeaning(category) {
  const templates = [
    '这一事件标志着{}历史上{}的开端，具有里程碑式的意义。',
    '该事件深刻影响了后来{}的发展方向，成为研究{}的重要课题。',
    '作为{}的标志性事件，承载着丰富的历史内涵。',
    '这一创举不仅改变了{}的格局，也为人类{}进步做出巨大贡献。',
    '该事件反映了当时{}的社会状况，是研究{}的珍贵史料。'
  ];
  const pools = [...countryNames, categoryNames[category] ? [categoryNames[category]] : ['文化'], '世界', '人类', '科学', '文明', '社会', '经济', '文化', '政治', '军事', '中国', '世界', '近代', '古代', '现代'];
  let result = templates[random(0, templates.length - 1)];
  while (result.includes('{}')) {
    result = result.replace('{}', randomItem(pools));
  }
  return result;
}

function fillTitle(template, category) {
  const pools = category === 'birth' || category === 'death'
    ? [...personNames, ...(function(){ const arr=[]; for(let k=0;k<50;k++) arr.push(randomItem(personFirstNames)+randomItem(personLastNames)); return arr;})(), ...countryNames, ...placeNames]
    : [...countryNames, ...placeNames, ...personNames, ...commonNouns, String(random(1,300)), String(random(1,20000))];
  let result = template;
  while (result.includes('{}')) {
    result = result.replace('{}', randomItem(pools));
  }
  return result;
}

function fillSummary(template, title) {
  const pools = [...countryNames, ...placeNames, ...personNames, ...commonNouns, title, '全世界', '全国', '数年', '数月', '数周', '政治', '军事', '经济', '文化', '社会'];
  let result = template;
  while (result.includes('{}')) {
    result = result.replace('{}', randomItem(pools));
  }
  return result;
}

const events = [];
let idCounter = 1;

for (let month = 1; month <= 12; month++) {
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  for (let day = 1; day <= daysInMonth; day++) {
    const numEvents = random(5, 7);
    for (let i = 0; i < numEvents; i++) {
      let category;
      if (i < categories.length) {
        category = categories[i % categories.length];
      } else {
        category = randomItem(categories);
      }
      const isBC = Math.random() < 0.18;
      const year = isBC ? random(1, 2000) : random(1, 2024);
      const templates = eventTitleTemplates[category];
      const title = fillTitle(templates[random(0, templates.length - 1)], category);
      const summaryTemplates = [
        '这一天发生了震惊{}的{}事件。{}等多位重要人物参与其中，最终以{}告终。',
        '{}事件，是{}历史上极为重要的一页。它发生在{}地区，造成了深远影响。',
        '历史上的今天，{}。这一事件持续了{}之久，涉及多方势力参与。',
        '{}的发生，彻底改变了{}的走向。历史学者认为是时代的必然。',
        '值得永远铭记：{}。它不仅影响了当时的{}格局，余波至今未息。'
      ];
      const summary = fillSummary(summaryTemplates[random(0, summaryTemplates.length - 1)], title);
      const content = `【事件背景】\n${summary}\n\n【详细经过】\n${summary}相关的各方势力在${randomItem(placeNames)}展开了复杂的博弈。${randomItem(personNames)}作为主要推动者，在${random(1, 30)}天内完成了关键步骤。期间经历了${random(2, 5)}次重要转折，包括${randomItem(commonNouns)}方面的介入和${randomItem(placeNames)}方面的态度转变。\n\n【最终结果】\n事件最终以${randomItem(['和平解决', '军事胜利', '政治妥协', '技术突破', '文化繁荣'])}告终，直接影响了${random(1000, 100000000).toLocaleString()}人的生活方式。`;
      const personsCount = category === 'birth' || category === 'death' ? random(1, 3) : random(0, 4);
      const persons = [];
      for (let p = 0; p < personsCount; p++) {
        persons.push(generatePerson());
      }
      const tagsCount = random(2, 5);
      const tagPool = [...Object.values(categoryNames), ...commonNouns.slice(0, 30), ...placeNames.slice(0, 20), '重要', '历史', '里程碑', '转折', '改革', '革命', '创新', '突破', '经典', '传奇'];
      const tags = [];
      const usedTags = new Set();
      while (tags.length < tagsCount) {
        const t = randomItem(tagPool);
        if (!usedTags.has(t)) {
          tags.push(t);
          usedTags.add(t);
        }
      }
      const importance = random(1, 5);
      const relatedIds = [];
      const relCount = random(0, 3);
      for (let r = 0; r < relCount; r++) {
        const rid = random(1, Math.max(1, idCounter - 1));
        if (!relatedIds.includes(rid)) relatedIds.push(rid);
      }
      events.push({
        id: idCounter++,
        month,
        day,
        year,
        isBC,
        title,
        category,
        persons,
        location: randomItem(placeNames),
        importance,
        image: '',
        summary,
        content,
        impact: generateImpact(),
        historicalMeaning: generateHistoricalMeaning(category),
        relatedIds,
        sourceUrl: Math.random() > 0.5 ? `https://zh.wikipedia.org/wiki/${encodeURIComponent(title.slice(0, Math.min(20, title.length)))}` : '',
        tags,
        isBirthday: category === 'birth',
        isAnniversary: category !== 'birth' && category !== 'death' && Math.random() > 0.7
      });
    }
  }
}

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'data.json'), JSON.stringify(events), 'utf8');
console.log('生成事件总数:', events.length);
console.log('写入完成');
