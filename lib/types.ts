export type FitnessLevel = "pocetni" | "srednji" | "napredni";

export interface User {
  userId: string;
  email: string;
  username: string;
  age: number;
  gender: "muski" | "zenski" | "drugo";
  fitnessLevel: FitnessLevel;
  runningPaceMinPerKm: number;
  city: string;
}

export interface Location {
  locationId: string;
  city: string;
  municipality: string;
}

export interface Run {
  runId: string;
  title: string;
  route: string;
  startsAtIso: string;
  paceMinPerKm: number;
  distanceKm: number;
  locationId: string;
  hostUserId: string;
  participantUserIds: string[];
}

export interface Message {
  messageId: string;
  fromUserId: string;
  toUserId: string;
  runId?: string;
  content: string;
  sentAtIso: string;
}

export interface Rating {
  ratingId: string;
  fromUserId: string;
  toUserId: string;
  score: 1 | 2 | 3 | 4 | 5;
  comment: string;
}
