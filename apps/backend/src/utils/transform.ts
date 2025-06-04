// Zodバリデーション結果をDrizzle用に変換するユーティリティ

import type { CreateTribeInput, UpdateTribeInput, CreateCardInput, UpdateCardInput, CreateCardSetInput, UpdateCardSetInput } from '@/types/validation';
import type { InsertTribe, InsertCard, InsertCardSet } from '@/types/database';

export function transformTribeForDb(input: CreateTribeInput): InsertTribe {
  return {
    ...input,
    leaderId: input.leaderId ?? null,
    thematic: input.thematic ?? null,
    description: input.description ?? null,
    masterCardId: input.masterCardId ?? null,
  };
}

export function transformTribeUpdateForDb(input: UpdateTribeInput): Partial<InsertTribe> {
  const result: Partial<InsertTribe> = {};
  
  if (input.name !== undefined) result.name = input.name;
  if (input.leaderId !== undefined) result.leaderId = input.leaderId ?? null;
  if (input.thematic !== undefined) result.thematic = input.thematic ?? null;
  if (input.description !== undefined) result.description = input.description ?? null;
  if (input.masterCardId !== undefined) result.masterCardId = input.masterCardId ?? null;
  
  return result;
}

export function transformCardForDb(input: CreateCardInput): InsertCard {
  return {
    ...input,
    leaderId: input.leaderId ?? null,
    tribeId: input.tribeId ?? null,
    flavorText: input.flavorText ?? null,
    artist: input.artist ?? null,
  };
}

export function transformCardUpdateForDb(input: UpdateCardInput): Partial<InsertCard> {
  const result: Partial<InsertCard> = {};
  
  if (input.name !== undefined) result.name = input.name;
  if (input.cardNumber !== undefined) result.cardNumber = input.cardNumber;
  if (input.leaderId !== undefined) result.leaderId = input.leaderId ?? null;
  if (input.tribeId !== undefined) result.tribeId = input.tribeId ?? null;
  if (input.rarityId !== undefined) result.rarityId = input.rarityId;
  if (input.cardTypeId !== undefined) result.cardTypeId = input.cardTypeId;
  if (input.cost !== undefined) result.cost = input.cost;
  if (input.power !== undefined) result.power = input.power;
  if (input.effects !== undefined) result.effects = input.effects;
  if (input.flavorText !== undefined) result.flavorText = input.flavorText ?? null;
  if (input.imageUrl !== undefined) result.imageUrl = input.imageUrl;
  if (input.artist !== undefined) result.artist = input.artist ?? null;
  if (input.cardSetId !== undefined) result.cardSetId = input.cardSetId;
  
  return result;
}

export function transformCardSetForDb(input: CreateCardSetInput): InsertCardSet {
  return {
    ...input,
    description: input.description ?? null,
  };
}

export function transformCardSetUpdateForDb(input: UpdateCardSetInput): Partial<InsertCardSet> {
  const result: Partial<InsertCardSet> = {};
  
  if (input.name !== undefined) result.name = input.name;
  if (input.code !== undefined) result.code = input.code;
  if (input.releaseDate !== undefined) result.releaseDate = input.releaseDate;
  if (input.cardCount !== undefined) result.cardCount = input.cardCount;
  if (input.description !== undefined) result.description = input.description ?? null;
  
  return result;
}