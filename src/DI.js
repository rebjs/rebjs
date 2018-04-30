export class Scope {
  context = {};
  singletons = {};
  get(name) {
    let prevScope = activeScope;
    activeScope = this;
    let value = DI.get(name);
    activeScope = prevScope;
    return value;
  }
}
const globalScope = new Scope();
let activeScope = globalScope;

const registrations = {};

export const DI = {
  Scope: Scope,

  /** Registers a factory. */
  factory(name, factory, options = {}) {
    registrations[name] = {
      factory,
      name,
      scoped: !!options.scoped,
      singleton: !!options.singleton,
    };
  },
  /** Returns a registered component value. */
  get(name) {
    const reg = registrations[name];
    if (!reg) {
      return undefined;
    }
    let {
      factory,
      scoped,
      singleton,
      type: Type,
      value,
    } = reg;
    if (Type) {
      if (singleton) {
        let scope = scoped ? activeScope : globalScope;
        value = scope.singletons[name];
        if (value === undefined) {
          value = new Type();
          scope.singletons[name] = value;
        }
      }
      else {
        value = new Type();
      }
    } else if (factory) {
      let scope = scoped ? activeScope : globalScope;
      if (singleton) {
        value = scope.singletons[name];
        if (value === undefined) {
          value = scoped ? factory(scope) : factory();
          scope.singletons[name] = value;
        }
      } else {
        value = scoped ? factory(scope) : factory();
      }
    }
    return value;
  },
  /** Returns a new Scope. */
  scope() {
    const scope = new Scope();
    return scope;
  },
  /** Registers a service type (singleton). */
  service(name, type, options = {}) {
    registrations[name] = {
      name,
      scoped: !!options.scoped,
      singleton: true,
      type,
    };
  },
  /** Registers a regular type (transient). */
  type(name, type, options) {
    registrations[name] = {
      name,
      scoped: !!options.scoped,
      singleton: false,
      type,
    };
  },
  /** Registers a value. */
  value(name, value) {
    registrations[name] = {
      name,
      scoped: false,
      singleton: false,
      value,
    };
  },

};
export default DI;
