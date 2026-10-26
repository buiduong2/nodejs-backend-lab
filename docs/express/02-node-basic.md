### 2.2.2 — Requiring third-party modules with package.json and npm

- `package.json` metadata dependencies và script
- npm cài các third-party packages vào node_modules
- npm install ; cài package và lưu dependency theo mặc định
- dependencies:: runtime, devDependencies: development/build/test
- package-lock.json: ghi nhận dependency tree đã resolve
- npm ci: cài sạch theo lock file , phù hợp CICD
- npm init -=y : khởi tạo nhanh project

### 2.4 — Building a web server with Node: the http module

- `node`: http buildint module để xây dựng HTTP server
- http.createServer(handler): tạo server và đăng kí request callback
- req: incommingMEssage, res Server Response
- req.url, req.method, req.headers: thông tin request
- res.end(): kết thúc ghi response
- server.listen(port): bắt đầu lắng nghe
- Express đơn giản hóa routing, middleware và response handling