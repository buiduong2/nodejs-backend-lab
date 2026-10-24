import { AsyncLocalStorage } from 'node:async_hooks'

export type MdcData = Record<string, unknown>

/**
 * Quản lý Mapped Diagnostic Context (MDC) bằng AsyncLocalStorage.
 *
 * Cho phép lưu trữ và truy xuất metadata (requestId, userId, traceId...)
 * trong cùng một asynchronous execution context mà không cần truyền
 * dữ liệu qua từng lời gọi hàm.
 *
 * LogContext có thể được sử dụng dưới dạng Singleton.
 * Mỗi async execution context vẫn có dữ liệu MDC riêng biệt,
 * giúp tránh xung đột dữ liệu giữa các HTTP request đồng thời.
 *
 * @example
 * logContext.run({ requestId: 'req-123' }, async () => {
 *   await service.execute();
 *   console.log(logContext.get()); // { requestId: 'req-123' }
 * });
 */
export class LogContext {
	private readonly storage = new AsyncLocalStorage<MdcData>()

	/**
	 *  Thiết lập Context cho callback và các tác vụ async phát sinh từ đó
	 * @param data: Default MdcData - khởi tạo giá trị
	 * @param callback:  callback mà tất cả các code trong đó có thể truy cập vào cùng AsyncLocalStorage
	 */
	run<T>(data: MdcData, callback: () => T): T {
		return this.storage.run(data, callback)
	}

	/**
	 * Lấy Context hiện tại
	 * @returns  Trả về dữ Object sống trong một async execution context.
	 */
	get(): MdcData | undefined {
		return this.storage.getStore()
	}
}
