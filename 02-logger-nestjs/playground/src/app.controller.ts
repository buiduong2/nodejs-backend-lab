import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from './user.service';
import { TaskService } from './task.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
    private readonly taskService: TaskService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Test 1: Logger Injection
   *
   * - Logger nhận diện đúng tên từng Service qua INQUIRER.
   * - Hai Service nhận cùng MDC trong một HTTP request.
   * - Kiểm tra log level INFO và WARN.
   */
  // curl http://localhost:3000/test-logger
  @Get('test-logger')
  testLoggerInjection() {
    this.taskService.execute();
    this.userService.execute();

    return { message: 'Logger injection test completed' };
  }

  /**
   * Test 2: Async Context Isolation
   *
   * - MDC được giữ nguyên trước và sau await.
   * - Mỗi HTTP request có requestId riêng.
   * - Các request đồng thời không bị lẫn MDC.
   */
  // curl -s http://localhost:3000/test-async-context & curl -s http://localhost:3000/test-async-context & wait
  @Get('test-async-context')
  async testAsyncContextIsolation() {
    await this.taskService.executeWithDelay();

    return { message: 'Async context isolation test completed' };
  }


    /**
   * Test 3: Async Context Isolation
   *
   * - Các Sink cung cấp thêm đã hoạt động
   * - Có thể cung cấp cả sink được cung cấp bởi hệ thống.\
   * - providers đăng ký các Sink thành công.
   * - LogDispatcher phân phối log tới tất cả Sink
   * - ConsoleSink tùy chỉnh hoạt động qua useFactory
   */
  // curl -s http://localhost:3000/test-async-context & curl -s http://localhost:3000/test-async-context & wait
}
