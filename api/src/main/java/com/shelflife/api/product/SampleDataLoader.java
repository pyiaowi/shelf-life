package com.shelflife.api.product;

import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Adds a few example products the first time the app starts with an empty database. */
@Component
public class SampleDataLoader implements CommandLineRunner {

    private final ProductRepository repository;

    public SampleDataLoader(ProductRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }
        LocalDate today = LocalDate.now();
        repository.saveAll(List.of(
                sample("Barrier Repair Serum", "Dewdrop Labs", Category.SKINCARE, null,
                        today.minusDays(40), today.minusMonths(6).plusDays(12), 6, null, ContentStatus.POSTED),
                sample("Velvet Matte Lip", "Velvet & Vine", Category.MAKEUP, "04 Fig",
                        today.minusDays(10), null, 12, today.plusYears(1), ContentStatus.NOT_STARTED),
                sample("Daily Mineral SPF 50", "Maru Skin", Category.SKINCARE, null,
                        today.minusDays(60), today.minusDays(50), 12, today.minusDays(3), ContentStatus.FILMED),
                sample("Bond Repair Mask", "Oro Hair", Category.HAIRCARE, null,
                        today.minusDays(5), null, null, null, ContentStatus.NOT_STARTED)
        ));
    }

    private static Product sample(String name, String brand, Category category, String shade,
                                  LocalDate received, LocalDate opened, Integer paoMonths,
                                  LocalDate expiry, ContentStatus status) {
        Product product = new Product();
        product.setName(name);
        product.setBrand(brand);
        product.setCategory(category);
        product.setShade(shade);
        product.setReceivedDate(received);
        product.setOpenedDate(opened);
        product.setPaoMonths(paoMonths);
        product.setExpiryDate(expiry);
        product.setContentStatus(status);
        return product;
    }
}