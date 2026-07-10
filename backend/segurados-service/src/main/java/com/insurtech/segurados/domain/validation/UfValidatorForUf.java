package com.insurtech.segurados.domain.validation;

import com.insurtech.segurados.domain.model.Uf;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class UfValidatorForUf implements ConstraintValidator<UfValido, Uf> {

    private boolean allowNull;

    @Override
    public void initialize(UfValido constraintAnnotation) {
        this.allowNull = constraintAnnotation.allowNull();
    }

    @Override
    public boolean isValid(Uf value, ConstraintValidatorContext context) {
        if (value == null) return allowNull;
        return true; // enum instance is always valid
    }
}

