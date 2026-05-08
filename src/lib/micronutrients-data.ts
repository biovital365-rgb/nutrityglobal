export interface Micronutrient {
    id: string;
    name: string;
    symbol: string;
    category: string;
    function: string;
    metabolicImpact: string;
    sources: string[];
    deficiencySigns: string[];
    dailyDose: string;
    image?: string;
}

export const micronutrientsData: Micronutrient[] = [
    {
        id: "m1",
        name: "Magnesio",
        symbol: "Mg",
        category: "Mineral Esencial",
        function: "Cofactor en más de 300 reacciones enzimáticas, incluyendo el metabolismo de la glucosa.",
        metabolicImpact: "Mejora la sensibilidad a la insulina y reduce la inflamación sistémica.",
        sources: ["Cacao Puro", "Semillas de Zapallo", "Espinaca", "Almendras"],
        deficiencySigns: ["Calambres", "Ansiedad", "Resistencia a la insulina"],
        dailyDose: "300 - 450 mg",
        image: "https://images.unsplash.com/photo-1548907040-4baa42d100fe?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "m2",
        name: "Cromo",
        symbol: "Cr",
        category: "Oligoelemento",
        function: "Potencia la acción de la insulina facilitando la entrada de glucosa a las células.",
        metabolicImpact: "Vital para el control glucémico y la reducción de antojos por carbohidratos.",
        sources: ["Brócoli", "Levadura de cerveza", "Cebada", "Hígado"],
        deficiencySigns: ["Intolerancia a la glucosa", "Fatiga", "Confusión mental"],
        dailyDose: "200 - 400 mcg",
        image: "https://images.unsplash.com/photo-1453227588063-bb302b62f50b?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "m3",
        name: "Vanadio",
        symbol: "V",
        category: "Oligoelemento",
        function: "Tiene efectos 'miméticos de la insulina', ayudando a transportar glucosa sin depender totalmente de ella.",
        metabolicImpact: "Especialmente presente en cereales andinos, ayuda a estabilizar la hemoglobina glicosilada.",
        sources: ["Granos Andinos", "Perejil", "Pimienta negra", "Hongos"],
        deficiencySigns: ["Metabolismo lento de carbohidratos", "Problemas de crecimiento"],
        dailyDose: "10 - 20 mcg",
        image: "https://images.unsplash.com/photo-1586201327102-330081300858?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "m4",
        name: "Zinc",
        symbol: "Zn",
        category: "Mineral Esencial",
        function: "Necesario para la síntesis, almacenamiento y secreción de insulina.",
        metabolicImpact: "Protege las células beta del páncreas contra el estrés oxidativo.",
        sources: ["Semillas de Sacha Inchi", "Ostras", "Carne de pastoreo", "Garbanzos"],
        deficiencySigns: ["Mala cicatrización", "Pérdida de gusto", "Inmunidad baja"],
        dailyDose: "15 - 30 mg",
        image: "https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "m5",
        name: "Selenio",
        symbol: "Se",
        category: "Oligoelemento",
        function: "Componente clave de la glutatión peroxidasa, el principal sistema antioxidante celular.",
        metabolicImpact: "Esencial para la conversión de hormonas tiroideas (T4 a T3), regulando el metabolismo base.",
        sources: ["Castañas de Brasil", "Atún", "Huevo", "Semillas de girasol"],
        deficiencySigns: ["Hipotiroidismo", "Debilidad muscular", "Envejecimiento prematuro"],
        dailyDose: "55 - 200 mcg",
        image: "https://images.unsplash.com/photo-1552345387-9a143b6fbd44?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "m6",
        name: "Antocianinas",
        symbol: "Ant",
        category: "Fitonutriente / Flavonoide",
        function: "Pigmentos naturales que protegen las plantas y los vasos sanguíneos humanos.",
        metabolicImpact: "Reducen la resistencia a la insulina y protegen contra la retinopatía diabética.",
        sources: ["Maíz Morado", "Arándanos", "Oca Morada", "Açai"],
        deficiencySigns: ["Fragilidad capilar", "Inflamación crónica", "Visión pobre"],
        dailyDose: "50 - 500 mg",
        image: "https://images.unsplash.com/photo-1513531926349-466f15ec8cc7?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "m7",
        name: "Vitamina D3",
        symbol: "D3",
        category: "Pro-hormona",
        function: "Regula el calcio y tiene receptores en casi todas las células del cuerpo, incluyendo el páncreas.",
        metabolicImpact: "Niveles bajos están fuertemente vinculados con la Diabetes Tipo 2 y enfermedades autoinmunes.",
        sources: ["Exposición solar", "Aceite de hígado de bacalao", "Yema de huevo"],
        deficiencySigns: ["Dolor óseo", "Depresión", "Infecciones frecuentes"],
        dailyDose: "2000 - 5000 IU"
    },
    {
        id: "m8",
        name: "Potasio",
        symbol: "K",
        category: "Electrolito",
        function: "Crucial para la transmisión nerviosa y la liberación de insulina tras las comidas.",
        metabolicImpact: "Ayuda a mantener la presión arterial saludable, crítica en pacientes metabólicos.",
        sources: ["Palta", "Camote", "Plátano", "Agua de coco"],
        deficiencySigns: ["Arritmias", "Debilidad", "Fatiga extrema"],
        dailyDose: "3500 - 4700 mg"
    }
];
