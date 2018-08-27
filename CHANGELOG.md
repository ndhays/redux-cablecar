# Change Log

## JULY 2018 - version 3.0.0 (and 3.0.x)

- renames `matchPrefix` option to `prefix`
- default prefix option is now `RAILS`
- adds `optimisticOnFail` option

**ALSO:**
- creates `CableCarDispatcher` class to manage multiple simultaneous cablecar connections
- adds the `actioncable` package as a dependency
- removes dependency of ActionCable as a global variable
- adds ability to set the ActionCable provider on the middleware
