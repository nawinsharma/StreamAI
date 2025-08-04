declare module 'gtts' {
  class gTTS {
    constructor(text: string, lang: string);
    save(filename: string, callback: (err: Error | null) => void): void;
  }
  export = gTTS;
}

declare module 'shortid' {
  function generate(): string;
  export = { generate };
} 