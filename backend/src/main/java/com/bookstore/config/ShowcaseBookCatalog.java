package com.bookstore.config;

import com.bookstore.entity.Product;

import java.text.Normalizer;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public final class ShowcaseBookCatalog {

    private static final String OPEN_LIBRARY_SOURCE = "Open Library Covers API";

    private static final List<ShowcaseBookSeed> BOOKS = List.of(
            new ShowcaseBookSeed("tieu-thuyet", "The Great Gatsby", "F. Scott Fitzgerald", "Scribner", "9780743273565", 2004, "English", cover("9780743273565"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("tieu-thuyet", "To Kill a Mockingbird", "Harper Lee", "Harper Perennial", "9780061120084", 2006, "English", cover("9780061120084"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("truyen-ngan", "Nine Stories", "J.D. Salinger", "Back Bay Books", "9780316767729", 1991, "English", cover("9780316767729"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("truyen-ngan", "Dubliners", "James Joyce", "Penguin Classics", "9780140186475", 1993, "English", cover("9780140186475"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("tho", "Leaves of Grass", "Walt Whitman", "Penguin Classics", "9780140421996", 2005, "English", cover("9780140421996"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("tho", "The Sun and Her Flowers", "Rupi Kaur", "Andrews McMeel Publishing", "9781449486792", 2017, "English", cover("9781449486792"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("van-hoc-co-dien", "Pride and Prejudice", "Jane Austen", "Penguin Classics", "9780141439518", 2002, "English", cover("9780141439518"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("van-hoc-co-dien", "Anna Karenina", "Leo Tolstoy", "Penguin Classics", "9780143035008", 2003, "English", cover("9780143035008"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("marketing", "Contagious", "Jonah Berger", "Simon & Schuster", "9781451686579", 2016, "English", cover("9781451686579"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("marketing", "This Is Marketing", "Seth Godin", "Portfolio", "9780525540830", 2018, "English", cover("9780525540830"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("tai-chinh", "Rich Dad Poor Dad", "Robert T. Kiyosaki", "Plata Publishing", "9781612680194", 2017, "English", cover("9781612680194"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("tai-chinh", "The Psychology of Money", "Morgan Housel", "Harriman House", "9780857197689", 2020, "English", cover("9780857197689"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("lanh-dao", "Leaders Eat Last", "Simon Sinek", "Portfolio", "9781591848011", 2017, "English", cover("9781591848011"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("lanh-dao", "The Five Dysfunctions of a Team", "Patrick Lencioni", "Jossey-Bass", "9780787960759", 2002, "English", cover("9780787960759"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("khoa-hoc-tu-nhien", "A Brief History of Time", "Stephen Hawking", "Bantam", "9780553380163", 1998, "English", cover("9780553380163"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("khoa-hoc-tu-nhien", "Cosmos", "Carl Sagan", "Ballantine Books", "9780345539434", 2013, "English", cover("9780345539434"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("cong-nghe", "Clean Code", "Robert C. Martin", "Prentice Hall", "9780132350884", 2008, "English", cover("9780132350884"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("cong-nghe", "Introduction to Algorithms", "Thomas H. Cormen", "MIT Press", "9780262046305", 2022, "English", cover("9780262046305"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("phat-trien-ban-than", "Atomic Habits", "James Clear", "Avery", "9780735211292", 2018, "English", cover("9780735211292"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("phat-trien-ban-than", "The Power of Habit", "Charles Duhigg", "Random House Trade Paperbacks", "9780812981605", 2014, "English", cover("9780812981605"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("sach-thieu-nhi", "Alice's Adventures in Wonderland", "Lewis Carroll", "Puffin Classics", "9780141321073", 2015, "English", cover("9780141321073"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("sach-thieu-nhi", "The Little Prince", "Antoine de Saint-Exupery", "Mariner Books", "9780156012195", 2000, "English", cover("9780156012195"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("lich-su", "Guns, Germs, and Steel", "Jared Diamond", "W. W. Norton & Company", "9780393317558", 1999, "English", cover("9780393317558"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("lich-su", "SPQR", "Mary Beard", "Liveright", "9781631492228", 2016, "English", cover("9781631492228"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("sach-ngoai-van", "The Catcher in the Rye", "J.D. Salinger", "Back Bay Books", "9780316769488", 2001, "English", cover("9780316769488"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("sach-ngoai-van", "The Hobbit", "J.R.R. Tolkien", "Mariner Books", "9780547928227", 2012, "English", cover("9780547928227"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("sach-giao-khoa", "Campbell Biology", "Lisa A. Urry", "Pearson", "9780134093413", 2016, "English", cover("9780134093413"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("sach-giao-khoa", "Calculus: Early Transcendentals", "James Stewart", "Cengage Learning", "9781285741550", 2015, "English", cover("9781285741550"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("am-thuc", "Salt, Fat, Acid, Heat", "Samin Nosrat", "Simon & Schuster", "9781476753836", 2017, "English", cover("9781476753836"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("am-thuc", "Joy of Cooking", "Irma S. Rombauer", "Scribner", "9781501169717", 2019, "English", cover("9781501169717"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("nghe-thuat", "The Story of Art", "E. H. Gombrich", "Phaidon Press", "9780714832470", 1995, "English", cover("9780714832470"), OPEN_LIBRARY_SOURCE),
            new ShowcaseBookSeed("nghe-thuat", "Steal Like an Artist", "Austin Kleon", "Workman Publishing Company", "9780761169253", 2012, "English", cover("9780761169253"), OPEN_LIBRARY_SOURCE)
    );

    private static final Map<String, List<ShowcaseBookSeed>> BOOKS_BY_SLOT = BOOKS.stream()
            .collect(Collectors.groupingBy(ShowcaseBookSeed::slotKey, LinkedHashMap::new, Collectors.toList()));

    private static final Set<String> CURATED_ISBNS = BOOKS.stream()
            .map(ShowcaseBookSeed::isbn)
            .collect(Collectors.toUnmodifiableSet());

    private ShowcaseBookCatalog() {
    }

    public static List<ShowcaseBookSeed> forCategory(String categoryName) {
        return BOOKS_BY_SLOT.getOrDefault(slugify(categoryName), List.of());
    }

    public static boolean isCuratedIsbn(String isbn) {
        return isbn != null && CURATED_ISBNS.contains(isbn);
    }

    public static List<Product> prioritizeProducts(List<Product> products) {
        return products.stream()
                .sorted(Comparator
                        .comparing((Product product) -> !isCuratedIsbn(product.getIsbn()))
                        .thenComparing((Product product) -> !Boolean.TRUE.equals(product.getIsFeatured()))
                        .thenComparing((Product product) -> !Boolean.TRUE.equals(product.getIsBestseller()))
                        .thenComparing((Product product) -> product.getSoldCount() != null ? product.getSoldCount() : 0, Comparator.reverseOrder())
                        .thenComparing((Product product) -> product.getViewCount() != null ? product.getViewCount() : 0, Comparator.reverseOrder())
                        .thenComparing(Product::getName))
                .toList();
    }

    private static String cover(String isbn) {
        return "https://covers.openlibrary.org/b/isbn/" + isbn + "-L.jpg";
    }

    private static String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        return Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'D')
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");
    }

    public record ShowcaseBookSeed(
            String slotKey,
            String title,
            String author,
            String publisher,
            String isbn,
            int publishedYear,
            String language,
            String coverUrl,
            String source
    ) {
    }
}
