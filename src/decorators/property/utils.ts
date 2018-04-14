export function applyNewDescriptor(target, key, descriptor, newDescriptor) {
  if (descriptor) {
    // babel-plugin-transform-decorators-legacy
    if (newDescriptor.set) {
      const value = descriptor.initializer
        ? descriptor.initializer()
        : descriptor.value;

      newDescriptor.initializer = function() {
        if (Object.getPrototypeOf(this) === target) {
          newDescriptor.set.call(this, value);
        }

        return value;
      };
    }
  } else {
    // TypeScript
    Object.defineProperty(target, key, newDescriptor);
  }

  return newDescriptor as any;
}
