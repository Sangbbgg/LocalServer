import os
import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for
from werkzeug.utils import secure_filename

app = Flask(__name__)

# --- [설정] ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
DB_FILE = os.path.join(BASE_DIR, 'database.db')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- [DB 초기화] ---
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # 1. 파일 기록 테이블 (유지)
    c.execute('''
        CREATE TABLE IF NOT EXISTS file_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            file_type TEXT,
            upload_date TEXT,
            status TEXT,
            category TEXT
        )
    ''')

    # 2. 기존 daily_logs 테이블을 백업 (한 번만 실행되도록)
    try:
        c.execute("SELECT id FROM daily_logs_old LIMIT 1")
    except sqlite3.OperationalError:
        try:
            c.execute("ALTER TABLE daily_logs RENAME TO daily_logs_old")
        except sqlite3.OperationalError:
            print("기존 daily_logs 테이블이 없어 백업을 건너뜁니다.")

    # 3. 새로운 일일 업무 상위 테이블 (날짜별)
    c.execute('''
        CREATE TABLE IF NOT EXISTS daily_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            work_date TEXT UNIQUE NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')

    # 4. 새로운 일일 업무 상세 테이블 (항목별)
    c.execute('''
        CREATE TABLE IF NOT EXISTS daily_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            log_id INTEGER NOT NULL,
            work_time TEXT,
            task_type TEXT,
            task_details TEXT,
            task_result TEXT,
            future_plan TEXT,
            notes TEXT,
            FOREIGN KEY (log_id) REFERENCES daily_logs (id)
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

# --- [라우팅] ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/report')
def report_page():
    return render_template('report.html')


# --- [일일 업무 기능] ---
@app.route('/work/daily')
def work_daily():
    # 저장된 업무 일지 '날짜' 목록 불러오기 (최신순)
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT id, work_date, created_at FROM daily_logs ORDER BY work_date DESC")
    logs = c.fetchall()
    conn.close()
    return render_template('work_daily.html', logs=logs)


@app.route('/work/daily/new')
def new_daily_log():
    return render_template('work_daily_form.html')

@app.route('/work/daily/add', methods=['POST'])
def add_daily_log():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    try:
        # 1. 상위 로그 생성
        work_date = request.form['work_date']
        created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        c.execute("INSERT INTO daily_logs (work_date, created_at) VALUES (?, ?)", (work_date, created_at))
        log_id = c.lastrowid

        # 2. 상세 태스크 저장
        # 전송된 폼 데이터에서 최대 인덱스 찾기
        max_index = 0
        for key in request.form:
            if key.startswith('task_type_'):
                index = int(key.split('_')[-1])
                if index > max_index:
                    max_index = index
        
        for i in range(max_index + 1):
            task_type = request.form.get(f'task_type_{i}')
            # 내용이 있는 행만 저장
            if task_type or request.form.get(f'task_details_{i}') or request.form.get(f'task_result_{i}'):
                am = request.form.get(f'work_time_am_{i}')
                pm = request.form.get(f'work_time_pm_{i}')
                work_time_parts = []
                if am: work_time_parts.append(am)
                if pm: work_time_parts.append(pm)
                work_time = ','.join(work_time_parts)

                c.execute("""
                    INSERT INTO daily_tasks (log_id, work_time, task_type, task_details, task_result, future_plan, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    log_id,
                    work_time,
                    task_type,
                    request.form.get(f'task_details_{i}'),
                    request.form.get(f'task_result_{i}'),
                    request.form.get(f'future_plan_{i}'),
                    request.form.get(f'notes_{i}')
                ))

        conn.commit()

    except sqlite3.IntegrityError:
        # UNIQUE 제약 조건 위반 (이미 해당 날짜의 로그가 존재)
        conn.rollback()
        # 여기서 사용자에게 오류를 알리는 페이지를 보여주는 것이 좋지만, 일단 리다이렉트합니다.
        return redirect(url_for('work_daily')) 
    finally:
        conn.close()
    
    return redirect(url_for('work_daily'))


@app.route('/work/daily/view/<int:log_id>')
def view_daily_log(log_id):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # 결과를 딕셔너리처럼 접근 허용
    c = conn.cursor()

    # 상위 로그 정보 가져오기
    c.execute("SELECT * FROM daily_logs WHERE id = ?", (log_id,))
    log = c.fetchone()

    # 상세 태스크 목록 가져오기
    c.execute("SELECT * FROM daily_tasks WHERE log_id = ? ORDER BY id", (log_id,))
    tasks = c.fetchall()

    conn.close()

    return render_template('work_daily_detail.html', log=log, tasks=tasks)

# --- [주간/EVTX/파일업로드 기능] ---
@app.route('/work/weekly')
def work_weekly():
    return render_template('work_weekly.html')

@app.route('/work/evtx')
def work_evtx():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT * FROM file_history WHERE filename LIKE '%.evtx' ORDER BY id DESC")
    files = c.fetchall()
    conn.close()
    return render_template('work_evtx.html', files=files)

@app.route('/upload', methods=['POST'])
def upload_file():
    # (기존 파일 업로드 로직 유지)
    if 'file' not in request.files: return '파일 없음'
    file = request.files['file']
    category = request.form.get('category', 'general')
    if file.filename == '': return '선택 안함'

    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        ext = filename.split('.')[-1].lower()
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("INSERT INTO file_history (filename, file_type, upload_date, status, category) VALUES (?, ?, ?, ?, ?)",
                  (filename, ext, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'Uploaded', category))
        conn.commit()
        conn.close()

        if category == 'weekly': return redirect(url_for('work_weekly'))
        if category == 'evtx': return redirect(url_for('work_evtx'))
        return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)