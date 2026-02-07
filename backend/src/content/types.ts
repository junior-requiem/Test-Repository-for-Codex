export interface LessonMetadata {
  id: string;
  title: string;
  objective: string;
  keywords: string[];
  prerequisites: string[];
  questionSet: string;
}

export interface SkillNode {
  id: string;
  name: string;
  path: string[];
  lessons: LessonMetadata[];
}

export interface ProductCatalog {
  id: string;
  name: string;
  skills: SkillNode[];
}

export interface LessonRecord extends LessonMetadata {
  productId: string;
  productName: string;
  skillId: string;
  skillName: string;
  skillPath: string;
}
