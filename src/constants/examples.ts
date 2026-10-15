import { TaskInput } from "@@/lib/main";

/**
 * Standard CPM example project with single deterministic durations.
 */
export const cpmExampleTasks: TaskInput[] = [
  { key: "1", duration: 5, text: "Requirement Analysis", dependsOn: ["8", "9", "10"] },
  { key: "2", duration: 4, text: "System Architecture", dependsOn: ["9", "10"] },
  { key: "3", duration: 2, text: "Feasibility Study" },
  { key: "4", duration: 3, text: "UI/UX Mockups", dependsOn: ["5", "8"] },
  { key: "5", duration: 6, text: "Database Schema", dependsOn: ["3"] },
  { key: "6", duration: 8, text: "Infrastructure Setup" },
  { key: "7", duration: 3, text: "Security Review" },
  { key: "8", duration: 5, text: "API Design", dependsOn: ["3", "6", "7"] },
  { key: "9", duration: 5, text: "Integration Contracts", dependsOn: ["3", "6"] },
  { key: "10", duration: 2, text: "DevOps Pipeline", dependsOn: ["6", "7"] },
];

/**
 * Standard 3-point estimation (PERT) project with Optimistic, Most Likely, and Pessimistic durations.
 */
export const pertExampleTasks: TaskInput[] = [
  {
    key: "1",
    text: "Market Research",
    optimistic: 2,
    mostLikely: 4,
    pessimistic: 6,
  },
  {
    key: "2",
    text: "Product Specification",
    optimistic: 3,
    mostLikely: 6,
    pessimistic: 9,
    dependsOn: ["1"],
  },
  {
    key: "3",
    text: "Frontend Development",
    optimistic: 4,
    mostLikely: 8,
    pessimistic: 18,
    dependsOn: ["2"],
  },
  {
    key: "4",
    text: "Backend API Services",
    optimistic: 5,
    mostLikely: 7,
    pessimistic: 15,
    dependsOn: ["2"],
  },
  {
    key: "5",
    text: "Quality Assurance & Launch",
    optimistic: 2,
    mostLikely: 5,
    pessimistic: 14,
    dependsOn: ["3", "4"],
  },
];
