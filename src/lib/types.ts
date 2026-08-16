export type CategoryId =
  | "work"
  | "study"
  | "health"
  | "personal"
  | "break"
  | "sleep"
  | "other";

export type Activity = {
  id: string;
  title: string;
  start: number; // minutes after midnight
  end: number;
  category: CategoryId;
  completed: boolean;
  x: number;
};

export type Category = {
  id: CategoryId;
  label: string;
  color: string;
  soft: string;
  icon: string;
};
