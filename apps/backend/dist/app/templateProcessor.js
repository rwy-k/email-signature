import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class TemplateProcessor {
    /**
     * Retrieves all available template information
     * @returns Array of template objects with id, name, and description
     */
    static getAllTemplates() {
        try {
            const templatesDir = path.join(__dirname, '../templates');
            if (!fs.existsSync(templatesDir)) {
                console.error('Templates directory not found:', templatesDir);
                return [];
            }
            const files = fs.readdirSync(templatesDir);
            const templates = files
                .filter(file => file.endsWith('.html'))
                .map(file => {
                const id = file.replace('.html', '');
                try {
                    const content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
                    return {
                        id,
                        content
                    };
                }
                catch (error) {
                    console.error(`Error reading template ${file}:`, error);
                    return {
                        id,
                        content: ''
                    };
                }
            });
            return templates;
        }
        catch (error) {
            console.error('Error getting template list:', error);
            return [];
        }
    }
    /**
     * Renders an HTML template with the provided user data
     * @param templateId - The ID or name of the template to use
     * @param userData - User information to populate the template
     * @returns Rendered HTML signature
     */
    static renderHtml(templateId, userData) {
        const templateContent = this.getTemplateContent(templateId);
        return this.processTemplate(templateContent, userData);
    }
    /**
     * Generates a plain text version of the signature
     * @param userData - User information for the signature
     * @returns Plain text signature
     */
    static renderPlainText(userData) {
        let plainText = `${userData.name || ''}\n${userData.title || ''}\n${userData.company || ''}\n\n`;
        if (userData.phone) {
            plainText += `Phone: ${userData.phone}\n`;
        }
        if (userData.email) {
            plainText += `Email: ${userData.email}\n`;
        }
        if (userData.website) {
            plainText += `Website: ${userData.website}\n`;
        }
        if (userData.disclaimer) {
            plainText += `\n${userData.disclaimer}`;
        }
        return plainText;
    }
    /**
     * Retrieves the template content by ID
     * @param templateId - The ID or name of the template
     * @returns Template HTML content
     */
    static getTemplateContent(templateId) {
        try {
            if (!/^[a-zA-Z0-9_-]+$/.test(templateId)) {
                throw new Error('Invalid template ID format');
            }
            const templatePath = path.join(__dirname, '../templates', `${templateId}.html`);
            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template with ID '${templateId}' not found`);
            }
            return fs.readFileSync(templatePath, 'utf8');
        }
        catch (error) {
            console.error(`Error loading template ${templateId}:`, error);
            // Return a basic fallback template in case of error
            return `<table>
                <tr>
                    <td>
                        <h1><%= fullName %></h1>
                        <p><%= jobTitle %></p>
                        <p><%= companyName %></p>
                        <p><%= phone %></p>
                        <p><%= email %></p>
                        <p><%= website %></p>
                    </td>
                </tr>
            </table>`;
        }
    }
    /**
     * Processes a template by using EJS to render the template with user data
     * @param template - Template string with EJS syntax
     * @param userData - User information to substitute
     * @returns Processed template with values
     */
    static processTemplate(template, userData) {
        try {
            return ejs.render(template, userData, {
                rmWhitespace: false,
                escape: (markup) => markup
            });
        }
        catch (error) {
            console.error('Error rendering template with EJS:', error);
            // Return a simple fallback if rendering fails
            return `<table><tr><td>Error rendering template: ${error instanceof Error ? error.message : error}</td></tr></table>`;
        }
    }
}
