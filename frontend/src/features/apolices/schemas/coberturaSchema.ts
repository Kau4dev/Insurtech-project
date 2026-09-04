import { z } from "zod";

export const CoberturaSchema = z.object({                                                                    
      tipoCobertura: z.enum(                                                                                     
        [                                                                                                        
          "COLISAO",                                                                                             
          "ROUBO_FURTO",                                                                                         
          "INCENDIO_VEICULO",                                                                                    
          "DANO_A_TERCEIRO",                                                                                     
          "QUEBRA_DE_VIDRO",                                                                                     
          "INCENDIO_RESIDENCIAL",                                                                                
          "DANOS_ELETRICOS",                                                                                     
          "ROUBO_BENS",                                                                                          
          "ALAGAMENTO",                                                                                          
          "MORTE",                                                                                               
          "INVALIDEZ_PERMANENTE",                                                                                
          "DOENCA_GRAVE",                                                                                        
          "DANO_EQUIPAMENTO",                                                                                    
          "LUCROS_CESSANTES",                                                                                    
          "RESPONSABILIDADE_CIVIL",                                                                              
          "OUTROS",                                                                                              
        ],                                                                                                       
        { message: "Tipo de cobertura é obrigatório" }                                                           
      ),                                                                                                         
      valorCobertura: z.coerce
        .number({ message: "Valor da cobertura é obrigatório" })
        .positive("Valor da cobertura deve ser positivo"),
      valorFranquia: z.coerce
        .number()
        .optional()
        .refine((val) => val === undefined || val >= 0, {
          message: "Valor da franquia deve ser positivo ou zero",
        }),
    });                                                                                                          
                          