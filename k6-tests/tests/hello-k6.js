import { browser } from "k6/browser";
import http from "k6/http";
import { check } from "k6";

export const options = {
    // scenarios: {
    //     client: {
    //         vus: 2,
    //         duration: "10s",
    //         executor: "constant-vus",
    //         exec: "loadPage",
    //         options: {
    //             browser: {
    //                 type: "chromium",
    //             },
    //         },
    //     },
    //     server: {
    //         vus: 2,
    //         duration: "10s",
    //         executor: "constant-vus",
    //         exec: "getServerRoot",
    //     },
    // },
    vus: 5,
    duration: "10s",
};

// export const loadPage = async () => {
//     const page = await browser.newPage();

//     try {
//         await page.goto("http://client:4321");
//     } finally {
//         await page.close();
//     }
// };

// export const getServerRoot = async () => {
//     const url = "http://server:8000/";
//     const res = http.get(url);

//     check(res, {
//         "status is 200": (r) => r.status === 200,
//     });
// };

export default async () => {
    const user = {
        name: `User ${Math.random()}`,
    };

    const url = "http://traefik:8000/users";
    const res = http.post(url, JSON.stringify(user), {
        headers: {
            "Content-Type": "application/json",
        },
    });

    check(res, {
        "status is 202": (r) => r.status === 202,
    });
};