import { CableCarActionFilter } from './cableCar'
import { Action } from '@reduxjs/toolkit'

const matchPrefix = (str1: string, str2: string) =>
    String(str1).slice(0, str2.length) === str2

export const getPermittedActionsFn = (
    opt: string | RegExp | CableCarActionFilter | (string | RegExp)[]
): CableCarActionFilter => {
    // if permitted actions option is a string value (prefix)
    if (typeof opt === 'string') {
        return (action: Action) => matchPrefix(String(action.type), opt)
    }

    // if permitted actions option is a list of string values (prefixes) or RegExp
    if (Array.isArray(opt)) {
        return (action: Action) =>
            opt.some((val) => {
                if (typeof val === 'string') {
                    return matchPrefix(String(action.type), val)
                }
                if (val instanceof RegExp) {
                    return String(action.type).match(val) != null
                }
            })
    }

    // if permitted actions option is a regular expression
    if (opt instanceof RegExp) {
        return (action: Action) => String(action.type).match(opt) != null
    }

    // if permitted actions option is a filter function
    if (typeof opt === 'function') {
        return (action: Action) => opt(action)
    }

    // handle errors
    throw new TypeError(
        `CableCar: 'permittedActions' option is not formatted correctly (string|string[]|RegExp|function)`
    )
}
