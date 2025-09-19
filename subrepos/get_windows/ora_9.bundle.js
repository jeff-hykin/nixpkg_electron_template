// https://esm.sh/chalk@5.6.2/denonext/source/vendor/ansi-styles/index.development.mjs
var ANSI_BACKGROUND_OFFSET = 10;
var wrapAnsi16 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
var wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
var wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
var styles = {
  modifier: {
    reset: [0, 0],
    // 21 isn't widely supported and 22 does the same thing
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    // Bright color
    blackBright: [90, 39],
    gray: [90, 39],
    // Alias of `blackBright`
    grey: [90, 39],
    // Alias of `blackBright`
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    // Bright color
    bgBlackBright: [100, 49],
    bgGray: [100, 49],
    // Alias of `bgBlackBright`
    bgGrey: [100, 49],
    // Alias of `bgBlackBright`
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};
var modifierNames = Object.keys(styles.modifier);
var foregroundColorNames = Object.keys(styles.color);
var backgroundColorNames = Object.keys(styles.bgColor);
var colorNames = [...foregroundColorNames, ...backgroundColorNames];
function assembleStyles() {
  const codes = /* @__PURE__ */ new Map();
  for (const [groupName, group] of Object.entries(styles)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles, "codes", {
    value: codes,
    enumerable: false
  });
  styles.color.close = "\x1B[39m";
  styles.bgColor.close = "\x1B[49m";
  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value(red, green, blue) {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value(hex) {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          /* eslint-disable no-bitwise */
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
          /* eslint-enable no-bitwise */
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value(code) {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles;
}
var ansiStyles = assembleStyles();
var index_default = ansiStyles;

// https://esm.sh/chalk@5.6.2/denonext/chalk.development.mjs
var level = (() => {
  if (!("navigator" in globalThis)) {
    return 0;
  }
  if (globalThis.navigator.userAgentData) {
    const brand = navigator.userAgentData.brands.find(({ brand: brand2 }) => brand2 === "Chromium");
    if (brand && brand.version > 93) {
      return 3;
    }
  }
  if (/\b(Chrome|Chromium)\//.test(globalThis.navigator.userAgent)) {
    return 1;
  }
  return 0;
})();
var colorSupport = level !== 0 && {
  level,
  hasBasic: true,
  has256: level >= 2,
  has16m: level >= 3
};
var supportsColor = {
  stdout: colorSupport,
  stderr: colorSupport
};
var browser_default = supportsColor;
function stringReplaceAll(string, substring, replacer) {
  let index = string.indexOf(substring);
  if (index === -1) {
    return string;
  }
  const substringLength = substring.length;
  let endIndex = 0;
  let returnValue = "";
  do {
    returnValue += string.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = string.indexOf(substring, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
  let endIndex = 0;
  let returnValue = "";
  do {
    const gotCR = string[index - 1] === "\r";
    returnValue += string.slice(endIndex, gotCR ? index - 1 : index) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
    endIndex = index + 1;
    index = string.indexOf("\n", endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
var ANSI_BACKGROUND_OFFSET2 = 10;
var wrapAnsi162 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
var wrapAnsi2562 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
var wrapAnsi16m2 = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
var styles2 = {
  modifier: {
    reset: [0, 0],
    // 21 isn't widely supported and 22 does the same thing
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    // Bright color
    blackBright: [90, 39],
    gray: [90, 39],
    // Alias of `blackBright`
    grey: [90, 39],
    // Alias of `blackBright`
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    // Bright color
    bgBlackBright: [100, 49],
    bgGray: [100, 49],
    // Alias of `bgBlackBright`
    bgGrey: [100, 49],
    // Alias of `bgBlackBright`
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};
var modifierNames2 = Object.keys(styles2.modifier);
var foregroundColorNames2 = Object.keys(styles2.color);
var backgroundColorNames2 = Object.keys(styles2.bgColor);
var colorNames2 = [...foregroundColorNames2, ...backgroundColorNames2];
function assembleStyles2() {
  const codes = /* @__PURE__ */ new Map();
  for (const [groupName, group] of Object.entries(styles2)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles2[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles2[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles2, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles2, "codes", {
    value: codes,
    enumerable: false
  });
  styles2.color.close = "\x1B[39m";
  styles2.bgColor.close = "\x1B[49m";
  styles2.color.ansi = wrapAnsi162();
  styles2.color.ansi256 = wrapAnsi2562();
  styles2.color.ansi16m = wrapAnsi16m2();
  styles2.bgColor.ansi = wrapAnsi162(ANSI_BACKGROUND_OFFSET2);
  styles2.bgColor.ansi256 = wrapAnsi2562(ANSI_BACKGROUND_OFFSET2);
  styles2.bgColor.ansi16m = wrapAnsi16m2(ANSI_BACKGROUND_OFFSET2);
  Object.defineProperties(styles2, {
    rgbToAnsi256: {
      value(red, green, blue) {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value(hex) {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          /* eslint-disable no-bitwise */
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
          /* eslint-enable no-bitwise */
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles2.rgbToAnsi256(...styles2.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value(code) {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles2.ansi256ToAnsi(styles2.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles2.ansi256ToAnsi(styles2.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles2;
}
var ansiStyles2 = assembleStyles2();
var { stdout: stdoutColor, stderr: stderrColor } = browser_default;
var GENERATOR = Symbol("GENERATOR");
var STYLER = Symbol("STYLER");
var IS_EMPTY = Symbol("IS_EMPTY");
var levelMapping = [
  "ansi",
  "ansi",
  "ansi256",
  "ansi16m"
];
var styles22 = /* @__PURE__ */ Object.create(null);
var applyOptions = (object, options = {}) => {
  if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
    throw new Error("The `level` option should be an integer from 0 to 3");
  }
  const colorLevel = stdoutColor ? stdoutColor.level : 0;
  object.level = options.level === void 0 ? colorLevel : options.level;
};
var chalkFactory = (options) => {
  const chalk2 = (...strings) => strings.join(" ");
  applyOptions(chalk2, options);
  Object.setPrototypeOf(chalk2, createChalk.prototype);
  return chalk2;
};
function createChalk(options) {
  return chalkFactory(options);
}
Object.setPrototypeOf(createChalk.prototype, Function.prototype);
for (const [styleName, style] of Object.entries(index_default)) {
  styles22[styleName] = {
    get() {
      const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
      Object.defineProperty(this, styleName, { value: builder });
      return builder;
    }
  };
}
styles22.visible = {
  get() {
    const builder = createBuilder(this, this[STYLER], true);
    Object.defineProperty(this, "visible", { value: builder });
    return builder;
  }
};
var getModelAnsi = (model, level2, type, ...arguments_) => {
  if (model === "rgb") {
    if (level2 === "ansi16m") {
      return index_default[type].ansi16m(...arguments_);
    }
    if (level2 === "ansi256") {
      return index_default[type].ansi256(index_default.rgbToAnsi256(...arguments_));
    }
    return index_default[type].ansi(index_default.rgbToAnsi(...arguments_));
  }
  if (model === "hex") {
    return getModelAnsi("rgb", level2, type, ...index_default.hexToRgb(...arguments_));
  }
  return index_default[type][model](...arguments_);
};
var usedModels = ["rgb", "hex", "ansi256"];
for (const model of usedModels) {
  styles22[model] = {
    get() {
      const { level: level2 } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level2], "color", ...arguments_), index_default.color.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
  const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
  styles22[bgModel] = {
    get() {
      const { level: level2 } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level2], "bgColor", ...arguments_), index_default.bgColor.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
}
var proto = Object.defineProperties(() => {
}, {
  ...styles22,
  level: {
    enumerable: true,
    get() {
      return this[GENERATOR].level;
    },
    set(level2) {
      this[GENERATOR].level = level2;
    }
  }
});
var createStyler = (open, close, parent) => {
  let openAll;
  let closeAll;
  if (parent === void 0) {
    openAll = open;
    closeAll = close;
  } else {
    openAll = parent.openAll + open;
    closeAll = close + parent.closeAll;
  }
  return {
    open,
    close,
    openAll,
    closeAll,
    parent
  };
};
var createBuilder = (self, _styler, _isEmpty) => {
  const builder = (...arguments_) => applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
  Object.setPrototypeOf(builder, proto);
  builder[GENERATOR] = self;
  builder[STYLER] = _styler;
  builder[IS_EMPTY] = _isEmpty;
  return builder;
};
var applyStyle = (self, string) => {
  if (self.level <= 0 || !string) {
    return self[IS_EMPTY] ? "" : string;
  }
  let styler = self[STYLER];
  if (styler === void 0) {
    return string;
  }
  const { openAll, closeAll } = styler;
  if (string.includes("\x1B")) {
    while (styler !== void 0) {
      string = stringReplaceAll(string, styler.close, styler.open);
      styler = styler.parent;
    }
  }
  const lfIndex = string.indexOf("\n");
  if (lfIndex !== -1) {
    string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
  }
  return openAll + string + closeAll;
};
Object.defineProperties(createChalk.prototype, styles22);
var chalk = createChalk();
var chalkStderr = createChalk({ level: stderrColor ? stderrColor.level : 0 });

// https://esm.sh/mimic-function@5.0.1/denonext/mimic-function.development.mjs
var copyProperty = (to, from, property, ignoreNonConfigurable) => {
  if (property === "length" || property === "prototype") {
    return;
  }
  if (property === "arguments" || property === "caller") {
    return;
  }
  const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
  const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);
  if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
    return;
  }
  Object.defineProperty(to, property, fromDescriptor);
};
var canCopyProperty = function(toDescriptor, fromDescriptor) {
  return toDescriptor === void 0 || toDescriptor.configurable || toDescriptor.writable === fromDescriptor.writable && toDescriptor.enumerable === fromDescriptor.enumerable && toDescriptor.configurable === fromDescriptor.configurable && (toDescriptor.writable || toDescriptor.value === fromDescriptor.value);
};
var changePrototype = (to, from) => {
  const fromPrototype = Object.getPrototypeOf(from);
  if (fromPrototype === Object.getPrototypeOf(to)) {
    return;
  }
  Object.setPrototypeOf(to, fromPrototype);
};
var wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/
${fromBody}`;
var toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, "toString");
var toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name");
var changeToString = (to, from, name) => {
  const withName = name === "" ? "" : `with ${name.trim()}() `;
  const newToString = wrappedToString.bind(null, withName, from.toString());
  Object.defineProperty(newToString, "name", toStringName);
  const { writable, enumerable, configurable } = toStringDescriptor;
  Object.defineProperty(to, "toString", { value: newToString, writable, enumerable, configurable });
};
function mimicFunction(to, from, { ignoreNonConfigurable = false } = {}) {
  const { name } = to;
  for (const property of Reflect.ownKeys(from)) {
    copyProperty(to, from, property, ignoreNonConfigurable);
  }
  changePrototype(to, from);
  changeToString(to, from, name);
  return to;
}

// https://esm.sh/onetime@7.0.0/denonext/onetime.development.mjs
var calledFunctions = /* @__PURE__ */ new WeakMap();
var onetime = (function_, options = {}) => {
  if (typeof function_ !== "function") {
    throw new TypeError("Expected a function");
  }
  let returnValue;
  let callCount = 0;
  const functionName = function_.displayName || function_.name || "<anonymous>";
  const onetime2 = function(...arguments_) {
    calledFunctions.set(onetime2, ++callCount);
    if (callCount === 1) {
      returnValue = function_.apply(this, arguments_);
      function_ = void 0;
    } else if (options.throw === true) {
      throw new Error(`Function \`${functionName}\` can only be called once`);
    }
    return returnValue;
  };
  mimicFunction(onetime2, function_);
  calledFunctions.set(onetime2, callCount);
  return onetime2;
};
onetime.callCount = (function_) => {
  if (!calledFunctions.has(function_)) {
    throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
  }
  return calledFunctions.get(function_);
};
var index_default3 = onetime;

// https://esm.sh/signal-exit@4.1.0/denonext/signals.development.mjs
import __Process$ from "node:process";
var signals = [];
signals.push("SIGHUP", "SIGINT", "SIGTERM");
if (__Process$.platform !== "win32") {
  signals.push(
    "SIGALRM",
    "SIGABRT",
    "SIGVTALRM",
    "SIGXCPU",
    "SIGXFSZ",
    "SIGUSR2",
    "SIGTRAP",
    "SIGSYS",
    "SIGQUIT",
    "SIGIOT"
    // should detect profiler and enable/disable accordingly.
    // see #21
    // 'SIGPROF'
  );
}
if (__Process$.platform === "linux") {
  signals.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
}

// https://esm.sh/signal-exit@4.1.0/denonext/signal-exit.development.mjs
import __Process$2 from "node:process";
var processOk = (process22) => !!process22 && typeof process22 === "object" && typeof process22.removeListener === "function" && typeof process22.emit === "function" && typeof process22.reallyExit === "function" && typeof process22.listeners === "function" && typeof process22.kill === "function" && typeof process22.pid === "number" && typeof process22.on === "function";
var kExitEmitter = Symbol.for("signal-exit emitter");
var global = globalThis;
var ObjectDefineProperty = Object.defineProperty.bind(Object);
var Emitter = class {
  emitted = {
    afterExit: false,
    exit: false
  };
  listeners = {
    afterExit: [],
    exit: []
  };
  count = 0;
  id = Math.random();
  constructor() {
    if (global[kExitEmitter]) {
      return global[kExitEmitter];
    }
    ObjectDefineProperty(global, kExitEmitter, {
      value: this,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
  on(ev, fn) {
    this.listeners[ev].push(fn);
  }
  removeListener(ev, fn) {
    const list = this.listeners[ev];
    const i2 = list.indexOf(fn);
    if (i2 === -1) {
      return;
    }
    if (i2 === 0 && list.length === 1) {
      list.length = 0;
    } else {
      list.splice(i2, 1);
    }
  }
  emit(ev, code, signal) {
    if (this.emitted[ev]) {
      return false;
    }
    this.emitted[ev] = true;
    let ret = false;
    for (const fn of this.listeners[ev]) {
      ret = fn(code, signal) === true || ret;
    }
    if (ev === "exit") {
      ret = this.emit("afterExit", code, signal) || ret;
    }
    return ret;
  }
};
var SignalExitBase = class {
};
var signalExitWrap = (handler) => {
  return {
    onExit(cb, opts) {
      return handler.onExit(cb, opts);
    },
    load() {
      return handler.load();
    },
    unload() {
      return handler.unload();
    }
  };
};
var SignalExitFallback = class extends SignalExitBase {
  onExit() {
    return () => {
    };
  }
  load() {
  }
  unload() {
  }
};
var SignalExit = class extends SignalExitBase {
  // "SIGHUP" throws an `ENOSYS` error on Windows,
  // so use a supported signal instead
  /* c8 ignore start */
  #hupSig = process.platform === "win32" ? "SIGINT" : "SIGHUP";
  /* c8 ignore stop */
  #emitter = new Emitter();
  #process;
  #originalProcessEmit;
  #originalProcessReallyExit;
  #sigListeners = {};
  #loaded = false;
  constructor(process22) {
    super();
    this.#process = process22;
    this.#sigListeners = {};
    for (const sig of signals) {
      this.#sigListeners[sig] = () => {
        const listeners = this.#process.listeners(sig);
        let { count } = this.#emitter;
        const p8 = process22;
        if (typeof p8.__signal_exit_emitter__ === "object" && typeof p8.__signal_exit_emitter__.count === "number") {
          count += p8.__signal_exit_emitter__.count;
        }
        if (listeners.length === count) {
          this.unload();
          const ret = this.#emitter.emit("exit", null, sig);
          const s9 = sig === "SIGHUP" ? this.#hupSig : sig;
          if (!ret)
            process22.kill(process22.pid, s9);
        }
      };
    }
    this.#originalProcessReallyExit = process22.reallyExit;
    this.#originalProcessEmit = process22.emit;
  }
  onExit(cb, opts) {
    if (!processOk(this.#process)) {
      return () => {
      };
    }
    if (this.#loaded === false) {
      this.load();
    }
    const ev = opts?.alwaysLast ? "afterExit" : "exit";
    this.#emitter.on(ev, cb);
    return () => {
      this.#emitter.removeListener(ev, cb);
      if (this.#emitter.listeners["exit"].length === 0 && this.#emitter.listeners["afterExit"].length === 0) {
        this.unload();
      }
    };
  }
  load() {
    if (this.#loaded) {
      return;
    }
    this.#loaded = true;
    this.#emitter.count += 1;
    for (const sig of signals) {
      try {
        const fn = this.#sigListeners[sig];
        if (fn)
          this.#process.on(sig, fn);
      } catch (_3) {
      }
    }
    this.#process.emit = (ev, ...a4) => {
      return this.#processEmit(ev, ...a4);
    };
    this.#process.reallyExit = (code) => {
      return this.#processReallyExit(code);
    };
  }
  unload() {
    if (!this.#loaded) {
      return;
    }
    this.#loaded = false;
    signals.forEach((sig) => {
      const listener = this.#sigListeners[sig];
      if (!listener) {
        throw new Error("Listener not defined for signal: " + sig);
      }
      try {
        this.#process.removeListener(sig, listener);
      } catch (_3) {
      }
    });
    this.#process.emit = this.#originalProcessEmit;
    this.#process.reallyExit = this.#originalProcessReallyExit;
    this.#emitter.count -= 1;
  }
  #processReallyExit(code) {
    if (!processOk(this.#process)) {
      return 0;
    }
    this.#process.exitCode = code || 0;
    this.#emitter.emit("exit", this.#process.exitCode, null);
    return this.#originalProcessReallyExit.call(this.#process, this.#process.exitCode);
  }
  #processEmit(ev, ...args) {
    const og = this.#originalProcessEmit;
    if (ev === "exit" && processOk(this.#process)) {
      if (typeof args[0] === "number") {
        this.#process.exitCode = args[0];
      }
      const ret = og.call(this.#process, ev, ...args);
      this.#emitter.emit("exit", this.#process.exitCode, null);
      return ret;
    } else {
      return og.call(this.#process, ev, ...args);
    }
  }
};
var process = __Process$2;
var {
  /**
   * Called when the process is exiting, whether via signal, explicit
   * exit, or running out of stuff to do.
   *
   * If the global process object is not suitable for instrumentation,
   * then this will be a no-op.
   *
   * Returns a function that may be used to unload signal-exit.
   */
  onExit,
  /**
   * Load the listeners.  Likely you never need to call this, unless
   * doing a rather deep integration with signal-exit functionality.
   * Mostly exposed for the benefit of testing.
   *
   * @internal
   */
  load,
  /**
   * Unload the listeners.  Likely you never need to call this, unless
   * doing a rather deep integration with signal-exit functionality.
   * Mostly exposed for the benefit of testing.
   *
   * @internal
   */
  unload
} = signalExitWrap(processOk(process) ? new SignalExit(process) : new SignalExitFallback());

// https://esm.sh/restore-cursor@5.1.0/denonext/restore-cursor.development.mjs
import process2 from "node:process";
var terminal = process2.stderr.isTTY ? process2.stderr : process2.stdout.isTTY ? process2.stdout : void 0;
var restoreCursor = terminal ? index_default3(() => {
  onExit(() => {
    terminal.write("\x1B[?25h");
  }, { alwaysLast: true });
}) : () => {
};
var index_default4 = restoreCursor;

// https://esm.sh/cli-cursor@5.0.0/denonext/cli-cursor.development.mjs
import process3 from "node:process";
var isHidden = false;
var cliCursor = {};
cliCursor.show = (writableStream = process3.stderr) => {
  if (!writableStream.isTTY) {
    return;
  }
  isHidden = false;
  writableStream.write("\x1B[?25h");
};
cliCursor.hide = (writableStream = process3.stderr) => {
  if (!writableStream.isTTY) {
    return;
  }
  index_default4();
  isHidden = true;
  writableStream.write("\x1B[?25l");
};
cliCursor.toggle = (force, writableStream) => {
  if (force !== void 0) {
    isHidden = force;
  }
  if (isHidden) {
    cliCursor.show(writableStream);
  } else {
    cliCursor.hide(writableStream);
  }
};

// https://esm.sh/cli-spinners@3.2.1/spinners.json?module
var spinners_default = {
  "dots": {
    "interval": 80,
    "frames": [
      "⠋",
      "⠙",
      "⠹",
      "⠸",
      "⠼",
      "⠴",
      "⠦",
      "⠧",
      "⠇",
      "⠏"
    ]
  },
  "dots2": {
    "interval": 80,
    "frames": [
      "⣾",
      "⣽",
      "⣻",
      "⢿",
      "⡿",
      "⣟",
      "⣯",
      "⣷"
    ]
  },
  "dots3": {
    "interval": 80,
    "frames": [
      "⠋",
      "⠙",
      "⠚",
      "⠞",
      "⠖",
      "⠦",
      "⠴",
      "⠲",
      "⠳",
      "⠓"
    ]
  },
  "dots4": {
    "interval": 80,
    "frames": [
      "⠄",
      "⠆",
      "⠇",
      "⠋",
      "⠙",
      "⠸",
      "⠰",
      "⠠",
      "⠰",
      "⠸",
      "⠙",
      "⠋",
      "⠇",
      "⠆"
    ]
  },
  "dots5": {
    "interval": 80,
    "frames": [
      "⠋",
      "⠙",
      "⠚",
      "⠒",
      "⠂",
      "⠂",
      "⠒",
      "⠲",
      "⠴",
      "⠦",
      "⠖",
      "⠒",
      "⠐",
      "⠐",
      "⠒",
      "⠓",
      "⠋"
    ]
  },
  "dots6": {
    "interval": 80,
    "frames": [
      "⠁",
      "⠉",
      "⠙",
      "⠚",
      "⠒",
      "⠂",
      "⠂",
      "⠒",
      "⠲",
      "⠴",
      "⠤",
      "⠄",
      "⠄",
      "⠤",
      "⠴",
      "⠲",
      "⠒",
      "⠂",
      "⠂",
      "⠒",
      "⠚",
      "⠙",
      "⠉",
      "⠁"
    ]
  },
  "dots7": {
    "interval": 80,
    "frames": [
      "⠈",
      "⠉",
      "⠋",
      "⠓",
      "⠒",
      "⠐",
      "⠐",
      "⠒",
      "⠖",
      "⠦",
      "⠤",
      "⠠",
      "⠠",
      "⠤",
      "⠦",
      "⠖",
      "⠒",
      "⠐",
      "⠐",
      "⠒",
      "⠓",
      "⠋",
      "⠉",
      "⠈"
    ]
  },
  "dots8": {
    "interval": 80,
    "frames": [
      "⠁",
      "⠁",
      "⠉",
      "⠙",
      "⠚",
      "⠒",
      "⠂",
      "⠂",
      "⠒",
      "⠲",
      "⠴",
      "⠤",
      "⠄",
      "⠄",
      "⠤",
      "⠠",
      "⠠",
      "⠤",
      "⠦",
      "⠖",
      "⠒",
      "⠐",
      "⠐",
      "⠒",
      "⠓",
      "⠋",
      "⠉",
      "⠈",
      "⠈"
    ]
  },
  "dots9": {
    "interval": 80,
    "frames": [
      "⢹",
      "⢺",
      "⢼",
      "⣸",
      "⣇",
      "⡧",
      "⡗",
      "⡏"
    ]
  },
  "dots10": {
    "interval": 80,
    "frames": [
      "⢄",
      "⢂",
      "⢁",
      "⡁",
      "⡈",
      "⡐",
      "⡠"
    ]
  },
  "dots11": {
    "interval": 100,
    "frames": [
      "⠁",
      "⠂",
      "⠄",
      "⡀",
      "⢀",
      "⠠",
      "⠐",
      "⠈"
    ]
  },
  "dots12": {
    "interval": 80,
    "frames": [
      "⢀⠀",
      "⡀⠀",
      "⠄⠀",
      "⢂⠀",
      "⡂⠀",
      "⠅⠀",
      "⢃⠀",
      "⡃⠀",
      "⠍⠀",
      "⢋⠀",
      "⡋⠀",
      "⠍⠁",
      "⢋⠁",
      "⡋⠁",
      "⠍⠉",
      "⠋⠉",
      "⠋⠉",
      "⠉⠙",
      "⠉⠙",
      "⠉⠩",
      "⠈⢙",
      "⠈⡙",
      "⢈⠩",
      "⡀⢙",
      "⠄⡙",
      "⢂⠩",
      "⡂⢘",
      "⠅⡘",
      "⢃⠨",
      "⡃⢐",
      "⠍⡐",
      "⢋⠠",
      "⡋⢀",
      "⠍⡁",
      "⢋⠁",
      "⡋⠁",
      "⠍⠉",
      "⠋⠉",
      "⠋⠉",
      "⠉⠙",
      "⠉⠙",
      "⠉⠩",
      "⠈⢙",
      "⠈⡙",
      "⠈⠩",
      "⠀⢙",
      "⠀⡙",
      "⠀⠩",
      "⠀⢘",
      "⠀⡘",
      "⠀⠨",
      "⠀⢐",
      "⠀⡐",
      "⠀⠠",
      "⠀⢀",
      "⠀⡀"
    ]
  },
  "dots13": {
    "interval": 80,
    "frames": [
      "⣼",
      "⣹",
      "⢻",
      "⠿",
      "⡟",
      "⣏",
      "⣧",
      "⣶"
    ]
  },
  "dots14": {
    "interval": 80,
    "frames": [
      "⠉⠉",
      "⠈⠙",
      "⠀⠹",
      "⠀⢸",
      "⠀⣰",
      "⢀⣠",
      "⣀⣀",
      "⣄⡀",
      "⣆⠀",
      "⡇⠀",
      "⠏⠀",
      "⠋⠁"
    ]
  },
  "dots8Bit": {
    "interval": 80,
    "frames": [
      "⠀",
      "⠁",
      "⠂",
      "⠃",
      "⠄",
      "⠅",
      "⠆",
      "⠇",
      "⡀",
      "⡁",
      "⡂",
      "⡃",
      "⡄",
      "⡅",
      "⡆",
      "⡇",
      "⠈",
      "⠉",
      "⠊",
      "⠋",
      "⠌",
      "⠍",
      "⠎",
      "⠏",
      "⡈",
      "⡉",
      "⡊",
      "⡋",
      "⡌",
      "⡍",
      "⡎",
      "⡏",
      "⠐",
      "⠑",
      "⠒",
      "⠓",
      "⠔",
      "⠕",
      "⠖",
      "⠗",
      "⡐",
      "⡑",
      "⡒",
      "⡓",
      "⡔",
      "⡕",
      "⡖",
      "⡗",
      "⠘",
      "⠙",
      "⠚",
      "⠛",
      "⠜",
      "⠝",
      "⠞",
      "⠟",
      "⡘",
      "⡙",
      "⡚",
      "⡛",
      "⡜",
      "⡝",
      "⡞",
      "⡟",
      "⠠",
      "⠡",
      "⠢",
      "⠣",
      "⠤",
      "⠥",
      "⠦",
      "⠧",
      "⡠",
      "⡡",
      "⡢",
      "⡣",
      "⡤",
      "⡥",
      "⡦",
      "⡧",
      "⠨",
      "⠩",
      "⠪",
      "⠫",
      "⠬",
      "⠭",
      "⠮",
      "⠯",
      "⡨",
      "⡩",
      "⡪",
      "⡫",
      "⡬",
      "⡭",
      "⡮",
      "⡯",
      "⠰",
      "⠱",
      "⠲",
      "⠳",
      "⠴",
      "⠵",
      "⠶",
      "⠷",
      "⡰",
      "⡱",
      "⡲",
      "⡳",
      "⡴",
      "⡵",
      "⡶",
      "⡷",
      "⠸",
      "⠹",
      "⠺",
      "⠻",
      "⠼",
      "⠽",
      "⠾",
      "⠿",
      "⡸",
      "⡹",
      "⡺",
      "⡻",
      "⡼",
      "⡽",
      "⡾",
      "⡿",
      "⢀",
      "⢁",
      "⢂",
      "⢃",
      "⢄",
      "⢅",
      "⢆",
      "⢇",
      "⣀",
      "⣁",
      "⣂",
      "⣃",
      "⣄",
      "⣅",
      "⣆",
      "⣇",
      "⢈",
      "⢉",
      "⢊",
      "⢋",
      "⢌",
      "⢍",
      "⢎",
      "⢏",
      "⣈",
      "⣉",
      "⣊",
      "⣋",
      "⣌",
      "⣍",
      "⣎",
      "⣏",
      "⢐",
      "⢑",
      "⢒",
      "⢓",
      "⢔",
      "⢕",
      "⢖",
      "⢗",
      "⣐",
      "⣑",
      "⣒",
      "⣓",
      "⣔",
      "⣕",
      "⣖",
      "⣗",
      "⢘",
      "⢙",
      "⢚",
      "⢛",
      "⢜",
      "⢝",
      "⢞",
      "⢟",
      "⣘",
      "⣙",
      "⣚",
      "⣛",
      "⣜",
      "⣝",
      "⣞",
      "⣟",
      "⢠",
      "⢡",
      "⢢",
      "⢣",
      "⢤",
      "⢥",
      "⢦",
      "⢧",
      "⣠",
      "⣡",
      "⣢",
      "⣣",
      "⣤",
      "⣥",
      "⣦",
      "⣧",
      "⢨",
      "⢩",
      "⢪",
      "⢫",
      "⢬",
      "⢭",
      "⢮",
      "⢯",
      "⣨",
      "⣩",
      "⣪",
      "⣫",
      "⣬",
      "⣭",
      "⣮",
      "⣯",
      "⢰",
      "⢱",
      "⢲",
      "⢳",
      "⢴",
      "⢵",
      "⢶",
      "⢷",
      "⣰",
      "⣱",
      "⣲",
      "⣳",
      "⣴",
      "⣵",
      "⣶",
      "⣷",
      "⢸",
      "⢹",
      "⢺",
      "⢻",
      "⢼",
      "⢽",
      "⢾",
      "⢿",
      "⣸",
      "⣹",
      "⣺",
      "⣻",
      "⣼",
      "⣽",
      "⣾",
      "⣿"
    ]
  },
  "dotsCircle": {
    "interval": 80,
    "frames": [
      "⢎ ",
      "⠎⠁",
      "⠊⠑",
      "⠈⠱",
      " ⡱",
      "⢀⡰",
      "⢄⡠",
      "⢆⡀"
    ]
  },
  "sand": {
    "interval": 80,
    "frames": [
      "⠁",
      "⠂",
      "⠄",
      "⡀",
      "⡈",
      "⡐",
      "⡠",
      "⣀",
      "⣁",
      "⣂",
      "⣄",
      "⣌",
      "⣔",
      "⣤",
      "⣥",
      "⣦",
      "⣮",
      "⣶",
      "⣷",
      "⣿",
      "⡿",
      "⠿",
      "⢟",
      "⠟",
      "⡛",
      "⠛",
      "⠫",
      "⢋",
      "⠋",
      "⠍",
      "⡉",
      "⠉",
      "⠑",
      "⠡",
      "⢁"
    ]
  },
  "line": {
    "interval": 130,
    "frames": [
      "-",
      "\\",
      "|",
      "/"
    ]
  },
  "line2": {
    "interval": 100,
    "frames": [
      "⠂",
      "-",
      "–",
      "—",
      "–",
      "-"
    ]
  },
  "pipe": {
    "interval": 100,
    "frames": [
      "┤",
      "┘",
      "┴",
      "└",
      "├",
      "┌",
      "┬",
      "┐"
    ]
  },
  "simpleDots": {
    "interval": 400,
    "frames": [
      ".  ",
      ".. ",
      "...",
      "   "
    ]
  },
  "simpleDotsScrolling": {
    "interval": 200,
    "frames": [
      ".  ",
      ".. ",
      "...",
      " ..",
      "  .",
      "   "
    ]
  },
  "star": {
    "interval": 70,
    "frames": [
      "✶",
      "✸",
      "✹",
      "✺",
      "✹",
      "✷"
    ]
  },
  "star2": {
    "interval": 80,
    "frames": [
      "+",
      "x",
      "*"
    ]
  },
  "flip": {
    "interval": 70,
    "frames": [
      "_",
      "_",
      "_",
      "-",
      "`",
      "`",
      "'",
      "´",
      "-",
      "_",
      "_",
      "_"
    ]
  },
  "hamburger": {
    "interval": 100,
    "frames": [
      "☱",
      "☲",
      "☴"
    ]
  },
  "growVertical": {
    "interval": 120,
    "frames": [
      "▁",
      "▃",
      "▄",
      "▅",
      "▆",
      "▇",
      "▆",
      "▅",
      "▄",
      "▃"
    ]
  },
  "growHorizontal": {
    "interval": 120,
    "frames": [
      "▏",
      "▎",
      "▍",
      "▌",
      "▋",
      "▊",
      "▉",
      "▊",
      "▋",
      "▌",
      "▍",
      "▎"
    ]
  },
  "balloon": {
    "interval": 140,
    "frames": [
      " ",
      ".",
      "o",
      "O",
      "@",
      "*",
      " "
    ]
  },
  "balloon2": {
    "interval": 120,
    "frames": [
      ".",
      "o",
      "O",
      "°",
      "O",
      "o",
      "."
    ]
  },
  "noise": {
    "interval": 100,
    "frames": [
      "▓",
      "▒",
      "░"
    ]
  },
  "bounce": {
    "interval": 120,
    "frames": [
      "⠁",
      "⠂",
      "⠄",
      "⠂"
    ]
  },
  "boxBounce": {
    "interval": 120,
    "frames": [
      "▖",
      "▘",
      "▝",
      "▗"
    ]
  },
  "boxBounce2": {
    "interval": 100,
    "frames": [
      "▌",
      "▀",
      "▐",
      "▄"
    ]
  },
  "triangle": {
    "interval": 50,
    "frames": [
      "◢",
      "◣",
      "◤",
      "◥"
    ]
  },
  "binary": {
    "interval": 80,
    "frames": [
      "010010",
      "001100",
      "100101",
      "111010",
      "111101",
      "010111",
      "101011",
      "111000",
      "110011",
      "110101"
    ]
  },
  "arc": {
    "interval": 100,
    "frames": [
      "◜",
      "◠",
      "◝",
      "◞",
      "◡",
      "◟"
    ]
  },
  "circle": {
    "interval": 120,
    "frames": [
      "◡",
      "⊙",
      "◠"
    ]
  },
  "squareCorners": {
    "interval": 180,
    "frames": [
      "◰",
      "◳",
      "◲",
      "◱"
    ]
  },
  "circleQuarters": {
    "interval": 120,
    "frames": [
      "◴",
      "◷",
      "◶",
      "◵"
    ]
  },
  "circleHalves": {
    "interval": 50,
    "frames": [
      "◐",
      "◓",
      "◑",
      "◒"
    ]
  },
  "squish": {
    "interval": 100,
    "frames": [
      "╫",
      "╪"
    ]
  },
  "toggle": {
    "interval": 250,
    "frames": [
      "⊶",
      "⊷"
    ]
  },
  "toggle2": {
    "interval": 80,
    "frames": [
      "▫",
      "▪"
    ]
  },
  "toggle3": {
    "interval": 120,
    "frames": [
      "□",
      "■"
    ]
  },
  "toggle4": {
    "interval": 100,
    "frames": [
      "■",
      "□",
      "▪",
      "▫"
    ]
  },
  "toggle5": {
    "interval": 100,
    "frames": [
      "▮",
      "▯"
    ]
  },
  "toggle6": {
    "interval": 300,
    "frames": [
      "ဝ",
      "၀"
    ]
  },
  "toggle7": {
    "interval": 80,
    "frames": [
      "⦾",
      "⦿"
    ]
  },
  "toggle8": {
    "interval": 100,
    "frames": [
      "◍",
      "◌"
    ]
  },
  "toggle9": {
    "interval": 100,
    "frames": [
      "◉",
      "◎"
    ]
  },
  "toggle10": {
    "interval": 100,
    "frames": [
      "㊂",
      "㊀",
      "㊁"
    ]
  },
  "toggle11": {
    "interval": 50,
    "frames": [
      "⧇",
      "⧆"
    ]
  },
  "toggle12": {
    "interval": 120,
    "frames": [
      "☗",
      "☖"
    ]
  },
  "toggle13": {
    "interval": 80,
    "frames": [
      "=",
      "*",
      "-"
    ]
  },
  "arrow": {
    "interval": 100,
    "frames": [
      "←",
      "↖",
      "↑",
      "↗",
      "→",
      "↘",
      "↓",
      "↙"
    ]
  },
  "arrow2": {
    "interval": 80,
    "frames": [
      "⬆️ ",
      "↗️ ",
      "➡️ ",
      "↘️ ",
      "⬇️ ",
      "↙️ ",
      "⬅️ ",
      "↖️ "
    ]
  },
  "arrow3": {
    "interval": 120,
    "frames": [
      "▹▹▹▹▹",
      "▸▹▹▹▹",
      "▹▸▹▹▹",
      "▹▹▸▹▹",
      "▹▹▹▸▹",
      "▹▹▹▹▸"
    ]
  },
  "bouncingBar": {
    "interval": 80,
    "frames": [
      "[    ]",
      "[=   ]",
      "[==  ]",
      "[=== ]",
      "[====]",
      "[ ===]",
      "[  ==]",
      "[   =]",
      "[    ]",
      "[   =]",
      "[  ==]",
      "[ ===]",
      "[====]",
      "[=== ]",
      "[==  ]",
      "[=   ]"
    ]
  },
  "bouncingBall": {
    "interval": 80,
    "frames": [
      "( ●    )",
      "(  ●   )",
      "(   ●  )",
      "(    ● )",
      "(     ●)",
      "(    ● )",
      "(   ●  )",
      "(  ●   )",
      "( ●    )",
      "(●     )"
    ]
  },
  "smiley": {
    "interval": 200,
    "frames": [
      "😄 ",
      "😝 "
    ]
  },
  "monkey": {
    "interval": 300,
    "frames": [
      "🙈 ",
      "🙈 ",
      "🙉 ",
      "🙊 "
    ]
  },
  "hearts": {
    "interval": 100,
    "frames": [
      "💛 ",
      "💙 ",
      "💜 ",
      "💚 ",
      "💗 "
    ]
  },
  "clock": {
    "interval": 100,
    "frames": [
      "🕛 ",
      "🕐 ",
      "🕑 ",
      "🕒 ",
      "🕓 ",
      "🕔 ",
      "🕕 ",
      "🕖 ",
      "🕗 ",
      "🕘 ",
      "🕙 ",
      "🕚 "
    ]
  },
  "earth": {
    "interval": 180,
    "frames": [
      "🌍 ",
      "🌎 ",
      "🌏 "
    ]
  },
  "material": {
    "interval": 17,
    "frames": [
      "█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
      "██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
      "███▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
      "████▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
      "██████▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
      "██████▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
      "███████▁▁▁▁▁▁▁▁▁▁▁▁▁",
      "████████▁▁▁▁▁▁▁▁▁▁▁▁",
      "█████████▁▁▁▁▁▁▁▁▁▁▁",
      "█████████▁▁▁▁▁▁▁▁▁▁▁",
      "██████████▁▁▁▁▁▁▁▁▁▁",
      "███████████▁▁▁▁▁▁▁▁▁",
      "█████████████▁▁▁▁▁▁▁",
      "██████████████▁▁▁▁▁▁",
      "██████████████▁▁▁▁▁▁",
      "▁██████████████▁▁▁▁▁",
      "▁██████████████▁▁▁▁▁",
      "▁██████████████▁▁▁▁▁",
      "▁▁██████████████▁▁▁▁",
      "▁▁▁██████████████▁▁▁",
      "▁▁▁▁█████████████▁▁▁",
      "▁▁▁▁██████████████▁▁",
      "▁▁▁▁██████████████▁▁",
      "▁▁▁▁▁██████████████▁",
      "▁▁▁▁▁██████████████▁",
      "▁▁▁▁▁██████████████▁",
      "▁▁▁▁▁▁██████████████",
      "▁▁▁▁▁▁██████████████",
      "▁▁▁▁▁▁▁█████████████",
      "▁▁▁▁▁▁▁█████████████",
      "▁▁▁▁▁▁▁▁████████████",
      "▁▁▁▁▁▁▁▁████████████",
      "▁▁▁▁▁▁▁▁▁███████████",
      "▁▁▁▁▁▁▁▁▁███████████",
      "▁▁▁▁▁▁▁▁▁▁██████████",
      "▁▁▁▁▁▁▁▁▁▁██████████",
      "▁▁▁▁▁▁▁▁▁▁▁▁████████",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁███████",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁██████",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████",
      "█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
      "██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
      "██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
      "███▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
      "████▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
      "█████▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
      "█████▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
      "██████▁▁▁▁▁▁▁▁▁▁▁▁▁█",
      "████████▁▁▁▁▁▁▁▁▁▁▁▁",
      "█████████▁▁▁▁▁▁▁▁▁▁▁",
      "█████████▁▁▁▁▁▁▁▁▁▁▁",
      "█████████▁▁▁▁▁▁▁▁▁▁▁",
      "█████████▁▁▁▁▁▁▁▁▁▁▁",
      "███████████▁▁▁▁▁▁▁▁▁",
      "████████████▁▁▁▁▁▁▁▁",
      "████████████▁▁▁▁▁▁▁▁",
      "██████████████▁▁▁▁▁▁",
      "██████████████▁▁▁▁▁▁",
      "▁██████████████▁▁▁▁▁",
      "▁██████████████▁▁▁▁▁",
      "▁▁▁█████████████▁▁▁▁",
      "▁▁▁▁▁████████████▁▁▁",
      "▁▁▁▁▁████████████▁▁▁",
      "▁▁▁▁▁▁███████████▁▁▁",
      "▁▁▁▁▁▁▁▁█████████▁▁▁",
      "▁▁▁▁▁▁▁▁█████████▁▁▁",
      "▁▁▁▁▁▁▁▁▁█████████▁▁",
      "▁▁▁▁▁▁▁▁▁█████████▁▁",
      "▁▁▁▁▁▁▁▁▁▁█████████▁",
      "▁▁▁▁▁▁▁▁▁▁▁████████▁",
      "▁▁▁▁▁▁▁▁▁▁▁████████▁",
      "▁▁▁▁▁▁▁▁▁▁▁▁███████▁",
      "▁▁▁▁▁▁▁▁▁▁▁▁███████▁",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁███████",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁███████",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
      "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁"
    ]
  },
  "moon": {
    "interval": 80,
    "frames": [
      "🌑 ",
      "🌒 ",
      "🌓 ",
      "🌔 ",
      "🌕 ",
      "🌖 ",
      "🌗 ",
      "🌘 "
    ]
  },
  "runner": {
    "interval": 140,
    "frames": [
      "🚶 ",
      "🏃 "
    ]
  },
  "pong": {
    "interval": 80,
    "frames": [
      "▐⠂       ▌",
      "▐⠈       ▌",
      "▐ ⠂      ▌",
      "▐ ⠠      ▌",
      "▐  ⡀     ▌",
      "▐  ⠠     ▌",
      "▐   ⠂    ▌",
      "▐   ⠈    ▌",
      "▐    ⠂   ▌",
      "▐    ⠠   ▌",
      "▐     ⡀  ▌",
      "▐     ⠠  ▌",
      "▐      ⠂ ▌",
      "▐      ⠈ ▌",
      "▐       ⠂▌",
      "▐       ⠠▌",
      "▐       ⡀▌",
      "▐      ⠠ ▌",
      "▐      ⠂ ▌",
      "▐     ⠈  ▌",
      "▐     ⠂  ▌",
      "▐    ⠠   ▌",
      "▐    ⡀   ▌",
      "▐   ⠠    ▌",
      "▐   ⠂    ▌",
      "▐  ⠈     ▌",
      "▐  ⠂     ▌",
      "▐ ⠠      ▌",
      "▐ ⡀      ▌",
      "▐⠠       ▌"
    ]
  },
  "shark": {
    "interval": 120,
    "frames": [
      "▐|\\____________▌",
      "▐_|\\___________▌",
      "▐__|\\__________▌",
      "▐___|\\_________▌",
      "▐____|\\________▌",
      "▐_____|\\_______▌",
      "▐______|\\______▌",
      "▐_______|\\_____▌",
      "▐________|\\____▌",
      "▐_________|\\___▌",
      "▐__________|\\__▌",
      "▐___________|\\_▌",
      "▐____________|\\▌",
      "▐____________/|▌",
      "▐___________/|_▌",
      "▐__________/|__▌",
      "▐_________/|___▌",
      "▐________/|____▌",
      "▐_______/|_____▌",
      "▐______/|______▌",
      "▐_____/|_______▌",
      "▐____/|________▌",
      "▐___/|_________▌",
      "▐__/|__________▌",
      "▐_/|___________▌",
      "▐/|____________▌"
    ]
  },
  "dqpb": {
    "interval": 100,
    "frames": [
      "d",
      "q",
      "p",
      "b"
    ]
  },
  "weather": {
    "interval": 100,
    "frames": [
      "☀️ ",
      "☀️ ",
      "☀️ ",
      "🌤 ",
      "⛅️ ",
      "🌥 ",
      "☁️ ",
      "🌧 ",
      "🌨 ",
      "🌧 ",
      "🌨 ",
      "🌧 ",
      "🌨 ",
      "⛈ ",
      "🌨 ",
      "🌧 ",
      "🌨 ",
      "☁️ ",
      "🌥 ",
      "⛅️ ",
      "🌤 ",
      "☀️ ",
      "☀️ "
    ]
  },
  "christmas": {
    "interval": 400,
    "frames": [
      "🌲",
      "🎄"
    ]
  },
  "grenade": {
    "interval": 80,
    "frames": [
      "،  ",
      "′  ",
      " ´ ",
      " ‾ ",
      "  ⸌",
      "  ⸊",
      "  |",
      "  ⁎",
      "  ⁕",
      " ෴ ",
      "  ⁓",
      "   ",
      "   ",
      "   "
    ]
  },
  "point": {
    "interval": 125,
    "frames": [
      "∙∙∙",
      "●∙∙",
      "∙●∙",
      "∙∙●",
      "∙∙∙"
    ]
  },
  "layer": {
    "interval": 150,
    "frames": [
      "-",
      "=",
      "≡"
    ]
  },
  "betaWave": {
    "interval": 80,
    "frames": [
      "ρββββββ",
      "βρβββββ",
      "ββρββββ",
      "βββρβββ",
      "ββββρββ",
      "βββββρβ",
      "ββββββρ"
    ]
  },
  "fingerDance": {
    "interval": 160,
    "frames": [
      "🤘 ",
      "🤟 ",
      "🖖 ",
      "✋ ",
      "🤚 ",
      "👆 "
    ]
  },
  "fistBump": {
    "interval": 80,
    "frames": [
      "🤜　　　　🤛 ",
      "🤜　　　　🤛 ",
      "🤜　　　　🤛 ",
      "　🤜　　🤛　 ",
      "　　🤜🤛　　 ",
      "　🤜✨🤛　　 ",
      "🤜　✨　🤛　 "
    ]
  },
  "soccerHeader": {
    "interval": 80,
    "frames": [
      " 🧑⚽️       🧑 ",
      "🧑  ⚽️      🧑 ",
      "🧑   ⚽️     🧑 ",
      "🧑    ⚽️    🧑 ",
      "🧑     ⚽️   🧑 ",
      "🧑      ⚽️  🧑 ",
      "🧑       ⚽️🧑  ",
      "🧑      ⚽️  🧑 ",
      "🧑     ⚽️   🧑 ",
      "🧑    ⚽️    🧑 ",
      "🧑   ⚽️     🧑 ",
      "🧑  ⚽️      🧑 "
    ]
  },
  "mindblown": {
    "interval": 160,
    "frames": [
      "😐 ",
      "😐 ",
      "😮 ",
      "😮 ",
      "😦 ",
      "😦 ",
      "😧 ",
      "😧 ",
      "🤯 ",
      "💥 ",
      "✨ ",
      "　 ",
      "　 ",
      "　 "
    ]
  },
  "speaker": {
    "interval": 160,
    "frames": [
      "🔈 ",
      "🔉 ",
      "🔊 ",
      "🔉 "
    ]
  },
  "orangePulse": {
    "interval": 100,
    "frames": [
      "🔸 ",
      "🔶 ",
      "🟠 ",
      "🟠 ",
      "🔶 "
    ]
  },
  "bluePulse": {
    "interval": 100,
    "frames": [
      "🔹 ",
      "🔷 ",
      "🔵 ",
      "🔵 ",
      "🔷 "
    ]
  },
  "orangeBluePulse": {
    "interval": 100,
    "frames": [
      "🔸 ",
      "🔶 ",
      "🟠 ",
      "🟠 ",
      "🔶 ",
      "🔹 ",
      "🔷 ",
      "🔵 ",
      "🔵 ",
      "🔷 "
    ]
  },
  "timeTravel": {
    "interval": 100,
    "frames": [
      "🕛 ",
      "🕚 ",
      "🕙 ",
      "🕘 ",
      "🕗 ",
      "🕖 ",
      "🕕 ",
      "🕔 ",
      "🕓 ",
      "🕒 ",
      "🕑 ",
      "🕐 "
    ]
  },
  "aesthetic": {
    "interval": 80,
    "frames": [
      "▰▱▱▱▱▱▱",
      "▰▰▱▱▱▱▱",
      "▰▰▰▱▱▱▱",
      "▰▰▰▰▱▱▱",
      "▰▰▰▰▰▱▱",
      "▰▰▰▰▰▰▱",
      "▰▰▰▰▰▰▰",
      "▰▱▱▱▱▱▱"
    ]
  },
  "dwarfFortress": {
    "interval": 80,
    "frames": [
      " ██████£££  ",
      "☺██████£££  ",
      "☺██████£££  ",
      "☺▓█████£££  ",
      "☺▓█████£££  ",
      "☺▒█████£££  ",
      "☺▒█████£££  ",
      "☺░█████£££  ",
      "☺░█████£££  ",
      "☺ █████£££  ",
      " ☺█████£££  ",
      " ☺█████£££  ",
      " ☺▓████£££  ",
      " ☺▓████£££  ",
      " ☺▒████£££  ",
      " ☺▒████£££  ",
      " ☺░████£££  ",
      " ☺░████£££  ",
      " ☺ ████£££  ",
      "  ☺████£££  ",
      "  ☺████£££  ",
      "  ☺▓███£££  ",
      "  ☺▓███£££  ",
      "  ☺▒███£££  ",
      "  ☺▒███£££  ",
      "  ☺░███£££  ",
      "  ☺░███£££  ",
      "  ☺ ███£££  ",
      "   ☺███£££  ",
      "   ☺███£££  ",
      "   ☺▓██£££  ",
      "   ☺▓██£££  ",
      "   ☺▒██£££  ",
      "   ☺▒██£££  ",
      "   ☺░██£££  ",
      "   ☺░██£££  ",
      "   ☺ ██£££  ",
      "    ☺██£££  ",
      "    ☺██£££  ",
      "    ☺▓█£££  ",
      "    ☺▓█£££  ",
      "    ☺▒█£££  ",
      "    ☺▒█£££  ",
      "    ☺░█£££  ",
      "    ☺░█£££  ",
      "    ☺ █£££  ",
      "     ☺█£££  ",
      "     ☺█£££  ",
      "     ☺▓£££  ",
      "     ☺▓£££  ",
      "     ☺▒£££  ",
      "     ☺▒£££  ",
      "     ☺░£££  ",
      "     ☺░£££  ",
      "     ☺ £££  ",
      "      ☺£££  ",
      "      ☺£££  ",
      "      ☺▓££  ",
      "      ☺▓££  ",
      "      ☺▒££  ",
      "      ☺▒££  ",
      "      ☺░££  ",
      "      ☺░££  ",
      "      ☺ ££  ",
      "       ☺££  ",
      "       ☺££  ",
      "       ☺▓£  ",
      "       ☺▓£  ",
      "       ☺▒£  ",
      "       ☺▒£  ",
      "       ☺░£  ",
      "       ☺░£  ",
      "       ☺ £  ",
      "        ☺£  ",
      "        ☺£  ",
      "        ☺▓  ",
      "        ☺▓  ",
      "        ☺▒  ",
      "        ☺▒  ",
      "        ☺░  ",
      "        ☺░  ",
      "        ☺   ",
      "        ☺  &",
      "        ☺ ☼&",
      "       ☺ ☼ &",
      "       ☺☼  &",
      "      ☺☼  & ",
      "      ‼   & ",
      "     ☺   &  ",
      "    ‼    &  ",
      "   ☺    &   ",
      "  ‼     &   ",
      " ☺     &    ",
      "‼      &    ",
      "      &     ",
      "      &     ",
      "     &   ░  ",
      "     &   ▒  ",
      "    &    ▓  ",
      "    &    £  ",
      "   &    ░£  ",
      "   &    ▒£  ",
      "  &     ▓£  ",
      "  &     ££  ",
      " &     ░££  ",
      " &     ▒££  ",
      "&      ▓££  ",
      "&      £££  ",
      "      ░£££  ",
      "      ▒£££  ",
      "      ▓£££  ",
      "      █£££  ",
      "     ░█£££  ",
      "     ▒█£££  ",
      "     ▓█£££  ",
      "     ██£££  ",
      "    ░██£££  ",
      "    ▒██£££  ",
      "    ▓██£££  ",
      "    ███£££  ",
      "   ░███£££  ",
      "   ▒███£££  ",
      "   ▓███£££  ",
      "   ████£££  ",
      "  ░████£££  ",
      "  ▒████£££  ",
      "  ▓████£££  ",
      "  █████£££  ",
      " ░█████£££  ",
      " ▒█████£££  ",
      " ▓█████£££  ",
      " ██████£££  ",
      " ██████£££  "
    ]
  }
};

// https://esm.sh/cli-spinners@3.2.1/es2022/cli-spinners.development.mjs
var spinnersList = Object.keys(spinners_default);

// https://esm.sh/is-interactive@2.0.0/denonext/is-interactive.development.mjs
import __Process$3 from "node:process";

// https://esm.sh/is-unicode-supported@2.1.0/denonext/is-unicode-supported.development.mjs
import process4 from "node:process";

// https://esm.sh/log-symbols@7.0.1/denonext/log-symbols.development.mjs
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var browser_symbols_exports = {};
__export(browser_symbols_exports, {
  error: () => error,
  info: () => info,
  success: () => success,
  warning: () => warning
});
var info = "ℹ️";
var success = "✅";
var warning = "⚠️";
var error = "❌️";

// https://esm.sh/node/process.mjs?dev
var v = function() {
};
function u(e3, t5 = {}) {
  v.prototype.name = e3;
  let r6 = {};
  return new Proxy(v, { get(n6, a4) {
    return a4 === "caller" ? null : a4 === "__createMock__" ? u : a4 === "__unenv__" ? true : a4 in t5 ? t5[a4] : r6[a4] = r6[a4] || u(`${e3}.${a4.toString()}`);
  }, apply(n6, a4, o3) {
    return u(`${e3}()`);
  }, construct(n6, a4, o3) {
    return u(`[${e3}]`);
  }, enumerate() {
    return [];
  } });
}
var d = u("mock");
function m(e3) {
  return new Error(`[unenv] ${e3} is not implemented yet!`);
}
function s(e3) {
  return Object.assign(() => {
    throw m(e3);
  }, { __unenv__: true });
}
var b = Object.freeze(Object.create(null, { __unenv__: { get: () => true } }));
var p = /* @__PURE__ */ Object.create(null);
var h = globalThis.process?.env;
var l = (e3) => h || globalThis.__env__ || (e3 ? p : globalThis);
var x = new Proxy(p, { get(e3, t5) {
  return l()[t5] ?? p[t5];
}, has(e3, t5) {
  let r6 = l();
  return t5 in r6 || t5 in p;
}, set(e3, t5, r6) {
  let n6 = l(true);
  return n6[t5] = r6, true;
}, deleteProperty(e3, t5) {
  let r6 = l(true);
  return delete r6[t5], true;
}, ownKeys() {
  let e3 = l();
  return Object.keys(e3);
} });
var k = Object.assign(function(e3) {
  let t5 = Date.now(), r6 = Math.trunc(t5 / 1e3), n6 = t5 % 1e3 * 1e6;
  if (e3) {
    let a4 = r6 - e3[0], o3 = n6 - e3[0];
    return o3 < 0 && (a4 = a4 - 1, o3 = 1e9 + o3), [a4, o3];
  }
  return [r6, n6];
}, { bigint: function() {
  return BigInt(Date.now() * 1e6);
} });
var E = globalThis.queueMicrotask ? (e3, ...t5) => {
  globalThis.queueMicrotask(e3.bind(void 0, ...t5));
} : M();
function M() {
  let e3 = [], t5 = false, r6, n6 = -1;
  function a4() {
    !t5 || !r6 || (t5 = false, r6.length > 0 ? e3 = [...r6, ...e3] : n6 = -1, e3.length > 0 && o3());
  }
  function o3() {
    if (t5) return;
    let g6 = setTimeout(a4);
    t5 = true;
    let c6 = e3.length;
    for (; c6; ) {
      for (r6 = e3, e3 = []; ++n6 < c6; ) r6 && r6[n6]();
      n6 = -1, c6 = e3.length;
    }
    r6 = void 0, t5 = false, clearTimeout(g6);
  }
  return (g6, ...c6) => {
    e3.push(g6.bind(void 0, ...c6)), e3.length === 1 && !t5 && setTimeout(o3);
  };
}
var Q = s("process.abort");
var re = s("process.cpuUsage");
var ne = s("process.dlopen");
var ce = s("process.eventNames");
var de = s("process.exit");
var _e = s("process.getMaxListeners");
var ve = s("process.kill");
var fe = Object.assign(() => ({ arrayBuffers: 0, rss: 0, external: 0, heapTotal: 0, heapUsed: 0 }), { rss: () => 0 });
var xe = s("process.rawListeners");
var Ee = /* @__PURE__ */ Object.create({ compact: void 0, directory: void 0, filename: void 0, getReport: s("process.report.getReport"), reportOnFatalError: void 0, reportOnSignal: void 0, reportOnUncaughtException: void 0, signal: void 0, writeReport: s("process.report.writeReport") });
var Me = s("process.resourceUsage");
var we = s("process.setegid");
var Le = s("process.seteuid");
var ye = s("process.setgid");
var Ce = s("process.setgroups");
var Pe = s("process.setuid");
var Ue = s("process.setMaxListeners");
var Oe = s("process.setSourceMapsEnabled");
var Ae = d.__createMock__("process.stdout");
var je = d.__createMock__("process.stderr");
var Ne = d.__createMock__("process.stdin");
var Se = s("process.setUncaughtExceptionCaptureCallback");
var Fe = s("process.loadEnvFile");
var Ke = s("process.assert");
var Ge = s("process.openStdin");
var Je = s("process._debugEnd");
var Qe = s("process._debugProcess");
var Ve = s("process._fatalException");
var Xe = s("process._getActiveHandles");
var Ye = s("process._getActiveRequests");
var Ze = s("process._kill");
var ss = s("process._rawDebug");
var ts = s("process._startProfilerIdleNotifier");
var rs = s("process.__stopProfilerIdleNotifier");
var as = s("process._tickCallback");
var hs = s("process._linkedBinding");
var is = s("process.initgroups");

// https://esm.sh/stdin-discarder@0.2.2/denonext/stdin-discarder.development.mjs
import process5 from "node:process";
var ASCII_ETX_CODE = 3;
var StdinDiscarder = class {
  #activeCount = 0;
  start() {
    this.#activeCount++;
    if (this.#activeCount === 1) {
      this.#realStart();
    }
  }
  stop() {
    if (this.#activeCount <= 0) {
      throw new Error("`stop` called more times than `start`");
    }
    this.#activeCount--;
    if (this.#activeCount === 0) {
      this.#realStop();
    }
  }
  #realStart() {
    if (process5.platform === "win32" || !process5.stdin.isTTY) {
      return;
    }
    process5.stdin.setRawMode(true);
    process5.stdin.on("data", this.#handleInput);
    process5.stdin.resume();
  }
  #realStop() {
    if (!process5.stdin.isTTY) {
      return;
    }
    process5.stdin.off("data", this.#handleInput);
    process5.stdin.pause();
    process5.stdin.setRawMode(false);
  }
  #handleInput(chunk) {
    if (chunk[0] === ASCII_ETX_CODE) {
      process5.emit("SIGINT");
    }
  }
};
var stdinDiscarder = new StdinDiscarder();

// https://esm.sh/ansi-regex@6.2.2/denonext/ansi-regex.development.mjs
function ansiRegex({ onlyFirst = false } = {}) {
  const ST = "(?:\\u0007|\\u001B\\u005C|\\u009C)";
  const osc = `(?:\\u001B\\][\\s\\S]*?${ST})`;
  const csi = "[\\u001B\\u009B][[\\]()#;?]*(?:\\d{1,4}(?:[;:]\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]";
  const pattern = `${osc}|${csi}`;
  return new RegExp(pattern, onlyFirst ? void 0 : "g");
}

// https://esm.sh/strip-ansi@7.1.2/denonext/strip-ansi.development.mjs
var regex = ansiRegex();

// https://esm.sh/string-width@8.1.0/denonext/string-width.development.mjs
var segmenter = new Intl.Segmenter();

// https://esm.sh/node/process.mjs
var v2 = function() {
};
function u2(e3, t5 = {}) {
  v2.prototype.name = e3;
  let r6 = {};
  return new Proxy(v2, { get(n6, a4) {
    return a4 === "caller" ? null : a4 === "__createMock__" ? u2 : a4 === "__unenv__" ? true : a4 in t5 ? t5[a4] : r6[a4] = r6[a4] || u2(`${e3}.${a4.toString()}`);
  }, apply(n6, a4, o3) {
    return u2(`${e3}()`);
  }, construct(n6, a4, o3) {
    return u2(`[${e3}]`);
  }, enumerate() {
    return [];
  } });
}
var d2 = u2("mock");
function m2(e3) {
  return new Error(`[unenv] ${e3} is not implemented yet!`);
}
function s2(e3) {
  return Object.assign(() => {
    throw m2(e3);
  }, { __unenv__: true });
}
var b2 = Object.freeze(Object.create(null, { __unenv__: { get: () => true } }));
var p2 = /* @__PURE__ */ Object.create(null);
var h2 = globalThis.process?.env;
var l2 = (e3) => h2 || globalThis.__env__ || (e3 ? p2 : globalThis);
var x2 = new Proxy(p2, { get(e3, t5) {
  return l2()[t5] ?? p2[t5];
}, has(e3, t5) {
  let r6 = l2();
  return t5 in r6 || t5 in p2;
}, set(e3, t5, r6) {
  let n6 = l2(true);
  return n6[t5] = r6, true;
}, deleteProperty(e3, t5) {
  let r6 = l2(true);
  return delete r6[t5], true;
}, ownKeys() {
  let e3 = l2();
  return Object.keys(e3);
} });
var k2 = Object.assign(function(e3) {
  let t5 = Date.now(), r6 = Math.trunc(t5 / 1e3), n6 = t5 % 1e3 * 1e6;
  if (e3) {
    let a4 = r6 - e3[0], o3 = n6 - e3[0];
    return o3 < 0 && (a4 = a4 - 1, o3 = 1e9 + o3), [a4, o3];
  }
  return [r6, n6];
}, { bigint: function() {
  return BigInt(Date.now() * 1e6);
} });
var E2 = globalThis.queueMicrotask ? (e3, ...t5) => {
  globalThis.queueMicrotask(e3.bind(void 0, ...t5));
} : M2();
function M2() {
  let e3 = [], t5 = false, r6, n6 = -1;
  function a4() {
    !t5 || !r6 || (t5 = false, r6.length > 0 ? e3 = [...r6, ...e3] : n6 = -1, e3.length > 0 && o3());
  }
  function o3() {
    if (t5) return;
    let g6 = setTimeout(a4);
    t5 = true;
    let c6 = e3.length;
    for (; c6; ) {
      for (r6 = e3, e3 = []; ++n6 < c6; ) r6 && r6[n6]();
      n6 = -1, c6 = e3.length;
    }
    r6 = void 0, t5 = false, clearTimeout(g6);
  }
  return (g6, ...c6) => {
    e3.push(g6.bind(void 0, ...c6)), e3.length === 1 && !t5 && setTimeout(o3);
  };
}
var w = "unenv";
var L = [];
var y = "";
var C = { ares: "", http_parser: "", icu: "", modules: "", node: "", openssl: "", uv: "", v8: "", zlib: "" };
function i() {
  return _;
}
var P = i;
var U = i;
var O = i;
var A = i;
var j = i;
var N = i;
var T = function(e3) {
  return e3 === "message" || e3 === "multipleResolves" ? _ : false;
};
var R = i;
var I = i;
var S = function(e3) {
  return [];
};
var B = () => 0;
var D = function(e3) {
  throw new Error("[unenv] process.binding is not supported");
};
var f = "/";
var F = function() {
  return f;
};
var $ = function(e3) {
  f = e3;
};
var q = function() {
  return 0;
};
var z = function() {
  return 1e3;
};
var H = function() {
  return 1e3;
};
var W = function() {
  return 1e3;
};
var K = function() {
  return 1e3;
};
var G = function() {
  return [];
};
var J = (e3) => {
};
var Q2 = s2("process.abort");
var V = /* @__PURE__ */ new Set();
var X = "";
var Y = "";
var Z = b2;
var ee = false;
var se = () => 0;
var te = () => 0;
var re2 = s2("process.cpuUsage");
var ae = 0;
var ne2 = s2("process.dlopen");
var ie = i;
var oe = i;
var ce2 = s2("process.eventNames");
var ue = [];
var le = "";
var de2 = s2("process.exit");
var pe = /* @__PURE__ */ Object.create({ inspector: void 0, debug: void 0, uv: void 0, ipv6: void 0, tls_alpn: void 0, tls_sni: void 0, tls_ocsp: void 0, tls: void 0, cached_builtins: void 0 });
var ge = () => [];
var _e2 = s2("process.getMaxListeners");
var ve2 = s2("process.kill");
var fe2 = Object.assign(() => ({ arrayBuffers: 0, rss: 0, external: 0, heapTotal: 0, heapUsed: 0 }), { rss: () => 0 });
var me = 1e3;
var be = "";
var he = 1e3;
var xe2 = s2("process.rawListeners");
var ke = /* @__PURE__ */ Object.create({ name: "", lts: "", sourceUrl: void 0, headersUrl: void 0 });
var Ee2 = /* @__PURE__ */ Object.create({ compact: void 0, directory: void 0, filename: void 0, getReport: s2("process.report.getReport"), reportOnFatalError: void 0, reportOnSignal: void 0, reportOnUncaughtException: void 0, signal: void 0, writeReport: s2("process.report.writeReport") });
var Me2 = s2("process.resourceUsage");
var we2 = s2("process.setegid");
var Le2 = s2("process.seteuid");
var ye2 = s2("process.setgid");
var Ce2 = s2("process.setgroups");
var Pe2 = s2("process.setuid");
var Ue2 = s2("process.setMaxListeners");
var Oe2 = s2("process.setSourceMapsEnabled");
var Ae2 = d2.__createMock__("process.stdout");
var je2 = d2.__createMock__("process.stderr");
var Ne2 = d2.__createMock__("process.stdin");
var Te = false;
var Re = () => 0;
var Ie = 0;
var Se2 = s2("process.setUncaughtExceptionCaptureCallback");
var Be = () => false;
var De = false;
var Fe2 = s2("process.loadEnvFile");
var $e = void 0;
var qe = { has: () => false };
var ze = { ref() {
}, unref() {
} };
var He = false;
var We = { register() {
}, unregister() {
}, registerBeforeExit() {
} };
var Ke2 = s2("process.assert");
var Ge2 = s2("process.openStdin");
var Je2 = s2("process._debugEnd");
var Qe2 = s2("process._debugProcess");
var Ve2 = s2("process._fatalException");
var Xe2 = s2("process._getActiveHandles");
var Ye2 = s2("process._getActiveRequests");
var Ze2 = s2("process._kill");
var es = [];
var ss2 = s2("process._rawDebug");
var ts2 = s2("process._startProfilerIdleNotifier");
var rs2 = s2("process.__stopProfilerIdleNotifier");
var as2 = s2("process._tickCallback");
var hs2 = s2("process._linkedBinding");
var ns = void 0;
var is2 = s2("process.initgroups");
var os = [];
var cs = i;
var us = false;
var ls = [];
var ds = 0;
var ps = 0;
var _ = { _events: ls, _eventsCount: ds, _exiting: us, _maxListeners: ps, _debugEnd: Je2, _debugProcess: Qe2, _fatalException: Ve2, _getActiveHandles: Xe2, _getActiveRequests: Ye2, _kill: Ze2, _preload_modules: es, _rawDebug: ss2, _startProfilerIdleNotifier: ts2, _stopProfilerIdleNotifier: rs2, _tickCallback: as2, domain: ns, initgroups: is2, moduleLoadList: os, reallyExit: cs, exitCode: Ie, abort: Q2, addListener: U, allowedNodeEnvironmentFlags: V, hasUncaughtExceptionCaptureCallback: Be, setUncaughtExceptionCaptureCallback: Se2, loadEnvFile: Fe2, sourceMapsEnabled: De, throwDeprecation: He, mainModule: $e, permission: qe, channel: ze, arch: X, argv: L, argv0: Y, assert: Ke2, binding: D, chdir: $, config: Z, connected: ee, constrainedMemory: se, availableMemory: te, cpuUsage: re2, cwd: F, debugPort: ae, dlopen: ne2, disconnect: ie, emit: T, emitWarning: oe, env: x2, eventNames: ce2, execArgv: ue, execPath: le, exit: de2, finalization: We, features: pe, getBuiltinModule: J, getegid: z, geteuid: H, getgid: W, getgroups: G, getuid: K, getActiveResourcesInfo: ge, getMaxListeners: _e2, hrtime: k2, kill: ve2, listeners: S, listenerCount: B, memoryUsage: fe2, nextTick: E2, on: P, off: A, once: O, openStdin: Ge2, pid: me, platform: be, ppid: he, prependListener: R, prependOnceListener: I, rawListeners: xe2, release: ke, removeAllListeners: N, removeListener: j, report: Ee2, resourceUsage: Me2, setegid: we2, seteuid: Le2, setgid: ye2, setgroups: Ce2, setuid: Pe2, setMaxListeners: Ue2, setSourceMapsEnabled: Oe2, stderr: je2, stdin: Ne2, stdout: Ae2, title: w, traceDeprecation: Te, umask: q, uptime: Re, version: y, versions: C };
var xs = _;

// https://esm.sh/chalk@5.6.2/es2022/source/vendor/ansi-styles/index.mjs
var g = (a4 = 0) => (e3) => `\x1B[${e3 + a4}m`;
var u3 = (a4 = 0) => (e3) => `\x1B[${38 + a4};5;${e3}m`;
var b3 = (a4 = 0) => (e3, t5, n6) => `\x1B[${38 + a4};2;${e3};${t5};${n6}m`;
var r = { modifier: { reset: [0, 0], bold: [1, 22], dim: [2, 22], italic: [3, 23], underline: [4, 24], overline: [53, 55], inverse: [7, 27], hidden: [8, 28], strikethrough: [9, 29] }, color: { black: [30, 39], red: [31, 39], green: [32, 39], yellow: [33, 39], blue: [34, 39], magenta: [35, 39], cyan: [36, 39], white: [37, 39], blackBright: [90, 39], gray: [90, 39], grey: [90, 39], redBright: [91, 39], greenBright: [92, 39], yellowBright: [93, 39], blueBright: [94, 39], magentaBright: [95, 39], cyanBright: [96, 39], whiteBright: [97, 39] }, bgColor: { bgBlack: [40, 49], bgRed: [41, 49], bgGreen: [42, 49], bgYellow: [43, 49], bgBlue: [44, 49], bgMagenta: [45, 49], bgCyan: [46, 49], bgWhite: [47, 49], bgBlackBright: [100, 49], bgGray: [100, 49], bgGrey: [100, 49], bgRedBright: [101, 49], bgGreenBright: [102, 49], bgYellowBright: [103, 49], bgBlueBright: [104, 49], bgMagentaBright: [105, 49], bgCyanBright: [106, 49], bgWhiteBright: [107, 49] } };
var B2 = Object.keys(r.modifier);
var c = Object.keys(r.color);
var h3 = Object.keys(r.bgColor);
var A2 = [...c, ...h3];
function m3() {
  let a4 = /* @__PURE__ */ new Map();
  for (let [e3, t5] of Object.entries(r)) {
    for (let [n6, o3] of Object.entries(t5)) r[n6] = { open: `\x1B[${o3[0]}m`, close: `\x1B[${o3[1]}m` }, t5[n6] = r[n6], a4.set(o3[0], o3[1]);
    Object.defineProperty(r, e3, { value: t5, enumerable: false });
  }
  return Object.defineProperty(r, "codes", { value: a4, enumerable: false }), r.color.close = "\x1B[39m", r.bgColor.close = "\x1B[49m", r.color.ansi = g(), r.color.ansi256 = u3(), r.color.ansi16m = b3(), r.bgColor.ansi = g(10), r.bgColor.ansi256 = u3(10), r.bgColor.ansi16m = b3(10), Object.defineProperties(r, { rgbToAnsi256: { value(e3, t5, n6) {
    return e3 === t5 && t5 === n6 ? e3 < 8 ? 16 : e3 > 248 ? 231 : Math.round((e3 - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(e3 / 255 * 5) + 6 * Math.round(t5 / 255 * 5) + Math.round(n6 / 255 * 5);
  }, enumerable: false }, hexToRgb: { value(e3) {
    let t5 = /[a-f\d]{6}|[a-f\d]{3}/i.exec(e3.toString(16));
    if (!t5) return [0, 0, 0];
    let [n6] = t5;
    n6.length === 3 && (n6 = [...n6].map((l7) => l7 + l7).join(""));
    let o3 = Number.parseInt(n6, 16);
    return [o3 >> 16 & 255, o3 >> 8 & 255, o3 & 255];
  }, enumerable: false }, hexToAnsi256: { value: (e3) => r.rgbToAnsi256(...r.hexToRgb(e3)), enumerable: false }, ansi256ToAnsi: { value(e3) {
    if (e3 < 8) return 30 + e3;
    if (e3 < 16) return 90 + (e3 - 8);
    let t5, n6, o3;
    if (e3 >= 232) t5 = ((e3 - 232) * 10 + 8) / 255, n6 = t5, o3 = t5;
    else {
      e3 -= 16;
      let s9 = e3 % 36;
      t5 = Math.floor(e3 / 36) / 5, n6 = Math.floor(s9 / 6) / 5, o3 = s9 % 6 / 5;
    }
    let l7 = Math.max(t5, n6, o3) * 2;
    if (l7 === 0) return 30;
    let i2 = 30 + (Math.round(o3) << 2 | Math.round(n6) << 1 | Math.round(t5));
    return l7 === 2 && (i2 += 60), i2;
  }, enumerable: false }, rgbToAnsi: { value: (e3, t5, n6) => r.ansi256ToAnsi(r.rgbToAnsi256(e3, t5, n6)), enumerable: false }, hexToAnsi: { value: (e3) => r.ansi256ToAnsi(r.hexToAnsi256(e3)), enumerable: false } }), r;
}
var f2 = m3();
var y2 = f2;

// https://esm.sh/chalk@5.6.2/es2022/chalk.mjs
var h4 = (() => {
  if (!("navigator" in globalThis)) return 0;
  if (globalThis.navigator.userAgentData) {
    let r6 = navigator.userAgentData.brands.find(({ brand: e3 }) => e3 === "Chromium");
    if (r6 && r6.version > 93) return 3;
  }
  return /\b(Chrome|Chromium)\//.test(globalThis.navigator.userAgent) ? 1 : 0;
})();
var C2 = h4 !== 0 && { level: h4, hasBasic: true, has256: h4 >= 2, has16m: h4 >= 3 };
var I2 = { stdout: C2, stderr: C2 };
var O2 = I2;
function B3(r6, e3, t5) {
  let o3 = r6.indexOf(e3);
  if (o3 === -1) return r6;
  let n6 = e3.length, s9 = 0, a4 = "";
  do
    a4 += r6.slice(s9, o3) + e3 + t5, s9 = o3 + n6, o3 = r6.indexOf(e3, s9);
  while (o3 !== -1);
  return a4 += r6.slice(s9), a4;
}
function x3(r6, e3, t5, o3) {
  let n6 = 0, s9 = "";
  do {
    let a4 = r6[o3 - 1] === "\r";
    s9 += r6.slice(n6, a4 ? o3 - 1 : o3) + e3 + (a4 ? `\r
` : `
`) + t5, n6 = o3 + 1, o3 = r6.indexOf(`
`, n6);
  } while (o3 !== -1);
  return s9 += r6.slice(n6), s9;
}
var T2 = (r6 = 0) => (e3) => `\x1B[${e3 + r6}m`;
var N2 = (r6 = 0) => (e3) => `\x1B[${38 + r6};5;${e3}m`;
var S2 = (r6 = 0) => (e3, t5, o3) => `\x1B[${38 + r6};2;${e3};${t5};${o3}m`;
var l3 = { modifier: { reset: [0, 0], bold: [1, 22], dim: [2, 22], italic: [3, 23], underline: [4, 24], overline: [53, 55], inverse: [7, 27], hidden: [8, 28], strikethrough: [9, 29] }, color: { black: [30, 39], red: [31, 39], green: [32, 39], yellow: [33, 39], blue: [34, 39], magenta: [35, 39], cyan: [36, 39], white: [37, 39], blackBright: [90, 39], gray: [90, 39], grey: [90, 39], redBright: [91, 39], greenBright: [92, 39], yellowBright: [93, 39], blueBright: [94, 39], magentaBright: [95, 39], cyanBright: [96, 39], whiteBright: [97, 39] }, bgColor: { bgBlack: [40, 49], bgRed: [41, 49], bgGreen: [42, 49], bgYellow: [43, 49], bgBlue: [44, 49], bgMagenta: [45, 49], bgCyan: [46, 49], bgWhite: [47, 49], bgBlackBright: [100, 49], bgGray: [100, 49], bgGrey: [100, 49], bgRedBright: [101, 49], bgGreenBright: [102, 49], bgYellowBright: [103, 49], bgBlueBright: [104, 49], bgMagentaBright: [105, 49], bgCyanBright: [106, 49], bgWhiteBright: [107, 49] } };
var j2 = Object.keys(l3.modifier);
var d3 = Object.keys(l3.color);
var m4 = Object.keys(l3.bgColor);
var F2 = [...d3, ...m4];
function P2() {
  let r6 = /* @__PURE__ */ new Map();
  for (let [e3, t5] of Object.entries(l3)) {
    for (let [o3, n6] of Object.entries(t5)) l3[o3] = { open: `\x1B[${n6[0]}m`, close: `\x1B[${n6[1]}m` }, t5[o3] = l3[o3], r6.set(n6[0], n6[1]);
    Object.defineProperty(l3, e3, { value: t5, enumerable: false });
  }
  return Object.defineProperty(l3, "codes", { value: r6, enumerable: false }), l3.color.close = "\x1B[39m", l3.bgColor.close = "\x1B[49m", l3.color.ansi = T2(), l3.color.ansi256 = N2(), l3.color.ansi16m = S2(), l3.bgColor.ansi = T2(10), l3.bgColor.ansi256 = N2(10), l3.bgColor.ansi16m = S2(10), Object.defineProperties(l3, { rgbToAnsi256: { value(e3, t5, o3) {
    return e3 === t5 && t5 === o3 ? e3 < 8 ? 16 : e3 > 248 ? 231 : Math.round((e3 - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(e3 / 255 * 5) + 6 * Math.round(t5 / 255 * 5) + Math.round(o3 / 255 * 5);
  }, enumerable: false }, hexToRgb: { value(e3) {
    let t5 = /[a-f\d]{6}|[a-f\d]{3}/i.exec(e3.toString(16));
    if (!t5) return [0, 0, 0];
    let [o3] = t5;
    o3.length === 3 && (o3 = [...o3].map((s9) => s9 + s9).join(""));
    let n6 = Number.parseInt(o3, 16);
    return [n6 >> 16 & 255, n6 >> 8 & 255, n6 & 255];
  }, enumerable: false }, hexToAnsi256: { value: (e3) => l3.rgbToAnsi256(...l3.hexToRgb(e3)), enumerable: false }, ansi256ToAnsi: { value(e3) {
    if (e3 < 8) return 30 + e3;
    if (e3 < 16) return 90 + (e3 - 8);
    let t5, o3, n6;
    if (e3 >= 232) t5 = ((e3 - 232) * 10 + 8) / 255, o3 = t5, n6 = t5;
    else {
      e3 -= 16;
      let A5 = e3 % 36;
      t5 = Math.floor(e3 / 36) / 5, o3 = Math.floor(A5 / 6) / 5, n6 = A5 % 6 / 5;
    }
    let s9 = Math.max(t5, o3, n6) * 2;
    if (s9 === 0) return 30;
    let a4 = 30 + (Math.round(n6) << 2 | Math.round(o3) << 1 | Math.round(t5));
    return s9 === 2 && (a4 += 60), a4;
  }, enumerable: false }, rgbToAnsi: { value: (e3, t5, o3) => l3.ansi256ToAnsi(l3.rgbToAnsi256(e3, t5, o3)), enumerable: false }, hexToAnsi: { value: (e3) => l3.ansi256ToAnsi(l3.hexToAnsi256(e3)), enumerable: false } }), l3;
}
var W2 = P2();
var { stdout: R2, stderr: M3 } = O2;
var p3 = Symbol("GENERATOR");
var c2 = Symbol("STYLER");
var b4 = Symbol("IS_EMPTY");
var k3 = ["ansi", "ansi", "ansi256", "ansi16m"];
var u4 = /* @__PURE__ */ Object.create(null);
var G2 = (r6, e3 = {}) => {
  if (e3.level && !(Number.isInteger(e3.level) && e3.level >= 0 && e3.level <= 3)) throw new Error("The `level` option should be an integer from 0 to 3");
  let t5 = R2 ? R2.level : 0;
  r6.level = e3.level === void 0 ? t5 : e3.level;
};
var E3 = (r6) => {
  let e3 = (...t5) => t5.join(" ");
  return G2(e3, r6), Object.setPrototypeOf(e3, f3.prototype), e3;
};
function f3(r6) {
  return E3(r6);
}
Object.setPrototypeOf(f3.prototype, Function.prototype);
for (let [r6, e3] of Object.entries(y2)) u4[r6] = { get() {
  let t5 = g2(this, v3(e3.open, e3.close, this[c2]), this[b4]);
  return Object.defineProperty(this, r6, { value: t5 }), t5;
} };
u4.visible = { get() {
  let r6 = g2(this, this[c2], true);
  return Object.defineProperty(this, "visible", { value: r6 }), r6;
} };
var y3 = (r6, e3, t5, ...o3) => r6 === "rgb" ? e3 === "ansi16m" ? y2[t5].ansi16m(...o3) : e3 === "ansi256" ? y2[t5].ansi256(y2.rgbToAnsi256(...o3)) : y2[t5].ansi(y2.rgbToAnsi(...o3)) : r6 === "hex" ? y3("rgb", e3, t5, ...y2.hexToRgb(...o3)) : y2[t5][r6](...o3);
var $2 = ["rgb", "hex", "ansi256"];
for (let r6 of $2) {
  u4[r6] = { get() {
    let { level: t5 } = this;
    return function(...o3) {
      let n6 = v3(y3(r6, k3[t5], "color", ...o3), y2.color.close, this[c2]);
      return g2(this, n6, this[b4]);
    };
  } };
  let e3 = "bg" + r6[0].toUpperCase() + r6.slice(1);
  u4[e3] = { get() {
    let { level: t5 } = this;
    return function(...o3) {
      let n6 = v3(y3(r6, k3[t5], "bgColor", ...o3), y2.bgColor.close, this[c2]);
      return g2(this, n6, this[b4]);
    };
  } };
}
var D2 = Object.defineProperties(() => {
}, { ...u4, level: { enumerable: true, get() {
  return this[p3].level;
}, set(r6) {
  this[p3].level = r6;
} } });
var v3 = (r6, e3, t5) => {
  let o3, n6;
  return t5 === void 0 ? (o3 = r6, n6 = e3) : (o3 = t5.openAll + r6, n6 = e3 + t5.closeAll), { open: r6, close: e3, openAll: o3, closeAll: n6, parent: t5 };
};
var g2 = (r6, e3, t5) => {
  let o3 = (...n6) => L2(o3, n6.length === 1 ? "" + n6[0] : n6.join(" "));
  return Object.setPrototypeOf(o3, D2), o3[p3] = r6, o3[c2] = e3, o3[b4] = t5, o3;
};
var L2 = (r6, e3) => {
  if (r6.level <= 0 || !e3) return r6[b4] ? "" : e3;
  let t5 = r6[c2];
  if (t5 === void 0) return e3;
  let { openAll: o3, closeAll: n6 } = t5;
  if (e3.includes("\x1B")) for (; t5 !== void 0; ) e3 = B3(e3, t5.close, t5.open), t5 = t5.parent;
  let s9 = e3.indexOf(`
`);
  return s9 !== -1 && (e3 = x3(e3, n6, o3, s9)), o3 + e3 + n6;
};
Object.defineProperties(f3.prototype, u4);
var Y2 = f3();
var H2 = f3({ level: M3 ? M3.level : 0 });
var J2 = Y2;

// https://esm.sh/mimic-function@5.0.1/es2022/mimic-function.mjs
var u5 = (e3, t5, n6, o3) => {
  if (n6 === "length" || n6 === "prototype" || n6 === "arguments" || n6 === "caller") return;
  let r6 = Object.getOwnPropertyDescriptor(e3, n6), c6 = Object.getOwnPropertyDescriptor(t5, n6);
  !g3(r6, c6) && o3 || Object.defineProperty(e3, n6, c6);
};
var g3 = function(e3, t5) {
  return e3 === void 0 || e3.configurable || e3.writable === t5.writable && e3.enumerable === t5.enumerable && e3.configurable === t5.configurable && (e3.writable || e3.value === t5.value);
};
var b5 = (e3, t5) => {
  let n6 = Object.getPrototypeOf(t5);
  n6 !== Object.getPrototypeOf(e3) && Object.setPrototypeOf(e3, n6);
};
var l4 = (e3, t5) => `/* Wrapped ${e3}*/
${t5}`;
var f4 = Object.getOwnPropertyDescriptor(Function.prototype, "toString");
var s3 = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name");
var O3 = (e3, t5, n6) => {
  let o3 = n6 === "" ? "" : `with ${n6.trim()}() `, r6 = l4.bind(null, o3, t5.toString());
  Object.defineProperty(r6, "name", s3);
  let { writable: c6, enumerable: i2, configurable: a4 } = f4;
  Object.defineProperty(e3, "toString", { value: r6, writable: c6, enumerable: i2, configurable: a4 });
};
function p4(e3, t5, { ignoreNonConfigurable: n6 = false } = {}) {
  let { name: o3 } = e3;
  for (let r6 of Reflect.ownKeys(t5)) u5(e3, t5, r6, n6);
  return b5(e3, t5), O3(e3, t5, o3), e3;
}

// https://esm.sh/onetime@7.0.0/es2022/onetime.mjs
var n2 = /* @__PURE__ */ new WeakMap();
var a = (e3, i2 = {}) => {
  if (typeof e3 != "function") throw new TypeError("Expected a function");
  let r6, o3 = 0, l7 = e3.displayName || e3.name || "<anonymous>", t5 = function(...c6) {
    if (n2.set(t5, ++o3), o3 === 1) r6 = e3.apply(this, c6), e3 = void 0;
    else if (i2.throw === true) throw new Error(`Function \`${l7}\` can only be called once`);
    return r6;
  };
  return p4(t5, e3), n2.set(t5, o3), t5;
};
a.callCount = (e3) => {
  if (!n2.has(e3)) throw new Error(`The given function \`${e3.name}\` is not wrapped by the \`onetime\` package`);
  return n2.get(e3);
};
var p5 = a;

// https://esm.sh/signal-exit@4.1.0/es2022/signals.mjs
var S3 = [];
S3.push("SIGHUP", "SIGINT", "SIGTERM");
xs.platform !== "win32" && S3.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
xs.platform === "linux" && S3.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");

// https://esm.sh/signal-exit@4.1.0/es2022/signal-exit.mjs
var r2 = (i2) => !!i2 && typeof i2 == "object" && typeof i2.removeListener == "function" && typeof i2.emit == "function" && typeof i2.reallyExit == "function" && typeof i2.listeners == "function" && typeof i2.kill == "function" && typeof i2.pid == "number" && typeof i2.on == "function";
var f5 = Symbol.for("signal-exit emitter");
var a2 = globalThis;
var _2 = Object.defineProperty.bind(Object);
var u6 = class {
  emitted = { afterExit: false, exit: false };
  listeners = { afterExit: [], exit: [] };
  count = 0;
  id = Math.random();
  constructor() {
    if (a2[f5]) return a2[f5];
    _2(a2, f5, { value: this, writable: false, enumerable: false, configurable: false });
  }
  on(t5, e3) {
    this.listeners[t5].push(e3);
  }
  removeListener(t5, e3) {
    let s9 = this.listeners[t5], n6 = s9.indexOf(e3);
    n6 !== -1 && (n6 === 0 && s9.length === 1 ? s9.length = 0 : s9.splice(n6, 1));
  }
  emit(t5, e3, s9) {
    if (this.emitted[t5]) return false;
    this.emitted[t5] = true;
    let n6 = false;
    for (let o3 of this.listeners[t5]) n6 = o3(e3, s9) === true || n6;
    return t5 === "exit" && (n6 = this.emit("afterExit", e3, s9) || n6), n6;
  }
};
var l5 = class {
};
var E4 = (i2) => ({ onExit(t5, e3) {
  return i2.onExit(t5, e3);
}, load() {
  return i2.load();
}, unload() {
  return i2.unload();
} });
var c3 = class extends l5 {
  onExit() {
    return () => {
    };
  }
  load() {
  }
  unload() {
  }
};
var x4 = class extends l5 {
  #r = m5.platform === "win32" ? "SIGINT" : "SIGHUP";
  #e = new u6();
  #t;
  #n;
  #o;
  #s = {};
  #i = false;
  constructor(t5) {
    super(), this.#t = t5, this.#s = {};
    for (let e3 of S3) this.#s[e3] = () => {
      let s9 = this.#t.listeners(e3), { count: n6 } = this.#e, o3 = t5;
      if (typeof o3.__signal_exit_emitter__ == "object" && typeof o3.__signal_exit_emitter__.count == "number" && (n6 += o3.__signal_exit_emitter__.count), s9.length === n6) {
        this.unload();
        let d5 = this.#e.emit("exit", null, e3), y4 = e3 === "SIGHUP" ? this.#r : e3;
        d5 || t5.kill(t5.pid, y4);
      }
    };
    this.#o = t5.reallyExit, this.#n = t5.emit;
  }
  onExit(t5, e3) {
    if (!r2(this.#t)) return () => {
    };
    this.#i === false && this.load();
    let s9 = e3?.alwaysLast ? "afterExit" : "exit";
    return this.#e.on(s9, t5), () => {
      this.#e.removeListener(s9, t5), this.#e.listeners.exit.length === 0 && this.#e.listeners.afterExit.length === 0 && this.unload();
    };
  }
  load() {
    if (!this.#i) {
      this.#i = true, this.#e.count += 1;
      for (let t5 of S3) try {
        let e3 = this.#s[t5];
        e3 && this.#t.on(t5, e3);
      } catch {
      }
      this.#t.emit = (t5, ...e3) => this.#h(t5, ...e3), this.#t.reallyExit = (t5) => this.#l(t5);
    }
  }
  unload() {
    this.#i && (this.#i = false, S3.forEach((t5) => {
      let e3 = this.#s[t5];
      if (!e3) throw new Error("Listener not defined for signal: " + t5);
      try {
        this.#t.removeListener(t5, e3);
      } catch {
      }
    }), this.#t.emit = this.#n, this.#t.reallyExit = this.#o, this.#e.count -= 1);
  }
  #l(t5) {
    return r2(this.#t) ? (this.#t.exitCode = t5 || 0, this.#e.emit("exit", this.#t.exitCode, null), this.#o.call(this.#t, this.#t.exitCode)) : 0;
  }
  #h(t5, ...e3) {
    let s9 = this.#n;
    if (t5 === "exit" && r2(this.#t)) {
      typeof e3[0] == "number" && (this.#t.exitCode = e3[0]);
      let n6 = s9.call(this.#t, t5, ...e3);
      return this.#e.emit("exit", this.#t.exitCode, null), n6;
    } else return s9.call(this.#t, t5, ...e3);
  }
};
var m5 = xs;
var { onExit: b6, load: g4, unload: w2 } = E4(r2(m5) ? new x4(m5) : new c3());

// https://esm.sh/restore-cursor@5.1.0/es2022/restore-cursor.mjs
var r3 = xs.stderr.isTTY ? xs.stderr : xs.stdout.isTTY ? xs.stdout : void 0;
var s4 = r3 ? p5(() => {
  b6(() => {
    r3.write("\x1B[?25h");
  }, { alwaysLast: true });
}) : () => {
};
var n3 = s4;

// https://esm.sh/cli-cursor@5.0.0/es2022/cli-cursor.mjs
var s5 = false;
var r4 = {};
r4.show = (e3 = xs.stderr) => {
  e3.isTTY && (s5 = false, e3.write("\x1B[?25h"));
};
r4.hide = (e3 = xs.stderr) => {
  e3.isTTY && (n3(), s5 = true, e3.write("\x1B[?25l"));
};
r4.toggle = (e3, i2) => {
  e3 !== void 0 && (s5 = e3), s5 ? r4.show(i2) : r4.hide(i2);
};
var u7 = r4;

// https://esm.sh/cli-spinners@3.2.1/es2022/cli-spinners.mjs
var s6 = spinners_default;
var t = Object.keys(spinners_default);

// https://esm.sh/log-symbols@7.0.1/es2022/log-symbols.mjs
var s7 = Object.defineProperty;
var n4 = (e3, o3) => {
  for (var r6 in o3) s7(e3, r6, { get: o3[r6], enumerable: true });
};
var t2 = {};
n4(t2, { error: () => a3, info: () => c4, success: () => p6, warning: () => x5 });
var c4 = "ℹ️";
var p6 = "✅";
var x5 = "⚠️";
var a3 = "❌️";

// https://esm.sh/ansi-regex@6.2.2/es2022/ansi-regex.mjs
function e({ onlyFirst: n6 = false } = {}) {
  let u9 = "(?:\\u001B\\][\\s\\S]*?(?:\\u0007|\\u001B\\u005C|\\u009C))|[\\u001B\\u009B][[\\]()#;?]*(?:\\d{1,4}(?:[;:]\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]";
  return new RegExp(u9, n6 ? void 0 : "g");
}

// https://esm.sh/strip-ansi@7.1.2/es2022/strip-ansi.mjs
var t3 = e();
function o(e3) {
  if (typeof e3 != "string") throw new TypeError(`Expected a \`string\`, got \`${typeof e3}\``);
  return e3.replace(t3, "");
}

// https://esm.sh/get-east-asian-width@1.4.0/es2022/get-east-asian-width.mjs
function D3(F3) {
  return F3 === 161 || F3 === 164 || F3 === 167 || F3 === 168 || F3 === 170 || F3 === 173 || F3 === 174 || F3 >= 176 && F3 <= 180 || F3 >= 182 && F3 <= 186 || F3 >= 188 && F3 <= 191 || F3 === 198 || F3 === 208 || F3 === 215 || F3 === 216 || F3 >= 222 && F3 <= 225 || F3 === 230 || F3 >= 232 && F3 <= 234 || F3 === 236 || F3 === 237 || F3 === 240 || F3 === 242 || F3 === 243 || F3 >= 247 && F3 <= 250 || F3 === 252 || F3 === 254 || F3 === 257 || F3 === 273 || F3 === 275 || F3 === 283 || F3 === 294 || F3 === 295 || F3 === 299 || F3 >= 305 && F3 <= 307 || F3 === 312 || F3 >= 319 && F3 <= 322 || F3 === 324 || F3 >= 328 && F3 <= 331 || F3 === 333 || F3 === 338 || F3 === 339 || F3 === 358 || F3 === 359 || F3 === 363 || F3 === 462 || F3 === 464 || F3 === 466 || F3 === 468 || F3 === 470 || F3 === 472 || F3 === 474 || F3 === 476 || F3 === 593 || F3 === 609 || F3 === 708 || F3 === 711 || F3 >= 713 && F3 <= 715 || F3 === 717 || F3 === 720 || F3 >= 728 && F3 <= 731 || F3 === 733 || F3 === 735 || F3 >= 768 && F3 <= 879 || F3 >= 913 && F3 <= 929 || F3 >= 931 && F3 <= 937 || F3 >= 945 && F3 <= 961 || F3 >= 963 && F3 <= 969 || F3 === 1025 || F3 >= 1040 && F3 <= 1103 || F3 === 1105 || F3 === 8208 || F3 >= 8211 && F3 <= 8214 || F3 === 8216 || F3 === 8217 || F3 === 8220 || F3 === 8221 || F3 >= 8224 && F3 <= 8226 || F3 >= 8228 && F3 <= 8231 || F3 === 8240 || F3 === 8242 || F3 === 8243 || F3 === 8245 || F3 === 8251 || F3 === 8254 || F3 === 8308 || F3 === 8319 || F3 >= 8321 && F3 <= 8324 || F3 === 8364 || F3 === 8451 || F3 === 8453 || F3 === 8457 || F3 === 8467 || F3 === 8470 || F3 === 8481 || F3 === 8482 || F3 === 8486 || F3 === 8491 || F3 === 8531 || F3 === 8532 || F3 >= 8539 && F3 <= 8542 || F3 >= 8544 && F3 <= 8555 || F3 >= 8560 && F3 <= 8569 || F3 === 8585 || F3 >= 8592 && F3 <= 8601 || F3 === 8632 || F3 === 8633 || F3 === 8658 || F3 === 8660 || F3 === 8679 || F3 === 8704 || F3 === 8706 || F3 === 8707 || F3 === 8711 || F3 === 8712 || F3 === 8715 || F3 === 8719 || F3 === 8721 || F3 === 8725 || F3 === 8730 || F3 >= 8733 && F3 <= 8736 || F3 === 8739 || F3 === 8741 || F3 >= 8743 && F3 <= 8748 || F3 === 8750 || F3 >= 8756 && F3 <= 8759 || F3 === 8764 || F3 === 8765 || F3 === 8776 || F3 === 8780 || F3 === 8786 || F3 === 8800 || F3 === 8801 || F3 >= 8804 && F3 <= 8807 || F3 === 8810 || F3 === 8811 || F3 === 8814 || F3 === 8815 || F3 === 8834 || F3 === 8835 || F3 === 8838 || F3 === 8839 || F3 === 8853 || F3 === 8857 || F3 === 8869 || F3 === 8895 || F3 === 8978 || F3 >= 9312 && F3 <= 9449 || F3 >= 9451 && F3 <= 9547 || F3 >= 9552 && F3 <= 9587 || F3 >= 9600 && F3 <= 9615 || F3 >= 9618 && F3 <= 9621 || F3 === 9632 || F3 === 9633 || F3 >= 9635 && F3 <= 9641 || F3 === 9650 || F3 === 9651 || F3 === 9654 || F3 === 9655 || F3 === 9660 || F3 === 9661 || F3 === 9664 || F3 === 9665 || F3 >= 9670 && F3 <= 9672 || F3 === 9675 || F3 >= 9678 && F3 <= 9681 || F3 >= 9698 && F3 <= 9701 || F3 === 9711 || F3 === 9733 || F3 === 9734 || F3 === 9737 || F3 === 9742 || F3 === 9743 || F3 === 9756 || F3 === 9758 || F3 === 9792 || F3 === 9794 || F3 === 9824 || F3 === 9825 || F3 >= 9827 && F3 <= 9829 || F3 >= 9831 && F3 <= 9834 || F3 === 9836 || F3 === 9837 || F3 === 9839 || F3 === 9886 || F3 === 9887 || F3 === 9919 || F3 >= 9926 && F3 <= 9933 || F3 >= 9935 && F3 <= 9939 || F3 >= 9941 && F3 <= 9953 || F3 === 9955 || F3 === 9960 || F3 === 9961 || F3 >= 9963 && F3 <= 9969 || F3 === 9972 || F3 >= 9974 && F3 <= 9977 || F3 === 9979 || F3 === 9980 || F3 === 9982 || F3 === 9983 || F3 === 10045 || F3 >= 10102 && F3 <= 10111 || F3 >= 11094 && F3 <= 11097 || F3 >= 12872 && F3 <= 12879 || F3 >= 57344 && F3 <= 63743 || F3 >= 65024 && F3 <= 65039 || F3 === 65533 || F3 >= 127232 && F3 <= 127242 || F3 >= 127248 && F3 <= 127277 || F3 >= 127280 && F3 <= 127337 || F3 >= 127344 && F3 <= 127373 || F3 === 127375 || F3 === 127376 || F3 >= 127387 && F3 <= 127404 || F3 >= 917760 && F3 <= 917999 || F3 >= 983040 && F3 <= 1048573 || F3 >= 1048576 && F3 <= 1114109;
}
function E5(F3) {
  return F3 === 12288 || F3 >= 65281 && F3 <= 65376 || F3 >= 65504 && F3 <= 65510;
}
function A3(F3) {
  return F3 >= 4352 && F3 <= 4447 || F3 === 8986 || F3 === 8987 || F3 === 9001 || F3 === 9002 || F3 >= 9193 && F3 <= 9196 || F3 === 9200 || F3 === 9203 || F3 === 9725 || F3 === 9726 || F3 === 9748 || F3 === 9749 || F3 >= 9776 && F3 <= 9783 || F3 >= 9800 && F3 <= 9811 || F3 === 9855 || F3 >= 9866 && F3 <= 9871 || F3 === 9875 || F3 === 9889 || F3 === 9898 || F3 === 9899 || F3 === 9917 || F3 === 9918 || F3 === 9924 || F3 === 9925 || F3 === 9934 || F3 === 9940 || F3 === 9962 || F3 === 9970 || F3 === 9971 || F3 === 9973 || F3 === 9978 || F3 === 9981 || F3 === 9989 || F3 === 9994 || F3 === 9995 || F3 === 10024 || F3 === 10060 || F3 === 10062 || F3 >= 10067 && F3 <= 10069 || F3 === 10071 || F3 >= 10133 && F3 <= 10135 || F3 === 10160 || F3 === 10175 || F3 === 11035 || F3 === 11036 || F3 === 11088 || F3 === 11093 || F3 >= 11904 && F3 <= 11929 || F3 >= 11931 && F3 <= 12019 || F3 >= 12032 && F3 <= 12245 || F3 >= 12272 && F3 <= 12287 || F3 >= 12289 && F3 <= 12350 || F3 >= 12353 && F3 <= 12438 || F3 >= 12441 && F3 <= 12543 || F3 >= 12549 && F3 <= 12591 || F3 >= 12593 && F3 <= 12686 || F3 >= 12688 && F3 <= 12773 || F3 >= 12783 && F3 <= 12830 || F3 >= 12832 && F3 <= 12871 || F3 >= 12880 && F3 <= 42124 || F3 >= 42128 && F3 <= 42182 || F3 >= 43360 && F3 <= 43388 || F3 >= 44032 && F3 <= 55203 || F3 >= 63744 && F3 <= 64255 || F3 >= 65040 && F3 <= 65049 || F3 >= 65072 && F3 <= 65106 || F3 >= 65108 && F3 <= 65126 || F3 >= 65128 && F3 <= 65131 || F3 >= 94176 && F3 <= 94180 || F3 >= 94192 && F3 <= 94198 || F3 >= 94208 && F3 <= 101589 || F3 >= 101631 && F3 <= 101662 || F3 >= 101760 && F3 <= 101874 || F3 >= 110576 && F3 <= 110579 || F3 >= 110581 && F3 <= 110587 || F3 === 110589 || F3 === 110590 || F3 >= 110592 && F3 <= 110882 || F3 === 110898 || F3 >= 110928 && F3 <= 110930 || F3 === 110933 || F3 >= 110948 && F3 <= 110951 || F3 >= 110960 && F3 <= 111355 || F3 >= 119552 && F3 <= 119638 || F3 >= 119648 && F3 <= 119670 || F3 === 126980 || F3 === 127183 || F3 === 127374 || F3 >= 127377 && F3 <= 127386 || F3 >= 127488 && F3 <= 127490 || F3 >= 127504 && F3 <= 127547 || F3 >= 127552 && F3 <= 127560 || F3 === 127568 || F3 === 127569 || F3 >= 127584 && F3 <= 127589 || F3 >= 127744 && F3 <= 127776 || F3 >= 127789 && F3 <= 127797 || F3 >= 127799 && F3 <= 127868 || F3 >= 127870 && F3 <= 127891 || F3 >= 127904 && F3 <= 127946 || F3 >= 127951 && F3 <= 127955 || F3 >= 127968 && F3 <= 127984 || F3 === 127988 || F3 >= 127992 && F3 <= 128062 || F3 === 128064 || F3 >= 128066 && F3 <= 128252 || F3 >= 128255 && F3 <= 128317 || F3 >= 128331 && F3 <= 128334 || F3 >= 128336 && F3 <= 128359 || F3 === 128378 || F3 === 128405 || F3 === 128406 || F3 === 128420 || F3 >= 128507 && F3 <= 128591 || F3 >= 128640 && F3 <= 128709 || F3 === 128716 || F3 >= 128720 && F3 <= 128722 || F3 >= 128725 && F3 <= 128728 || F3 >= 128732 && F3 <= 128735 || F3 === 128747 || F3 === 128748 || F3 >= 128756 && F3 <= 128764 || F3 >= 128992 && F3 <= 129003 || F3 === 129008 || F3 >= 129292 && F3 <= 129338 || F3 >= 129340 && F3 <= 129349 || F3 >= 129351 && F3 <= 129535 || F3 >= 129648 && F3 <= 129660 || F3 >= 129664 && F3 <= 129674 || F3 >= 129678 && F3 <= 129734 || F3 === 129736 || F3 >= 129741 && F3 <= 129756 || F3 >= 129759 && F3 <= 129770 || F3 >= 129775 && F3 <= 129784 || F3 >= 131072 && F3 <= 196605 || F3 >= 196608 && F3 <= 262141;
}
function B4(F3) {
  if (!Number.isSafeInteger(F3)) throw new TypeError(`Expected a code point, got \`${typeof F3}\`.`);
}
function u8(F3, { ambiguousAsWide: r6 = false } = {}) {
  return B4(F3), E5(F3) || A3(F3) || r6 && D3(F3) ? 2 : 1;
}

// https://esm.sh/string-width@8.1.0/es2022/string-width.mjs
var l6 = new Intl.Segmenter();
var g5 = new RegExp("^(?:\\p{Default_Ignorable_Code_Point}|\\p{Control}|\\p{Mark}|\\p{Surrogate})+$", "v");
var d4 = new RegExp("^[\\p{Default_Ignorable_Code_Point}\\p{Control}\\p{Format}\\p{Mark}\\p{Surrogate}]+", "v");
var p7 = new RegExp("^\\p{RGI_Emoji}$", "v");
function h5(t5) {
  return t5.replace(d4, "");
}
function m6(t5) {
  return g5.test(t5);
}
function A4(t5, s9) {
  let n6 = 0;
  if (t5.length > 1) for (let e3 of t5.slice(1)) e3 >= "＀" && e3 <= "￯" && (n6 += u8(e3.codePointAt(0), s9));
  return n6;
}
function C3(t5, s9 = {}) {
  if (typeof t5 != "string" || t5.length === 0) return 0;
  let { ambiguousIsNarrow: n6 = true, countAnsiEscapeCodes: e3 = false } = s9, o3 = t5;
  if (e3 || (o3 = o(o3)), o3.length === 0) return 0;
  let i2 = 0, a4 = { ambiguousAsWide: !n6 };
  for (let { segment: r6 } of l6.segment(o3)) {
    if (m6(r6)) continue;
    if (p7.test(r6)) {
      i2 += 2;
      continue;
    }
    let c6 = h5(r6).codePointAt(0);
    i2 += u8(c6, a4), i2 += A4(r6, a4);
  }
  return i2;
}

// https://esm.sh/is-interactive@2.0.0/es2022/is-interactive.mjs
function n5({ stream: e3 = xs.stdout } = {}) {
  return !!(e3 && e3.isTTY && xs.env.TERM !== "dumb" && !("CI" in xs.env));
}

// https://esm.sh/is-unicode-supported@2.1.0/es2022/is-unicode-supported.mjs
function t4() {
  let { env: o3 } = xs, { TERM: e3, TERM_PROGRAM: r6 } = o3;
  return xs.platform !== "win32" ? e3 !== "linux" : !!o3.WT_SESSION || !!o3.TERMINUS_SUBLIME || o3.ConEmuTask === "{cmd::Cmder}" || r6 === "Terminus-Sublime" || r6 === "vscode" || e3 === "xterm-256color" || e3 === "alacritty" || e3 === "rxvt-unicode" || e3 === "rxvt-unicode-256color" || o3.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}

// https://esm.sh/stdin-discarder@0.2.2/es2022/stdin-discarder.mjs
var e2 = 3;
var s8 = class {
  #t = 0;
  start() {
    this.#t++, this.#t === 1 && this.#i();
  }
  stop() {
    if (this.#t <= 0) throw new Error("`stop` called more times than `start`");
    this.#t--, this.#t === 0 && this.#e();
  }
  #i() {
    xs.platform === "win32" || !xs.stdin.isTTY || (xs.stdin.setRawMode(true), xs.stdin.on("data", this.#s), xs.stdin.resume());
  }
  #e() {
    xs.stdin.isTTY && (xs.stdin.off("data", this.#s), xs.stdin.pause(), xs.stdin.setRawMode(false));
  }
  #s(i2) {
    i2[0] === e2 && xs.emit("SIGINT");
  }
};
var r5 = new s8();
var o2 = r5;

// https://esm.sh/ora@9.0.0/es2022/ora.mjs?dev
var c5 = class {
  #l = 0;
  #d = false;
  #y = 0;
  #h = -1;
  #g = 0;
  #b = 0;
  #t;
  #e;
  #i;
  #u;
  #x;
  #s;
  #f;
  #r;
  #a;
  #n;
  #o;
  color;
  constructor(t5) {
    typeof t5 == "string" && (t5 = { text: t5 }), this.#t = { color: "cyan", stream: xs.stderr, discardStdin: true, hideCursor: true, ...t5 }, this.color = this.#t.color, this.spinner = this.#t.spinner, this.#x = this.#t.interval, this.#i = this.#t.stream, this.#s = typeof this.#t.isEnabled == "boolean" ? this.#t.isEnabled : n5({ stream: this.#i }), this.#f = typeof this.#t.isSilent == "boolean" ? this.#t.isSilent : false, this.text = this.#t.text, this.prefixText = this.#t.prefixText, this.suffixText = this.#t.suffixText, this.indent = this.#t.indent, xs.env.NODE_ENV === "test" && (this._stream = this.#i, this._isEnabled = this.#s, Object.defineProperty(this, "_linesToClear", { get() {
      return this.#l;
    }, set(i2) {
      this.#l = i2;
    } }), Object.defineProperty(this, "_frameIndex", { get() {
      return this.#h;
    } }), Object.defineProperty(this, "_lineCount", { get() {
      return this.#y;
    } }));
  }
  get indent() {
    return this.#r;
  }
  set indent(t5 = 0) {
    if (!(t5 >= 0 && Number.isInteger(t5))) throw new Error("The `indent` option must be an integer from 0 and up");
    this.#r = t5, this.#c();
  }
  get interval() {
    return this.#x ?? this.#e.interval ?? 100;
  }
  get spinner() {
    return this.#e;
  }
  set spinner(t5) {
    if (this.#h = -1, this.#x = void 0, typeof t5 == "object") {
      if (!Array.isArray(t5.frames) || t5.frames.length === 0 || t5.frames.some((i2) => typeof i2 != "string")) throw new Error("The given spinner must have a non-empty `frames` array of strings");
      if (t5.interval !== void 0 && !(Number.isInteger(t5.interval) && t5.interval > 0)) throw new Error("`spinner.interval` must be a positive integer if provided");
      this.#e = t5;
    } else if (!t4()) this.#e = s6.line;
    else if (t5 === void 0) this.#e = s6.dots;
    else if (t5 !== "default" && s6[t5]) this.#e = s6[t5];
    else throw new Error(`There is no built-in spinner named '${t5}'. See https://github.com/sindresorhus/cli-spinners/blob/main/spinners.json for a full list.`);
  }
  get text() {
    return this.#a;
  }
  set text(t5 = "") {
    this.#a = t5, this.#c();
  }
  get prefixText() {
    return this.#n;
  }
  set prefixText(t5 = "") {
    this.#n = t5, this.#c();
  }
  get suffixText() {
    return this.#o;
  }
  set suffixText(t5 = "") {
    this.#o = t5, this.#c();
  }
  get isSpinning() {
    return this.#u !== void 0;
  }
  #w(t5, i2, s9 = false) {
    let e3 = typeof t5 == "function" ? t5() : t5;
    return typeof e3 == "string" && e3 !== "" ? s9 ? i2 + e3 : e3 + i2 : "";
  }
  #m(t5 = this.#n, i2 = " ") {
    return this.#w(t5, i2, false);
  }
  #p(t5 = this.#o, i2 = " ") {
    return this.#w(t5, i2, true);
  }
  #T(t5, i2) {
    let s9 = 0;
    for (let e3 of o(t5).split(`
`)) s9 += Math.max(1, Math.ceil(C3(e3) / i2));
    return s9;
  }
  #c() {
    let t5 = globalThis?.Deno?.consoleSize?.()?.columns ?? this.#i.columns ?? 80, i2 = typeof this.#n == "function" ? "" : this.#n, s9 = typeof this.#o == "function" ? "" : this.#o, e3 = typeof i2 == "string" && i2 !== "" ? i2 + " " : "", r6 = typeof s9 == "string" && s9 !== "" ? " " + s9 : "", h6 = " ".repeat(this.#r) + e3 + "-" + (typeof this.#a == "string" ? " " + this.#a : "") + r6;
    this.#y = this.#T(h6, t5);
  }
  get isEnabled() {
    return this.#s && !this.#f;
  }
  set isEnabled(t5) {
    if (typeof t5 != "boolean") throw new TypeError("The `isEnabled` option must be a boolean");
    this.#s = t5;
  }
  get isSilent() {
    return this.#f;
  }
  set isSilent(t5) {
    if (typeof t5 != "boolean") throw new TypeError("The `isSilent` option must be a boolean");
    this.#f = t5;
  }
  frame() {
    let t5 = Date.now();
    (this.#h === -1 || t5 - this.#g >= this.interval) && (this.#h = ++this.#h % this.#e.frames.length, this.#g = t5);
    let { frames: i2 } = this.#e, s9 = i2[this.#h];
    this.color && (s9 = J2[this.color](s9));
    let e3 = this.#m(this.#n, " "), r6 = typeof this.text == "string" ? " " + this.text : "", n6 = this.#p(this.#o, " ");
    return e3 + s9 + r6 + n6;
  }
  clear() {
    if (!this.#s || !this.#i.isTTY) return this;
    this.#i.cursorTo(0);
    for (let t5 = 0; t5 < this.#l; t5++) t5 > 0 && this.#i.moveCursor(0, -1), this.#i.clearLine(1);
    return (this.#r || this.#b !== this.#r) && this.#i.cursorTo(this.#r), this.#b = this.#r, this.#l = 0, this;
  }
  render() {
    if (!this.#s || this.#f) return this;
    this.clear();
    let t5 = this.frame(), i2 = globalThis?.Deno?.consoleSize?.()?.columns ?? this.#i.columns ?? 80, s9 = this.#T(t5, i2), e3 = globalThis?.Deno?.consoleSize?.()?.rows ?? this.#i.rows;
    if (e3 && e3 > 1 && s9 > e3) {
      let r6 = t5.split(`
`), n6 = e3 - 1;
      t5 = [...r6.slice(0, n6), "... (content truncated to fit terminal)"].join(`
`);
    }
    return this.#i.write(t5), this.#l = this.#T(t5, i2), this;
  }
  start(t5) {
    if (t5 && (this.text = t5), this.#f) return this;
    if (!this.#s) {
      let i2 = " ".repeat(this.#r) + this.#m(this.#n, " ") + (this.text ? `- ${this.text}` : "") + this.#p(this.#o, " ");
      return i2.trim() !== "" && this.#i.write(i2 + `
`), this;
    }
    return this.isSpinning ? this : (this.#t.hideCursor && u7.hide(this.#i), this.#t.discardStdin && xs.stdin.isTTY && (this.#d = true, o2.start()), this.render(), this.#u = setInterval(this.render.bind(this), this.interval), this);
  }
  stop() {
    return clearInterval(this.#u), this.#u = void 0, this.#h = 0, this.#s && (this.clear(), this.#t.hideCursor && u7.show(this.#i)), this.#t.discardStdin && xs.stdin.isTTY && this.#d && (o2.stop(), this.#d = false), this;
  }
  succeed(t5) {
    return this.stopAndPersist({ symbol: t2.success, text: t5 });
  }
  fail(t5) {
    return this.stopAndPersist({ symbol: t2.error, text: t5 });
  }
  warn(t5) {
    return this.stopAndPersist({ symbol: t2.warning, text: t5 });
  }
  info(t5) {
    return this.stopAndPersist({ symbol: t2.info, text: t5 });
  }
  stopAndPersist(t5 = {}) {
    if (this.#f) return this;
    let i2 = t5.prefixText ?? this.#n, s9 = this.#m(i2, " "), e3 = t5.symbol ?? " ", r6 = t5.text ?? this.text, h6 = typeof r6 == "string" ? (e3 ? " " : "") + r6 : "", f6 = t5.suffixText ?? this.#o, p8 = this.#p(f6, " "), T3 = s9 + e3 + h6 + p8 + `
`;
    return this.stop(), this.#i.write(T3), this;
  }
};
function m7(o3) {
  return new c5(o3);
}
async function D4(o3, t5) {
  let i2 = typeof o3 == "function", s9 = typeof o3.then == "function";
  if (!i2 && !s9) throw new TypeError("Parameter `action` must be a Function or a Promise");
  let { successText: e3, failText: r6 } = typeof t5 == "object" ? t5 : { successText: void 0, failText: void 0 }, n6 = m7(t5).start();
  try {
    let f6 = await (i2 ? o3(n6) : o3);
    return n6.succeed(e3 === void 0 ? void 0 : typeof e3 == "string" ? e3 : e3(f6)), f6;
  } catch (h6) {
    throw n6.fail(r6 === void 0 ? void 0 : typeof r6 == "string" ? r6 : r6(h6)), h6;
  }
}
export {
  m7 as default,
  D4 as oraPromise,
  s6 as spinners
};
