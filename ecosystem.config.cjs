module.exports = {
  apps: [
    {
      name: "image-generation",
      cwd: "/home/vishva/Projects/image-generation",
      // Run the Next.js production server directly (matches the npm `start` →
      // `next start` script, but invoked via the binary so PM2 controls it cleanly).
      script: "node_modules/next/dist/bin/next",
      args: "start -p 4187",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: "4187",
        // Served under /image-generation on the `dev` gateway. Must match the value
        // the build was compiled with (deploy.sh) — basePath is baked in at build time.
        NEXT_PUBLIC_BASE_PATH: "/image-generation",
      },
    },
  ],
};
