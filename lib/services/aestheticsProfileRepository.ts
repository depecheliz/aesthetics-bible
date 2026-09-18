/**
 * Persistence adapter for Quiz V2.
 * Existing scalar columns remain the compatibility source of truth. V2
 * multi-select values are serialized into those text columns with a stable
 * delimiter, so this feature does not require an irreversible DB migration.
 * Older scalar rows hydrate as one-item arrays.
 */
import { supabase } from './supabaseClient';
import { RULES_VERSION } from '../../src/domain/recommendation';
import type { QuizAnswers, ConcernId, AreaId } from '../../src/domain/quiz';
export interface AestheticsProfileRepository{load(userId:string):Promise<QuizAnswers|null>;save(userId:string,answers:QuizAnswers):Promise<void>;}
type Row={concern:string;area:string;intensity:string;downtime:string;comfort:string;budget:string};
const SEP='|';
function split<T extends string>(v:string):T[]{return v.split(SEP).filter(Boolean) as T[];}
function toQuizAnswers(row:Row):QuizAnswers{return {
 concerns:split<ConcernId>(row.concern),areas:split<AreaId>(row.area),
 intensity:row.intensity as QuizAnswers['intensity'],downtime:row.downtime as QuizAnswers['downtime'],
 comfort:row.comfort as QuizAnswers['comfort'],budget:row.budget as QuizAnswers['budget'],priorities:[],
};}
export const supabaseAestheticsProfileRepository:AestheticsProfileRepository={
 async load(userId){const {data,error}=await supabase.from('aesthetics_profile_answers').select('concern, area, intensity, downtime, comfort, budget').eq('user_id',userId).maybeSingle();if(error)throw error;return data?toQuizAnswers(data):null;},
 async save(userId,answers){const {error}=await supabase.from('aesthetics_profile_answers').upsert({
  user_id:userId,concern:answers.concerns.join(SEP),area:answers.areas.join(SEP),intensity:answers.intensity,
  downtime:answers.downtime,comfort:answers.comfort,budget:answers.budget,rules_version:RULES_VERSION,updated_at:new Date().toISOString(),
 },{onConflict:'user_id'});if(error)throw error;},
};
