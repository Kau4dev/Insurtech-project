package com.insurtech.auth.integration;

import com.insurtech.auth.application.dto.LoginRequestDTO;
import com.insurtech.auth.application.dto.LoginResponseDTO;
import com.insurtech.auth.application.dto.UsuarioResponseDTO;
import com.insurtech.auth.domain.model.Papel;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import static org.junit.jupiter.api.Assertions.*;

class AuthControllerIT extends IntegrationTestBase {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void deveLogarComSucesso_quandoCredenciaisCorretas() {
        LoginRequestDTO dto = new LoginRequestDTO("admin@insurtech.com", "password");

        ResponseEntity<LoginResponseDTO> response = restTemplate.postForEntity(
                "/api/v1/auth/login", dto, LoginResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().token());
        assertEquals("Bearer", response.getBody().tipo());
        assertEquals(Papel.ADMIN, response.getBody().papel());
    }

    @Test
    void deveRetornar404_quandoEmailNaoEncontrado() {
        LoginRequestDTO dto = new LoginRequestDTO("naoexiste@insurtech.com", "password");

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/auth/login", dto, String.class
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deveRetornar401_quandoSenhaIncorreta() {
        LoginRequestDTO dto = new LoginRequestDTO("admin@insurtech.com", "senhaIncorreta");

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/auth/login", dto, String.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void deveRetornar400_quandoDadosInvalidos() {
        LoginRequestDTO dto = new LoginRequestDTO("emailInvalido", "123");

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/auth/login", dto, String.class
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void deveValidarTokenComSucesso_quandoTokenValido() {
        LoginRequestDTO loginDto = new LoginRequestDTO("admin@insurtech.com", "password");
        ResponseEntity<LoginResponseDTO> loginResponse = restTemplate.postForEntity(
                "/api/v1/auth/login", loginDto, LoginResponseDTO.class
        );
        assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
        assertNotNull(loginResponse.getBody());
        String token = loginResponse.getBody().token();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<UsuarioResponseDTO> response = restTemplate.exchange(
                "/api/v1/auth/validar", HttpMethod.GET, requestEntity, UsuarioResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Admin", response.getBody().nome());
        assertEquals("admin@insurtech.com", response.getBody().email());
        assertEquals(Papel.ADMIN, response.getBody().papel());
    }

    @Test
    void deveRetornar401_quandoTokenInvalido() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer token-totalmente-invalido");
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/auth/validar", HttpMethod.GET, requestEntity, String.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void deveRetornar401_quandoHeaderAuthorizationAusente() {
        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/auth/validar", HttpMethod.GET, null, String.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}
