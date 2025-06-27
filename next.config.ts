const nextConfig = {
  images: {
    domains: [
      'exei-object-bucket.s3.ap-south-1.amazonaws.com',
      'exei-object-bucket.s3.amazonaws.com',
      'exei-qa-bucket.s3.amazonaws.com',
      's3-alpha-sig.figma.com',
      'https://exei-qa-bucket.s3.us-east-2.amazonaws.com/',
      'exei-qa-bucket.s3.us-east-2.amazonaws.com',
      'exei-staging-bucket.s3.us-east-2.amazonaws.com',
      'qa-cdn.exei.ai',
      'staging-cdn.exei.ai',
      'prod-cdn.exei.ai',
      'pps.whatsapp.net',
    ], // Add your S3 bucket
  },
  env: {
    NEXT_BACKEND_SOCKET_ENDPOINT: process.env.NEXT_BACKEND_SOCKET_ENDPOINT,
  },
  reactStrictMode: false,

  devIndicators: {
    autoPrerender: false,
  },
};

export default nextConfig;
