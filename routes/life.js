const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// 🔸 multer 이미지 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads/partnership/'));
    },
    filename: (req, file, cb) => {
        const original = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const safe = Date.now() + '-' + original.replace(/\s+/g, '_');
        cb(null, safe);
    }
});
const upload = multer({ storage: storage });

// 🔹 제휴 안내 - 목록 페이지
router.get('/affiliation', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = 9;
    const offset = (page - 1) * perPage;

    const countSql = 'SELECT COUNT(*) AS total FROM partnership_info WHERE end_date >= CURDATE()';
    const listSql = `
        SELECT pi.id, pi.title, pi.start_date, pi.end_date, pi_img.image_path
        FROM partnership_info pi
        LEFT JOIN (
            SELECT post_id, MIN(image_path) AS image_path
            FROM partnership_images
            GROUP BY post_id
        ) pi_img ON pi.id = pi_img.post_id
        WHERE pi.end_date >= CURDATE()
        ORDER BY pi.created_at DESC
        LIMIT ? OFFSET ?
    `;

    db.query(countSql, (err, countResult) => {
        if (err) return res.status(500).send('DB 오류');
        const totalPages = Math.ceil(countResult[0].total / perPage);

        db.query(listSql, [perPage, offset], (err, posts) => {
            if (err) return res.status(500).send('DB 오류');
            posts = posts.map(post => {
                return {
                    ...post,
                    thumb: post.image_path
                        ? `/uploads/partnership/${post.image_path}`
                        : '/uploads/partnership/default.jpg'
                };
            });

            res.render('life/affiliation', {
                user: req.session.user || null,
                posts,
                currentPage: page,
                totalPages
            });
        });
    });
});

// 🔹 제휴 등록 페이지
router.get('/affiliation/new', (req, res) => {
    if (!req.session.user || req.session.user.username !== 'ullimdavinci67') {
        return res.status(403).send('관리자만 접근 가능합니다.');
    }
    res.render('life/affiliation_form', { user: req.session.user });
});

// 🔹 제휴 상세 페이지
router.get('/affiliation/:id', (req, res) => {
    const id = req.params.id;
    const infoSql = 'SELECT * FROM partnership_info WHERE id = ?';
    const imgSql = 'SELECT image_path FROM partnership_images WHERE post_id = ?';

    db.query(infoSql, [id], (err, infoRows) => {
        if (err || infoRows.length === 0) return res.status(404).send('게시글 없음');
        const post = infoRows[0];

        db.query(imgSql, [id], (err, imageRows) => {
            if (err) return res.status(500).send('이미지 오류');
            const imagePaths = imageRows.map(row => `/uploads/partnership/${row.image_path}`);
            res.render('life/affiliation_detail', {
                user: req.session.user || null,
                post,
                images: imagePaths
            });
        });
    });
});

// 🔹 제휴 등록 처리
router.post('/affiliation/new', upload.array('images', 10), (req, res) => {
  if (!req.session.user || req.session.user.username !== 'ullimdavinci67') {
    return res.status(403).send('관리자만 작성할 수 있습니다.');
  }

  const { title, content, start_date, end_date } = req.body;
  const insertSql = `
      INSERT INTO partnership_info (title, content, start_date, end_date)
      VALUES (?, ?, ?, ?)
  `;

  db.query(insertSql, [title, content, start_date, end_date], (err, result) => {
    if (err) {
      console.error('제휴 정보 저장 실패:', err);
      return res.status(500).send('DB 오류');
    }

    const postId = result.insertId;

    /** 1) 사용자가 선택한 파일 이름(contact_1_1, contact_1_2 …) 순서대로 정렬 */
    const sorted = [...req.files].sort((a, b) =>
      a.originalname.localeCompare(b.originalname, undefined, { numeric: true })
    );

    /** 2) 실제 파일 이름을 1_…, 2_… 로 바꾼 뒤 DB 배열 생성 */
    const images = sorted.map((file, idx) => {
      const newName = `${idx + 1}_${file.filename}`;
      const oldPath = path.join(file.destination, file.filename);
      const newPath = path.join(file.destination, newName);
      fs.renameSync(oldPath, newPath);
      return [postId, newName];
    });

    if (images.length > 0) {
      const imgSql = 'INSERT INTO partnership_images (post_id, image_path) VALUES ?';
      db.query(imgSql, [images], (err) => {
        if (err) console.warn('이미지 저장 실패:', err);
        res.redirect('/life/affiliation');
      });
    } else {
      res.redirect('/life/affiliation');
    }
  });
});


// 🔹 제휴 삭제
router.post('/affiliation/:id/delete', (req, res) => {
    if (!req.session.user || req.session.user.username !== 'ullimdavinci67') {
        return res.status(403).send('관리자만 삭제할 수 있습니다.');
    }

    const postId = req.params.id;
    const getImages = 'SELECT image_path FROM partnership_images WHERE post_id = ?';

    db.query(getImages, [postId], (err, results) => {
        if (err) return res.status(500).send('DB 오류');
        results.forEach(img => {
            const filePath = path.join(__dirname, '../public/uploads/partnership/', img.image_path);
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.warn('이미지 삭제 실패:', unlinkErr);
            });
        });

        const deletePost = 'DELETE FROM partnership_info WHERE id = ?';
        db.query(deletePost, [postId], (err2) => {
            if (err2) return res.status(500).send('삭제 실패');
            res.redirect('/life/affiliation');
        });
    });
});

// 🔹 캠퍼스 맵
router.get('/map', (req, res) => {
    res.render('life/map', { user: req.session.user || null });
});

// 🔹 업로드 설정 재사용
const lostStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads/lost_items/'));
    },
    filename: (req, file, cb) => {
        const original = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const safe = Date.now() + '-' + original.replace(/\s+/g, '_');
        cb(null, safe);
    }
});
const lostUpload = multer({ storage: lostStorage });


// 🔹 업로드 폼 렌더
router.get('/lostfound/new', (req, res) => {
  if (!req.session.user || req.session.user.username !== 'ullimdavinci67') {
    return res.status(403).send('관리자만 접근 가능합니다.');
  }

  res.render('life/lostfound_form', {
    user: req.session.user  // ✅ 반드시 user 전달
  });
});


// 🔹 게시글 업로드 처리
router.post('/lostfound/new', lostUpload.array('images', 10), (req, res) => {
  const { item_name, found_date, location } = req.body;

  const insertSql = `
  INSERT INTO lost_items (title, found_date, location)
  VALUES (?, ?, ?)
  `;

  db.query(insertSql, [item_name, found_date, location], (err, result) => {
    if (err) return res.status(500).send('DB 오류');
    const postId = result.insertId;

    const sorted = [...req.files].sort((a, b) =>
      a.originalname.localeCompare(b.originalname, undefined, { numeric: true })
    );

    const images = sorted.map((file, idx) => {
      const newName = `${idx + 1}_${file.filename}`;
      fs.renameSync(path.join(file.destination, file.filename), path.join(file.destination, newName));
      return [postId, newName];
    });

    if (images.length > 0) {
      db.query('INSERT INTO lost_item_images (post_id, image_path) VALUES ?', [images], () => {
        res.redirect('/life/lostfound');
      });
    } else {
      res.redirect('/life/lostfound');
    }
  });
});


// 🔹 목록 조회
router.get('/lostfound', (req, res) => {
  const listSql = `
    SELECT li.id, li.title, li.found_date, MIN(img.image_path) AS thumb
    FROM lost_items li
    LEFT JOIN lost_item_images img ON li.id = img.post_id
    GROUP BY li.id
    ORDER BY li.created_at DESC
  `;

  db.query(listSql, (err, results) => {
    if (err) {
      console.error('DB 오류:', err);
      return res.status(500).send('DB 오류');
    }

    const posts = results.map(post => ({
      ...post,
      thumb: post.thumb ? `/uploads/lost_items/${post.thumb}` : '/uploads/lost_items/default.jpg'
    }));

    res.render('life/lostfound', {
      user: req.session.user || null,
      posts
    });
  });
});



// 🔹 상세 페이지
router.get('/lostfound/:id', (req, res) => {
    const id = req.params.id;
    const postSql = 'SELECT * FROM lost_items WHERE id = ?';
    const imgSql = 'SELECT image_path FROM lost_item_images WHERE post_id = ?';

    db.query(postSql, [id], (err, results) => {
        if (err || results.length === 0) return res.status(404).send('존재하지 않는 게시글입니다.');
        const post = results[0];

        db.query(imgSql, [id], (err, imgResults) => {
            const images = imgResults.map(row => `/uploads/lost_items/${row.image_path}`);
            res.render('life/lostfound_detail', { user: req.session.user || null, post, images });
        });
    });
});

// 🔹 분실물 게시글 삭제
router.post('/lostfound/:id/delete', (req, res) => {
  if (!req.session.user || req.session.user.username !== 'ullimdavinci67') {
    return res.status(403).send('관리자만 삭제할 수 있습니다.');
  }

  const postId = req.params.id;

  // 이미지 경로 조회
  const imgSql = 'SELECT image_path FROM lost_item_images WHERE post_id = ?';
  db.query(imgSql, [postId], (err, results) => {
    if (err) return res.status(500).send('DB 오류');

    // 파일 삭제
    results.forEach(img => {
      const filePath = path.join(__dirname, '../public/uploads/lost_items/', img.image_path);
      fs.unlink(filePath, (err) => {
        if (err) console.warn('이미지 삭제 실패:', err);
      });
    });

    // 게시글 삭제 (images 테이블은 ON DELETE CASCADE로 처리되어야 함)
    const deleteSql = 'DELETE FROM lost_items WHERE id = ?';
    db.query(deleteSql, [postId], (err) => {
      if (err) return res.status(500).send('삭제 실패');
      res.redirect('/life/lostfound');
    });
  });
});






module.exports = router;
