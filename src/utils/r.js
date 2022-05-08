import { useState } from 'react';
import { hofGetDOMValue } from './c';

const HOOK = Symbol('hook私有属性');

/**
 * react useState proxy封装
 * @param {object} initState 状态
 */
export function hookGetState(initState) {
    if ('[object Object]' === Object.prototype.toString.call(initState))
        return new Proxy(Object.entries(initState).reduce((prev, [key, dv]) => {
            const [val, set] = useState(dv);
            prev[key] = { val, set };
            return prev;
        }, {
            [HOOK]: null,
            *[Symbol.iterator]() {
                const keys = Object.keys(this);
                for (const key of keys)
                    yield { key, ...this[HOOK][key] };
            }
        }), {
            get(tar, prop) {
                if (Symbol.iterator === prop)
                    return tar[prop];
                else if (HOOK === prop)
                    return tar;
                else
                    return tar[prop]?.val;
            },
            set(tar, prop, val) {
                const rev = 'function' === typeof tar[prop]?.set;
                if (rev)
                    tar[prop].set(val);
                return rev;
            }
        });
    else
        throw new Error('hookGetState() 参数错误');
}

export function hookSetState(target, state) {
    if (Reflect.has(target, HOOK)) {
        const keys = Object.keys(state);
        for (const key of keys)
            target[key] = state[key];
    }
    else
        throw new Error('hookSetState() 参数错误');
}

export function hofFormBindValue({ state, key, cbn="onChange", hof=hofGetDOMValue, ...rest }) {
    if (Reflect.has(state, HOOK) && Reflect.has(state, key))
        return {
            value: state[key],
            [cbn]: hof(v => state[key] = v)
        };
    throw new Error("hofFormBindValue() 参数错误");
}
