/**
 * Email sender interface for abstracting email provider implementation
 */
export interface EmailSender {
    sendEmail(params: {
        to: string;
        subject: string;
        html: string;
    }): Promise<{ success: boolean; error?: string }>;
}

/**
 * Resend implementation of EmailSender
 */
export class ResendEmailSender implements EmailSender {
    constructor(
        private resendClient: any,
        private fromEmail: string
    ) { }

    async sendEmail(params: {
        to: string;
        subject: string;
        html: string;
    }): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await this.resendClient.emails.send({
                from: this.fromEmail,
                to: params.to,
                subject: params.subject,
                html: params.html,
            });

            if (error) {
                console.error('[EmailSender] Error sending email:', error);
                return { success: false, error: error.message };
            }

            console.log('[EmailSender] Email sent successfully:', data?.id);
            return { success: true };
        } catch (error) {
            console.error('[EmailSender] Exception sending email:', error);
            return { success: false, error: (error as Error).message };
        }
    }
}
