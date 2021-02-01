# Changelog
## JANUARY 2021
### 5.0.1, 5.0.2
- change from npm to yarn
### 5.0.0
- redesign to include more functionality
- multiple channels
- cleaner code
- separates provider, ws url from other logic
- adds 'channel' meta property by default
- adds 'matchChannel' option for permitting actions
- matches on channel by default
- **Breaking Changes**
  - new import `{ createCableCarRoute }`

### 4.0.1
- small bugfix
- updates webpack, node packages, npm audit fix
### 4.0.0
- rewrite using TypeScript and Redux toolkit best practices
- **Breaking Changes**
  - new import `{ createCableCar }`
  - `prefix` option deprecated
  - `permittedActions` option added
  - new action type format:
    - *redux-cablecar/INITIALIZED*
    - *redux-cablecar/CONNECTED*
    - *redux-cablecar/DISCONNECTED*
    - *redux-cablecar/REJECTED*
#### Permitted Actions (`permittedActions`)
- can be string, RegExp, (string|RegExp)[], or function

## AUGUST 2020
### 3.0.11 - npm package updates

## JULY 2020
### 3.0.10 - npm package updates

## JUNE 2020
### 3.0.9
- `prefix` config option accepts list of strings for use w/ different action name conventions

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
