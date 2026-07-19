package com.insurtech.segurados.domain.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.PARAMETER;

@Documented
@Constraint(validatedBy = {
        UfValidatorForString.class,
        UfValidatorForUf.class
})
@Target({FIELD, PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface UfValido {
    String message() default "UF inválida";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    boolean allowNull() default true;
}

