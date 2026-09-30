package com.shelflife.api.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
public class SecurityConfig {

    /** The single account that can use the app, taken from APP_USERNAME and APP_PASSWORD. */
    @Bean
    public UserDetailsService users(@Value("${app.username}") String username,
                                    @Value("${app.password}") String password) {
        return new InMemoryUserDetailsManager(
                User.withUsername(username)
                        .password("{noop}" + password)
                        .roles("OWNER")
                        .build());
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   UserDetailsService users,
                                                   @Value("${app.remember-me-key}") String rememberMeKey)
            throws Exception {
        http
                // Everything needs a login, except the login page itself
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login.html").permitAll()
                        .anyRequest().authenticated())
                // Our own login page; the form posts to /login.
                // After signing in, always go to the shelf.
                .formLogin(form -> form
                        .loginPage("/login.html")
                        .loginProcessingUrl("/login")
                        .defaultSuccessUrl("/", true)
                        .permitAll())
                // Stay signed in for 30 days, even after the server restarts
                .rememberMe(remember -> remember
                        .key(rememberMeKey)
                        .userDetailsService(users)
                        .alwaysRemember(true)
                        .tokenValiditySeconds(60 * 60 * 24 * 30))
                .logout(Customizer.withDefaults())
                // API calls without a login get a plain 401 instead of the login page,
                // so Angular can redirect the browser itself
                .exceptionHandling(ex -> ex.defaultAuthenticationEntryPointFor(
                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                        request -> request.getRequestURI().startsWith("/api/")))
                // Same-site cookies and JSON-only endpoints cover CSRF for this single-user app
                .csrf(csrf -> csrf.disable());
        return http.build();
    }
};