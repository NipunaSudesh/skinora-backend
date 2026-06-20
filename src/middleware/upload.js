import multer, { memoryStorage } from "multer";

const storage = memoryStorage();

export default multer({ storage });