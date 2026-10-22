## @PathVariable của Spring Boot tương đương với @Param().

-  nên `validate` và `transform` Path Parameter, đặc biệt khi ID trong PostgreSQL của bạn có kiểu integer.
-  

```js
import { Param, ParseIntPipe, Patch, Body } from '@nestjs/common';

@Patch(':id')
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateTaskDto,
) {
  return this.tasksService.update(id, dto);
}
```

### 2. Nên sử dụng ParseIntPipe

- 