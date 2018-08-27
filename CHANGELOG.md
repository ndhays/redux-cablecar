# Change Log

## 3.0.0 (and 3.0.1, 3.0.2)

- renames `matchPrefix` option to `prefix`
- default prefix option is now `RAILS`
- adds `optimisticOnFail` option
  
- creates `CableCarDispatcher` class to manage multiple simultaneous cablecar connections
- adds the `actioncable` package as a dependency
- removes dependency of ActionCable global variable
- adds ability to set the ActionCable provider on the middleware
