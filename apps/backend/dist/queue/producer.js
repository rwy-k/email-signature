export class Producer {
    constructor(queue) {
        this.queue = queue;
        this.queue.on('error', (error) => {
            console.error('Queue error:', error);
        });
    }
    async sendSignatureRequest(data, webhookUrl) {
        const jobData = {
            data,
            webhookUrl,
        };
        await this.queue.add(jobData);
    }
    async sendMessage(message) {
        try {
            const job = await this.queue.add(message, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000
                },
                removeOnComplete: true,
                removeOnFail: false
            });
            console.log(`Message queued successfully. Job ID: ${job.id}`);
        }
        catch (error) {
            console.error('Failed to queue message:', error);
        }
    }
}
