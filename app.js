'use strict';
const $ = id => document.getElementById(id);
const COMMON = ['password','passw0rd','admin','welcome','letmein','qwerty','azerty','abc123','iloveyou','monkey','dragon','master','login','football','shadow','sunshine','princess','trustno1','superman','whatever','freedom','hello','secret','starwars','charlie','internet','pharaoh','egypt','cairo','ahmed','mohamed','mohammed','allah','habibi','123456','12345678','123456789','1q2w3e','qazwsx','000000','111111','654321','666666','pass','user','test','guest','default','root'];
const WALKS = ['qwertyuiop','asdfghjkl','zxcvbnm','1234567890','0987654321','qazwsxedc','1qaz2wsx','azertyuiop','poiuytrewq','lkjhgfdsa','mnbvcxz'];
const LEET = {'@':'a','4':'a','8':'b','3':'e','6':'g','1':'l','!':'i','0':'o','$':'s','5':'s','7':'t','+':'t','2':'z'};
const RATE = 1e11; // guesses per second, offline attacker with GPUs

function unleet(s){ return s.split('').map(c => LEET[c] || c).join(''); }
function poolSize(s){
  let p = 0;
  if (/[a-z]/.test(s)) p += 26;
  if (/[A-Z]/.test(s)) p += 26;
  if (/[0-9]/.test(s)) p += 10;
  if (/[^A-Za-z0-9]/.test(s)) p += 33;
  if (/[^\u0000-\u007f]/.test(s)) p += 64;
  return Math.max(p, 1);
}
function analyze(pw){
  const issues = [];
  const low = pw.toLowerCase();
  let penalty = 0; // bits removed from the naive estimate
  const naive = pw.length * Math.log2(poolSize(pw));
  const base = unleet(low);
  for (const w of COMMON){
    if (low.includes(w) || base.includes(w)){
      const share = w.length / pw.length;
      penalty += naive * Math.min(0.85, share + 0.2);
      issues.push({lvl:'bad', t:`تحتوي على كلمة شائعة: ${w}`});
      break;
    }
  }
  const walkHit = WALKS.some(w => { for (let i = 0; i + 4 <= w.length; i++){ if (low.includes(w.slice(i, i + 4))) return true; } return false; });
  if (walkHit){ penalty += 10 + Math.max(0, pw.length - 8) * 0.6; issues.push({lvl:'bad', t:'تحتوي على تسلسل لوحة مفاتيح متوقع'}); }
  if (/(.)\1{2,}/.test(pw)){ penalty += 6; issues.push({lvl:'warn', t:'تكرار متتابع للحرف نفسه'}); }
  if (/(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef)/i.test(pw)){ penalty += 8; issues.push({lvl:'bad', t:'أرقام أو حروف متتابعة'}); }
  if (/(19[5-9]\d|20[0-4]\d)/.test(pw)){ penalty += 6; issues.push({lvl:'warn', t:'تحتوي على سنة، وهي من أول ما يجرّبه المهاجم'}); }
  if (/^[A-Za-z]+\d{1,4}[!@#$%^&*]?$/.test(pw)){ penalty += 8; issues.push({lvl:'warn', t:'نمط «كلمة + أرقام» شائع جدًا'}); }
  if (/^[a-z]+$/.test(pw) || /^[0-9]+$/.test(pw)) issues.push({lvl:'warn', t:'نوع واحد من الرموز فقط'});
  if (pw.length < 12) issues.push({lvl:'warn', t:'أقل من 12 حرفًا. الطول أهم عامل في القوة'});
  const uniq = new Set(pw).size;
  if (pw.length > 4 && uniq / pw.length < 0.5){ penalty += 6; issues.push({lvl:'warn', t:'قليلة التنوع: حروف كثيرة مكررة'}); }
  const bits = Math.max(0, naive - penalty);
  return {bits, issues};
}
function fmtTime(bits){
  const s = Math.pow(2, bits) / RATE / 2;
  if (s < 1) return 'أقل من ثانية';
  const u = [[60,'ثانية'],[60,'دقيقة'],[24,'ساعة'],[365,'يوم'],[100,'سنة'],[10,'قرن']];
  let v = s, name = 'ثانية';
  const names = ['ثانية','دقيقة','ساعة','يوم','سنة','قرن'];
  let i = 0;
  while (i < u.length - 1 && v >= u[i][0]){ v /= u[i][0]; i++; name = names[i]; }
  if (v > 1e6) return 'أكثر من مليون ' + name;
  return Math.round(v).toLocaleString('ar-EG') + ' ' + name;
}
function level(bits){
  if (bits < 28) return ['ضعيفة جدًا','#ef5b5b',12];
  if (bits < 40) return ['ضعيفة','#ef8a5b',30];
  if (bits < 60) return ['متوسطة','#f0b429',55];
  if (bits < 80) return ['قوية','#9bd35a',80];
  return ['قوية جدًا','#4cc38a',100];
}
function render(){
  const pw = $('pw').value;
  const ul = $('issues'); ul.textContent = '';
  if (!pw){ $('verdict').textContent = 'ابدأ بالكتابة'; $('bar').style.width = '0'; $('ent').textContent = '0 بت'; $('crack').textContent = '-'; $('len').textContent = '0'; return; }
  const r = pw === lastGen ? {bits: GEN_BITS, issues: []} : analyze(pw);
  const [name, color, pct] = level(r.bits);
  $('verdict').textContent = name; $('verdict').style.color = color;
  $('bar').style.width = pct + '%'; $('bar').style.background = color;
  $('ent').textContent = Math.round(r.bits) + ' بت';
  $('crack').textContent = fmtTime(r.bits);
  $('len').textContent = pw.length;
  const items = r.issues.length ? r.issues : [{lvl:'ok', t:'لا توجد أنماط ضعيفة معروفة'}];
  for (const it of items){
    const li = document.createElement('li'); li.className = it.lvl;
    const tag = document.createElement('span'); tag.className = 'tag ' + it.lvl;
    tag.textContent = it.lvl === 'bad' ? 'خطر' : it.lvl === 'warn' ? 'تنبيه' : 'جيد';
    li.append(tag, document.createTextNode(it.t)); ul.append(li);
  }
}
function rnd(n){ const a = new Uint32Array(1); const max = Math.floor(0xffffffff / n) * n; let x; do { crypto.getRandomValues(a); x = a[0]; } while (x >= max); return x % n; }
const SYL = ['ka','ra','mo','ne','ti','su','lo','be','fa','zi','hu','da','pe','wa','jo','ni','ta','ro','se','ma','ke','li','bo','ru'];
let lastGen = '';
// 6 words x 3 syllables from 24 syllables, plus a 2-digit number and one symbol: exact entropy is known.
const GEN_BITS = 6 * 3 * Math.log2(SYL.length) + Math.log2(90) + Math.log2(6);
function genPhrase(){
  const words = [];
  for (let i = 0; i < 6; i++){ let w = ''; for (let j = 0; j < 3; j++) w += SYL[rnd(SYL.length)]; words.push(w[0].toUpperCase() + w.slice(1)); }
  return words.join('-') + '-' + (10 + rnd(90)) + '!#$%&*'[rnd(6)];
}
$('pw').addEventListener('input', render);
$('tog').addEventListener('click', () => { const h = $('pw').type === 'password'; $('pw').type = h ? 'text' : 'password'; $('tog').textContent = h ? 'إخفاء' : 'إظهار'; });
$('gen').addEventListener('click', () => { const p = genPhrase(); lastGen = p; $('out').textContent = p; $('genbox').hidden = false; $('pw').value = p; $('pw').type = 'text'; $('tog').textContent = 'إخفاء'; render(); });
$('copy').addEventListener('click', () => { navigator.clipboard && navigator.clipboard.writeText($('out').textContent).then(() => { $('copy').textContent = 'تم النسخ'; setTimeout(() => $('copy').textContent = 'نسخ', 1500); }); });
render();
