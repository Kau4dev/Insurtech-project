package com.insurtech.auth.integration;

import com.insurtech.auth.application.dto.LoginRequestDTO;
import com.insurtech.auth.application.dto.LoginResponseDTO;
import com.insurtech.auth.application.dto.UsuarioResponseDTO;
import com.insurtech.auth.domain.model.Papel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class AuthControllerIT extends IntegrationTestBase {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    @DisplayName("Deve realizar login com sucesso quando as credenciais estiverem corretas")
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
    @DisplayName("Deve retornar status 404 quando o e-mail informado não for encontrado")
    void deveRetornar404_quandoEmailNaoEncontrado() {
        LoginRequestDTO dto = new LoginRequestDTO("naoexiste@insurtech.com", "password");

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/auth/login", dto, String.class
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @DisplayName("Deve retornar status 401 quando a senha informada for incorreta")
    void deveRetornar401_quandoSenhaIncorreta() {
        LoginRequestDTO dto = new LoginRequestDTO("admin@insurtech.com", "senhaIncorreta");

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/auth/login", dto, String.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    @DisplayName("Deve retornar status 400 quando os dados de login forem inválidos")
    void deveRetornar400_quandoDadosInvalidos() {
        LoginRequestDTO dto = new LoginRequestDTO("emailInvalido", "123");

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/auth/login", dto, String.class
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Deve validar o token JWT com sucesso quando o token for válido")
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
    @DisplayName("Deve retornar status 401 ao validar token com formato ou assinatura inválida")
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
    @DisplayName("Deve retornar status 401 quando o cabeçalho Authorization estiver ausente")
    void deveRetornar401_quandoHeaderAuthorizationAusente() {
        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/auth/validar", HttpMethod.GET, null, String.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    @DisplayName("Deve buscar usuário por ID com sucesso")
    void deveBuscarUsuarioPorId_comSucesso() {
        LoginRequestDTO loginDto = new LoginRequestDTO("admin@insurtech.com", "password");
        ResponseEntity<LoginResponseDTO> loginResponse = restTemplate.postForEntity(
                "/api/v1/auth/login", loginDto, LoginResponseDTO.class
        );
        assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
        assertNotNull(loginResponse.getBody());
        String token = loginResponse.getBody().token();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);

        ResponseEntity<UsuarioResponseDTO> validarResponse = restTemplate.exchange(
                "/api/v1/auth/validar", HttpMethod.GET, new HttpEntity<>(headers), UsuarioResponseDTO.class
        );
        assertEquals(HttpStatus.OK, validarResponse.getStatusCode());
        assertNotNull(validarResponse.getBody());
        UUID adminId = validarResponse.getBody().id();

        ResponseEntity<UsuarioResponseDTO> response = restTemplate.exchange(
                "/api/v1/auth/usuarios/" + adminId, HttpMethod.GET, null, UsuarioResponseDTO.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Admin", response.getBody().nome());
        assertEquals("admin@insurtech.com", response.getBody().email());
        assertEquals(Papel.ADMIN, response.getBody().papel());
    }

    @Test
    @DisplayName("Deve retornar status 404 ao buscar usuário por ID inexistente")
    void deveRetornar404_quandoUsuarioNaoExiste() {
        ResponseEntity<String> response = restTemplate.exchange(
                "/api/v1/auth/usuarios/" + UUID.randomUUID(), HttpMethod.GET, null, String.class
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}
