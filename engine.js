const INI=["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
const VOW=["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
const FIN={0:"k",2:"n",3:"t",5:"l",6:"m",7:"p",99:"ng"};
const TF=[[],[0],[1],[0,9],[2],[2,12],[2,18],[3],[5],[5,0],[5,6],[5,7],[5,9],[5,16],[5,17],[5,18],[6],[7],[7,9],[9],[10],[99],[12],[14],[15],[16],[17],[18]];
const NEUT1={0:0,1:0,15:0,9:3,10:3,12:3,14:3,16:3,18:3,17:7,2:2,3:3,5:5,6:6,7:7,99:99};
const NEUT2={"0,9":0,"2,12":2,"2,18":2,"5,0":0,"5,6":6,"5,7":5,"5,9":5,"5,16":5,"5,17":7,"5,18":5,"7,9":7};
const neut=f=>f.length===0?null:f.length===1?NEUT1[f[0]]:NEUT2[f.join(",")];
const TENSE={0:1,3:4,7:8,9:10,12:13};
function split(w){return [...w].map(c=>{const n=c.charCodeAt(0)-0xAC00;if(n<0||n>11171)return{raw:c};return{l:Math.floor(n/588),v:Math.floor((n%588)/28),f:TF[n%28].slice()}})}
function translit(w){return split(w).map(s=>s.raw?s.raw:INI[s.l]+VOW[s.v]+(s.f.length?FIN[neut(s.f)]:"")).join("-")}
function pronounce(w){
  const S=split(w),rules=new Set();
  for(let i=0;i<S.length;i++){
    const s=S[i],n=S[i+1];
    if(s.raw||!s.f.length||!n||n.raw)continue;
    const last=s.f[s.f.length-1];
    if(n.l===11&&last!==99){
      if(last===18){s.f.pop();rules.add("silent ㅎ")}
      else{let m=s.f.pop();if(s.f.length&&m===9)m=10;
        if((m===3||m===16)&&n.v===20){m=m===3?12:14;rules.add("palatalization (구개음화)")}
        n.l=m;rules.add("liaison (연음)")}
      continue;
    }
    const asp={0:15,3:16,7:17,12:14};
    if(last===18&&asp[n.l]!==undefined){s.f.pop();n.l=asp[n.l];rules.add("aspiration (격음화)");continue}
    let F=neut(s.f);
    if(s.f.length>1||[1,15,9,10,12,14,16,18,17].includes(s.f[0]))rules.add("final consonant simplification (받침)");
    if(n.l===18&&[0,3,7].includes(F)){n.l={0:15,3:16,7:17}[F];F=null;rules.add("aspiration (격음화)")}
    else if([0,3,7].includes(F)&&(n.l===2||n.l===6||n.l===5)){if(n.l===5)n.l=2;F={0:99,3:2,7:6}[F];rules.add("nasalization (비음화)")}
    else if([6,99].includes(F)&&n.l===5){n.l=2;rules.add("ㄹ → ㄴ after nasal")}
    else if((F===2&&n.l===5)||(F===5&&n.l===2)){F=5;n.l=5;rules.add("lateralization (유음화)")}
    else if([0,3,7].includes(F)&&TENSE[n.l]!==undefined){const same=(F===0&&n.l===0)||(F===3&&n.l===3)||(F===7&&n.l===7);n.l=TENSE[n.l];if(same)F=null;rules.add("tensification (경음화)")}
    s.f=F===null?[]:[F];s.done=1;
  }
  let pf="";const text=S.map(s=>{if(s.raw){pf="";return s.raw}let f="";if(s.f.length)f=FIN[s.done?s.f[0]:neut(s.f)];let i=INI[s.l];if(i==="r"&&pf==="l")i="l";pf=f;return i+VOW[s.v]+f}).join("");
  return{text,rules:[...rules]};
}
function analyze(input){
  const words=input.trim().split(/\s+/).filter(Boolean);
  const p=words.map(pronounce);
  return{rom:words.map(translit).join(" "),pron:p.map(x=>x.text).join(" "),rules:[...new Set(p.flatMap(x=>x.rules))]};
}
if(typeof module!=="undefined")module.exports={analyze};
