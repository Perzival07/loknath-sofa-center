const isDev = process.env.NODE_ENV !== "production";

/** Silence noisy console.log in production (errors still go to console.error). */
export const installProductionConsole = () => {
    if (!isDev) {
        console.log = () => {};
        console.debug = () => {};
    }
};

export const log = (...args) => {
    if (isDev) console.log(...args);
};

export const warn = (...args) => {
    if (isDev) console.warn(...args);
};

export const error = (...args) => {
    console.error(...args);
};
