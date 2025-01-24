import ImageKit from "imagekit";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_KEY!;
const privateKey = process.env.IMAGEKIT_SECRET_KEY!;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_ENDPOINT!;

export const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });