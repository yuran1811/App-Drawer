export const classnames = (...classes: (string | boolean)[]) =>
  classes
    .filter(Boolean)
    .map((_) => _.toString().trim())
    .join(' ');
