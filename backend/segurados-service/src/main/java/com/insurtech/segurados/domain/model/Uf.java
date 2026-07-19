package com.insurtech.segurados.domain.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.insurtech.segurados.domain.exception.UfInvalidaException;

public enum Uf {
    AC, AL, AP, AM, BA, CE, DF, ES, GO, MA,
    MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN,
    RS, RO, RR, SC, SP, SE, TO;

    @JsonCreator
    public static Uf from(String value) {
        if (value == null) return null;
        try {
            return Uf.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new UfInvalidaException("UF inválida: " + value);
        }
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}