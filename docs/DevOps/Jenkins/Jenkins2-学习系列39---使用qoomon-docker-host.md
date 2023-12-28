https://stackoverflow.com/questions/48546124/what-is-linux-equivalent-of-host-docker-internal/61001152

```yaml
docker-host:
  image: qoomon/docker-host
  cap_add: [ 'NET_ADMIN', 'NET_RAW' ]
  restart: on-failure
  environment:
    - PORTS=999

some-service:
  image: ...
  environment:
    SERVER_URL: "http://docker-host:999"
  command: ...
  depends_on:
    - docker-host
```
