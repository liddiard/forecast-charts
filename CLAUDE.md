# TypeScript coding guidelines

- Follow the DRY (don't repeat yourself) principle: Abstract shared logic into reusable functions.
- Use modern ECMAScript syntax.
- Coding style is single-quote strings, and no semicolons (except where required).
- Prefer arrow function syntax and use implicit return for single-line expressions.
- Always write a JSDoc-style docstring for new or modified functions.
- Avoid casting to `any`; create custom types where needed.
- Prefer functional array methods (e.g. `.map`, `.reduce`) over their imperative analogues.
- Prefer keeping objects immutable, creating new objects (e.g. with spread syntax) over mutating existing ones.

# React coding guidelines

- Same guidelines as TypeScript apply, especially regarding immutable objects and functional array methods.
- Comment all `useEffect` usages to explain why it's necessary / what it's doing.
- For any even semi-expensive calculation within a component, wrap it in a `useMemo` or `useCallback` as appropriate.
- Comment all `useMemo` or `useCallback` usages to explain what it's doing.

# CSS writing guidelines

- Follow the DRY (don't repeat yourself) principle: Use CSS variables to avoid hardcoding values that are used in multiple places.
- Use modern CSS features and syntax, including CSS nesting.
- Prefer the OKLCH color space for defining colors.
- Prefer EM and REM units for sizes, especially relating to text.
