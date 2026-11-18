import { InjectionToken, SetMetadata } from "@nestjs/common";

export const KAFKA_RELIABILITY_KEY = 'kafka_reliability';
export interface KafkaReliabilityOptions<TMessage> {
    clientToken: InjectionToken;
    getMessageKey: (msg:TMessage) => string
	maxAttempts?: number
	delayMs?: number
	backoffMultiplier?: number
	dlqTopic: string
}
export const KafkaReliable = <T>(option: KafkaReliabilityOptions<T>) =>
	SetMetadata(KAFKA_RELIABILITY_KEY, option)
