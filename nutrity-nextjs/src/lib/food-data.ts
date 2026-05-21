export interface FeedRecipe {
    title: string;
    instructions: string[];
}

export interface FoodItem {
    id: string;
    name: string;
    scientificName: string;
    image: string;
    category: string;
    description: string;
    metabolicBenefits: string[];
    nutrients: {
        protein: string;
        fiber: string;
        sugar: string;
    };
    recipes: FeedRecipe[];
}

export const foodCatalog: FoodItem[] = [
    {
        id: "1",
        name: "Tarwi (Chocho)",
        scientificName: "Lupinus mutabilis",
        image: "/tarwi_premium_andina_superfood_1772295600000_1772295858594.png",
        category: "Leguminosa Andina",
        description: "El superalimento andino por excelencia para la remisión de la diabetes. Contiene alcaloides que estimulan la secreción de insulina.",
        metabolicBenefits: ["Reduce picos de glucosa", "Efecto saciante prolongado", "Alta densidad proteica"],
        nutrients: { protein: "40g", fiber: "10g", sugar: "0.5g" },
        recipes: [
            { title: "Cebiche de Tarwi", instructions: ["Hidratar y desamargar el tarwi.", "Mezclar con limón, cebolla roja y ají limo.", "Acompañar con camote al horno."] },
            { title: "Crema de Tarwi al Curry", instructions: ["Licuar tarwi con leche de almendras.", "Añadir curry y una pizca de cúrcuma.", "Calentar a fuego lento."] },
            { title: "Ensalada Energética", instructions: ["Combinar tarwi con palta y tomate.", "Aliñar con aceite de oliva virgen extra."] }
        ]
    },
    {
        id: "2",
        name: "Quinua Negra",
        scientificName: "Chenopodium quinoa",
        image: "/quinua_negra_bowl_premium_1772251795891.png",
        category: "Pseudocereal",
        description: "Contiene antocianinas, potentes antioxidantes que reparan el daño celular causado por la hiperglucemia crónica.",
        metabolicBenefits: ["Anti-inflamatorio natural", "Bajo índice glucémico", "Reparación celular"],
        nutrients: { protein: "14g", fiber: "7g", sugar: "0g" },
        recipes: [
            { title: "Quinua Negra con Champiñones", instructions: ["Cocer la quinua al dente.", "Saltear champiñones con ajo.", "Mezclar y decorar con perejil."] },
            { title: "Bowl de Desayuno", instructions: ["Quinua negra cocida con canela.", "Topping de nueces y chía.", "Un chorrito de leche de coco."] },
            { title: "Hamburguesas de Quinua", instructions: ["Mezclar quinua con huevo y espinaca.", "Formar discos y dorar a la plancha."] }
        ]
    },
    {
        id: "3",
        name: "Oca Morada",
        scientificName: "Oxalis tuberosa",
        image: "https://images.unsplash.com/photo-1518977676601-b53f02bad177?q=80&w=800&auto=format&fit=crop",
        category: "Tubérculo",
        description: "Alternativa saludable a la papa. Su contenido de antioxidantes y tipo de almidón ayudan a una absorción lenta de carbohidratos.",
        metabolicBenefits: ["Control glucémico", "Rico en Vitamina C", "Energía sostenida"],
        nutrients: { protein: "2g", fiber: "3g", sugar: "1g" },
        recipes: [
            { title: "Ocas Horneadas con Hierbas", instructions: ["Cortar en rodajas finas.", "Hornear con romero y aceite de oliva.", "Servir crujiente."] },
            { title: "Puré de Oca y Ajo", instructions: ["Hervir ocas con cáscara.", "Prensar y mezclar con ajo asado."] },
            { title: "Guiso de Oca Morada", instructions: ["Cocinar con cebolla y pimientos.", "Añadir caldo de verduras."] }
        ]
    },
    {
        id: "4",
        name: "Kiwicha (Amaranto)",
        scientificName: "Amaranthus caudatus",
        image: "https://images.unsplash.com/photo-1509482560494-4126f8225994?q=80&w=800&auto=format&fit=crop",
        category: "Pseudocereal",
        description: "Excelente fuente de lisina, un aminoácido que ayuda a la síntesis de colágeno y salud cardiovascular.",
        metabolicBenefits: ["Salud del corazón", "Fuente de calcio", "Fácil digestión"],
        nutrients: { protein: "16g", fiber: "8g", sugar: "0g" },
        recipes: [
            { title: "Porridge de Kiwicha", instructions: ["Hervir kiwicha con leche vegetal.", "Añadir clavo y canela.", "Endulzar con estevia pura."] },
            { title: "Kiwicha Pop Salada", instructions: ["Tostar granos hasta que revienten.", "Espolvorear sal de mar y pimentón."] },
            { title: "Sopa de Kiwicha y Verduras", instructions: ["Añadir kiwicha a un caldo de verduras.", "Cocinar hasta que espese."] }
        ]
    },
    {
        id: "5",
        name: "Cañihua",
        scientificName: "Chenopodium pallidicaule",
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop",
        category: "Pseudocereal",
        description: "El grano con mayor capacidad antioxidante. Libre de gluten y altamente nutritivo para deportistas diabéticos.",
        metabolicBenefits: ["Alta capacidad antioxidante", "Optimización celular", "Sin gluten"],
        nutrients: { protein: "15g", fiber: "9g", sugar: "0g" },
        recipes: [
            { title: "Batido Energético de Cañihua", instructions: ["Licuar cañihua en polvo con agua.", "Añadir una pizca de cacao puro."] },
            { title: "Panqueques de Cañihua", instructions: ["Mezclar harina de cañihua con clara de huevo.", "Cocinar en sartén antiadherente."] },
            { title: "Mazamorra de Cañihua", instructions: ["Cocer con cáscara de manzana y canela."] }
        ]
    },
    {
        id: "6",
        name: "Maíz Morado",
        scientificName: "Zea mays L.",
        image: "/maiz_morado_drink_premium_1772251814305.png",
        category: "Grano",
        description: "Rico en antocianina (C3G), ayuda a reducir los niveles de colesterol y combatir la obesidad.",
        metabolicBenefits: ["Salud vascular", "Reducción de lípidos", "Protección renal"],
        nutrients: { protein: "9g", fiber: "5g", sugar: "2g" },
        recipes: [
            { title: "Chicha Morada Fit", instructions: ["Hervir maíz con canela y piña (sin azúcar).", "Enfriar y añadir limón."] },
            { title: "Mazamorra sin Azúcar", instructions: ["Usar espesante natural y estevia."] },
            { title: "Infusión de Maíz Morado", instructions: ["Hervir coronta con jengibre.", "Tomar durante el día."] }
        ]
    },
    {
        id: "7",
        name: "Camote Morado",
        scientificName: "Ipomoea batatas",
        image: "https://images.unsplash.com/photo-1594911771120-438466f272c7?q=80&w=800&auto=format&fit=crop",
        category: "Tubérculo",
        description: "Su color indica alta presencia de antioxidantes. Tiene un índice glucémico menor que la papa blanca.",
        metabolicBenefits: ["Visión saludable", "Control de azúcar", "Salud intestinal"],
        nutrients: { protein: "2g", fiber: "4g", sugar: "4g" },
        recipes: [
            { title: "Chips de Camote al Horno", instructions: ["Cortar láminas transparentes.", "Hornear a baja temperatura hasta que doren."] },
            { title: "Camote Relleno", instructions: ["Cocinar al vapor y rellenar con pollo deshilachado."] },
            { title: "Ensalada Rosticera", instructions: ["Cubos de camote asado con espinaca y alcachofa."] }
        ]
    },
    {
        id: "8",
        name: "Sacha Inchi",
        scientificName: "Plukenetia volubilis",
        image: "https://images.unsplash.com/photo-1511216335778-7cb8f49fa7a3?q=80&w=800&auto=format&fit=crop",
        category: "Semilla/Nuez",
        description: "Maní del Inca. La mayor fuente vegetal de Omega 3, esencial para reducir la inflamación sistémica.",
        metabolicBenefits: ["Reducción de Triglicéridos", "Fibrilación cerebral", "Anti-inflamatorio"],
        nutrients: { protein: "27g", fiber: "16g", sugar: "0g" },
        recipes: [
            { title: "Snack de Sacha Inchi Tostado", instructions: ["Tostar a fuego lento con una pizca de sal."] },
            { title: "Pesto de Sacha Inchi", instructions: ["Procesar con albahaca, ajo y aceite de oliva."] },
            { title: "Topping para ensaladas", instructions: ["Triturar y espolvorear sobre verdes."] }
        ]
    },
    {
        id: "9",
        name: "Macambo",
        scientificName: "Theobroma bicolor",
        image: "https://images.unsplash.com/photo-1606312619070-d48bc4a0cfdf?q=80&w=800&auto=format&fit=crop",
        category: "Semilla",
        description: "Primo del cacao, rico en fibra y energía limpia. Ideal para el control de la ansiedad por dulces.",
        metabolicBenefits: ["Control de saciedad", "Energía cerebral", "Digestivo"],
        nutrients: { protein: "20g", fiber: "30g", sugar: "0g" },
        recipes: [
            { title: "Macambo Tostado con Sal", instructions: ["Similar a las almendras, tostar y servir."] },
            { title: "Chocolate de Macambo", instructions: ["Moler semillas y mezclar con cacao al 100%."] },
            { title: "Trail Mix Amazónico", instructions: ["Mezclar macambo con castañas de Brasil."] }
        ]
    },
    {
        id: "10",
        name: "Castaña de Brasil",
        scientificName: "Bertholletia excelsa",
        image: "https://images.unsplash.com/photo-1599307733470-3571d46f56f1?q=80&w=800&auto=format&fit=crop",
        category: "Nuez",
        description: "Rey del selenio. Dos castañas al día cubren el requerimiento para proteger la glándula tiroides.",
        metabolicBenefits: ["Salud tiroidea", "Antioxidante potente", "Grados saludables"],
        nutrients: { protein: "14g", fiber: "8g", sugar: "2g" },
        recipes: [
            { title: "Leche de Castañas", instructions: ["Remojar, licuar y filtrar.", "Usar para café o batidos."] },
            { title: "Queso Vegano de Castañas", instructions: ["Procesar con levadura nutricional y limón."] },
            { title: "Castañas picadas en Bowl", instructions: ["Añadir a yogur griego sin azúcar."] }
        ]
    },
    {
        id: "11",
        name: "Aguaymanto",
        scientificName: "Physalis peruviana",
        image: "https://images.unsplash.com/photo-1595123550441-df13b246cdbf?q=80&w=800&auto=format&fit=crop",
        category: "Fruta",
        description: "Superfruta ácida y rica en Vitamina A y C. Ayuda a purificar la sangre y tonificar el nervio óptico.",
        metabolicBenefits: ["Salud ocular", "Inmunidad", "Bajo azúcar"],
        nutrients: { protein: "1g", fiber: "4g", sugar: "8g" },
        recipes: [
            { title: "Smoothie de Aguaymanto", instructions: ["Licuar con agua, hielo y espinaca."] },
            { title: "Salsa de Aguaymanto para Pollo", instructions: ["Reducir fruta con un poco de agua y hierbas."] },
            { title: "Aguaymantos Deshidratados", instructions: ["Secar al sol para un snack."] }
        ]
    },
    {
        id: "12",
        name: "Maca Negra",
        scientificName: "Lepidium meyenii",
        image: "https://images.unsplash.com/photo-1584263347416-85a18a4524a2?q=80&w=800&auto=format&fit=crop",
        category: "Raíz/Adaptógeno",
        description: "Adaptógeno potente que equilibra el sistema endocrino. Mejora la resistencia al estrés.",
        metabolicBenefits: ["Energía adaptogénica", "Equilibrio hormonal", "Memoria"],
        nutrients: { protein: "10g", fiber: "8g", sugar: "30g (carbohidratos complejos)" },
        recipes: [
            { title: "Shot de Maca Mañanero", instructions: ["Diluir 1 cucharadita en agua tibia."] },
            { title: "Galletas de Maca y Coco", instructions: ["Harina de coco, maca y claras."] },
            { title: "Smoothie Post-Entreno", instructions: ["Añadir maca a batido de proteína."] }
        ]
    },
    {
        id: "13",
        name: "Cacao Puro (100%)",
        scientificName: "Theobroma cacao",
        image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?q=80&w=800&auto=format&fit=crop",
        category: "Semilla",
        description: "El alimento con más magnesio del planeta. Reduce la presión arterial y mejora el estado de ánimo.",
        metabolicBenefits: ["Control de presión", "Rico en Magnesio", "Felicidad"],
        nutrients: { protein: "20g", fiber: "33g", sugar: "0g" },
        recipes: [
            { title: "Chocolate Caliente Especiado", instructions: ["Agua, cacao puro, canela y pimienta cayena."] },
            { title: "Nibs de Cacao en Bowl", instructions: ["Añadir a cualquier preparación para crunch."] },
            { title: "Mousse de Cacao y Palta", instructions: ["Licuar palta madura con cacao y estevia."] }
        ]
    },
    {
        id: "14",
        name: "Lúcuma",
        scientificName: "Pouteria lucuma",
        image: "https://images.unsplash.com/photo-1628102476625-5927ad646732?q=80&w=800&auto=format&fit=crop",
        category: "Fruta",
        description: "El 'oro de los incas'. Edulcorante natural con bajo índice glucémico y rico en niacina (B3).",
        metabolicBenefits: ["Sustituto de azúcar", "Salud de la piel", "Niacina"],
        nutrients: { protein: "2g", fiber: "2g", sugar: "10g" },
        recipes: [
            { title: "Helado de Lúcuma Fit", instructions: ["Plátano congelado licuado con polvo de lúcuma."] },
            { title: "Batido de Lúcuma y Vainilla", instructions: ["Leche de coco, lúcuma y vainilla."] },
            { title: "Manjar de Lúcuma", instructions: ["Procesar dátiles con lúcuma."] }
        ]
    },
    {
        id: "15",
        name: "Palta (Aguacate)",
        scientificName: "Persea americana",
        image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=800&auto=format&fit=crop",
        category: "Fruta/Grasilla",
        description: "Grasas monoinsaturadas esenciales para la salud celular y la absorción de vitaminas liposolubles.",
        metabolicBenefits: ["Grasas saludables", "Salud cardíaca", "Absorción de nutrientes"],
        nutrients: { protein: "2g", fiber: "7g", sugar: "0.7g" },
        recipes: [
            { title: "Guacamole Clásico", instructions: ["Cebolla, tomate, limón y culantro."] },
            { title: "Palta Rellena de Atún", instructions: ["Atún al agua en el centro de la palta."] },
            { title: "Tostada de Centeno y Palta", instructions: ["Rodajas de palta con semillas de cáñamo."] }
        ]
    },
    {
        id: "16",
        name: "Yacón",
        scientificName: "Smallanthus sonchifolius",
        image: "/yacon_metabolic_syrup_1772295600000_1772295881070.png",
        category: "Raíz",
        description: "Contiene FOS (fructooligosacáridos), una forma de azúcar que no se absorbe y alimenta la microbiota.",
        metabolicBenefits: ["Prebiótico potente", "Control de glucosa", "Salud digestiva"],
        nutrients: { protein: "0.5g", fiber: "2g", sugar: "5g (FOS)" },
        recipes: [
            { title: "Jarabe de Yacón Casero", instructions: ["Extraer zumo y reducir a fuego lento."] },
            { title: "Ensalada Crujiente", instructions: ["Cortar yacón en cubos, similar a la manzana."] },
            { title: "Té de Hojas de Yacón", instructions: ["Hervir hojas secas."] }
        ]
    },
    {
        id: "17",
        name: "Tuna (Nopal)",
        scientificName: "Opuntia ficus-indica",
        image: "https://images.unsplash.com/photo-1605282924197-0f8c8574c868?q=80&w=800&auto=format&fit=crop",
        category: "Fruta/Cactácea",
        description: "Rica en pectina, ayuda a evitar que el azúcar se absorba rápidamente en el intestino.",
        metabolicBenefits: ["Filtro de azúcares", "Hidratación", "Fibra soluble"],
        nutrients: { protein: "1g", fiber: "4g", sugar: "10g" },
        recipes: [
            { title: "Jugo de Tuna y Piña", instructions: ["Licuar y colar."], },
            { title: "Ensalada de Nopal", instructions: ["Si es nopal (la hoja), hervir y picar con tomate."] },
            { title: "Tunas con Melón", instructions: ["Mix de frutas hidratantes."] }
        ]
    },
    {
        id: "18",
        name: "Muña",
        scientificName: "Minthostachys mollis",
        image: "https://images.unsplash.com/photo-1543363950-c78545037afc?q=80&w=800&auto=format&fit=crop",
        category: "Hierba",
        description: "Digestivo andino por excelencia. Elimina gases y combate la Helicobacter Pylori.",
        metabolicBenefits: ["Digestión perfecta", "Antibacteriano", "Calcio"],
        nutrients: { protein: "0g", fiber: "0g", sugar: "0g" },
        recipes: [
            { title: "Infusión de Muña", instructions: ["Hojas frescas en agua caliente (no hirviendo)."] },
            { title: "Agua de Muña y Limón", instructions: ["Refrescante para después de comer."] },
            { title: "Aceite Aromatizado", instructions: ["Infundir hojas en aceite de oliva."] }
        ]
    },
    {
        id: "19",
        name: "Coca (Hoja Sagrada)",
        scientificName: "Erythroxylum coca",
        image: "https://images.unsplash.com/photo-1632766327318-7b9499805cb5?q=80&w=800&auto=format&fit=crop",
        category: "Hoja/Adaptógeno",
        description: "Contiene alcaloides que mejoran la oxigenación celular y suprimen el apetito de forma natural.",
        metabolicBenefits: ["Oxigenación", "Control de hambre", "Calcio biodisponible"],
        nutrients: { protein: "19g (hoja seca)", fiber: "45g", sugar: "0g" },
        recipes: [
            { title: "Mate de Coca", instructions: ["Tradicional filtrante o hojas enteras."] },
            { title: "Harina de Coca en Batidos", instructions: ["Añadir 1/2 cucharadita para energía."] },
            { title: "Extracto Verde", instructions: ["Combinar con espinaca y apio."] }
        ]
    },
    {
        id: "20",
        name: "Sancayo",
        scientificName: "Corryocactus brevistylus",
        image: "https://images.unsplash.com/photo-1559181567-c3190cb9959b?q=80&w=800&auto=format&fit=crop",
        category: "Fruta/Cactácea",
        description: "Cactus andino extremadamente ácido y hidratante. Excelente para bajar el estrés metabólico.",
        metabolicBenefits: ["Altísima Vitamina C", "Hidratación", "Antioxidante"],
        nutrients: { protein: "1g", fiber: "3g", sugar: "5g" },
        recipes: [
            { title: "Sancayo Sour Fit", instructions: ["Zumo de sancayo, clara de huevo y estevia."] },
            { title: "Agua de Sancayo", instructions: ["Mezclar zumo con mucha agua fría."] },
            { title: "Mermelada de Sancayo", instructions: ["Cocer fruta con chía para espesar."] }
        ]
    }
];
