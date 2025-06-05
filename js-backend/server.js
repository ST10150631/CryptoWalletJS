const express = require('express');
const xrpRoutes = require('./Routes/xrpRoutes.js');
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use('/xrp', xrpRoutes); // Isolated XRP endpoints


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
