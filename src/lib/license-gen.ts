export function licenseGen(type: string, author: string): string {
  const year = new Date().getFullYear();

  const LICENSES: Record<string, string> = {
    MIT: `
MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy...
    `.trim(),

    "Apache-2.0": `
Apache License 2.0

Copyright (c) ${year} ${author}

Licensed under the Apache License, Version 2.0...
    `.trim(),
  };

  if (!LICENSES[type]) {
    return `❌ License type '${type}' not supported. Try: MIT, Apache-2.0`;
  }

  return LICENSES[type];
}
