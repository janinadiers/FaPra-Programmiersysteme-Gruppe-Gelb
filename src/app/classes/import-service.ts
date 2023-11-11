import { Diagram } from './diagram/diagram';

export interface ImportService {
    import(content: string): Diagram | undefined;
    
}
