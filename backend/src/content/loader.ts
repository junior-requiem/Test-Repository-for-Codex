import { fusionCloudCatalog } from "./catalog";
import { LessonRecord, SkillNode } from "./types";

const normalizePath = (path: string | string[]) => {
  if (Array.isArray(path)) {
    return path.map((segment) => segment.trim()).filter(Boolean);
  }

  return path
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
};

const isPathMatch = (skillPath: string[], targetPath: string[]) => {
  if (targetPath.length === 0) {
    return true;
  }

  return targetPath.every((segment, index) => skillPath[index] === segment);
};

const toLessonRecord = (skill: SkillNode, productId: string, productName: string) =>
  skill.lessons.map<LessonRecord>((lesson) => ({
    ...lesson,
    productId,
    productName,
    skillId: skill.id,
    skillName: skill.name,
    skillPath: skill.path.join("/"),
  }));

export const loadLessonsBySkillPath = (path: string | string[]) => {
  const targetPath = normalizePath(path);

  return fusionCloudCatalog.flatMap((product) =>
    product.skills
      .filter((skill) => isPathMatch(skill.path, targetPath))
      .flatMap((skill) => toLessonRecord(skill, product.id, product.name)),
  );
};
