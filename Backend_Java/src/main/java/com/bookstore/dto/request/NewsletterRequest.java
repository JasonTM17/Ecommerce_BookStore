package com.bookstore.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsletterRequest {
    private String subscriberName;
    private String featuredBookTitle;
    private String featuredBookAuthor;
    private String featuredBookDescription;
    private String featuredBookPrice;
    private String featuredBookOriginalPrice;
    private String promoCode;
    private String promoTitle;
    private String promoDescription;
}
