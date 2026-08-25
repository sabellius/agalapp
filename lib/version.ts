export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
export const APP_GIT_SHA = process.env.NEXT_PUBLIC_GIT_SHA ?? "dev";
export const APP_BUILD_TIME = process.env.BUILD_TIME ?? "unknown";

export const APP_SHORT_SHA = APP_GIT_SHA.slice(0, 7);
