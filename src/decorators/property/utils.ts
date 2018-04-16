export function applyNewDescriptor(target, key, descriptor, newDescriptor) {
  if (descriptor) {
    // babel-plugin-transform-decorators-legacy
    newDescriptor.initializer = descriptor.initializer;
    return newDescriptor;
  }

  // TypeScript
  Object.defineProperty(target, key, newDescriptor);
}
