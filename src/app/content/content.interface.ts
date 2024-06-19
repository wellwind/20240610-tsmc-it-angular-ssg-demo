export interface ContentList {
  contentList: Array<ContentSummary>;
}

export interface ContentSummary {
  title: string;
  slug: string;
  date: string;
  summary: string;
}

export type ContentItem = Omit<ContentSummary, 'summary'> & { content: string };
