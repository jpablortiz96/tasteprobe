# Third-party notices

The MIT license in LICENSE covers TasteProbe's original source and documentation. It does not grant rights to provider data, movie artwork, trademarks, or third-party dependencies. Dependency licenses remain with their owners; retain npm package notices when distributing dependencies.

## TMDB

This product uses the TMDB API but is not endorsed or certified by TMDB.

TMDB provides optional movie artwork and descriptions, independently of Qloo cultural rankings. The approved TMDB logo in public/tmdb-logo.svg is a third-party brand asset, excluded from TasteProbe's MIT grant. Commercial movie posters are not bundled in the repository. Artwork is loaded from the provider only after identity matching; absence or ambiguity uses original illustrative covers.

The API's non-commercial attribution conditions do not constitute blanket copyright permission for all underlying images. Commercial use requires the appropriate provider agreement and rights review. See https://developer.themoviedb.org/docs/faq and https://www.themoviedb.org/terms-of-use .

## Qloo

Qloo supplies Search identities and Insights evidence through an authorized event credential. Qloo data and branding remain subject to provider/event terms, not the source-code MIT license. Historical evidence is dated and labeled. Do not repurpose or redistribute raw provider datasets under the source-code license.

## Runtime dependencies

Next.js, React, and React DOM use MIT licensing. Development tooling and transitive dependencies retain the licenses distributed in their packages. package-lock.json records the exact resolved dependency set; npm audit concerns vulnerability advisories, not legal clearance. No new runtime dependency was added for the release candidate.

Optional prebuilt sharp/libvips packages include LGPL-3.0-or-later components, with Apache-2.0 and MIT components in some builds; caniuse-lite uses CC-BY-4.0. These are not relicensed as MIT. The source repository does not vendor their binaries. Installation obtains the original packages and their notices from npm. When distributing a deploy image or binaries, retain the actual packages' LICENSE/NOTICE/copyright files and satisfy their applicable source/relinking requirements; do not strip them from a container. Review the exact deployed platform's package set before distributing a release image. The recorded lockfile license inventory is in evidence/gate3-release-security.json.
