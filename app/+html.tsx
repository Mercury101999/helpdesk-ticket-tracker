import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>IT Help Desk Ticket Tracker</title>
        <meta
          name="description"
          content="Submit, triage, and resolve IT support tickets. Try the demo as a requester, technician, or admin — no sign-up required."
        />
        <meta name="theme-color" content="#f4f6fb" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f1419" media="(prefers-color-scheme: dark)" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #e8edf5;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #0b0f14;
  }
}
a:focus-visible,
[role="button"]:focus-visible,
[role="link"]:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid #2563eb !important;
  outline-offset: 2px;
}
`;
