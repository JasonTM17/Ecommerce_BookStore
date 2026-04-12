import { api } from "./api";

export interface ReadingProgress {
  id: number;
  product: {
    id: number;
    name: string;
    author: string;
    imageUrl: string;
  };
  status: "WANT_TO_READ" | "READING" | "FINISHED";
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  startedAt: string;
  finishedAt: string | null;
  rating: number | null;
  review: string | null;
}

export interface ReadingChallenge {
  id: number;
  year: number;
  targetBooks: number;
  completedBooks: number;
  isCompleted: boolean;
  createdAt: string;
}

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;
}

export interface ReadingStats {
  totalBooksRead: number;
  totalPagesRead: number;
  currentStreak: number;
  longestStreak: number;
  averageRating: number;
  favoriteGenre: string | null;
  monthlyReading: { month: string; count: number }[];
}

export const readingApi = {
  getMyProgress: async () => {
    const response = await api.get<{ data: ReadingProgress[] }>("/reading/progress");
    return response.data.data;
  },

  startReading: async (productId: number) => {
    const response = await api.post<{ data: ReadingProgress }>("/reading/progress", {
      productId,
    });
    return response.data.data;
  },

  updateProgress: async (progressId: number, currentPage: number, status?: string) => {
    const response = await api.put<{ data: ReadingProgress }>(
      `/reading/progress/${progressId}`,
      { currentPage, status }
    );
    return response.data.data;
  },

  finishReading: async (progressId: number, rating?: number, review?: string) => {
    const response = await api.post<{ data: ReadingProgress }>(
      `/reading/progress/${progressId}/finish`,
      { rating, review }
    );
    return response.data.data;
  },

  getChallenges: async () => {
    const response = await api.get<{ data: ReadingChallenge[] }>("/reading/challenges");
    return response.data.data;
  },

  createChallenge: async (year: number, targetBooks: number) => {
    const response = await api.post<{ data: ReadingChallenge }>("/reading/challenges", {
      year,
      targetBooks,
    });
    return response.data.data;
  },

  getStats: async () => {
    const response = await api.get<{ data: ReadingStats }>("/reading/stats");
    return response.data.data;
  },

  getStreak: async () => {
    const response = await api.get<{ data: ReadingStreak }>("/reading/streak");
    return response.data.data;
  },
};
