import { connectDatabases } from "./db/index.js";
import app from "./app.js";

const PORT = process.env.PORT || 3001;

connectDatabases().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    })
}).catch((error) => console.log(error));
