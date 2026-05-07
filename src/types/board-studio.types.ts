export interface FileItem {
  name: string;
  path: string;
  updatedAt: string;
}

export interface FilesResponse {
  categories: {
    "数据故事": FileItem[];
    "品牌VI": FileItem[];
    "页面结构": FileItem[];
    "页面": FileItem[];
  };
}

export type CategoryKey = "数据故事" | "品牌VI" | "页面结构" | "页面";

export const CATEGORY_ORDER: CategoryKey[] = ["数据故事", "品牌VI", "页面结构", "页面"];

export interface OpenTab {
  id: string;
  file: FileItem;
}

export interface FormQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "radio" | "checkbox" | "select";
  options?: (string | { label: string; value: string })[] | null;
  placeholder?: string;
  required: boolean;
  description: string;
}

export interface QuestionFormData {
  title: string;
  description: string;
  questions: FormQuestion[];
}
