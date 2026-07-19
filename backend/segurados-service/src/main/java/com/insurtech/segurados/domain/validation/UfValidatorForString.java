package com.insurtech.segurados.domain.validation;

import com.insurtech.segurados.domain.model.Uf;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class UfValidatorForString implements ConstraintValidator<UfValido, String> {

    private boolean allowNull;

    @Override
    public void initialize(UfValido constraintAnnotation) {
        this.allowNull = constraintAnnotation.allowNull();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return allowNull;
        try {
            Uf.from(value);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}

