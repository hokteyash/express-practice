const db = require("../config/db")

const currentDB = async (req,res) => {
    try {
        const result = await db.query("SELECT current_database();")
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = currentDB;