import type { Selector, GetParamsFromSelectors, OutputSelector, EqualityFn, SelectorArray, SelectorResultArray, DropFirst } from './types';
export type { Selector, GetParamsFromSelectors, OutputSelector, EqualityFn, SelectorArray, SelectorResultArray, ParametricSelector, OutputParametricSelector } from './types';
import { defaultMemoize, defaultEqualityCheck, DefaultMemoizeOptions } from './defaultMemoize';
export { defaultMemoize, defaultEqualityCheck };
export type { DefaultMemoizeOptions };
export declare function createSelectorCreator<
/** Selectors will eventually accept some function to be memoized */
F extends (...args: unknown[]) => unknown, 
/** A memoizer such as defaultMemoize that accepts a function + some possible options */
MemoizeFunction extends (func: F, ...options: any[]) => F, 
/** The additional options arguments to the memoizer */
MemoizeOptions extends unknown[] = DropFirst<Parameters<MemoizeFunction>>>(memoize: MemoizeFunction, ...memoizeOptionsFromArgs: DropFirst<Parameters<MemoizeFunction>>): CreateSelectorFunction<F, MemoizeFunction, MemoizeOptions>;
interface CreateSelectorOptions<MemoizeOptions extends unknown[]> {
    memoizeOptions: MemoizeOptions[0] | MemoizeOptions;
}
/**
 * An instance of createSelector, customized with a given memoize implementation
 */
interface CreateSelectorFunction<F extends (...args: unknown[]) => unknown, MemoizeFunction extends (func: F, ...options: any[]) => F, MemoizeOptions extends unknown[] = DropFirst<Parameters<MemoizeFunction>>> {
    /** Input selectors as separate inline arguments */
    <Selectors extends SelectorArray, Result>(...items: [
        ...Selectors,
        (...args: SelectorResultArray<Selectors>) => Result
    ]): OutputSelector<Selectors, Result, ((...args: SelectorResultArray<Selectors>) => Result) & Pick<ReturnType<MemoizeFunction>, keyof ReturnType<MemoizeFunction>>, GetParamsFromSelectors<Selectors>> & Pick<ReturnType<MemoizeFunction>, keyof ReturnType<MemoizeFunction>>;
    /** Input selectors as separate inline arguments with memoizeOptions passed */
    <Selectors extends SelectorArray, Result>(...items: [
        ...Selectors,
        (...args: SelectorResultArray<Selectors>) => Result,
        CreateSelectorOptions<MemoizeOptions>
    ]): OutputSelector<Selectors, Result, ((...args: SelectorResultArray<Selectors>) => Result) & Pick<ReturnType<MemoizeFunction>, keyof ReturnType<MemoizeFunction>>, GetParamsFromSelectors<Selectors>> & Pick<ReturnType<MemoizeFunction>, keyof ReturnType<MemoizeFunction>>;
    /** Input selectors as a separate array */
    <Selectors extends SelectorArray, Result>(selectors: [...Selectors], combiner: (...args: SelectorResultArray<Selectors>) => Result, options?: CreateSelectorOptions<MemoizeOptions>): OutputSelector<Selectors, Result, ((...args: SelectorResultArray<Selectors>) => Result) & Pick<ReturnType<MemoizeFunction>, keyof ReturnType<MemoizeFunction>>, GetParamsFromSelectors<Selectors>> & Pick<ReturnType<MemoizeFunction>, keyof ReturnType<MemoizeFunction>>;
}
export declare const createSelector: CreateSelectorFunction<(...args: unknown[]) => unknown, typeof defaultMemoize, [equalityCheckOrOptions?: EqualityFn | DefaultMemoizeOptions | undefined]>;
declare type SelectorsObject = {
    [key: string]: (...args: any[]) => any;
};
export interface StructuredSelectorCreator {
    <SelectorMap extends SelectorsObject>(selectorMap: SelectorMap, selectorCreator?: CreateSelectorFunction<any, any, any>): (state: SelectorMap[keyof SelectorMap] extends (state: infer State) => unknown ? State : never) => {
        [Key in keyof SelectorMap]: ReturnType<SelectorMap[Key]>;
    };
    <State, Result = State>(selectors: {
        [K in keyof Result]: Selector<State, Result[K], never>;
    }, selectorCreator?: CreateSelectorFunction<any, any, any>): Selector<State, Result, never>;
}
export declare const createStructuredSelector: StructuredSelectorCreator;
