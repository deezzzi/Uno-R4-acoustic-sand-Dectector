
## Getting Started


# Sensor API Branch

This branch contains the API implementation used for the Gas Pipeline Acoustic Sand Monitoring Device. It includes a serverless function built with Next.js that fetches sensor data from an external endpoint and provides robust handling—including timeout and fallback mechanisms—to ensure your application continues to operate even when the sensor API is slow or unresponsive.

## Overview

- **API Route:**  
  The sensor API endpoint is implemented using a Next.js API route, found at `src/app/api/route.ts`.  
  It is deployed on Vercel and responds to requests at `/api`.

- **Data Fetching Logic:**  
  The API fetches sensor data from an external source using the environment variable `NEXT_PUBLIC_API_URL`. The function implements a 10-second timeout via an AbortController to protect against hanging requests. If the fetch operation fails or times out, fallback dummy data is automatically returned.

- **Important Deployment Notes:**  
  **Do not set** `NEXT_PUBLIC_API_URL` to the same URL as your API route (e.g., `https://uno-r4.vercel.app/api`), as that creates an infinite loop. Instead, this variable must point to a publicly accessible sensor data endpoint.  
  Example for a production sensor API:
  ```env
  NEXT_PUBLIC_API_URL=https://mysensorapi.example.com/data
  ```

## Environment Setup

For local development, create a `.env.local` file with the following sample content:

```env
# Replace the below URL with your actual sensor API endpoint.
NEXT_PUBLIC_API_URL=http://localhost:4000/data
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

For production on Vercel, set the environment variable in the Vercel dashboard:

- **Key:** `NEXT_PUBLIC_API_URL`
- **Value:** (A publicly accessible sensor API endpoint, e.g., `https://sensorapi.example.com/data`)

## Testing the API

1. **Local Testing:**  
   Run the development server:
   ```bash
   npm run dev
   ```
   Access the API endpoint at: [http://localhost:3000/api](http://localhost:3000/api)

2. **Deployed Testing:**  
   After deploying on Vercel, test the API endpoint at: `https://<your-deployment-domain>/api`

## Deployment

- **Vercel Configuration:**  
  Deploy this branch on Vercel. Make sure to configure the environment variable `NEXT_PUBLIC_API_URL` in your Vercel project settings.
  
- **Timeout and Fallback Behavior:**  
  The API route includes timeout settings. If the external sensor API does not respond within 10 seconds, the function aborts the request and returns fallback (dummy) data. Check Vercel logs for any issues related to timeouts or network errors.

## Troubleshooting

- **Recursive API Calls:**  
  If you observe recursive requests or timeouts, verify that `NEXT_PUBLIC_API_URL` is not set to your API route URL (e.g., `https://uno-r4.vercel.app/api`).
  
- **Timeouts / Network Issues:**  
  If the sensor API is slow, consider:
  - Increasing the timeout (if within Vercel's execution limits).
  - Implementing a caching mechanism or background job to pre-fetch sensor data.
  - Ensuring that the sensor API is deployed on a separate domain or subdomain for better accessibility.

## Conclusion

This API branch is dedicated to securely and reliably fetching sensor data for the Gas Pipeline Acoustic Sand Monitoring Device. It includes robust timeout handling, fallback responses, and clear environment configurations—ensuring the front-end receives timely and valid data.

For further updates or issues, please refer to the Vercel logs and the 