const express = require('express');
const router = express.Router();
const db = require('../db'); // DB 연결
const multer = require('multer');
const path = require('path');

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads/finance/'));
    },
    filename: (req, file, cb) => {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
        .replace(/\s+/g, '_')
        .replace(/[^\w.\-가-힣]/g, '');
        const finalName = Date.now() + '-' + originalName;
        file.original_utf8_name = originalName;
        cb(null, finalName);
    }
});


const upload = multer({ storage: storage });

// 🔹 회계감사내역 페이지 (DB에서 자료 불러오기)
router.get('/finance', (req, res) => {
    const sql = 'SELECT * FROM finance_reports ORDER BY created_at DESC';

    db.query(sql, (err, rows) => {
        if (err) {
            console.error('회계 감사 내역 조회 오류:', err);
            return res.status(500).send('DB 오류');
        }

        // 🔥 데이터 확인용 콘솔 출력
        console.log("📢 회계감사 데이터:", rows);
        res.render('notice/finance', { reports: rows, user: req.session.user || null });
    });
});

// 🔹 회계감사 보고서 업로드 (관리자 전용)
router.post('/finance/upload', upload.single('file'), (req, res) => {
    if (!req.session.user || req.session.user.username !== 'ullimdavinci67') {
        return res.status(403).send('관리자만 업로드할 수 있습니다.');
    }

    if (!req.file) {
        return res.status(400).send('파일이 업로드되지 않았습니다.');
    }

    const { title } = req.body;
    const file_path = req.file.filename;

    // 🔥 여기가 핵심
    const original_name = req.file.original_utf8_name || req.file.originalname;
    const author = req.session.user.username;

    const sql = 'INSERT INTO finance_reports (title, file_path, original_name, author, created_at) VALUES (?, ?, ?, ?, NOW())';
    db.query(sql, [title, file_path, original_name, author], (err) => {
        if (err) {
        console.error('DB 저장 오류:', err);
        return res.status(500).send('DB 오류');
        }
        res.redirect('/notice/finance');
    });
});

// 🔥 회계감사 파일 삭제
router.post('/finance/:id/delete', (req, res) => {
    if (!req.session.user || req.session.user.username !== 'ullimdavinci67') {
        return res.status(403).send('관리자만 삭제할 수 있습니다.');
    }

    const id = req.params.id;

    // 먼저 파일 이름 조회 → 실제 파일 삭제 (옵션)
    const sqlSelect = 'SELECT file_path FROM finance_reports WHERE id = ?';
    db.query(sqlSelect, [id], (err, results) => {
        if (err || results.length === 0) {
            console.error('파일 조회 오류:', err);
            return res.status(500).send('파일 조회 오류');
        }

        const filePath = results[0].file_path;
        const fullPath = path.join(__dirname, '../public/uploads/', filePath);

        // 실제 파일 시스템에서 파일 삭제 (옵션)
        const fs = require('fs');
        fs.unlink(fullPath, (unlinkErr) => {
            if (unlinkErr) console.warn('파일 삭제 실패 (무시):', unlinkErr);

            // DB에서 삭제
            const sqlDelete = 'DELETE FROM finance_reports WHERE id = ?';
            db.query(sqlDelete, [id], (delErr) => {
                if (delErr) {
                    console.error('DB 삭제 오류:', delErr);
                    return res.status(500).send('DB 삭제 오류');
                }

                res.redirect('/notice/finance');
            });
        });
    });
});




module.exports = router;
