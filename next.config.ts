/** import type { NextConfig } from "next"; */

const nextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "en.onepiece-cardgame.com",
                pathname: "/images/cardlist/card/**",
            },
        ],
    },
};

export default nextConfig;
