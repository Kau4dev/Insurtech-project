package com.insurtech.auth.domain.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class GeradorSenhaService {

    private static final String MAIUSCULAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String MINUSCULAS = "abcdefghijklmnopqrstuvwxyz";
    private static final String NUMEROS = "0123456789";
    private static final String SIMBOLOS = "!@#$%&*-_+=?";
    private static final String TODOS = MAIUSCULAS + MINUSCULAS + NUMEROS + SIMBOLOS;
    private static final int TAMANHO_PADRAO = 12;

    private final SecureRandom random = new SecureRandom();

    public String gerarSenhaSegura() {
        List<Character> caracteres = new ArrayList<>();

        // Garante ao menos um de cada classe
        caracteres.add(MAIUSCULAS.charAt(random.nextInt(MAIUSCULAS.length())));
        caracteres.add(MINUSCULAS.charAt(random.nextInt(MINUSCULAS.length())));
        caracteres.add(NUMEROS.charAt(random.nextInt(NUMEROS.length())));
        caracteres.add(SIMBOLOS.charAt(random.nextInt(SIMBOLOS.length())));

        // Completa o restante até o tamanho total
        for (int i = 4; i < TAMANHO_PADRAO; i++) {
            caracteres.add(TODOS.charAt(random.nextInt(TODOS.length())));
        }

        // Embaralha com Fisher-Yates
        Collections.shuffle(caracteres, random);

        StringBuilder sb = new StringBuilder();
        for (char c : caracteres) {
            sb.append(c);
        }
        return sb.toString();
    }
}