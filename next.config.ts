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
            {
                protocol: "https",
                hostname: "tcgplayer-cdn.tcgplayer.com",
                pathname: "/product/**",
            },
        ],
    },
}

export default nextConfig
