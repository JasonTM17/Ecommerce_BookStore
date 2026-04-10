import { api } from "./api";

export interface BookClub {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  owner: {
    id: number;
    fullName: string;
    email: string;
  };
  currentBook: {
    id: number;
    name: string;
    author: string;
    imageUrl: string;
  } | null;
  memberCount: number;
  isPublic: boolean;
  isActive: boolean;
  isJoined: boolean;
  createdAt: string;
}

export interface BookClubMember {
  id: number;
  user: {
    id: number;
    fullName: string;
    email: string;
    avatarUrl: string;
  };
  role: "OWNER" | "MODERATOR" | "MEMBER";
  joinedAt: string;
}

export interface BookDiscussion {
  id: number;
  club: { id: number; name: string };
  book: { id: number; name: string } | null;
  user: {
    id: number;
    fullName: string;
    avatarUrl: string;
  };
  content: string;
  likes: number;
  views: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

export const bookClubApi = {
  getPublicClubs: async (page = 0, size = 20) => {
    const response = await api.get<{ data: BookClub[] }>(
      `/clubs?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  getClubById: async (id: number) => {
    const response = await api.get<{ data: BookClub }>(`/clubs/${id}`);
    return response.data.data;
  },

  createClub: async (name: string, description: string) => {
    const response = await api.post<{ data: BookClub }>("/clubs", {
      name,
      description,
    });
    return response.data.data;
  },

  joinClub: async (id: number) => {
    await api.post(`/clubs/${id}/join`);
  },

  leaveClub: async (id: number) => {
    await api.post(`/clubs/${id}/leave`);
  },

  getMembers: async (id: number) => {
    const response = await api.get<{ data: BookClubMember[] }>(`/clubs/${id}/members`);
    return response.data.data;
  },

  getDiscussions: async (id: number, page = 0, size = 20) => {
    const response = await api.get<{ data: BookDiscussion[] }>(
      `/clubs/${id}/discussions?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  createDiscussion: async (clubId: number, content: string, bookId?: number) => {
    const response = await api.post<{ data: BookDiscussion }>(`/clubs/${clubId}/discussions`, {
      content,
      bookId,
    });
    return response.data.data;
  },

  likeDiscussion: async (discussionId: number) => {
    await api.post(`/discussions/${discussionId}/like`);
  },
};
