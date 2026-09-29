package com.shelflife.api.product;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAll() {
        LocalDate today = LocalDate.now();
        return repository.findAll(Sort.by(Sort.Direction.DESC, "receivedDate"))
                .stream()
                .map(product -> ProductResponse.from(product, today))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return ProductResponse.from(getProduct(id), LocalDate.now());
    }

    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        applyRequest(product, request);
        return ProductResponse.from(repository.save(product), LocalDate.now());
    }

    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getProduct(id);
        applyRequest(product, request);
        return ProductResponse.from(repository.save(product), LocalDate.now());
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        repository.deleteById(id);
    }

    private Product getProduct(Long id) {
        return repository.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    }

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.name().trim());
        product.setBrand(request.brand().trim());
        product.setCategory(request.category());
        product.setShade(blankToNull(request.shade()));
        product.setReceivedDate(request.receivedDate());
        product.setOpenedDate(request.openedDate());
        product.setPaoMonths(request.paoMonths());
        product.setExpiryDate(request.expiryDate());
        product.setContentStatus(
                request.contentStatus() != null ? request.contentStatus() : ContentStatus.NOT_STARTED);
        product.setNotes(blankToNull(request.notes()));
    }

    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}