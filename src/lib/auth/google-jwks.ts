// Snapshot of Google's OAuth JWKS (https://www.googleapis.com/oauth2/v3/certs)
// captured 2026-11-15. Google almost never removes these signing keys, and
// runtime code always tries a live refresh first — this file only serves as an
// offline fallback so ID-token verification works on hosts that cannot reach
// Google (mainland dev machines / mainland servers).
// Refresh with: scripts/fetch-google-jwks.mjs
export const GOOGLE_JWKS_BUNDLED = {
  "keys": [
    {
      "n": "pIpnzA2ezyEERJSxiqpLBmMeIqATH-V6iuBtKIibXEyYovujrx8niqTeO6RIyXT6uDUUv0V2kJ8V_iWYFxzXY1BqK9IfcAmjg0XUDoyTVkoyLsF0gj299LH-zw5vCvy8jmamFIZKAbKcQ5hpHvSittM1vl-6vVL-i2GxyGbMA9aY6Hq15NylS1t7ELTYfQimlnvxcb7_DM0cuS5U1SfbCZMCpKhh0nrSlYds240oxpCJOV2rBahs_Ea5c7tezS1nwVC9W_E-bR9TF6BHkC_fv-E8DcWfkI_6geaJzBhINNxBfjx-w1-WUp2Jz3YYFWEfeQjxMqu-Fg6cGxwk7V16uQ",
      "kid": "943a3a5d7d919625a454e489b75c29adab57acba",
      "use": "sig",
      "alg": "RS256",
      "kty": "RSA",
      "e": "AQAB"
    },
    {
      "use": "sig",
      "kid": "9e7b714e8bfb4ef03bac2570eb322bfb7d686ee9",
      "e": "AQAB",
      "alg": "RS256",
      "kty": "RSA",
      "n": "7O_xgke58DhpSDJRmIMm-u4fcgxyybcqhkKLHesjVvRuhcxYWFUDkb4elTCgEZGH35JXHK0BDZzA1IDuNdum6wnHFC9emCtE0j781ZPVdpK40qBB_tCk05iJrBaeL92Ep4AznwgCUI0ETQkZHnRcHDn2u-XDlABu1a9nfi3ZNL-JYZEBioielRWvIST64Q7EADp8VglvLQTTNcIYXYSoySBlI4YLipMwJYlw49Skac2IunodvJB6z8Z8VcZKvM87uC00CZMfi6ZuIN7Qjval66BIgamM4sJ6W6aUHDFfCiDOuEQtsXo5ItWg70fItLeTpss1_pJdxkM0nzfx6ccmQQ"
    }
  ]
} as const;
