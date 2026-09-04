import type { Stimulus } from "../types/study";

export type RandomSource = () => number;

export function shuffle<T>(values: readonly T[], random: RandomSource = Math.random): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createTrialOrder(
  stimuli: readonly Stimulus[],
  random: RandomSource = Math.random,
): Stimulus[] {
  const blocks = new Map<string, Stimulus[]>();
  stimuli.forEach((stimulus) => {
    const current = blocks.get(stimulus.sculptureId) ?? [];
    current.push(stimulus);
    blocks.set(stimulus.sculptureId, current);
  });

  return shuffle([...blocks.values()], random).flatMap((block) => shuffle(block, random));
}
