export declare class TemplateProcessor {
    static getAllTemplates(): Array<{
        id: string;
        content: string;
    }>;
    static renderHtml(templateId: string, userData: any): string;
    static renderPlainText(userData: any): string;
    static getTemplateContent(templateId: string): string;
    private static processTemplate;
}
