import type { Provider } from '@nestjs/common'
import { LogLevel } from '../core/log-level'

import type { InjectionToken, ModuleMetadata } from '@nestjs/common'

/**
 * Cấu hình LoggingModule.
 *
 * Cho phép thiết lập mức log, danh sách Sink và
 * các thành phần cần thiết để khởi tạo chúng.
 */
export interface LoggingOptions {
	imports?: ModuleMetadata['imports']

	providers?: Provider[]

	/**
	 * Danh sách token của các Sink dùng để ghi log.
	 *
	 * Mỗi token phải trỏ đến một Sink đã được đăng ký
	 * thông qua providers hoặc module trong imports.
	 *
	 * Các Sink được thực thi theo danh sách cấu hình.
	 *- Không khai báo: sử dụng ConsoleSink mặc định.
	 * @example
	 * sinks: [ConsoleSink, MongoSink]
	 */
	sinks?: InjectionToken[]

	level?: LogLevel

	/**
	 * Token của bộ xử lý lỗi khi Sink ghi log thất bại.
	 *
	 * Nếu không cung cấp, lỗi được ghi ra stderr.
	 */
	sinkErrorLog?: InjectionToken

	/**
	 * Tự động tạo MDC cho mỗi HTTP request.
	 *
	 * @default true
	 */
	httpContext?: boolean
}
