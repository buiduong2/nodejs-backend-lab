### trong Springbooot ta thường làm 


```java
public interface TaskRepository
    extends JpaRepository<Task, Long> {
}
```

- Còn TypeORM đã cung cấp sẵn

```js
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}
}
```


### Hoặc ta có thể wrapper lại trong NestJS 

### Create trong TypeORM

-  Bạn có thể xem repository.create() như một factory method thay thế cho việc gọi constructor new Entity(),