import { Theme, SourceContent } from '../types';

export interface SourceAdapter {
    readonly name: string;

    fetchContent(theme: Theme): Promise<SourceContent[]>;
}
