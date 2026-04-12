import { api } from "./api";

export interface ISBNBookInfo {
  isbn: string;
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  description: string;
  imageUrl: string;
  pageCount: number;
  categories: string[];
  language: string;
}

export const isbnApi = {
  lookupISBN: async (isbn: string) => {
    const response = await api.get<{ data: ISBNBookInfo }>(`/isbn/lookup/${isbn}`);
    return response.data.data;
  },

  comparePrice: async (isbn: string) => {
    const response = await api.get<{ data: any }>(`/isbn/compare/${isbn}`);
    return response.data.data;
  },
};

// Open Library API helper (public, no auth needed)
export async function lookupFromOpenLibrary(isbn: string): Promise<Partial<ISBNBookInfo> | null> {
  try {
    const response = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    );
    const data = await response.json();
    
    const bookData = data[`ISBN:${isbn}`];
    if (!bookData) return null;

    return {
      isbn,
      title: bookData.title,
      authors: bookData.authors?.map((a: any) => a.name) || [],
      publisher: bookData.publishers?.[0]?.name || "",
      publishedDate: bookData.publish_date || "",
      description: bookData.notes || "",
      imageUrl: bookData.cover?.medium || bookData.cover?.small || "",
      pageCount: bookData.number_of_pages || 0,
      categories: bookData.subjects?.map((s: any) => s.name).slice(0, 5) || [],
      language: bookData.language || "en",
    };
  } catch (error) {
    console.error("Error looking up ISBN from Open Library:", error);
    return null;
  }
}
