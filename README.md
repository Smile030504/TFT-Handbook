# TFT mùa 19 — sổ tay 94 tướng

Website tĩnh viết bằng **HTML + CSS + JavaScript thuần**, phát triển từ file sổ tay hiện tại.

## Cấu trúc

```text
tft19-web-source/
├── index.html     # Toàn bộ mã nguồn (HTML, CSS, JS, dữ liệu, ảnh tướng và icon tộc/hệ đã nhúng)
├── README.md      # Hướng dẫn
└── .gitignore
```

Không cần cài Node.js, React, chạy `npm install` hay thiết lập API.

## Xem thử trên máy

Mở `index.html` bằng Chrome hoặc Edge. Nếu muốn dùng một server local trong VS Code, có thể dùng extension **Live Server**. Trang vẫn hiển thị ảnh và icon đã nhúng khi không có mạng.

## Đưa lên GitHub

1. Tạo repository GitHub, ví dụ `tft19-handbook`.
2. Tải ZIP mã nguồn và giải nén. **Upload các file bên trong thư mục**, để `index.html` nằm ở thư mục gốc của repository.
3. Hoặc dùng Git từ thư mục chứa `index.html`:

```bash
git init
git add .
git commit -m "Initial TFT 19 handbook"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tft19-handbook.git
git push -u origin main
```

Thay `YOUR_USERNAME` bằng tài khoản GitHub của bạn và tạo repository trước khi push.

## Deploy với Vercel

1. Đăng nhập https://vercel.com/ bằng GitHub.
2. Chọn **Add New → Project**, import repository.
3. **Framework Preset: Other** (không có framework). Root Directory là thư mục chứa `index.html` (thông thường là `./`).
4. **Không cần build command** hoặc output directory riêng cho trang HTML tĩnh.
5. Nhấn **Deploy** để lấy một đường dẫn `*.vercel.app`.

Nếu push commit mới lên nhánh sản xuất, Vercel sẽ tự triển khai bản mới.

## Chỉnh sửa dữ liệu trong mã nguồn

Mã nguồn chứa các thẻ JSON nội tuyến, có thể tìm bằng tên `id`:

- `rosterData`: thông tin 94 tướng, tộc/hệ, trạng thái khóa, trang bị và hiệu ứng.
- `skillData`: mô tả kỹ năng ngắn của mỗi tướng.
- `traitInfo`: mô tả 47 tộc/hệ bằng tiếng Việt.
- `unlockRules`: dữ liệu sơ đồ mở khóa.
- `savedData`: 94 ảnh tướng dưới dạng data URL (base64).
- `traitIconData`: 47 icon tộc/hệ dưới dạng data URL (base64).

Giao diện CSS và xử lý JavaScript cũng nằm ngay trong `index.html`. Các hình đã nhúng nên không cần tạo thư mục `assets`.

## Lưu ý về chức năng lưu

- Nút **LƯU TÙY CHỈNH** hiện có chức năng **tải xuống một bản HTML** chứa sửa đổi, **không tự cập nhật repository GitHub hay website trên Vercel**.
- Nếu muốn các thay đổi xuất hiện trên website công khai, cần đưa nội dung của file HTML vừa xuất vào `index.html`, commit/push và chờ Vercel deploy.
- Không có backend hay cơ sở dữ liệu; trang không đồng bộ thay đổi giữa các thiết bị.
- Sơ đồ mở khóa và nội dung kỹ năng xuất phát từ thông tin giai đoạn PBE, có thể thay đổi khi game cập nhật.
- Đây là dự án ghi chú người hâm mộ, không phải website chính thức của Riot Games/Tactics.tools/Mobalytics. Khi xuất bản công khai nên ghi nguồn, tôn trọng quyền sử dụng hình ảnh và tránh giới thiệu như sản phẩm chính thức.

## Cập nhật website sau khi chỉnh giao diện

1. Vào repository `TFT-Handbook` trên GitHub.
2. Thay **file `index.html` ở thư mục gốc** bằng `index.html` từ bản cập nhật này (không upload nguyên ZIP).
3. Commit thay đổi trên nhánh deploy. Nếu GitHub không cho sửa file lớn trong trình soạn thảo web, hãy dùng **Add file → Upload files** để upload file thay thế hoặc dùng Git trên máy.
4. Nếu repo đã kết nối Vercel, deployment mới sẽ tự chạy sau khi commit.

Trang web chỉ hiển thị danh sách nguồn ở cuối trang. Các đoạn hướng dẫn nội bộ về dán ảnh/icon và ghi chú riêng của quá trình làm đã được bỏ khỏi giao diện.
