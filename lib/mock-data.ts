import type { Location, Message, Rating, Run, User } from "./types";

export const users: User[] = [
  {
    userId: "u1",
    email: "nikola@example.com",
    username: "nikola",
    age: 22,
    gender: "muski",
    fitnessLevel: "srednji",
    runningPaceMinPerKm: 5.4,
    city: "Beograd",
  },
  {
    userId: "u2",
    email: "masa@example.com",
    username: "masa",
    age: 21,
    gender: "zenski",
    fitnessLevel: "pocetni",
    runningPaceMinPerKm: 6.1,
    city: "Beograd",
  },
  {
    userId: "u3",
    email: "marko@example.com",
    username: "marko",
    age: 24,
    gender: "muski",
    fitnessLevel: "napredni",
    runningPaceMinPerKm: 4.8,
    city: "Beograd",
  },
];

export const locations: Location[] = [
  { locationId: "l1", city: "Beograd", municipality: "Novi Beograd" },
  { locationId: "l2", city: "Beograd", municipality: "Zemun" },
];

export const runs: Run[] = [
  {
    runId: "r1",
    title: "Večernjih 5K lagano",
    route: "Ušće krug",
    startsAtIso: "2026-02-10T18:00:00.000Z",
    paceMinPerKm: 6,
    distanceKm: 5,
    locationId: "l1",
    hostUserId: "u2",
    participantUserIds: ["u1", "u2"],
  },
  {
    runId: "r2",
    title: "Tempo 8K",
    route: "Kej Zemun",
    startsAtIso: "2026-02-11T17:30:00.000Z",
    paceMinPerKm: 5.1,
    distanceKm: 8,
    locationId: "l2",
    hostUserId: "u1",
    participantUserIds: ["u1", "u3"],
  },
];

export const messages: Message[] = [
  {
    messageId: "m1",
    fromUserId: "u1",
    toUserId: "u2",
    runId: "r1",
    content: "Možemo li da se nađemo 10 minuta ranije?",
    sentAtIso: "2026-02-06T10:20:00.000Z",
  },
  {
    messageId: "m2",
    fromUserId: "u2",
    toUserId: "u1",
    runId: "r1",
    content: "Može, vidimo se kod fontane.",
    sentAtIso: "2026-02-06T10:24:00.000Z",
  },
  {
    messageId: "m3",
    fromUserId: "u3",
    toUserId: "u1",
    runId: "r2",
    content: "Da li danas radimo i zagrevanje od 1 km?",
    sentAtIso: "2026-02-07T08:14:00.000Z",
  },
];

export const ratings: Rating[] = [
  {
    ratingId: "ra1",
    fromUserId: "u1",
    toUserId: "u2",
    score: 5,
    comment: "Odličan tempo i jasna komunikacija.",
  },
];
