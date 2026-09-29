package com.shelflife.api.common;

import java.util.Map;

/** The JSON body sent back whenever a request fails. */
public record ApiError(int status, String message, Map<String, String> fieldErrors) {
}