export class CreateProductDto {
    id?: number;
    name: string;
    category: string;
    unit: string;
    description?: string;
}

export class ProductDto {
    id: number;
    name: string;
    category: string;
    unit: string;
    description?: string;
}