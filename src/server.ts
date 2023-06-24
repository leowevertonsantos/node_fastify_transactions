import { app } from './app';
import { environment } from './env';

app.listen({ port: environment.PORT }).then((value) => {
  console.log(
    `Server running in ${value} in ${environment.NODE_ENV} environment`
  );
});
