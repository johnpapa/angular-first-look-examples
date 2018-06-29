/**
 * Type of the Inject decorator / constructor function.
 */
export interface InjectDecorator {
    /**
     * A parameter decorator that specifies a dependency.
     *
     * For more details, see the ["Dependency Injection Guide"](guide/dependency-injection).
     *
     * @usageNotes
     * ### Example
     *
     * {@example core/di/ts/metadata_spec.ts region='Inject'}
     *
     * When `@Inject()` is not present, `Injector` will use the type annotation of the
     * parameter.
     *
     * ### Example
     *
     * {@example core/di/ts/metadata_spec.ts region='InjectWithoutDecorator'}
     */
    (token: any): any;
    new (token: any): Inject;
}
/**
 * Type of the Inject metadata.
 */
export interface Inject {
    token: any;
}
/**
 * Inject decorator and metadata.
 *
 * @Annotation
 */
export declare const Inject: InjectDecorator;
/**
 * Type of the Optional decorator / constructor function.
 */
export interface OptionalDecorator {
    /**
     * A parameter metadata that marks a dependency as optional.
     * `Injector` provides `null` if the dependency is not found.
     *
     * For more details, see the ["Dependency Injection Guide"](guide/dependency-injection).
     *
     * @usageNotes
     * ### Example
     *
     * {@example core/di/ts/metadata_spec.ts region='Optional'}
     */
    (): any;
    new (): Optional;
}
/**
 * Type of the Optional metadata.
 */
export interface Optional {
}
/**
 * Optional decorator and metadata.
 *
 * @Annotation
 */
export declare const Optional: OptionalDecorator;
/**
 * Type of the Self decorator / constructor function.
 */
export interface SelfDecorator {
    /**
     * Specifies that an `Injector` should retrieve a dependency only from itself.
     *
     * For more details, see the ["Dependency Injection Guide"](guide/dependency-injection).
     *
     * @usageNotes
     * ### Example
     *
     * {@example core/di/ts/metadata_spec.ts region='Self'}
     */
    (): any;
    new (): Self;
}
/**
 * Type of the Self metadata.
 */
export interface Self {
}
/**
 * Self decorator and metadata.
 *
 * @Annotation
 */
export declare const Self: SelfDecorator;
/**
 * Type of the SkipSelf decorator / constructor function.
 */
export interface SkipSelfDecorator {
    /**
     * Specifies that the dependency resolution should start from the parent injector.
     *
     * For more details, see the ["Dependency Injection Guide"](guide/dependency-injection).
     *
     * @usageNotes
     * ### Example
     *
     * {@example core/di/ts/metadata_spec.ts region='SkipSelf'}
     */
    (): any;
    new (): SkipSelf;
}
/**
 * Type of the SkipSelf metadata.
 *
 *
 */
export interface SkipSelf {
}
/**
 * SkipSelf decorator and metadata.
 *
 * @Annotation
 */
export declare const SkipSelf: SkipSelfDecorator;
/**
 * Type of the Host decorator / constructor function.
 */
export interface HostDecorator {
    /**
     * Specifies that an injector should retrieve a dependency from any injector until
     * reaching the host element of the current component.
     *
     * For more details, see the ["Dependency Injection Guide"](guide/dependency-injection).
     *
     * @usageNotes
     * ### Example
     *
     * {@example core/di/ts/metadata_spec.ts region='Host'}
     */
    (): any;
    new (): Host;
}
/**
 * Type of the Host metadata.
 */
export interface Host {
}
/**
 * Host decorator and metadata.
 *
 * @Annotation
 */
export declare const Host: HostDecorator;
