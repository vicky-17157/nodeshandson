var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = function (obj, key, value) { return key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value: value }) : obj[key] = value; };
var __spreadValues = function (a, b) {
    for (var prop in b || (b = {}))
        if (__hasOwnProp.call(b, prop))
            __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
        for (var _i = 0, _c = __getOwnPropSymbols(b); _i < _c.length; _i++) {
            var prop = _c[_i];
            if (__propIsEnum.call(b, prop))
                __defNormalProp(a, prop, b[prop]);
        }
    return a;
};
var __spreadProps = function (a, b) { return __defProps(a, __getOwnPropDescs(b)); };
// src/query/react/index.ts
import { coreModule, buildCreateApi } from "@reduxjs/toolkit/query";
// src/query/react/buildHooks.ts
import { createSelector } from "@reduxjs/toolkit";
import { useCallback, useEffect as useEffect2, useLayoutEffect, useMemo, useRef as useRef2, useState } from "react";
import { QueryStatus, skipToken } from "@reduxjs/toolkit/query";
import { shallowEqual as shallowEqual2 } from "react-redux";
// src/query/react/useShallowStableValue.ts
import { useEffect, useRef } from "react";
import { shallowEqual } from "react-redux";
function useShallowStableValue(value) {
    var cache = useRef(value);
    useEffect(function () {
        if (!shallowEqual(cache.current, value)) {
            cache.current = value;
        }
    }, [value]);
    return shallowEqual(cache.current, value) ? cache.current : value;
}
// src/query/react/constants.ts
var UNINITIALIZED_VALUE = Symbol();
// src/query/react/buildHooks.ts
var useIsomorphicLayoutEffect = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined" ? useLayoutEffect : useEffect2;
var defaultQueryStateSelector = function (x) { return x; };
var defaultMutationStateSelector = function (x) { return x; };
var queryStatePreSelector = function (currentState, lastResult) {
    var data = currentState.isSuccess ? currentState.data : lastResult == null ? void 0 : lastResult.data;
    if (data === void 0)
        data = currentState.data;
    var hasData = data !== void 0;
    var isFetching = currentState.isLoading;
    var isLoading = !hasData && isFetching;
    var isSuccess = currentState.isSuccess || isFetching && hasData;
    return __spreadProps(__spreadValues({}, currentState), {
        data: data,
        isFetching: isFetching,
        isLoading: isLoading,
        isSuccess: isSuccess
    });
};
var noPendingQueryStateSelector = function (selected) {
    if (selected.isUninitialized) {
        return __spreadProps(__spreadValues({}, selected), {
            isUninitialized: false,
            isFetching: true,
            isLoading: selected.data !== void 0 ? false : true,
            status: QueryStatus.pending
        });
    }
    return selected;
};
function buildHooks(_c) {
    var api = _c.api, _d = _c.moduleOptions, batch = _d.batch, useDispatch = _d.useDispatch, useSelector = _d.useSelector, useStore = _d.useStore;
    return { buildQueryHooks: buildQueryHooks, buildMutationHook: buildMutationHook, usePrefetch: usePrefetch };
    function usePrefetch(endpointName, defaultOptions) {
        var dispatch = useDispatch();
        var stableDefaultOptions = useShallowStableValue(defaultOptions);
        return useCallback(function (arg, options) { return dispatch(api.util.prefetch(endpointName, arg, __spreadValues(__spreadValues({}, stableDefaultOptions), options))); }, [endpointName, dispatch, stableDefaultOptions]);
    }
    function buildQueryHooks(name) {
        var useQuerySubscription = function (arg, _c) {
            var _d = _c === void 0 ? {} : _c, refetchOnReconnect = _d.refetchOnReconnect, refetchOnFocus = _d.refetchOnFocus, refetchOnMountOrArgChange = _d.refetchOnMountOrArgChange, _e = _d.skip, skip = _e === void 0 ? false : _e, _f = _d.pollingInterval, pollingInterval = _f === void 0 ? 0 : _f;
            var initiate = api.endpoints[name].initiate;
            var dispatch = useDispatch();
            var stableArg = useShallowStableValue(skip ? skipToken : arg);
            var stableSubscriptionOptions = useShallowStableValue({
                refetchOnReconnect: refetchOnReconnect,
                refetchOnFocus: refetchOnFocus,
                pollingInterval: pollingInterval
            });
            var promiseRef = useRef2();
            useEffect2(function () {
                var _a;
                var lastPromise = promiseRef.current;
                if (stableArg === skipToken) {
                    lastPromise == null ? void 0 : lastPromise.unsubscribe();
                    promiseRef.current = void 0;
                    return;
                }
                var lastSubscriptionOptions = (_a = promiseRef.current) == null ? void 0 : _a.subscriptionOptions;
                if (!lastPromise || lastPromise.arg !== stableArg) {
                    lastPromise == null ? void 0 : lastPromise.unsubscribe();
                    var promise = dispatch(initiate(stableArg, {
                        subscriptionOptions: stableSubscriptionOptions,
                        forceRefetch: refetchOnMountOrArgChange
                    }));
                    promiseRef.current = promise;
                }
                else if (stableSubscriptionOptions !== lastSubscriptionOptions) {
                    lastPromise.updateSubscriptionOptions(stableSubscriptionOptions);
                }
            }, [
                dispatch,
                initiate,
                refetchOnMountOrArgChange,
                stableArg,
                stableSubscriptionOptions
            ]);
            useEffect2(function () {
                return function () {
                    var _a;
                    (_a = promiseRef.current) == null ? void 0 : _a.unsubscribe();
                    promiseRef.current = void 0;
                };
            }, []);
            return useMemo(function () { return ({
                refetch: function () {
                    var _a;
                    return void ((_a = promiseRef.current) == null ? void 0 : _a.refetch());
                }
            }); }, []);
        };
        var useLazyQuerySubscription = function (_c) {
            var _d = _c === void 0 ? {} : _c, refetchOnReconnect = _d.refetchOnReconnect, refetchOnFocus = _d.refetchOnFocus, _e = _d.pollingInterval, pollingInterval = _e === void 0 ? 0 : _e;
            var initiate = api.endpoints[name].initiate;
            var dispatch = useDispatch();
            var _f = useState(UNINITIALIZED_VALUE), arg = _f[0], setArg = _f[1];
            var promiseRef = useRef2();
            var stableSubscriptionOptions = useShallowStableValue({
                refetchOnReconnect: refetchOnReconnect,
                refetchOnFocus: refetchOnFocus,
                pollingInterval: pollingInterval
            });
            useEffect2(function () {
                var _a, _b;
                var lastSubscriptionOptions = (_a = promiseRef.current) == null ? void 0 : _a.subscriptionOptions;
                if (stableSubscriptionOptions !== lastSubscriptionOptions) {
                    (_b = promiseRef.current) == null ? void 0 : _b.updateSubscriptionOptions(stableSubscriptionOptions);
                }
            }, [stableSubscriptionOptions]);
            var subscriptionOptionsRef = useRef2(stableSubscriptionOptions);
            useEffect2(function () {
                subscriptionOptionsRef.current = stableSubscriptionOptions;
            }, [stableSubscriptionOptions]);
            var trigger = useCallback(function (arg2, preferCacheValue) {
                if (preferCacheValue === void 0) { preferCacheValue = false; }
                batch(function () {
                    var _a;
                    (_a = promiseRef.current) == null ? void 0 : _a.unsubscribe();
                    promiseRef.current = dispatch(initiate(arg2, {
                        subscriptionOptions: subscriptionOptionsRef.current,
                        forceRefetch: !preferCacheValue
                    }));
                    setArg(arg2);
                });
            }, [dispatch, initiate]);
            useEffect2(function () {
                return function () {
                    var _a;
                    (_a = promiseRef == null ? void 0 : promiseRef.current) == null ? void 0 : _a.unsubscribe();
                };
            }, []);
            useEffect2(function () {
                if (arg !== UNINITIALIZED_VALUE && !promiseRef.current) {
                    trigger(arg, true);
                }
            }, [arg, trigger]);
            return useMemo(function () { return [trigger, arg]; }, [trigger, arg]);
        };
        var useQueryState = function (arg, _c) {
            var _d = _c === void 0 ? {} : _c, _e = _d.skip, skip = _e === void 0 ? false : _e, _f = _d.selectFromResult, selectFromResult = _f === void 0 ? defaultQueryStateSelector : _f;
            var select = api.endpoints[name].select;
            var stableArg = useShallowStableValue(skip ? skipToken : arg);
            var lastValue = useRef2();
            var selectDefaultResult = useMemo(function () { return createSelector([select(stableArg), function (_, lastResult) { return lastResult; }], queryStatePreSelector); }, [select, stableArg]);
            var querySelector = useMemo(function () { return createSelector([selectDefaultResult], selectFromResult); }, [selectDefaultResult, selectFromResult]);
            var currentState = useSelector(function (state) { return querySelector(state, lastValue.current); }, shallowEqual2);
            var store = useStore();
            var newLastValue = selectDefaultResult(store.getState(), lastValue.current);
            useIsomorphicLayoutEffect(function () {
                lastValue.current = newLastValue;
            }, [newLastValue]);
            return currentState;
        };
        return {
            useQueryState: useQueryState,
            useQuerySubscription: useQuerySubscription,
            useLazyQuerySubscription: useLazyQuerySubscription,
            useLazyQuery: function (options) {
                var _c = useLazyQuerySubscription(options), trigger = _c[0], arg = _c[1];
                var queryStateResults = useQueryState(arg, __spreadProps(__spreadValues({}, options), {
                    skip: arg === UNINITIALIZED_VALUE
                }));
                var info = useMemo(function () { return ({ lastArg: arg }); }, [arg]);
                return useMemo(function () { return [trigger, queryStateResults, info]; }, [trigger, queryStateResults, info]);
            },
            useQuery: function (arg, options) {
                var querySubscriptionResults = useQuerySubscription(arg, options);
                var queryStateResults = useQueryState(arg, __spreadValues({
                    selectFromResult: arg === skipToken || (options == null ? void 0 : options.skip) ? void 0 : noPendingQueryStateSelector
                }, options));
                return useMemo(function () { return __spreadValues(__spreadValues({}, queryStateResults), querySubscriptionResults); }, [queryStateResults, querySubscriptionResults]);
            }
        };
    }
    function buildMutationHook(name) {
        return function (_c) {
            var _d = _c === void 0 ? {} : _c, _e = _d.selectFromResult, selectFromResult = _e === void 0 ? defaultMutationStateSelector : _e;
            var _a;
            var _f = api.endpoints[name], select = _f.select, initiate = _f.initiate;
            var dispatch = useDispatch();
            var _g = useState(), requestId = _g[0], setRequestId = _g[1];
            var promiseRef = useRef2();
            useEffect2(function () {
                return function () {
                    var _a2;
                    (_a2 = promiseRef.current) == null ? void 0 : _a2.unsubscribe();
                    promiseRef.current = void 0;
                };
            }, []);
            var triggerMutation = useCallback(function (arg) {
                var promise;
                batch(function () {
                    var _a2;
                    (_a2 = promiseRef == null ? void 0 : promiseRef.current) == null ? void 0 : _a2.unsubscribe();
                    promise = dispatch(initiate(arg));
                    promiseRef.current = promise;
                    setRequestId(promise.requestId);
                });
                return promise;
            }, [dispatch, initiate]);
            var mutationSelector = useMemo(function () { return createSelector([select(requestId || skipToken)], function (subState) { return selectFromResult(subState); }); }, [select, requestId, selectFromResult]);
            var currentState = useSelector(mutationSelector, shallowEqual2);
            var originalArgs = (_a = promiseRef.current) == null ? void 0 : _a.arg.originalArgs;
            var finalState = useMemo(function () { return __spreadProps(__spreadValues({}, currentState), {
                originalArgs: originalArgs
            }); }, [currentState, originalArgs]);
            return useMemo(function () { return [triggerMutation, finalState]; }, [triggerMutation, finalState]);
        };
    }
}
// src/query/endpointDefinitions.ts
var DefinitionType;
(function (DefinitionType2) {
    DefinitionType2["query"] = "query";
    DefinitionType2["mutation"] = "mutation";
})(DefinitionType || (DefinitionType = {}));
function isQueryDefinition(e) {
    return e.type === DefinitionType.query;
}
function isMutationDefinition(e) {
    return e.type === DefinitionType.mutation;
}
// src/query/utils/capitalize.ts
function capitalize(str) {
    return str.replace(str[0], str[0].toUpperCase());
}
// src/query/tsHelpers.ts
function safeAssign(target) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    Object.assign.apply(Object, __spreadArray([target], args));
}
// src/query/react/module.ts
import { useDispatch as rrUseDispatch, useSelector as rrUseSelector, useStore as rrUseStore, batch as rrBatch } from "react-redux";
var reactHooksModuleName = /* @__PURE__ */ Symbol();
var reactHooksModule = function (_c) {
    var _d = _c === void 0 ? {} : _c, _e = _d.batch, batch = _e === void 0 ? rrBatch : _e, _f = _d.useDispatch, useDispatch = _f === void 0 ? rrUseDispatch : _f, _g = _d.useSelector, useSelector = _g === void 0 ? rrUseSelector : _g, _h = _d.useStore, useStore = _h === void 0 ? rrUseStore : _h;
    return ({
        name: reactHooksModuleName,
        init: function (api, options, context) {
            var anyApi = api;
            var _c = buildHooks({
                api: api,
                moduleOptions: { batch: batch, useDispatch: useDispatch, useSelector: useSelector, useStore: useStore }
            }), buildQueryHooks = _c.buildQueryHooks, buildMutationHook = _c.buildMutationHook, usePrefetch = _c.usePrefetch;
            safeAssign(anyApi, { usePrefetch: usePrefetch });
            safeAssign(context, { batch: batch });
            return {
                injectEndpoint: function (endpointName, definition) {
                    if (isQueryDefinition(definition)) {
                        var _c = buildQueryHooks(endpointName), useQuery = _c.useQuery, useLazyQuery = _c.useLazyQuery, useLazyQuerySubscription = _c.useLazyQuerySubscription, useQueryState = _c.useQueryState, useQuerySubscription = _c.useQuerySubscription;
                        safeAssign(anyApi.endpoints[endpointName], {
                            useQuery: useQuery,
                            useLazyQuery: useLazyQuery,
                            useLazyQuerySubscription: useLazyQuerySubscription,
                            useQueryState: useQueryState,
                            useQuerySubscription: useQuerySubscription
                        });
                        api["use" + capitalize(endpointName) + "Query"] = useQuery;
                        api["useLazy" + capitalize(endpointName) + "Query"] = useLazyQuery;
                    }
                    else if (isMutationDefinition(definition)) {
                        var useMutation = buildMutationHook(endpointName);
                        safeAssign(anyApi.endpoints[endpointName], {
                            useMutation: useMutation
                        });
                        api["use" + capitalize(endpointName) + "Mutation"] = useMutation;
                    }
                }
            };
        }
    });
};
// src/query/react/index.ts
export * from "@reduxjs/toolkit/query";
// src/query/react/ApiProvider.tsx
import { configureStore } from "@reduxjs/toolkit";
import React from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
function ApiProvider(props) {
    var store = React.useState(function () {
        var _c;
        return configureStore({
            reducer: (_c = {},
                _c[props.api.reducerPath] = props.api.reducer,
                _c),
            middleware: function (gDM) { return gDM().concat(props.api.middleware); }
        });
    })[0];
    setupListeners(store.dispatch, props.setupListeners);
    return /* @__PURE__ */ React.createElement(Provider, {
        store: store,
        context: props.context
    }, props.children);
}
// src/query/react/index.ts
var createApi = /* @__PURE__ */ buildCreateApi(coreModule(), reactHooksModule());
export { ApiProvider, createApi, reactHooksModule };
//# sourceMappingURL=rtk-query-react.esm.js.map