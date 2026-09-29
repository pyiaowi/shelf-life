package com.shelflife.api.product;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/** The JSON body the frontend sends when it creates or updates a product. */
public record ProductRequest(
        @NotBlank(message = "Enter the product name.")
        @Size(max = 120, message = "Keep the name under 120 characters.")
        String name,

        @NotBlank(message = "Enter the brand.")
        @Size(max = 80, message = "Keep the brand under 80 characters.")
        String brand,

        @NotNull(message = "Pick a category.")
        Category category,

        @Size(max = 80, message = "Keep the shade under 80 characters.")
        String shade,

        @NotNull(message = "Pick the date the package arrived.")
        @PastOrPresent(message = "The received date can't be in the future.")
        LocalDate receivedDate,

        @PastOrPresent(message = "The opened date can't be in the future.")
        LocalDate openedDate,

        @Min(value = 1, message = "Use a number from 1 to 60.")
        @Max(value = 60, message = "Use a number from 1 to 60.")
        Integer paoMonths,

        LocalDate expiryDate,

        ContentStatus contentStatus,

        @Size(max = 1000, message = "Keep notes under 1000 characters.")
        String notes
) {
}