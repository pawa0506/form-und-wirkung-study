import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudySession } from "../types/study";
const mock = vi.hoisted(() => ({insert:vi.fn(), signOut:vi.fn(), getSession:vi.fn(), signInAnonymously:vi.fn(), from:vi.fn(), getUser:vi.fn()}));
vi.mock("./supabase", () => ({supabase:{auth:mock, from:mock.from}}));
import {createParticipant, submitTrialResponse, reconcileParticipantSession} from "./study-data";
import {studyStimuli} from "../config/stimuli";
import {emptyRatings, ratingKeys} from "../study/ratings";
const ratings = emptyRatings(); ratingKeys.forEach((key,i) => {ratings[key] = i % 7 + 1;});
const input = {participantId:"p", trialIndex:0, stimulus:studyStimuli[0], answers:{ratings,openVisualObservations:" note "}, startedAt:"2026-01-01T00:00:00Z", submittedAt:"2026-01-01T00:01:00Z"};
beforeEach(() => {
 vi.resetAllMocks(); mock.getSession.mockResolvedValue({data:{session:null}});
 mock.signInAnonymously.mockResolvedValue({data:{user:{id:"p"}}});
 mock.insert.mockResolvedValue({error:null}); mock.from.mockReturnValue({insert:mock.insert});
});
describe("persistence v2", () => {
 it.each(["often",null] as const)("inserts experience %s with enrollment",async experience => {
  await createParticipant("desktop",studyStimuli,experience);
  expect(mock.insert).toHaveBeenCalledWith(expect.objectContaining({experience_3d:experience, questionnaire_version:2, randomized_sequence:expect.arrayContaining([expect.objectContaining({stimulus_id:studyStimuli[0].id})])}));
 });
 it("maps eight answers to exact database fields",async () => {
  await submitTrialResponse(input); const sent=mock.insert.mock.calls[0][0];
  ratingKeys.forEach(key => expect(sent[`item_${key}`]).toBe(ratings[key]));
  expect(sent.open_visual_observations).toBe("note"); expect(sent.questionnaire_version).toBe(2);
 });
 it("rejects missing new values without inserting",async () => {
  await expect(submitTrialResponse({...input,answers:{...input.answers,ratings:{...ratings,view_stability:null}}})).rejects.toThrow();
  expect(mock.insert).not.toHaveBeenCalled();
 });
 it("propagates save failures without mutating submitted answers",async () => {
  const before=JSON.stringify(input); mock.insert.mockResolvedValue({error:{code:"network",message:"offline"}});
  await expect(submitTrialResponse(input)).rejects.toThrow("offline"); expect(JSON.stringify(input)).toBe(before);
 });
 it("treats a verified duplicate as saved without updating responses",async () => {
  mock.insert.mockResolvedValue({error:{code:"23505"}});
  const chain:any={insert:mock.insert,select:vi.fn(() => chain),eq:vi.fn(() => chain),maybeSingle:vi.fn(async () => ({data:{sculpture_id:input.stimulus.sculptureId,hidden_variant_id:input.stimulus.hiddenVariantId}}))};
  mock.from.mockReturnValue(chain); await expect(submitTrialResponse(input)).resolves.toBeUndefined();
 });
 it("resumes a legacy session from stored sequence and submitted indices",async () => {
  mock.getUser.mockResolvedValue({data:{user:{id:"p"}}});
  const sequence=studyStimuli.map(s => ({stimulus_id:s.id}));
  mock.from.mockImplementation(table => {
   const result=table === "participants" ? {data:{completed:false,randomized_sequence:sequence}} : {data:[{trial_index:0},{trial_index:1}]};
   const chain:any={select:()=>chain,eq:()=>chain,single:async()=>result,then:(resolve:any)=>Promise.resolve(result).then(resolve)}; return chain;
  });
  const session={version:2,participantId:"p",stage:"trials",currentTrialIndex:0,orderedStimulusIds:studyStimuli.map(s=>s.id),trialStartedAt:null} as StudySession;
  const resumed=await reconcileParticipantSession(session); expect(resumed.currentTrialIndex).toBe(2); expect(resumed.orderedStimulusIds).toEqual(session.orderedStimulusIds);
 });
});
