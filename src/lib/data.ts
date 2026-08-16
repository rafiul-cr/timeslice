import type { Activity, Category, CategoryId } from "./types";

export const DAY_START = 6 * 60;
export const DAY_END = 24 * 60;
export const PX_PER_MINUTE = 1.15;
export const MIN_ACTIVITY_MINUTES = 15;

export const categories: Category[] = [
  { id: "work", label: "Work", color: "#6D4AFF", soft: "#F0ECFF", icon: "W" },
  { id: "study", label: "Study", color: "#2F80ED", soft: "#EAF3FF", icon: "S" },
  { id: "health", label: "Health", color: "#21A366", soft: "#EAF8F0", icon: "H" },
  { id: "personal", label: "Personal", color: "#E49B20", soft: "#FFF5DF", icon: "P" },
  { id: "break", label: "Break", color: "#E85D9E", soft: "#FFF0F7", icon: "B" },
  { id: "sleep", label: "Sleep", color: "#5667C9", soft: "#EEF0FF", icon: "Z" },
  { id: "other", label: "Other", color: "#64748B", soft: "#EEF1F5", icon: "O" },
];

export const starterActivities: Activity[] = [];
export function categoryById(id: CategoryId) {
  return categories.find((category) => category.id === id) ?? categories[categories.length - 1];
}
