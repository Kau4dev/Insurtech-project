package com.insurtech.auth.unit.infrastructure.security;

import com.insurtech.auth.infrastructure.security.JwtService;
import com.insurtech.auth.infrastructure.security.UserContext;
import com.insurtech.auth.infrastructure.security.UserContextFilter;
import com.insurtech.auth.infrastructure.security.UserContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.MDC;

import java.io.IOException;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserContextFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain chain;

    @InjectMocks
    private UserContextFilter filter;

    @BeforeEach
    @AfterEach
    void cleanup() {
        MDC.clear();
        UserContextHolder.clear();
    }

    @Test
    @DisplayName("Deve extrair Correlation-Id e popular MDC e UserContext quando headers estiverem presentes")
    void deveExtrairCorrelationIdEPopularMdcQuandoHeaderPresente() throws ServletException, IOException {
        String correlationId = "custom-trace-123";
        when(request.getHeader("X-Correlation-Id")).thenReturn(correlationId);
        when(request.getHeader("X-Usuario-Id")).thenReturn("user-456");
        when(request.getHeader("X-Usuario-Papel")).thenReturn("ANALISTA");

        doAnswer(invocation -> {
            assertEquals(correlationId, MDC.get("correlationId"));
            assertEquals("user-456", MDC.get("usuarioId"));
            UserContext ctx = UserContextHolder.getContext();
            assertEquals("user-456", ctx.getUsuarioId());
            assertEquals("ANALISTA", ctx.getUsuarioPapel());
            return null;
        }).when(chain).doFilter(request, response);

        filter.doFilter(request, response, chain);

        verify(response).setHeader("X-Correlation-Id", correlationId);
        assertNull(MDC.get("correlationId"), "MDC deve ser limpo apos a execucao");
        assertNull(MDC.get("usuarioId"), "MDC deve ser limpo apos a execucao");
        assertNull(UserContextHolder.getContext().getUsuarioId(), "UserContext deve ser limpo apos a execucao");
    }

    @Test
    @DisplayName("Deve gerar novo Correlation-Id quando o header X-Correlation-Id estiver ausente")
    void deveGerarNovoCorrelationIdQuandoHeaderAusente() throws ServletException, IOException {
        when(request.getHeader("X-Correlation-Id")).thenReturn(null);

        doAnswer(invocation -> {
            String mdcCorrId = MDC.get("correlationId");
            assertNotNull(mdcCorrId);
            assertDoesNotThrow(() -> UUID.fromString(mdcCorrId));
            return null;
        }).when(chain).doFilter(request, response);

        filter.doFilter(request, response, chain);

        verify(response).setHeader(eq("X-Correlation-Id"), anyString());
        assertNull(MDC.get("correlationId"));
    }
}
