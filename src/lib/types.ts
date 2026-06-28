export type Level = "basico" | "intermedio" | "avanzado";

export interface Lesson {
  id: string;
  title: string;
  level: Level;
  content: string;
  order: number;
}

export interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  fen: string;
  solution: string[];
  explanation: string;
  order: number;
}
