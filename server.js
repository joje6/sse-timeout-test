const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/sse', (req, res) => {
  const interval = parseInt(req.query.interval) || 30; // 기본 30초 간격

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const startTime = Date.now();
  let eventCount = 0;

  // 초기 연결 확인 이벤트
  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);

  const timer = setInterval(() => {
    eventCount++;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const payload = {
      type: 'ping',
      count: eventCount,
      elapsed: `${elapsed}s`,
      time: new Date().toISOString(),
    };
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }, interval * 1000);

  req.on('close', () => {
    clearInterval(timer);
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`SSE connection closed after ${elapsed}s (${eventCount} events sent)`);
  });
});

// keep-alive 없이 아무 데이터도 보내지 않는 엔드포인트 (순수 타임아웃 테스트)
app.get('/sse-silent', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const startTime = Date.now();

  // 연결 확인만 보내고 이후 아무것도 보내지 않음
  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`Silent SSE connection closed after ${elapsed}s`);
  });
});

app.listen(PORT, () => {
  console.log(`SSE Timeout Test Server running at http://localhost:${PORT}`);
});
