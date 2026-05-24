export interface AnnouncementOutput {
  id: string;
  title: string;
  content: string;
  condominiumId: string;
  authorId: string;
  authorName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnouncementListOutput {
  announcements: AnnouncementOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnnouncementCreatedOutput {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}
