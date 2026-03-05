export interface DayMeal {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
    metabolicGoal: string;
}

export interface WeeklyMenu {
    [key: string]: DayMeal;
}

export const weeklyMenuData: WeeklyMenu = {
    lunes: {
        breakfast: "Porridge de Kiwicha con canela y nueces.",
        lunch: "Pescado al horno costrado con Quinua Negra y espárragos.",
        dinner: "Crema de Tarwi con cúrcuma.",
        snack: "10 Aguaymantos frescos.",
        metabolicGoal: "Sensibilización insulínica matutina."
    },
    martes: {
        breakfast: "Omelette de claras con espinaca y palta.",
        lunch: "Pollo saltado con Oca Morada y pimientos.",
        dinner: "Ensalada de Atún con cebolla roja y Sacha Inchi.",
        snack: "Un puñado de Castañas de Brasil.",
        metabolicGoal: "Control de picos post-prandiales."
    },
    miercoles: {
        breakfast: "Batido de Cañihua con cacao puro y leche de coco.",
        lunch: "Cebiche de Tarwi con camote morado asado.",
        dinner: "Sopa de vegetales con Kiwicha pop.",
        snack: "Bastoncitos de apio con mantequilla de macambo.",
        metabolicGoal: "Aporte máximo de micronutrientes."
    },
    jueves: {
        breakfast: "Panqueques de harina de coca y huevo.",
        lunch: "Guiso de Quinua Roja con champiñones.",
        dinner: "Salmón a la plancha con brócoli al vapor.",
        snack: "Taza de infusión de Muña con 2 castañas.",
        metabolicGoal: "Optimización de la tasa metabólica basal."
    },
    viernes: {
        breakfast: "Yogur griego sin azúcar con Nibs de Cacao.",
        lunch: "Hamburguesa de Maca y lentejas con ensalada verde.",
        dinner: "Wrap de lechuga con pollo y guacamole.",
        snack: "Rodajas de yacón crocante.",
        metabolicGoal: "Reducción de inflamación sistémica."
    },
    sabado: {
        breakfast: "Huevos revueltos con tomate y albahaca.",
        lunch: "Estofado de oca morada con carne de pastoreo.",
        dinner: "Tazón de caldo de huesos con granos andinos.",
        snack: "Smoothie verde de sancayo.",
        metabolicGoal: "Flexibilidad metabólica."
    },
    domingo: {
        breakfast: "Bowl de papaya con semillas de chía y kiwicha.",
        lunch: "Parrillada de vegetales con queso de castañas.",
        dinner: "Crema de calabaza con semillas de zapallo.",
        snack: "Cacao caliente con estevia.",
        metabolicGoal: "Reparación celular profunda."
    }
};
