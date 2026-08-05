package com.insurtech.segurados.infrastructure.security;

public class UserContextHolder {
    private static final ThreadLocal<UserContext> userContextThreadLocal = ThreadLocal.withInitial(UserContext::new);

    public static UserContext getContext() {
        return userContextThreadLocal.get();
    }

    public static void clear() {
        userContextThreadLocal.remove();
    }
}
