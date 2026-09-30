package com.shelflife.api.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * When the Angular app is bundled inside Spring Boot, a page refresh on an Angular
 * route (like /products/new) must still return index.html so Angular can take over.
 */
@Controller
public class SpaForwardController {

    @GetMapping({"/products/new", "/products/{id:\\d+}/edit"})
    public String forwardToAngular() {
        return "forward:/index.html";
    }
}