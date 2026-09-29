package com.shelflife.api.product;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/** The JSON the API sends back: the stored fields plus calculated expiry info. */
public record ProductResponse(
        Long id,
        String name,
        String brand,
        Category category,
        String shade,
        LocalDate receivedDate,
        LocalDate openedDate,
        Integer paoMonths,
        LocalDate expiryDate,
        ContentStatus contentStatus,
        String notes,
        LocalDate effectiveExpiry,
        Long daysUntilExpiry,
        ExpiryStatus expiryStatus
) {

    /** Products expiring within this many days are flagged as "expiring soon". */
    static final int EXPIRING_SOON_DAYS = 30;

    public static ProductResponse from(Product product, LocalDate today) {
        // The real expiry is whichever comes first:
        // the printed date, or the opened date plus the PAO months.
        LocalDate effectiveExpiry = product.getExpiryDate();
        if (product.getOpenedDate() != null && product.getPaoMonths() != null) {
            LocalDate paoExpiry = product.getOpenedDate().plusMonths(product.getPaoMonths());
            if (effectiveExpiry == null || paoExpiry.isBefore(effectiveExpiry)) {
                effectiveExpiry = paoExpiry;
            }
        }

        Long daysUntilExpiry = null;
        ExpiryStatus expiryStatus = ExpiryStatus.NO_DATE;
        if (effectiveExpiry != null) {
            daysUntilExpiry = ChronoUnit.DAYS.between(today, effectiveExpiry);
            if (daysUntilExpiry < 0) {
                expiryStatus = ExpiryStatus.EXPIRED;
            } else if (daysUntilExpiry <= EXPIRING_SOON_DAYS) {
                expiryStatus = ExpiryStatus.EXPIRING_SOON;
            } else {
                expiryStatus = ExpiryStatus.OK;
            }
        }

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getBrand(),
                product.getCategory(),
                product.getShade(),
                product.getReceivedDate(),
                product.getOpenedDate(),
                product.getPaoMonths(),
                product.getExpiryDate(),
                product.getContentStatus(),
                product.getNotes(),
                effectiveExpiry,
                daysUntilExpiry,
                expiryStatus
        );
    }
}