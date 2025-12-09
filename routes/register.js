import express from "express";
import pool from "../db.js";

const router = express.Router();

// สมัครแบบยังไม่จ่าย
router.post("/new", async (req, res) => {
    const { fullname, nickname, line, status, slip } = req.body;

    try {
        const sql = `
            INSERT INTO registrations (fullname, nickname, line_name, status, slip) 
            VALUES (?, ?, ?, ?, ?)
        `;
        await pool.query(sql, [fullname, nickname, line, status, slip]);

        res.json({ success: true, message: "บันทึกข้อมูลสำเร็จ" });
    } 
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err });
    }
});

// อัปโหลดสลิปจ่ายแล้ว
router.post("/paid", async (req, res) => {
    const { fullname, nickname, line, status, slip } = req.body;

    try {
        const sql = `
            UPDATE registrations
            SET status=?, slip=?
            WHERE fullname=? AND nickname=? AND line_name=?
        `;
        await pool.query(sql, [status, slip, fullname, nickname, line]);
        
        res.json({ success: true, message: "อัปโหลดสลิปสำเร็จ" });
    } 
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err });
    }
});

export default router;
