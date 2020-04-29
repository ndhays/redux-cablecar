# Change Log

## APRIL 2020
### 3.0.8
- race condition [bug fix](https://github.com/ndhays/redux-cablecar/issues/9)

### 3.0.7
- npm audit

## MARCH 2020 - version 3.0.6

- upgrades packages (Rails 6, security warnings)
- removes yarn


## JULY 2018 - version 3.0.0 (and 3.0.x)

- renames `matchPrefix` option to `prefix`
- default prefix option is now `RAILS`
- adds `optimisticOnFail` option

**ALSO:**
- creates `CableCarDispatcher` class to manage multiple simultaneous cablecar connections
- adds the `actioncable` package as a dependency
- removes dependency of ActionCable as a global variable
- adds ability to set the ActionCable provider on the middleware
