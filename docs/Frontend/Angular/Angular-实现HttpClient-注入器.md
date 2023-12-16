```
// https://stackoverflow.com/questions/49507928/how-to-inject-httpclient-in-static-method-or-custom-class
export function httpManual() {
  const injector = Injector.create({
    providers: [
      { provide: HttpClient, deps: [HttpHandler] },
      { provide: HttpHandler, useValue: new HttpXhrBackend({ build: () => new XMLHttpRequest }) },
    ],
  });
  const http = injector.get(HttpClient);
  return http.get(`https://jsonplaceholder.typicode.com/todos`);
}
```
