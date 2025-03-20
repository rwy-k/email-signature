import Queue from "bull";

export interface QueueMessage {
  type: string;
  payload: any;
}

export class Producer {
  private queue: Queue.Queue;

  constructor(queue: Queue.Queue) {
    this.queue = queue;

    this.queue.on("error", (error) => {
      console.error("Queue error:", error);
    });
  }

  public async sendSignatureRequest(
    data: string,
    webhookUrl?: string,
  ): Promise<void> {
    const jobData = {
      data,
      webhookUrl,
    };

    await this.queue.add(jobData);
  }

  public async sendMessage(message: QueueMessage): Promise<void> {
    try {
      const job = await this.queue.add(message, {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });

      console.log(`Message queued successfully. Job ID: ${job.id}`);
    } catch (error) {
      console.error("Failed to queue message:", error);
    }
  }
}
