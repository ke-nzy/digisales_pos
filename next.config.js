/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  ignoreBuildErrors: true,
  reactStrictMode: true,
};

const nextConfigFunction = async () => {
  const withPWA = (await import("@ducanh2912/next-pwa")).default({
    dest: "public",
    // cacheOnFrontEndNav: true,
    // aggressiveFrontEndNavCaching: true,
    // reloadOnOnline: true,
    // //   swMinFiles: true,
    // disable: false,
    // workboxOptions: {
    //   disableDevLogs: true,
    // },
  });
  return withPWA(config);
};

export default nextConfigFunction;
