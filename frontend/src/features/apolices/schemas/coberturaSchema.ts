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
      valorCobertura: z                                                                                          
        .string()                                                                                                
        .min(1, "Valor da cobertura é obrigatório")                                                              
        .regex(/^\d{1,14}(\.\d{1,2})?$/, "Valor inválido")                                                       
        .refine((val) => parseFloat(val) > 0, {                                                                  
          message: "Valor da cobertura deve ser positivo",                                                       
        }),                                                                                                      
      valorFranquia: z                                                                                           
        .string()                                                                                                
        .optional()                                                                                              
        .refine(                                                                                                 
          (val) => !val || (/^\d{1,14}(\.\d{1,2})?$/.test(val) && parseFloat(val) >= 0),                         
          { message: "Valor da franquia deve ser positivo ou zero" }                                             
        ),                                                                                                       
    });                                                                                                          
                          