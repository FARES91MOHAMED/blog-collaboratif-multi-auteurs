export interface Article {
  _id?: string;
  title: string;
  content: string;
  images?: string[]; // urls
  author?: { _id?: string; name?: string } | string;
  comments?: any[]; // structure selon backend
  createdAt?: string;
  [key: string]: any;
}
