import { KafkaContext } from "@nestjs/microservices";

export type DeadLetterMesage<T = unknown> = {
    originMessage: T;

    source: {
        topic: string;
        partition: number;
        offset: string;
    }

    error: {
        name: string,
        message: string
    }

    failedAt: string
}

export function  createDeadLetterMessage<T>(error: unknown, originMsg:T, kafkaContext: KafkaContext ):DeadLetterMesage<T> {

    const errorDetail:DeadLetterMesage['error'] = error instanceof Error  
    ? {
        message: error.message,
        name: error.name
    } : {
        message: String(error),
        name: "UNKNOWN"
    }
    

    return {
        originMessage: originMsg,
        error: errorDetail,
        failedAt: new Date().toISOString(),
        source: {
            partition: kafkaContext.getPartition(),
            topic: kafkaContext.getTopic(),
            offset: kafkaContext.getMessage().offset
        }

    }
}