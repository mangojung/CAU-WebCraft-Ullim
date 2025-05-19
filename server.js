// server.js - 관리자 단일 로그인 버전
const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./db');
const multer = require('multer');

const app = express();


// 기본 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'some-secret-key',
  resave: false,
  saveUninitialized: false
}));



// 관리자 체크 미들웨어
function isAdmin(req, res, next) {
  if (!req.session.user) return res.status(401).send('로그인 필요');
  next();
}

// 메인 페이지
app.get('/', (req, res) => {
  const noticeSql = 'SELECT id, title, created_at, views FROM notice_posts ORDER BY created_at DESC LIMIT 5';
  const lostSql = `
  SELECT li.id, li.title, li.found_date, li.location, MIN(img.image_path) AS image_path
  FROM lost_items li
  LEFT JOIN lost_item_images img ON li.id = img.post_id
  GROUP BY li.id
  ORDER BY li.created_at DESC
  LIMIT 3
`;

  db.query(noticeSql, (noticeErr, noticeRows) => {
    if (noticeErr) {
      console.error('홈 공지사항 쿼리 오류:', noticeErr);
      return res.status(500).send('DB 오류');
    }

    const formattedNotices = noticeRows.map(notice => ({
      ...notice,
      created_at: new Date(notice.created_at).toISOString().split('T')[0]
    }));

    db.query(lostSql, (lostErr, lostRows) => {
      if (lostErr) {
        console.error('홈 분실물 쿼리 오류:', lostErr);
        return res.status(500).send('DB 오류');
      }

      const lostItems = lostRows.map(item => ({
        ...item,
        thumb: item.image_path
          ? `/uploads/lost_items/${item.image_path}`
          : '/uploads/lost_items/default.jpg',
        found_date: item.found_date.toISOString().split('T')[0]
      }));

      res.render('home', {
        user: req.session.user || null,
        recentNotices: formattedNotices,
        recentLostItems: lostItems
      });
    });
  });
});

// 소개 페이지 라우트
app.get('/about/student_council', (req, res) => {
  res.render('about/student_council', { user: req.session.user || null,currentPath: req.path });
});

app.get('/about/committee', (req, res) => {
  res.render('about/committee', { user: req.session.user || null,currentPath: req.path });
});

app.get('/about/club', (req, res) => {
  res.render('about/club', { user: req.session.user || null,currentPath: req.path });
});



// 공지사항 목록
app.get('/notice', (req, res) => {
  const sql = 'SELECT id, title, created_at, views FROM notice_posts ORDER BY created_at DESC';
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('공지사항 목록 쿼리 오류:', err);
      return res.status(500).send('DB 오류');
    }

    res.render('notice/list', {
      user: req.session.user || null,
      notices: rows
    });
  });
});
// 공지사항 작성 페이지
app.get('/notice/new', (req, res) => {
  if (!req.session.user || req.session.user.username !== 'ullimdavinci67') return res.redirect('/login');
  res.render('notice/new', { user: req.session.user });
});

// 공지사항 작성 처리 (추가)
app.post('/notice', (req, res) => {
  if (!req.session.user || req.session.user.username !== 'ullimdavinci67') {
    return res.status(403).send('관리자만 작성할 수 있습니다.');
  }

  const { title, content } = req.body;
  const sql = 'INSERT INTO notice_posts (title, content, created_at, views) VALUES (?, ?, NOW(), 0)';

  db.query(sql, [title, content], (err) => {
    if (err) {
      console.error('공지사항 작성 DB 오류:', err);
      return res.status(500).send('DB 오류');
    }
    res.redirect('/notice');
  });
});

// 공지사항 삭제
app.post('/notice/:id/delete', (req, res) => {
  if (!req.session.user || req.session.user.username !== 'ullimdavinci67') {
    return res.status(403).send('관리자만 삭제할 수 있습니다.');
  }

  const noticeId = req.params.id;
  db.query('DELETE FROM notice_posts WHERE id = ?', [noticeId], (err) => {
    if (err) {
      console.error('공지사항 삭제 오류:', err);
      return res.status(500).send('DB 오류');
    }
    res.redirect('/notice');
  });
});


// 수정 페이지
app.get('/notice/:id/edit', (req, res) => {
  if (!req.session.user || req.session.user.username !== 'ullimdavinci67') {
    return res.status(403).send('관리자만 접근 가능합니다.');
  }

  const id = req.params.id;
  db.query('SELECT * FROM notice_posts WHERE id = ?', [id], (err, rows) => {
    if (err || rows.length === 0) return res.status(500).send('DB 오류 또는 게시물 없음');
    res.render('notice/edit', { notice: rows[0], user: req.session.user });
  });
});

// 수정 처리
app.post('/notice/:id/edit', (req, res) => {
  if (!req.session.user || req.session.user.username !== 'ullimdavinci67') {
    return res.status(403).send('관리자만 수정할 수 있습니다.');
  }

  const id = req.params.id;
  const { title, content } = req.body;
  db.query('UPDATE notice_posts SET title=?, content=? WHERE id=?', [title, content, id], (err) => {
    if (err) return res.status(500).send('DB 오류');
    res.redirect('/notice/' + id);
  });
});



// 회계감사내역 라우트
const financeRoutes = require('./routes/finance');
app.use('/notice', financeRoutes);

// 공지사항 상세 보기 + 댓글
app.get('/notice/:id', (req, res) => {
  const noticeId = req.params.id;
  if (isNaN(noticeId)) return res.status(400).send("잘못된 요청: ID는 숫자여야 합니다.");

  db.query('UPDATE notice_posts SET views = views + 1 WHERE id = ?', [noticeId]);
  db.query('SELECT * FROM notice_posts WHERE id = ?', [noticeId], (err, rows) => {
    if (err) {
      console.error('공지사항 상세보기 댓글 쿼리 오류:', err);
      return res.status(500).send('DB 오류');
    }
    if (rows.length < 1) return res.status(404).send('공지사항 없음');

    const notice = rows[0];
    res.render('notice/detail', {
      user: req.session.user || null,
      notice
    });
  });
});



// 회계 업로드 페이지
app.get('/notice/finance/upload', (req, res) => {
  if (!req.session.user || req.session.user.username !== 'ullimdavinci67') return res.redirect('/login');
  res.render('notice/finance_upload', { user: req.session.user });
});



//학교생활 페이지 관련
const lifeRouter = require('./routes/life');
app.use('/life', lifeRouter);

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
//학교생활 페이지 관련 끝---









// 관리자 로그인 페이지
app.get('/login', (req, res) => {
  res.render('auth/login', { user: req.session.user });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM admin_accounts WHERE username=? AND password=?';

  db.query(sql, [username, password], (err, rows) => {
    if (err) return res.status(500).send('DB 오류');
    if (rows.length < 1) {
      return res.render('auth/login', {
        popupMessage: '로그인 실패: 아이디 또는 비밀번호가 잘못되었습니다.',
        user: null
      });
    }

    const user = rows[0];
    req.session.user = {
      id: user.id,
      username: user.username
    };

    res.redirect('/');
  });
});

// 로그아웃
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});





// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});