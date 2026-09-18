/**
 * Aestella Recommendation Intelligence V2.
 * Deterministic, explainable category ranking. No LLM and no photo analysis.
 */
import {
  ageRangeLabels, areaLabels, comfortLabels, concernLabels, intensityLabels, priorityLabels,
  type AgeRangeId, type AreaId, type ComfortId, type ConcernId, type DowntimeId,
  type PriorityId, type QuizAnswers,
} from './quiz';

export const RULES_VERSION = 'v2';
export type ComfortLevel = 'skincare' | 'device' | 'injectable';
export type DowntimeTier = 'none' | 'short' | 'medium' | 'long';
export type TreatmentCategoryId =
  | 'tox' | 'fillers' | 'skin_boosters' | 'biostimulators' | 'lasers' | 'rf'
  | 'ultrasound' | 'microneedling' | 'peels' | 'threads' | 'skincare' | 'at_home_devices';
export type TreatmentCategory = {
  id: TreatmentCategoryId; name: string; overview: string; bestSuitedFor: string;
  comfortLevel: ComfortLevel; downtimeTier: DowntimeTier; costTier: 1|2|3|4;
  downtimeContext: string; costContext: string; longevityContext: string;
};
export const treatmentCategories: Record<TreatmentCategoryId, TreatmentCategory> = {
  tox:{id:'tox',name:'Tox / Neuromodulators',overview:'Injectable treatments that soften the look of dynamic lines caused by repeated muscle movement, such as around the forehead and eyes.',bestSuitedFor:'Forehead lines, crow’s feet, and other lines caused by expression.',comfortLevel:'injectable',downtimeTier:'none',costTier:2,downtimeContext:'Typically no downtime — most people return to normal activity immediately.',costContext:'Commonly $300–$700 per session, depending on area and provider.',longevityContext:'Results typically last 3–4 months.'},
  fillers:{id:'fillers',name:'Fillers',overview:'Injectable treatments used to add volume or soften contours in areas such as the lips, cheeks, or jawline.',bestSuitedFor:'Volume loss, lip shape, and softening contours in the cheeks or jawline.',comfortLevel:'injectable',downtimeTier:'short',costTier:3,downtimeContext:'Some swelling or bruising is common for a few days.',costContext:'Commonly $600–$1,200 per syringe, depending on area and product.',longevityContext:'Results typically last 6–18 months, depending on the area treated.'},
  skin_boosters:{id:'skin_boosters',name:'Skin Boosters',overview:'Injectable hydration treatments aimed at improving skin quality and radiance.',bestSuitedFor:'Under-eye appearance, skin hydration, and overall radiance.',comfortLevel:'injectable',downtimeTier:'none',costTier:2,downtimeContext:'Minimal downtime — light redness or small bumps may settle within a day.',costContext:'Commonly $350–$700 per session.',longevityContext:'Results typically build over a short series and last several months.'},
  biostimulators:{id:'biostimulators',name:'Biostimulators',overview:'Injectable treatments that work gradually to support the skin’s own structure.',bestSuitedFor:'Gradual, overall volume loss across the face.',comfortLevel:'injectable',downtimeTier:'short',costTier:3,downtimeContext:'Mild swelling or tenderness for a few days is common.',costContext:'Commonly $700–$1,500 per session, often in a series.',longevityContext:'Results typically build gradually and last a year or more.'},
  lasers:{id:'lasers',name:'Lasers',overview:'Light-based treatments commonly explored for pigmentation, sun damage, and resurfacing.',bestSuitedFor:'Pigmentation, sun damage, and overall skin resurfacing.',comfortLevel:'device',downtimeTier:'medium',costTier:3,downtimeContext:'Redness or flaking may last several days depending on intensity.',costContext:'Commonly $300–$900 per session.',longevityContext:'Results typically build over a short series of sessions.'},
  rf:{id:'rf',name:'RF (Radiofrequency)',overview:'Device-based treatments that use heat energy, often explored for skin texture and mild firming.',bestSuitedFor:'Skin texture, pores, and mild firming.',comfortLevel:'device',downtimeTier:'short',costTier:3,downtimeContext:'Mild redness or swelling for a few days is common with more intensive devices.',costContext:'Commonly $500–$1,200 per session, often in a series.',longevityContext:'Results typically build gradually over several months.'},
  ultrasound:{id:'ultrasound',name:'Ultrasound',overview:'Non-invasive device treatments commonly explored for skin laxity and gentle lifting.',bestSuitedFor:'Mild-to-moderate skin laxity and gentle lifting.',comfortLevel:'device',downtimeTier:'none',costTier:4,downtimeContext:'Typically no downtime, though mild tenderness may occur.',costContext:'Commonly $1,000–$2,500 per session.',longevityContext:'Results typically build over a few months and can last up to a year.'},
  microneedling:{id:'microneedling',name:'Microneedling',overview:'A device-based treatment commonly explored for texture, pores, and acne scarring.',bestSuitedFor:'Texture, enlarged pores, and acne scarring.',comfortLevel:'device',downtimeTier:'short',costTier:2,downtimeContext:'Redness is common for 1–3 days.',costContext:'Commonly $300–$700 per session, often in a series.',longevityContext:'Results typically build gradually over a series of sessions.'},
  peels:{id:'peels',name:'Peels',overview:'Topical exfoliating treatments commonly explored for pigmentation, texture, and brightness.',bestSuitedFor:'Pigmentation, dullness, and mild texture concerns.',comfortLevel:'device',downtimeTier:'short',costTier:1,downtimeContext:'Flaking or peeling may last several days depending on strength.',costContext:'Commonly $150–$400 per session.',longevityContext:'Results typically build with a regular series of treatments.'},
  threads:{id:'threads',name:'Threads',overview:'A minimally invasive treatment used to support the look of firmer contours.',bestSuitedFor:'Jawline definition and lower-face laxity.',comfortLevel:'injectable',downtimeTier:'medium',costTier:3,downtimeContext:'Mild swelling, tenderness, or pulling sensation may last about a week.',costContext:'Commonly $1,000–$2,500 per session.',longevityContext:'Results typically last around 12–18 months.'},
  skincare:{id:'skincare',name:'Skincare',overview:'A topical regimen as a foundational, lowest-commitment starting point.',bestSuitedFor:'A foundational starting point for nearly any concern, at the lowest commitment level.',comfortLevel:'skincare',downtimeTier:'none',costTier:1,downtimeContext:'No downtime — fits into a normal daily routine.',costContext:'Commonly $30–$150 per month depending on products chosen.',longevityContext:'Results typically build gradually with consistent daily use.'},
  at_home_devices:{id:'at_home_devices',name:'At-Home Devices',overview:'Consumer-grade devices used at home as a gentle complement to skincare.',bestSuitedFor:'A gentle, low-commitment complement to a skincare routine.',comfortLevel:'skincare',downtimeTier:'none',costTier:2,downtimeContext:'No downtime — used at home on your own schedule.',costContext:'Commonly $150–$500 as a one-time device cost.',longevityContext:'Results typically build gradually with regular use.'},
};

export const concernCandidates: Record<ConcernId,TreatmentCategoryId[]> = {
  fine_lines:['tox','skin_boosters','peels','skincare'], sagging_skin:['ultrasound','rf','threads','biostimulators'],
  pigmentation:['lasers','peels','skincare','at_home_devices'], texture_pores:['microneedling','rf','peels','skincare'],
  acne_scarring:['microneedling','lasers','rf','peels'], volume_loss:['fillers','biostimulators','skin_boosters','threads'],
  under_eye:['skin_boosters','fillers','peels','at_home_devices'], lips:['fillers','skin_boosters','skincare'],
  jawline:['fillers','threads','rf','ultrasound'], not_sure:['skincare','tox','microneedling','at_home_devices'],
};

const areaCategories: Record<AreaId,TreatmentCategoryId[]> = {
  forehead:['tox','lasers','peels','skincare'], eyes:['tox','skin_boosters','lasers','peels'],
  cheeks:['fillers','biostimulators','rf','microneedling'], midface:['fillers','biostimulators','skin_boosters','rf'],
  lips:['fillers','skin_boosters','skincare'], jawline:['fillers','threads','rf','ultrasound'],
  neck:['rf','ultrasound','biostimulators','threads'], overall:['skincare','lasers','rf','microneedling','biostimulators'],
};
const comfortToLevel: Partial<Record<ComfortId,ComfortLevel>>={skincare_only:'skincare',devices_lasers:'device',injectables:'injectable'};
const acceptedDowntime: Record<DowntimeId,DowntimeTier[]>={none:['none'],short:['none','short'],week:['none','short','medium'],not_concern:['none','short','medium','long']};
const budgetTier: Record<QuizAnswers['budget'],1|2|3|4>={under_500:1,'500_1500':2,'1500_3000':3,'3000_plus':4};

const ageNudges: Record<AgeRangeId,Partial<Record<TreatmentCategoryId,number>>> = {
  under_30:{skincare:3,at_home_devices:2,peels:1},
  '30_44':{tox:2,skin_boosters:2,microneedling:1,rf:1,biostimulators:1},
  '45_59':{ultrasound:2,rf:2,biostimulators:2,threads:1},
  '60_plus':{ultrasound:2,rf:1,biostimulators:1},
};
const priorityNudges: Record<PriorityId,Partial<Record<TreatmentCategoryId,number>>> = {
  natural:{skincare:2,skin_boosters:2,biostimulators:2,rf:1,microneedling:1},
  low_downtime:{tox:2,skin_boosters:2,ultrasound:2,skincare:2,at_home_devices:2},
  longevity:{biostimulators:2,fillers:1,threads:1,ultrasound:1},
  value:{skincare:2,peels:2,microneedling:1,at_home_devices:1},
  avoid_needles:{skincare:3,at_home_devices:3,lasers:2,rf:2,ultrasound:2,microneedling:2,peels:2},
  fast_results:{tox:2,fillers:2,peels:1},
};

export type RecommendationMatch={category:TreatmentCategory;score:number;reasons:string[];explanation:string};
export type RecommendationResult={
  rulesVersion:string; concerns:ConcernId[]; areas:AreaId[]; intensity:QuizAnswers['intensity'];
  topMatch:RecommendationMatch; alternates:TreatmentCategory[]; alternateMatches:RecommendationMatch[];
  budgetNote:string; tradeoff:string; layerCount:number; detectedLayers:string[];
  comfortConflict?:string; ageContext?:string;
};

const concernLayers: Record<ConcernId,string> = {
  fine_lines:'muscle movement', sagging_skin:'structural support', pigmentation:'pigmentation',
  texture_pores:'skin quality', acne_scarring:'skin quality', volume_loss:'volume support',
  under_eye:'under-eye / volume', lips:'shape / volume', jawline:'contour / structural support', not_sure:'general skin quality',
};

function allowedByComfort(id:TreatmentCategoryId, comfort:ComfortId){
  const level=comfortToLevel[comfort]; return !level || treatmentCategories[id].comfortLevel===level;
}
function buildExplanation(a:QuizAnswers,m:RecommendationMatch){
  const goals=a.concerns.map(x=>concernLabels[x].toLowerCase()).join(', ');
  const zones=a.areas.map(x=>areaLabels[x].toLowerCase()).join(', ');
  return `Your answers point most strongly to ${m.category.name}: it aligns with ${goals}, the ${zones} area${a.areas.length>1?'s':''}, and the boundaries you selected.`;
}
function buildTradeoff(id:TreatmentCategoryId,a:QuizAnswers){
  const c=treatmentCategories[id];
  if(!acceptedDowntime[a.downtime].includes(c.downtimeTier)) return `${c.name} can involve more downtime than you selected, so that tradeoff is worth discussing before you pursue it.`;
  if(c.costTier>budgetTier[a.budget]) return `${c.name} may run above the investment range you selected; a lower-cost alternative may fit your priorities better.`;
  if(a.intensity==='more_visible' && ['skincare','at_home_devices','peels'].includes(id)) return `${c.name} is generally a more gradual path than the visible change you said you prefer.`;
  return `${c.name} addresses specific concerns rather than every aesthetic layer, so your complete Blueprint may include a different category for another goal you selected.`;
}
function ageCopy(age?:AgeRangeId){
  if(!age) return undefined;
  return `Your ${ageRangeLabels[age]} range is being used only as context. Your stated concerns and preferences remain the primary drivers of your matches.`;
}

export function getRecommendation(a:QuizAnswers):RecommendationResult{
  const ids=Object.keys(treatmentCategories) as TreatmentCategoryId[];
  const scored=ids.map(id=>{
    let score=0; const reasons:string[]=[];
    a.concerns.forEach(concern=>{
      const pos=concernCandidates[concern].indexOf(id);
      if(pos>=0){ const pts=[40,30,20,10][pos]; score+=pts; reasons.push(`Commonly explored for ${concernLabels[concern].toLowerCase()}`); }
    });
    a.areas.forEach(area=>{if(areaCategories[area].includes(id)){score+=12;reasons.push(`Relevant to your ${areaLabels[area].toLowerCase()} focus`);}});
    if(acceptedDowntime[a.downtime].includes(treatmentCategories[id].downtimeTier)) score+=6; else score-=8;
    a.priorities.forEach(p=>{score+=priorityNudges[p][id]??0;});
    if(a.ageRange) score+=ageNudges[a.ageRange][id]??0;
    if(a.intensity==='more_visible' && ['skincare','at_home_devices','peels'].includes(id)) score-=4;
    if(a.intensity==='subtle' && ['threads'].includes(id)) score-=3;
    return {id,score,reasons};
  });

  const strict=scored.filter(x=>allowedByComfort(x.id,a.comfort));
  let pool=strict;
  let comfortConflict:string|undefined;
  if(strict.length===0 || Math.max(...strict.map(x=>x.score))<=0){
    // Never silently violate a stated comfort boundary. Return the safest
    // foundational option and explain the conflict rather than recommending
    // an excluded procedure.
    pool=scored.filter(x=>treatmentCategories[x.id].comfortLevel==='skincare');
    comfortConflict=`We couldn't find a strong match for every goal within “${comfortLabels[a.comfort]}.” We kept your boundary intact rather than silently recommending a procedure outside it.`;
  }
  pool.sort((x,y)=>y.score-x.score || ids.indexOf(x.id)-ids.indexOf(y.id));
  const matches=pool.slice(0,5).map(x=>{
    const m:RecommendationMatch={category:treatmentCategories[x.id],score:x.score,reasons:x.reasons.slice(0,4),explanation:''};
    m.explanation=buildExplanation(a,m); return m;
  });
  const topMatch=matches[0] ?? {category:treatmentCategories.skincare,score:0,reasons:['A low-commitment foundation'],explanation:'Skincare is a low-commitment foundation while you refine your goals.'};
  const layers=Array.from(new Set(a.concerns.map(c=>concernLayers[c])));
  return {
    rulesVersion:RULES_VERSION, concerns:a.concerns, areas:a.areas, intensity:a.intensity,
    topMatch, alternates:matches.slice(1,4).map(x=>x.category), alternateMatches:matches.slice(1,4),
    budgetNote:topMatch.category.costTier>budgetTier[a.budget]?'Typical cost for this category may run above your stated budget.':'Typical cost for this category generally fits within your stated budget.',
    tradeoff:buildTradeoff(topMatch.category.id,a), layerCount:layers.length, detectedLayers:layers,
    comfortConflict, ageContext:ageCopy(a.ageRange),
  };
}
