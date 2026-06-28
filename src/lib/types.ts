export type Level = "basico" | "intermedio" | "avanzado";
export type Category = "movimientos" | "jaquemate" | "apertura";

export interface Lesson {
  id: string;
  title: string;
  level: Level;
  category: Category;
  content: string;
  order: number;
}

export interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  fen: string;
  mode?: "free" | "sequence";
  scored?: boolean;
  fromSquare?: string;
  requireFlag?: string;
  requireDirection?: "horizontal" | "vertical" | "diagonal";
  solution: string[];
  explanation: string;
  order: number;
}
