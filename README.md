
Database Docker
```docker run -d -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password123 --name db-my -p 5432:5432  --restart=always postgres```

Cache Layer Docker
```
docker run --name=redis-devel --publish=6379:6379 --hostname=redis --restart=on-failure --detach redis:latest
```

SSH into redis
```
docker exec -it redis-devel redis-cli
```